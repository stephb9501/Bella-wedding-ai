import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { calculateVendorMatchScore, getTopRecommendations, Vendor } from '@/lib/recommendation-engine';

export const dynamic = 'force-dynamic';

// GET /api/recommendations - Get personalized vendor recommendations
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
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const refresh = searchParams.get('refresh') === 'true'; // Force recalculation

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

    // Get preferences
    const { data: preferences, error: prefError } = await supabase
      .from('wedding_preferences')
      .select('*')
      .eq('wedding_id', weddingId)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    // If no preferences, return empty recommendations with suggestion
    if (!preferences) {
      return NextResponse.json({
        recommendations: [],
        message: 'Please set your wedding preferences to get personalized recommendations',
        has_preferences: false,
      });
    }

    // Check for cached recommendations (if not forcing refresh)
    if (!refresh) {
      let cachedQuery = supabase
        .from('vendor_recommendations')
        .select(`
          *,
          vendor:vendors(*)
        `)
        .eq('wedding_id', weddingId)
        .gt('expires_at', new Date().toISOString())
        .order('match_score', { ascending: false })
        .limit(limit);

      if (category) {
        cachedQuery = cachedQuery.eq('vendor.category', category);
      }

      const { data: cached, error: cacheError } = await cachedQuery;

      if (!cacheError && cached && cached.length > 0) {
        return NextResponse.json({
          recommendations: cached,
          from_cache: true,
          has_preferences: true,
        });
      }
    }

    // Get user location (from their profile or preferences)
    const { data: userData } = await supabase
      .from('users')
      .select('city, state, latitude, longitude')
      .eq('id', session.user.id)
      .single();

    const brideLocation = (userData?.latitude && userData?.longitude)
      ? { latitude: userData.latitude, longitude: userData.longitude }
      : undefined;

    // Get vendors to score
    let vendorsQuery = supabase
      .from('vendors')
      .select(`
        *,
        badges:vendor_badges(badge_type)
      `);

    if (category) {
      vendorsQuery = vendorsQuery.eq('category', category);
    }

    // Fetch vendors
    const { data: vendors, error: vendorsError } = await vendorsQuery;

    if (vendorsError) {
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    if (!vendors || vendors.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: category
          ? `No ${category} vendors found`
          : 'No vendors found',
        has_preferences: true,
      });
    }

    // Calculate recommendations
    const recommendations = getTopRecommendations(
      vendors as unknown as Vendor[],
      preferences,
      brideLocation,
      limit
    );

    // Save recommendations to cache
    const recommendationsToInsert = recommendations.map(rec => ({
      wedding_id: weddingId,
      vendor_id: rec.vendor_id,
      match_score: rec.match_score,
      confidence_level: rec.confidence_level,
      budget_match_score: rec.budget_match_score,
      style_match_score: rec.style_match_score,
      location_match_score: rec.location_match_score,
      rating_score: rec.rating_score,
      availability_score: rec.availability_score,
      popularity_score: rec.popularity_score,
      reason: rec.reason,
      match_highlights: rec.match_highlights,
      potential_concerns: rec.potential_concerns,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    }));

    // Upsert recommendations
    if (recommendationsToInsert.length > 0) {
      await supabase
        .from('vendor_recommendations')
        .upsert(recommendationsToInsert, {
          onConflict: 'wedding_id,vendor_id',
          ignoreDuplicates: false,
        });
    }

    // Fetch full vendor data for response
    const vendorIds = recommendations.map(r => r.vendor_id);
    const { data: fullVendors } = await supabase
      .from('vendors')
      .select(`
        *,
        badges:vendor_badges(badge_type)
      `)
      .in('id', vendorIds);

    // Merge vendor data with scores
    const enrichedRecommendations = recommendations.map(rec => {
      const vendor = fullVendors?.find(v => v.id === rec.vendor_id);
      return {
        ...rec,
        vendor,
      };
    });

    return NextResponse.json({
      recommendations: enrichedRecommendations,
      from_cache: false,
      has_preferences: true,
      count: enrichedRecommendations.length,
    });
  } catch (error) {
    console.error('Error in GET /api/recommendations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/recommendations - Mark recommendation as interested/not interested
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wedding_id, vendor_id, interested } = body;

    if (!wedding_id || !vendor_id || typeof interested !== 'boolean') {
      return NextResponse.json(
        { error: 'wedding_id, vendor_id, and interested (boolean) are required' },
        { status: 400 }
      );
    }

    // Update recommendation
    const { data, error } = await supabase
      .from('vendor_recommendations')
      .update({
        interested,
        viewed_at: interested ? new Date().toISOString() : undefined,
      })
      .eq('wedding_id', wedding_id)
      .eq('vendor_id', vendor_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Track interaction
    await supabase.from('vendor_interactions').insert({
      user_id: session.user.id,
      vendor_id,
      wedding_id,
      interaction_type: interested ? 'save' : 'dismiss',
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/recommendations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
