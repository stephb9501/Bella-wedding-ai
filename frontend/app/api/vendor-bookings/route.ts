import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

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
    const { bride_id, vendor_id, wedding_date, venue_location, message, bride_tier } = await request.json();

    if (!bride_id || !vendor_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Get vendor details including tier and email
    const { data: vendor } = await supabaseServer
      .from('vendors')
      .select('id, business_name, category, tier, email')
      .eq('id', vendor_id)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Check bride's monthly inquiry limit based on tier
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: brideInquiryCount } = await supabaseServer
      .from('vendor_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('bride_id', bride_id)
      .gte('created_at', startOfMonth.toISOString());

    // Bride tier limits
    const brideLimits: Record<string, number> = {
      'early-tester': 999999, // Unlimited for early testers
      'standard': 10,         // 10 vendor inquiries per month
      'premium': 999999,      // Unlimited for premium
    };

    const brideLimit = brideLimits[bride_tier || 'standard'] || 10;

    if ((brideInquiryCount || 0) >= brideLimit) {
      return NextResponse.json({
        error: `You've reached your monthly vendor inquiry limit (${brideLimit}). Upgrade to Premium for unlimited inquiries!`,
        upgradeRequired: true
      }, { status: 403 });
    }

    // Check vendor's monthly response limit (only FREE tier has limits)
    if (vendor.tier === 'free') {
      const { count: vendorResponseCount } = await supabaseServer
        .from('vendor_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendor_id)
        .gte('created_at', startOfMonth.toISOString());

      if ((vendorResponseCount || 0) >= 5) {
        return NextResponse.json({
          error: 'This vendor has reached their monthly inquiry limit. Please try another vendor or check back next month.',
          vendorLimitReached: true
        }, { status: 403 });
      }
    }

    // Get bride details for notification
    const { data: brideUser } = await supabaseServer
      .from('profiles')
      .select('first_name, email')
      .eq('id', bride_id)
      .single();

    const brideFirstName = brideUser?.first_name || 'A bride';

    // Create the booking
    const { data, error } = await supabaseServer
      .from('vendor_bookings')
      .insert({
        bride_id,
        vendor_id,
        vendor_category: vendor.category || '',
        wedding_date: wedding_date || null,
        venue_location: venue_location || '',
        message: message || '',
        status: 'pending',
      })
      .select();

    if (error) throw error;

    // Increment vendor's booking_requests count
    await supabaseServer.rpc('increment_booking_requests', { vendor_id_input: vendor_id });

    // Send vendor notification email (don't wait for it, don't fail if it errors)
    const bookingId = data?.[0]?.id;
    fetch(`${request.nextUrl.origin}/api/vendor-inquiry-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorEmail: vendor.email,
        vendorBusinessName: vendor.business_name,
        brideFirstName,
        weddingDate: wedding_date,
        venueLocation: venue_location,
        messagePreview: message,
        category: vendor.category,
        bookingId,
      }),
    }).catch(err => console.error('Vendor notification failed:', err));

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
