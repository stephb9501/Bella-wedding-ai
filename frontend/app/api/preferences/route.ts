import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/preferences - Get wedding preferences for current user
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
    const { data: preferences, error } = await supabase
      .from('wedding_preferences')
      .select('*')
      .eq('wedding_id', weddingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(preferences || {});
  } catch (error) {
    console.error('Error in GET /api/preferences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/preferences - Create or update wedding preferences
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wedding_id, ...preferenceData } = body;

    if (!wedding_id) {
      return NextResponse.json({ error: 'wedding_id is required' }, { status: 400 });
    }

    // Verify user has access to this wedding
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id, bride_user_id, groom_user_id')
      .eq('id', wedding_id)
      .single();

    if (weddingError || !wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
    }

    if (wedding.bride_user_id !== session.user.id && wedding.groom_user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - not your wedding' }, { status: 403 });
    }

    // Upsert preferences
    const { data, error } = await supabase
      .from('wedding_preferences')
      .upsert({
        wedding_id,
        user_id: session.user.id,
        ...preferenceData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'wedding_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting preferences:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/preferences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/preferences - Delete wedding preferences
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('wedding_id');

    if (!weddingId) {
      return NextResponse.json({ error: 'wedding_id is required' }, { status: 400 });
    }

    // Delete preferences (RLS will ensure user owns the wedding)
    const { error } = await supabase
      .from('wedding_preferences')
      .delete()
      .eq('wedding_id', weddingId)
      .eq('user_id', session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/preferences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
