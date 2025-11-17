import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minRating = searchParams.get('min_rating');
    const location = searchParams.get('location');
    const sort = searchParams.get('sort') || 'rating';

    let query = supabaseServer
      .from('vendors')
      .select('*');

    // Apply filters
    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }

    if (location) {
      query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%,zip.eq.${location}`);
    }

    // Fetch all and filter by price/rating in memory (since these might not be in DB yet)
    const { data, error } = await query;

    if (error) throw error;

    let vendors = data || [];

    // Mock data enhancement for demo
    vendors = vendors.map(v => ({
      ...v,
      starting_price: Math.floor(Math.random() * 5000) + 500,
      average_rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      review_count: Math.floor(Math.random() * 50) + 5,
      years_in_business: Math.floor(Math.random() * 15) + 2,
      weddings_completed: Math.floor(Math.random() * 100) + 10,
      photo_urls: v.photo_count > 0 ? ['/wedding-photos/deltalow-131.jpg'] : [],
    }));

    // Filter by price
    if (minPrice) {
      vendors = vendors.filter(v => v.starting_price >= parseInt(minPrice));
    }
    if (maxPrice) {
      vendors = vendors.filter(v => v.starting_price <= parseInt(maxPrice));
    }

    // Filter by rating
    if (minRating) {
      vendors = vendors.filter(v => parseFloat(v.average_rating) >= parseFloat(minRating));
    }

    // Sort
    switch (sort) {
      case 'price_low':
        vendors.sort((a, b) => a.starting_price - b.starting_price);
        break;
      case 'price_high':
        vendors.sort((a, b) => b.starting_price - a.starting_price);
        break;
      case 'rating':
        vendors.sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));
        break;
      case 'newest':
        vendors.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Prioritize featured/elite vendors
    const tierOrder = { elite: 4, featured: 3, premium: 2, free: 1 };
    vendors.sort((a, b) => (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0));

    return NextResponse.json(vendors);
  } catch (error: any) {
    console.error('Vendor search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
