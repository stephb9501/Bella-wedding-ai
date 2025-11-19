import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Search vendors by zip code radius, city, or state
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    const zip = searchParams.get('zip');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('vendor_listings').select('*');

    if (zip) {
      query = query.eq('zip_code', zip);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    if (state) {
      query = query.ilike('state', `%${state}%`);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }

    const { data, error } = await query.order('view_count', { ascending: false }).limit(100);

    if (error) throw error;

    return NextResponse.json({
      vendors: data || [],
      total: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Vendor search error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
