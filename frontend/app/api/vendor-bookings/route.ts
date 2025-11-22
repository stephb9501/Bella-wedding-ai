import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { sendVendorLeadEmail, sendBookingConfirmedEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendor-bookings
 * Fetch booking requests for vendor or bride
 * Query params: vendor_id, bride_id (user_id), status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brideId = searchParams.get('bride_id');
    const vendorId = searchParams.get('vendor_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    // Check for booking_requests table first
    const { data: bookingRequests, error: brError } = await supabaseServer
      .from('booking_requests')
      .select('*, vendors(name, category, email, user_id)')
      .match(
        Object.fromEntries(
          Object.entries({
            vendor_id: vendorId,
            user_id: userId || brideId,
            status: status,
          }).filter(([_, v]) => v !== null)
        )
      )
      .order('created_at', { ascending: false });

    if (!brError && bookingRequests) {
      return NextResponse.json(bookingRequests);
    }

    // Fallback to old vendor_bookings table
    let query = supabaseServer.from('vendor_bookings').select('*, vendors(*)');

    if (brideId) {
      query = query.eq('bride_id', brideId);
    }

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vendor bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

/**
 * POST /api/vendor-bookings
 * Create a new booking request
 * Body: { user_id, vendor_id, wedding_date, time_slot?, message }
 */
export async function POST(request: NextRequest) {
  try {
    const { user_id, vendor_id, wedding_date, time_slot, message, bride_id } = await request.json();

    const userId = user_id || bride_id;

    if (!userId || !vendor_id || !wedding_date) {
      return NextResponse.json(
        { error: 'user_id, vendor_id, and wedding_date are required' },
        { status: 400 }
      );
    }

    // Check if booking request already exists
    const { data: existing } = await supabaseServer
      .from('booking_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('vendor_id', vendor_id)
      .eq('wedding_date', wedding_date)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Booking request already exists for this date' },
        { status: 400 }
      );
    }

    // Get vendor info
    const { data: vendor } = await supabaseServer
      .from('vendors')
      .select('name, category, email, user_id')
      .eq('id', vendor_id)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Check availability
    const { data: availabilityCheck } = await supabaseServer.rpc(
      'check_vendor_availability',
      {
        p_vendor_id: vendor_id,
        p_wedding_date: wedding_date,
        p_time_slot: time_slot || 'all_day',
      }
    );

    // Create booking request
    const { data, error } = await supabaseServer
      .from('booking_requests')
      .insert({
        user_id: userId,
        vendor_id,
        wedding_date,
        time_slot: time_slot || 'all_day',
        message: message || '',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Send vendor lead email notification
    try {
      if (vendor.email) {
        // Get user info for the email
        const { data: userData } = await supabaseServer.auth.admin.getUserById(userId);
        const { data: userProfile } = await supabaseServer
          .from('users')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        const brideName = userProfile?.full_name || userData?.user?.email || 'A couple';
        const brideEmail = userProfile?.email || userData?.user?.email || '';

        await sendVendorLeadEmail(
          vendor.email,
          {
            vendorName: vendor.name,
            brideName,
            weddingDate: wedding_date,
            timeSlot: time_slot || 'all_day',
            message: message || '',
            brideEmail,
            requestId: data.id,
            category: vendor.category || 'Wedding Service',
          },
          vendor.user_id
        );
      }
    } catch (emailError) {
      console.error('Failed to send vendor lead email:', emailError);
      // Don't fail the request if email fails
    }

    // Increment vendor's booking_requests count if function exists
    try {
      await supabaseServer.rpc('increment_booking_requests', { vendor_id_input: vendor_id });
    } catch (rpcError) {
      console.log('RPC function not available, skipping counter increment');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Vendor booking POST error:', error);
    return NextResponse.json({ error: 'Failed to create booking request' }, { status: 500 });
  }
}

/**
 * PATCH /api/vendor-bookings
 * Update booking request status (accept/decline/cancel)
 * Body: { id, status, vendor_response? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { id, status, vendor_response } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    if (!['pending', 'accepted', 'declined', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Get the booking request with vendor and user info
    const { data: booking, error: fetchError } = await supabaseServer
      .from('booking_requests')
      .select('*, vendors(name, email, user_id, category)')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking request not found' }, { status: 404 });
    }

    // Update the booking request
    const updates: any = { status };
    if (vendor_response) {
      updates.vendor_response = vendor_response;
    }

    const { data, error } = await supabaseServer
      .from('booking_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send email notification to user when booking is accepted
    try {
      if (status === 'accepted') {
        // Get user details
        const { data: userData } = await supabaseServer.auth.admin.getUserById(booking.user_id);
        const { data: userProfile } = await supabaseServer
          .from('users')
          .select('full_name, email')
          .eq('id', booking.user_id)
          .single();

        const userEmail = userProfile?.email || userData?.user?.email;
        const userName = userProfile?.full_name || userData?.user?.email || 'There';

        if (userEmail) {
          // Send booking confirmation email to bride
          await sendBookingConfirmedEmail(
            userEmail,
            {
              recipientName: userName,
              recipientType: 'bride',
              vendorName: booking.vendors.name,
              vendorCategory: booking.vendors.category || 'Wedding Service',
              weddingDate: booking.wedding_date,
              timeSlot: booking.time_slot,
              bookingId: booking.id,
              message: vendor_response,
              vendorEmail: booking.vendors.email,
            },
            booking.user_id
          );

          // Send booking confirmation email to vendor
          const { data: vendorUser } = await supabaseServer
            .from('vendors')
            .select('email, name, user_id, category')
            .eq('id', booking.vendor_id)
            .single();

          if (vendorUser?.email) {
            await sendBookingConfirmedEmail(
              vendorUser.email,
              {
                recipientName: vendorUser.name,
                recipientType: 'vendor',
                vendorName: vendorUser.name,
                vendorCategory: vendorUser.category || 'Wedding Service',
                weddingDate: booking.wedding_date,
                timeSlot: booking.time_slot,
                bookingId: booking.id,
                brideEmail: userEmail,
              },
              vendorUser.user_id
            );
          }
        }
      } else if (status === 'declined') {
        // Send simple decline notification
        const resend = new Resend(process.env.RESEND_API_KEY || '');
        const { data: userData } = await supabaseServer.auth.admin.getUserById(booking.user_id);
        const { data: userProfile } = await supabaseServer
          .from('users')
          .select('email')
          .eq('id', booking.user_id)
          .single();

        const userEmail = userProfile?.email || userData?.user?.email;

        if (userEmail && process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'Bella Wedding AI <onboarding@resend.dev>',
            to: userEmail,
            subject: `Booking Request Update - ${booking.vendors.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #E11D48;">Booking Request Update</h2>
                <p>Unfortunately, <strong>${booking.vendors.name}</strong> is not available for your requested date.</p>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Wedding Date:</strong> ${booking.wedding_date}</p>
                  ${vendor_response ? `
                    <p><strong>Vendor's Note:</strong></p>
                    <p style="white-space: pre-wrap;">${vendor_response}</p>
                  ` : ''}
                </div>
                <p>Don't worry! There are many other wonderful vendors available. Browse our marketplace to find the perfect match for your special day.</p>
                <p><a href="https://bellaweddingai.com/vendors" style="background: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Browse Vendors</a></p>
              </div>
            `,
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Vendor booking PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update booking request' }, { status: 500 });
  }
}

/**
 * PUT /api/vendor-bookings
 * Legacy endpoint for backward compatibility
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try new table first
    const { data: newData, error: newError } = await supabaseServer
      .from('booking_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (!newError && newData) {
      return NextResponse.json(newData);
    }

    // Fallback to old table
    const { data, error } = await supabaseServer
      .from('vendor_bookings')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Vendor booking PUT error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

/**
 * DELETE /api/vendor-bookings
 * Delete a booking request (cancel before vendor responds)
 * Query params: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Booking id is required' }, { status: 400 });
    }

    // Try new table first
    const { error: newError } = await supabaseServer
      .from('booking_requests')
      .delete()
      .eq('id', id);

    if (!newError) {
      return NextResponse.json({ success: true });
    }

    // Fallback to old table
    const { error } = await supabaseServer
      .from('vendor_bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendor booking DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
