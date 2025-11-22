import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/analytics/wedding - Get wedding analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('wedding_id');
    const refresh = searchParams.get('refresh') === 'true';

    if (!weddingId) {
      return NextResponse.json({ error: 'wedding_id is required' }, { status: 400 });
    }

    // Verify user has access to this wedding
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id, bride_user_id, groom_user_id')
      .eq('id', weddingId)
      .single();

    if (weddingError || !wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    if (wedding.bride_user_id !== session.user.id && wedding.groom_user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - not your wedding' }, { status: 403 });
    }

    // Calculate analytics if refresh requested or doesn't exist
    if (refresh) {
      const { error: calcError } = await supabase.rpc('calculate_wedding_analytics', {
        p_wedding_id: weddingId,
      });

      if (calcError) {
        console.error('Error calculating analytics:', calcError);
      }
    }

    // Get analytics
    const { data: analytics, error } = await supabase
      .from('wedding_analytics')
      .select('*')
      .eq('wedding_id', weddingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no analytics exist, calculate them
    if (!analytics) {
      const { error: calcError } = await supabase.rpc('calculate_wedding_analytics', {
        p_wedding_id: weddingId,
      });

      if (calcError) {
        return NextResponse.json({ error: 'Failed to calculate analytics' }, { status: 500 });
      }

      // Fetch again
      const { data: newAnalytics, error: fetchError } = await supabase
        .from('wedding_analytics')
        .select('*')
        .eq('wedding_id', weddingId)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      return NextResponse.json(newAnalytics || {});
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/analytics/wedding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/analytics/wedding/activity - Get activity log
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wedding_id, activity_type, activity_data } = body;

    if (!wedding_id || !activity_type) {
      return NextResponse.json(
        { error: 'wedding_id and activity_type are required' },
        { status: 400 }
      );
    }

    // Log activity
    const { error } = await supabase.rpc('log_activity', {
      p_user_id: session.user.id,
      p_wedding_id: wedding_id,
      p_activity_type: activity_type,
      p_activity_data: activity_data || {},
    });

    if (error) {
      console.error('Error logging activity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/analytics/wedding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
