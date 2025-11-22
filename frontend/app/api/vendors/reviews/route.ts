import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });
    }

    // In production, fetch from a reviews table
    // For now, returning mock review data

    const mockReviews = [
      {
        id: '1',
        bride_name: 'Sarah M.',
        rating: 5,
        title: 'Absolutely Amazing!',
        review_text: 'This vendor made our wedding day perfect. Professional, responsive, and the quality exceeded our expectations. Highly recommend!',
        wedding_date: '2024-06-15',
        verified: true,
        helpful_count: 12,
        created_at: '2024-06-20T10:00:00Z',
      },
      {
        id: '2',
        bride_name: 'Emily R.',
        rating: 5,
        title: 'Exceeded Expectations',
        review_text: 'We were blown away by the service. Every detail was handled with care and the results were stunning. Thank you!',
        wedding_date: '2024-05-10',
        verified: true,
        helpful_count: 8,
        created_at: '2024-05-15T14:30:00Z',
      },
      {
        id: '3',
        bride_name: 'Jessica T.',
        rating: 4,
        title: 'Great Service',
        review_text: 'Very professional and easy to work with. Minor timing issues but overall a great experience.',
        wedding_date: '2024-04-22',
        verified: true,
        helpful_count: 5,
        created_at: '2024-04-25T09:15:00Z',
      },
    ];

    const totalRating = mockReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = mockReviews.length > 0 ? totalRating / mockReviews.length : 0;

    return NextResponse.json({
      reviews: mockReviews,
      average_rating: averageRating,
      total_reviews: mockReviews.length,
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
