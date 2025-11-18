import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('music_playlists')
      .select('*')
      .eq('project_id', projectId)
      .order('event_part', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Playlists GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { project_id, vendor_id, event_part, songs } = await request.json();

    if (!project_id || !vendor_id || !event_part || !songs) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('music_playlists')
      .insert({
        project_id,
        vendor_id,
        event_part,
        songs,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Playlist POST error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, event_part, songs } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing playlist id' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (event_part !== undefined) updateData.event_part = event_part;
    if (songs !== undefined) updateData.songs = songs;

    const { data, error } = await supabaseServer
      .from('music_playlists')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Playlist PUT error:', error);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing playlist id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('music_playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Playlist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
