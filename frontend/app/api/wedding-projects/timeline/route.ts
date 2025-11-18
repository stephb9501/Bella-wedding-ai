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
      .from('wedding_timeline')
      .select('*')
      .eq('project_id', projectId)
      .order('time_slot', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Timeline GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { project_id, vendor_id, time_slot, activity, duration_minutes, notes, location } = await request.json();

    if (!project_id || !vendor_id || !time_slot || !activity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('wedding_timeline')
      .insert({
        project_id,
        vendor_id,
        time_slot,
        activity,
        duration_minutes: duration_minutes || null,
        notes: notes || null,
        location: location || null,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Timeline POST error:', error);
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, time_slot, activity, duration_minutes, notes, location } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing timeline id' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (time_slot !== undefined) updateData.time_slot = time_slot;
    if (activity !== undefined) updateData.activity = activity;
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
    if (notes !== undefined) updateData.notes = notes;
    if (location !== undefined) updateData.location = location;

    const { data, error } = await supabaseServer
      .from('wedding_timeline')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Timeline PUT error:', error);
    return NextResponse.json({ error: 'Failed to update timeline' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing timeline id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('wedding_timeline')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Timeline DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 });
  }
}
