import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST: Hide/unhide a review
export async function POST(request: NextRequest) {
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

    const { review_id, action, reason, admin_notes } = await request.json();

    if (!review_id || !action || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: review_id, action, reason' },
        { status: 400 }
      );
    }

    // Get current review state
    const { data: review, error: reviewError } = await supabase
      .from('vendor_reviews')
      .select('*')
      .eq('id', review_id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const previousState = {
      is_published: review.is_published,
      is_hidden_by_admin: review.is_hidden_by_admin,
      review_text: review.review_text,
      rating: review.rating,
    };

    let updateData: any = {};
    let logAction = action;

    if (action === 'hide') {
      updateData = {
        is_hidden_by_admin: true,
        is_published: false,
        admin_hidden_reason: reason,
        admin_hidden_at: new Date().toISOString(),
        admin_hidden_by: user.id,
      };
    } else if (action === 'unhide') {
      updateData = {
        is_hidden_by_admin: false,
        is_published: true,
        admin_hidden_reason: null,
        admin_hidden_at: null,
        admin_hidden_by: null,
      };
    } else if (action === 'delete') {
      // Soft delete - mark as hidden and unpublished
      updateData = {
        is_hidden_by_admin: true,
        is_published: false,
        admin_hidden_reason: `DELETED: ${reason}`,
        admin_hidden_at: new Date().toISOString(),
        admin_hidden_by: user.id,
      };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update review
    const { error: updateError } = await supabase
      .from('vendor_reviews')
      .update(updateData)
      .eq('id', review_id);

    if (updateError) {
      console.error('Review update error:', updateError);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    // Get client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || '0.0.0.0';

    // Log moderation action
    const { error: logError } = await supabase
      .from('review_moderation_log')
      .insert({
        review_id,
        admin_id: user.id,
        action: logAction,
        reason,
        admin_notes,
        previous_state: previousState,
        ip_address: ip,
      });

    if (logError) {
      console.error('Moderation log error:', logError);
      // Don't fail the request if logging fails
    }

    // Log admin activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'review_moderation',
      p_entity_type: 'review',
      p_entity_id: review_id,
      p_description: `${action} review: ${reason}`,
      p_metadata: { action, reason, vendor_id: review.vendor_id },
    });

    return NextResponse.json({
      success: true,
      message: `Review ${action === 'hide' ? 'hidden' : action === 'unhide' ? 'unhidden' : 'deleted'} successfully`,
    });
  } catch (error: any) {
    console.error('Review moderation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get all reviews for moderation
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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, hidden, flagged, recent

    let query = supabase
      .from('admin_review_moderation_view')
      .select('*')
      .order('review_date', { ascending: false });

    if (filter === 'hidden') {
      query = query.eq('is_hidden_by_admin', true);
    } else if (filter === 'flagged') {
      // Reviews with low ratings or high moderation count
      query = query.or('rating.lte.2,moderation_count.gte.1');
    } else if (filter === 'recent') {
      // Last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('review_date', sevenDaysAgo.toISOString());
    }

    const { data: reviews, error } = await query.limit(100);

    if (error) {
      console.error('Reviews fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
