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
      .from('wedding_info_checklist')
      .select('*')
      .eq('project_id', projectId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Checklist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { project_id, vendor_id, item_name, category, description, priority } = await request.json();

    if (!project_id || !vendor_id || !item_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('wedding_info_checklist')
      .insert({
        project_id,
        vendor_id,
        item_name,
        category: category || null,
        description: description || null,
        priority: priority || 'medium',
        is_completed: false,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Checklist POST error:', error);
    return NextResponse.json({ error: 'Failed to create checklist item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, item_name, category, description, priority, is_completed } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing checklist item id' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (item_name !== undefined) updateData.item_name = item_name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (is_completed !== undefined) {
      updateData.is_completed = is_completed;
      if (is_completed) {
        updateData.completed_date = new Date().toISOString();
      } else {
        updateData.completed_date = null;
      }
    }

    const { data, error } = await supabaseServer
      .from('wedding_info_checklist')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Checklist PUT error:', error);
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing checklist item id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('wedding_info_checklist')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checklist DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 });
  }
}
