import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const vendorId = searchParams.get('vendor_id');
    const status = searchParams.get('status');

    if (!userId && !vendorId) {
      return NextResponse.json({ error: 'Missing user_id or vendor_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('bookings')
      .select('*, vendors(business_name, category), users(full_name, email)');

    if (userId) query = query.eq('user_id', userId);
    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (status) query = query.eq('status', status);

    query = query.order('booking_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      user_id,
      vendor_id,
      booking_date,
      booking_time,
      service_type,
      message,
      budget_range,
    } = body;

    if (!user_id || !vendor_id || !booking_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('bookings')
      .insert({
        user_id,
        vendor_id,
        booking_date,
        booking_time: booking_time || null,
        service_type: service_type || null,
        message: message || null,
        budget_range: budget_range || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // In production, send notification to vendor

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Booking POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { booking_id, status, vendor_response } = body;

    if (!booking_id || !status) {
      return NextResponse.json({ error: 'Missing booking_id or status' }, { status: 400 });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (vendor_response) {
      updateData.vendor_response = vendor_response;
    }

    if (status === 'accepted' || status === 'declined') {
      updateData.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabaseServer
      .from('bookings')
      .update(updateData)
      .eq('id', booking_id)
      .select()
      .single();

    if (error) throw error;

    // In production, send notification to bride

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Booking PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Booking DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
