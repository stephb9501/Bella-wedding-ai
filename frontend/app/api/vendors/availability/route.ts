import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vendors/availability
 * Fetch availability for a vendor within a date range
 * Query params: vendor_id (required), start_date, end_date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!vendorId) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    }

    let query = supabaseServer
      .from('vendor_availability')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('date', { ascending: true });

    // Apply date range filters if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Availability fetch error:', error);
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vendor availability GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

/**
 * POST /api/vendors/availability
 * Vendor sets availability for dates (supports bulk updates)
 * Body: { vendor_id, dates: [{ date, is_available, time_slot?, price_override?, notes? }] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor_id, dates } = body;

    if (!vendor_id || !dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { error: 'vendor_id and dates array are required' },
        { status: 400 }
      );
    }

    // Verify the vendor belongs to the authenticated user
    const { data: vendor, error: vendorError } = await supabaseServer
      .from('vendors')
      .select('id, user_id')
      .eq('id', vendor_id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user || user.id !== vendor.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Prepare availability records
    const availabilityRecords = dates.map((dateEntry) => ({
      vendor_id,
      date: dateEntry.date,
      is_available: dateEntry.is_available ?? true,
      time_slot: dateEntry.time_slot || 'all_day',
      price_override: dateEntry.price_override || null,
      notes: dateEntry.notes || null,
    }));

    // Upsert availability records (insert or update if exists)
    const { data, error } = await supabaseServer
      .from('vendor_availability')
      .upsert(availabilityRecords, {
        onConflict: 'vendor_id,date,time_slot',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Availability upsert error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    }, { status: 201 });
  } catch (error) {
    console.error('Vendor availability POST error:', error);
    return NextResponse.json({ error: 'Failed to set availability' }, { status: 500 });
  }
}

/**
 * PATCH /api/vendors/availability
 * Update specific date availability
 * Body: { id, is_available?, time_slot?, price_override?, notes? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, is_available, time_slot, price_override, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Availability id is required' }, { status: 400 });
    }

    // Get the availability record to check ownership
    const { data: availability, error: fetchError } = await supabaseServer
      .from('vendor_availability')
      .select('*, vendors(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !availability) {
      return NextResponse.json({ error: 'Availability record not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user || user.id !== availability.vendors.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (is_available !== undefined) updates.is_available = is_available;
    if (time_slot !== undefined) updates.time_slot = time_slot;
    if (price_override !== undefined) updates.price_override = price_override;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('vendor_availability')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Availability update error:', error);
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Vendor availability PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}

/**
 * DELETE /api/vendors/availability
 * Remove availability block
 * Query params: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Availability id is required' }, { status: 400 });
    }

    // Get the availability record to check ownership
    const { data: availability, error: fetchError } = await supabaseServer
      .from('vendor_availability')
      .select('*, vendors(user_id)')
      .eq('id', id)
      .single();

    if (fetchError || !availability) {
      return NextResponse.json({ error: 'Availability record not found' }, { status: 404 });
    }

    // Verify ownership
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user || user.id !== availability.vendors.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabaseServer
      .from('vendor_availability')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Availability delete error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendor availability DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete availability' }, { status: 500 });
  }
}
