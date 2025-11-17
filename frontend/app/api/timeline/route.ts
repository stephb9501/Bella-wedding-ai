import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
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
      .order('event_time', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Timeline GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, event_time, title, description, category, enabled } = body;

    if (!user_id || !event_time || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('timeline_events')
      .insert({
        user_id,
        event_time,
        title,
        description: description || '',
        category: category || 'general',
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
  try {
    const body = await request.json();
    const { id, event_time, title, description, category, enabled } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing timeline event id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('timeline_events')
      .update({
        event_time,
        title,
        description,
        category,
        enabled,
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
