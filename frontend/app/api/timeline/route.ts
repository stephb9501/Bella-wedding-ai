import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role to bypass RLS for admin operations
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/timeline - Fetch timeline events for a wedding
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('wedding_id');
    const userId = searchParams.get('user_id'); // Legacy support

    // Support both new wedding_id and legacy user_id
    const query = supabaseServer.from('timeline_events').select('*');

    if (weddingId) {
      query.eq('wedding_id', weddingId);
    } else if (userId) {
      query.eq('user_id', userId);
    } else {
      return NextResponse.json({ error: 'wedding_id or user_id is required' }, { status: 400 });
    }

    const { data: events, error } = await query.order('event_time', { ascending: true });

    if (error) {
      console.error('Error fetching timeline events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(events || []);
  } catch (error) {
    console.error('Error in GET /api/timeline:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/timeline - Create a new timeline event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wedding_id,
      user_id, // Legacy support
      title,
      description,
      event_time,
      category,
      status,
      created_by,
      created_by_role,
      is_visible_to_team,
      enabled, // Legacy support
    } = body;

    if (!title || !event_time) {
      return NextResponse.json(
        { error: 'Missing required fields: title, event_time' },
        { status: 400 }
      );
    }

    const insertData: any = {
      title,
      description: description || '',
      event_time,
      category: category || 'other',
      enabled: enabled !== undefined ? enabled : true,
    };

    // New wedding collaboration system
    if (wedding_id && created_by && created_by_role) {
      insertData.wedding_id = wedding_id;
      insertData.created_by = created_by;
      insertData.created_by_role = created_by_role;
      insertData.status = status || 'published';
      insertData.is_visible_to_team = is_visible_to_team !== undefined ? is_visible_to_team : true;
      insertData.last_edited_by = created_by;
      insertData.last_edited_at = new Date().toISOString();

      if (insertData.status === 'published') {
        insertData.published_by = created_by;
        insertData.published_at = new Date().toISOString();
      }
    }
    // Legacy system
    else if (user_id) {
      insertData.user_id = user_id;
    } else {
      return NextResponse.json(
        { error: 'Either (wedding_id, created_by, created_by_role) or user_id is required' },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabaseServer
      .from('timeline_events')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error in POST /api/timeline:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/timeline - Update an existing timeline event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    const updateData: any = { ...updates };

    // Handle new collaboration fields
    if (updates.last_edited_by) {
      updateData.last_edited_at = new Date().toISOString();
    }

    // If status is changing to published, set published_by and published_at
    if (updates.status === 'published' && !updates.published_at) {
      updateData.published_at = new Date().toISOString();
      if (updates.published_by) {
        updateData.published_by = updates.published_by;
      }
    }

    // Legacy updated_at field
    if (!updateData.last_edited_at) {
      updateData.updated_at = new Date().toISOString();
    }

    const { data: event, error } = await supabaseServer
      .from('timeline_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating timeline event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error in PUT /api/timeline:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/timeline - Delete a timeline event
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('timeline_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting timeline event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/timeline:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
