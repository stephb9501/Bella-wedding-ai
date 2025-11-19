import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });
    }

    // Fetch real reviews from database
    const { data: reviews, error } = await supabaseServer
      .from('vendor_reviews')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      // Return empty reviews instead of error
      return NextResponse.json({
        reviews: [],
        average_rating: 0,
        total_reviews: 0,
      });
    }

    const reviewsList = reviews || [];
    const totalRating = reviewsList.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
    const averageRating = reviewsList.length > 0 ? totalRating / reviewsList.length : 0;

    return NextResponse.json({
      reviews: reviewsList,
      average_rating: averageRating,
      total_reviews: reviewsList.length,
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
