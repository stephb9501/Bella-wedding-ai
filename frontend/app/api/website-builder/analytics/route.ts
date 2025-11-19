import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST - Track page view (public)
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const body = await request.json();
    const { website_id, page_visited, referrer } = body;

    if (!website_id) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 });
    }

    // Get client info
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || '';

    // Track analytics
    const { error: analyticsError } = await supabase
      .from('wedding_website_analytics')
      .insert({
        website_id,
        visitor_ip: ip,
        visitor_user_agent: userAgent,
        page_visited: page_visited || '/',
        referrer,
      });

    if (analyticsError) {
      console.error('Error tracking analytics:', analyticsError);
    }

    // Increment view counter
    const { error: viewError } = await supabase.rpc('increment_website_views', {
      p_website_id: website_id
    });

    if (viewError) {
      console.error('Error incrementing views:', viewError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Get analytics (owner only)
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('website_id');

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 });
    }

    // Verify ownership
    const { data: website } = await supabase
      .from('wedding_websites')
      .select('user_id, page_views, unique_visitors, last_viewed_at')
      .eq('id', websiteId)
      .single();

    if (!website || website.user_id !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get detailed analytics
    const { data: analytics, error } = await supabase
      .from('wedding_website_analytics')
      .select('*')
      .eq('website_id', websiteId)
      .order('visited_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate unique visitors (by IP and session)
    const uniqueIPs = new Set(analytics?.map(a => a.visitor_ip).filter(Boolean));
    const uniqueSessions = new Set(analytics?.map(a => a.session_id).filter(Boolean));

    // Group by date
    const viewsByDate: Record<string, number> = {};
    analytics?.forEach(a => {
      const date = new Date(a.visited_at).toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    // Top referrers
    const referrerCounts: Record<string, number> = {};
    analytics?.forEach(a => {
      if (a.referrer) {
        referrerCounts[a.referrer] = (referrerCounts[a.referrer] || 0) + 1;
      }
    });

    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }));

    return NextResponse.json({
      summary: {
        page_views: website.page_views,
        unique_ips: uniqueIPs.size,
        unique_sessions: uniqueSessions.size,
        last_viewed_at: website.last_viewed_at,
      },
      views_by_date: viewsByDate,
      top_referrers: topReferrers,
      recent_visits: analytics?.slice(0, 20) || [],
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
