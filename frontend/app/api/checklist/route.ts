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
      .from('checklist_items')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Checklist GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, task, category, due_date, completed, order_index } = body;

    if (!user_id || !task) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error} = await supabaseServer
      .from('checklist_items')
      .insert({
        user_id,
        task,
        category: category || 'General',
        due_date: due_date || null,
        completed: completed || false,
        order_index: order_index || 0,
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error: any) {
    console.error('Checklist POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, task, category, due_date, completed } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing checklist item id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('checklist_items')
      .update({
        task,
        category,
        due_date,
        completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {});
  } catch (error: any) {
    console.error('Checklist PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Checklist DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
