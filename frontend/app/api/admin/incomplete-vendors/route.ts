import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Fetch vendors with missing information
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch vendors that are missing at least one piece of information
    const { data: vendors, error } = await supabase
      .from('vendor_listings')
      .select('*')
      .or('email.is.null,phone.is.null,website_url.is.null,city.is.null,state.is.null,zip_code.is.null,short_description.is.null')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      vendors: vendors || [],
      total: vendors?.length || 0,
    });
  } catch (error: any) {
    console.error('Fetch incomplete vendors error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update vendor information
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { vendor_id, email, phone, website_url, city, state, zip_code, short_description } = await request.json();

    if (!vendor_id) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    }

    // Build update object (only include fields that are provided)
    const updateData: any = { updated_at: new Date().toISOString() };
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (website_url !== undefined) updateData.website_url = website_url || null;
    if (city !== undefined) updateData.city = city || null;
    if (state !== undefined) updateData.state = state || null;
    if (zip_code !== undefined) updateData.zip_code = zip_code || null;
    if (short_description !== undefined) updateData.short_description = short_description || null;

    // Update vendor
    const { data, error } = await supabase
      .from('vendor_listings')
      .update(updateData)
      .eq('id', vendor_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      vendor: data,
    });
  } catch (error: any) {
    console.error('Update vendor error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
