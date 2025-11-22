import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

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

    // Send email notification to vendor
    try {
      if (process.env.RESEND_API_KEY && vendor.email) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Get user info for the email
        const { data: userData } = await supabaseServer.auth.admin.getUserById(userId);

        await resend.emails.send({
          from: 'Bella Wedding AI <onboarding@resend.dev>',
          to: vendor.email,
          subject: `New Booking Request for ${wedding_date}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #E11D48;">New Booking Request</h2>
              <p>You have received a new booking request:</p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${userData?.user?.email || 'A couple'}</p>
                <p><strong>Wedding Date:</strong> ${wedding_date}</p>
                <p><strong>Time Slot:</strong> ${time_slot || 'All day'}</p>
                ${message ? `<p><strong>Message:</strong></p><p style="white-space: pre-wrap;">${message}</p>` : ''}
              </div>
              <p>Please log in to your vendor dashboard to respond to this request.</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Failed to send booking notification email:', emailError);
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
      .select('*, vendors(name, email, user_id)')
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

    // Send email notification to user when status changes
    try {
      if (process.env.RESEND_API_KEY && (status === 'accepted' || status === 'declined')) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Get user email
        const { data: userData } = await supabaseServer.auth.admin.getUserById(booking.user_id);
        const userEmail = userData?.user?.email;

        if (userEmail) {
          const statusColor = status === 'accepted' ? '#10B981' : '#EF4444';
          const statusText = status === 'accepted' ? 'Accepted' : 'Declined';

          await resend.emails.send({
            from: 'Bella Wedding AI <onboarding@resend.dev>',
            to: userEmail,
            subject: `Booking Request ${statusText} - ${booking.vendors.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${statusColor};">Booking Request ${statusText}</h2>
                <p>Your booking request with <strong>${booking.vendors.name}</strong> has been ${statusText.toLowerCase()}.</p>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Vendor:</strong> ${booking.vendors.name}</p>
                  <p><strong>Wedding Date:</strong> ${booking.wedding_date}</p>
                  <p><strong>Time Slot:</strong> ${booking.time_slot || 'All day'}</p>
                  <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
                  ${vendor_response ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                      <p><strong>Vendor's Response:</strong></p>
                      <p style="white-space: pre-wrap;">${vendor_response}</p>
                    </div>
                  ` : ''}
                </div>
                ${status === 'accepted' ? `
                  <p style="color: #10B981; font-weight: bold;">Congratulations! Your vendor has accepted your booking request.</p>
                  <p>Please reach out to them directly to finalize the details.</p>
                ` : `
                  <p>Don't worry! There are many other wonderful vendors available for your special day.</p>
                `}
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
