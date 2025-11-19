import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const brideId = searchParams.get('bride_id');
    const vendorId = searchParams.get('vendor_id');

    let query = supabaseServer.from('vendor_bookings').select('*, vendors(*)');

    if (brideId) {
      query = query.eq('bride_id', brideId);
    }

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error} = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vendor bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {

  try {
    const { bride_id, vendor_id, wedding_date, venue_location, message, bride_name, email, phone, budget_range } = await request.json();

    if (!bride_id || !vendor_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get bride info from auth if not provided
    let brideName = bride_name;
    let brideEmail = email;

    if (!brideName || !brideEmail) {
      const { data: userData, error: userError } = await supabaseServer.auth.admin.getUserById(bride_id);
      if (userData?.user) {
        brideEmail = brideEmail || userData.user.email || '';
        brideName = brideName || userData.user.user_metadata?.full_name || brideEmail.split('@')[0];
      }
    }

    if (!brideEmail || !brideName) {
      return NextResponse.json({ error: 'Bride name and email are required' }, { status: 400 });
    }

    // Check if booking already exists
    const { data: existing } = await supabaseServer
      .from('vendor_bookings')
      .select('id')
      .eq('bride_id', bride_id)
      .eq('vendor_id', vendor_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already connected with this vendor' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('vendor_bookings')
      .insert({
        bride_id,
        vendor_id,
        bride_name: brideName,
        email: brideEmail,
        phone: phone || null,
        wedding_date: wedding_date || null,
        venue: venue_location || '',
        budget_range: budget_range || null,
        message: message || '',
        status: 'pending',
      })
      .select();

    if (error) throw error;

    // Increment vendor's booking_requests count
    await supabaseServer.rpc('increment_booking_requests', { vendor_id_input: vendor_id });

    // Get vendor details for email notification
    const { data: vendorData } = await supabaseServer
      .from('vendors')
      .select('business_name, email')
      .eq('id', vendor_id)
      .single();

    // Send email notification to vendor (if Resend API key is configured)
    if (process.env.RESEND_API_KEY && vendorData?.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const formattedDate = wedding_date
          ? new Date(wedding_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : 'Not specified';

        await resend.emails.send({
          from: 'Bella Wedding <notifications@bellawedding.com>',
          to: vendorData.email,
          subject: `New Booking Request from ${brideName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B4789;">New Booking Request!</h2>

              <p>Hi ${vendorData.business_name},</p>

              <p>You have a new booking request from <strong>${brideName}</strong>.</p>

              <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Request Details:</h3>
                <p><strong>Contact:</strong> ${brideEmail}${phone ? ` • ${phone}` : ''}</p>
                <p><strong>Wedding Date:</strong> ${formattedDate}</p>
                ${venue_location ? `<p><strong>Venue:</strong> ${venue_location}</p>` : ''}
                ${budget_range ? `<p><strong>Budget:</strong> ${budget_range}</p>` : ''}
                ${message ? `<p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
              </div>

              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bellawedding.com'}/vendor-dashboard"
                   style="background: linear-gradient(to right, #8B4789, #D97757); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  View in Dashboard
                </a>
              </p>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Respond quickly to increase your chances of booking!
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('Email notification error:', emailError);
      }
    }

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Vendor booking POST error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

export async function DELETE(request: NextRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });

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
