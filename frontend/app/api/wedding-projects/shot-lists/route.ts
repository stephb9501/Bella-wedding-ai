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
      .from('shot_lists')
      .select('*')
      .eq('project_id', projectId)
      .order('category', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Shot lists GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch shot lists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { project_id, vendor_id, category, shots } = await request.json();

    if (!project_id || !vendor_id || !category || !shots) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('shot_lists')
      .insert({
        project_id,
        vendor_id,
        category,
        shots,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Shot list POST error:', error);
    return NextResponse.json({ error: 'Failed to create shot list' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, category, shots } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing shot list id' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (category !== undefined) updateData.category = category;
    if (shots !== undefined) updateData.shots = shots;

    const { data, error } = await supabaseServer
      .from('shot_lists')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Shot list PUT error:', error);
    return NextResponse.json({ error: 'Failed to update shot list' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing shot list id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('shot_lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shot list DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete shot list' }, { status: 500 });
  }
}
