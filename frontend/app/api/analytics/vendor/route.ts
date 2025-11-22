import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/analytics/vendor - Get vendor analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id') || session.user.id;
    const periodStart = searchParams.get('period_start');
    const periodEnd = searchParams.get('period_end');

    // Verify user is the vendor
    if (vendorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - not your vendor profile' }, { status: 403 });
    }

    // Calculate analytics for the period
    const analytics = await calculateVendorAnalytics(supabase, vendorId, periodStart, periodEnd);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/analytics/vendor:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateVendorAnalytics(
  supabase: any,
  vendorId: string,
  periodStart?: string | null,
  periodEnd?: string | null
) {
  const start = periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const end = periodEnd || new Date().toISOString().split('T')[0];

  // Get booking metrics
  let bookingQuery = supabase
    .from('booking_requests')
    .select('*')
    .eq('vendor_id', vendorId);

  if (periodStart) {
    bookingQuery = bookingQuery.gte('requested_at', start);
  }
  if (periodEnd) {
    bookingQuery = bookingQuery.lte('requested_at', end);
  }

  const { data: bookings, error: bookingError } = await bookingQuery;

  if (bookingError) {
    console.error('Error fetching bookings:', bookingError);
  }

  const totalInquiries = bookings?.length || 0;
  const totalBookings = bookings?.filter(b => b.status === 'accepted').length || 0;
  const pendingRequests = bookings?.filter(b => b.status === 'pending').length || 0;
  const bookingConversionRate = totalInquiries > 0 ? (totalBookings / totalInquiries) * 100 : 0;

  // Get review metrics
  const { data: reviews, error: reviewError } = await supabase
    .from('vendor_reviews')
    .select('rating')
    .eq('vendor_id', vendorId);

  if (reviewError) {
    console.error('Error fetching reviews:', reviewError);
  }

  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews
    : 0;

  const ratingDistribution = {
    five_star: reviews?.filter(r => r.rating === 5).length || 0,
    four_star: reviews?.filter(r => r.rating === 4).length || 0,
    three_star: reviews?.filter(r => r.rating === 3).length || 0,
    two_star: reviews?.filter(r => r.rating === 2).length || 0,
    one_star: reviews?.filter(r => r.rating === 1).length || 0,
  };

  // Get interaction metrics
  let interactionQuery = supabase
    .from('vendor_interactions')
    .select('interaction_type')
    .eq('vendor_id', vendorId);

  if (periodStart) {
    interactionQuery = interactionQuery.gte('created_at', start);
  }
  if (periodEnd) {
    interactionQuery = interactionQuery.lte('created_at', end);
  }

  const { data: interactions, error: interactionError } = await interactionQuery;

  if (interactionError) {
    console.error('Error fetching interactions:', interactionError);
  }

  const profileViews = interactions?.filter(i => i.interaction_type === 'view').length || 0;
  const savedCount = interactions?.filter(i => i.interaction_type === 'save').length || 0;
  const sharedCount = interactions?.filter(i => i.interaction_type === 'share').length || 0;

  // Calculate response metrics
  const responseTimes: number[] = [];
  let respondedRequests = 0;

  bookings?.forEach((booking: any) => {
    if (booking.responded_at && booking.requested_at) {
      const responseTime = new Date(booking.responded_at).getTime() - new Date(booking.requested_at).getTime();
      responseTimes.push(responseTime / (1000 * 60 * 60)); // Convert to hours
      respondedRequests++;
    }
  });

  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const responseRate = totalInquiries > 0 ? (respondedRequests / totalInquiries) * 100 : 100;

  // Get vendor info for category ranking
  const { data: vendor } = await supabase
    .from('vendors')
    .select('category, average_rating')
    .eq('id', vendorId)
    .single();

  // Get category rank (simplified - count vendors with higher ratings in same category)
  let categoryRank = 1;
  if (vendor?.category) {
    const { count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('category', vendor.category)
      .gt('average_rating', vendor.average_rating || 0);

    categoryRank = (count || 0) + 1;
  }

  const analytics = {
    vendor_id: vendorId,
    period_start: start,
    period_end: end,

    // Booking metrics
    total_inquiries: totalInquiries,
    total_bookings: totalBookings,
    booking_conversion_rate: Math.round(bookingConversionRate * 100) / 100,
    pending_requests: pendingRequests,

    // Response metrics
    average_response_time_hours: Math.round(averageResponseTime * 100) / 100,
    response_rate: Math.round(responseRate * 100) / 100,

    // Review metrics
    total_reviews: totalReviews,
    average_rating: Math.round(averageRating * 100) / 100,
    ...ratingDistribution,

    // Visibility metrics
    profile_views: profileViews,
    saved_count: savedCount,
    shared_count: sharedCount,

    // Ranking
    category_rank: categoryRank,

    calculated_at: new Date().toISOString(),
  };

  // Save to database
  await supabase
    .from('vendor_analytics')
    .upsert(analytics, {
      onConflict: 'vendor_id,period_start,period_end',
    });

  return analytics;
}
