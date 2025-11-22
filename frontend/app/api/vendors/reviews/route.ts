import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Helper to get authenticated user
async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const sort = searchParams.get('sort') || 'recent'; // recent, rating, helpful
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });
    }

    // Build query with user info
    let query = supabase
      .from('vendor_reviews')
      .select(`
        *,
        users:user_id (
          full_name,
          email
        )
      `)
      .eq('vendor_id', vendorId);

    // Apply sorting
    if (sort === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (sort === 'helpful') {
      query = query.order('helpful_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error } = await query;

    if (error) throw error;

    // Get vendor rating stats
    const { data: vendor } = await supabase
      .from('vendors')
      .select('average_rating, review_count')
      .eq('id', vendorId)
      .single();

    // Calculate rating distribution
    const { data: ratingDist } = await supabase
      .from('vendor_reviews')
      .select('rating')
      .eq('vendor_id', vendorId);

    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = ratingDist?.filter(r => r.rating === stars).length || 0;
      return {
        stars,
        count,
        percentage: ratingDist && ratingDist.length > 0 ? (count / ratingDist.length) * 100 : 0
      };
    });

    return NextResponse.json({
      reviews: reviews || [],
      average_rating: vendor?.average_rating || 0,
      total_reviews: vendor?.review_count || 0,
      rating_distribution: distribution,
    });
  } catch (error: any) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { user_id, vendor_id, rating, title, review_text, verified_booking } = body;

    if (!user_id || !vendor_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this vendor
    const { data: existingReview } = await supabase
      .from('vendor_reviews')
      .select('id')
      .eq('user_id', user_id)
      .eq('vendor_id', vendor_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this vendor. Please update your existing review instead.' },
        { status: 400 }
      );
    }

    // Check if user has a verified booking with this vendor
    const { data: booking } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user_id)
      .eq('vendor_id', vendor_id)
      .eq('status', 'confirmed')
      .single();

    const isVerified = verified_booking && booking ? true : false;

    // Create review
    const { data, error } = await supabase
      .from('vendor_reviews')
      .insert({
        user_id,
        vendor_id,
        rating,
        title: title || null,
        review_text: review_text || null,
        verified_booking: isVerified,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Review POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { review_id, user_id, rating, title, review_text } = body;

    if (!review_id || !user_id) {
      return NextResponse.json({ error: 'Missing review_id or user_id' }, { status: 400 });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Verify ownership
    const { data: review } = await supabase
      .from('vendor_reviews')
      .select('user_id')
      .eq('id', review_id)
      .single();

    if (!review || review.user_id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update review
    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (review_text !== undefined) updateData.review_text = review_text;

    const { data, error } = await supabase
      .from('vendor_reviews')
      .update(updateData)
      .eq('id', review_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Review PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!reviewId || !userId) {
      return NextResponse.json({ error: 'Missing review id or user_id' }, { status: 400 });
    }

    // Verify ownership
    const { data: review } = await supabase
      .from('vendor_reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (!review || review.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('vendor_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Review DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}
