import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// POST /api/vendor-interactions - Track vendor interaction
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vendor_id,
      wedding_id,
      interaction_type,
      duration_seconds,
      metadata,
    } = body;

    if (!vendor_id || !interaction_type) {
      return NextResponse.json(
        { error: 'vendor_id and interaction_type are required' },
        { status: 400 }
      );
    }

    // Valid interaction types
    const validTypes = ['view', 'save', 'contact', 'book', 'review', 'share', 'dismiss'];
    if (!validTypes.includes(interaction_type)) {
      return NextResponse.json(
        { error: `Invalid interaction_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert interaction
    const { data, error } = await supabase
      .from('vendor_interactions')
      .insert({
        user_id: session.user.id,
        vendor_id,
        wedding_id: wedding_id || null,
        interaction_type,
        duration_seconds: duration_seconds || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking interaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/vendor-interactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/vendor-interactions - Get interactions for analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const weddingId = searchParams.get('wedding_id');
    const interactionType = searchParams.get('interaction_type');

    let query = supabase
      .from('vendor_interactions')
      .select('*')
      .eq('user_id', session.user.id);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    if (weddingId) {
      query = query.eq('wedding_id', weddingId);
    }

    if (interactionType) {
      query = query.eq('interaction_type', interactionType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/vendor-interactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
