import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('timeline_events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Timeline GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      user_id,
      event_name,
      event_date,
      event_time,
      location,
      description,
      category,
      order_index,
      notes,
      music_cue,
      assigned_to,
      completed,
      enabled
    } = body;

    if (!user_id || !event_name || !event_date || !event_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('timeline_events')
      .insert({
        user_id,
        event_name,
        event_date,
        event_time,
        location: location || null,
        description: description || null,
        category: category || 'wedding-day',
        order_index: order_index || 0,
        notes: notes || null,
        music_cue: music_cue || null,
        assigned_to: assigned_to || [],
        completed: completed || false,
        enabled: enabled !== undefined ? enabled : true,
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error: any) {
    console.error('Timeline POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing timeline event id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('timeline_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {});
  } catch (error: any) {
    console.error('Timeline PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing timeline event id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('timeline_events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Timeline DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH endpoint for bulk updates (used for drag & drop reordering)
export async function PATCH(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { events } = body; // Array of { id, order_index }

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Missing events array' }, { status: 400 });
    }

    // Update all events in a transaction-like manner
    const updates = events.map(async (event) => {
      return supabaseServer
        .from('timeline_events')
        .update({ order_index: event.order_index })
        .eq('id', event.id);
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Timeline PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
