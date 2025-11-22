import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

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
    const { bride_id, vendor_id, wedding_date, venue_location, message } = await request.json();

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

    // Get vendor category for permissions
    const { data: vendor } = await supabaseServer
      .from('vendors')
      .select('category')
      .eq('id', vendor_id)
      .single();

    const { data, error } = await supabaseServer
      .from('vendor_bookings')
      .insert({
        bride_id,
        vendor_id,
        vendor_category: vendor?.category || '',
        wedding_date: wedding_date || null,
        venue_location: venue_location || '',
        message: message || '',
        status: 'pending',
      })
      .select();

    if (error) throw error;

    // Increment vendor's booking_requests count
    await supabaseServer.rpc('increment_booking_requests', { vendor_id_input: vendor_id });

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
