import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { randomBytes } from 'crypto';

function generateVendorId(): string {
  return `vendor_${randomBytes(12).toString('hex')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    let query = supabaseServer.from('vendors').select('*');

    if (id) {
      query = query.eq('id', id);
      const { data, error } = await query.single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Order by tier (elite > featured > premium > free)
    query = query.order('tier', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vendors GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, email, password, phone, category, city, state, description, tier } = body;

    if (!businessName || !email || !password || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vendorId = generateVendorId();

    // TODO: Hash password before storing
    const { data, error } = await supabaseServer
      .from('vendors')
      .insert({
        id: vendorId,
        business_name: businessName,
        email,
        password, // TODO: Hash this
        phone: phone || '',
        category,
        city: city || '',
        state: state || '',
        description: description || '',
        tier: tier || 'free',
        photo_count: 0,
        message_count_this_month: 0,
        booking_requests: 0,
        profile_views: 0,
        is_featured: tier === 'featured' || tier === 'elite',
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Vendors POST error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Vendors PUT error:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });

    const { error } = await supabaseServer
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendors DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
