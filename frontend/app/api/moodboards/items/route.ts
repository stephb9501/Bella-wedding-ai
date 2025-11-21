import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moodboardId = searchParams.get('moodboard_id');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabaseServer
        .from('moodboard_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (moodboardId) {
      const { data, error } = await supabaseServer
        .from('moodboard_items')
        .select('*')
        .eq('moodboard_id', moodboardId)
        .order('z_index', { ascending: true });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Moodboard items GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      moodboard_id,
      item_type,
      image_url,
      note,
      color_value,
      position_x,
      position_y,
      width,
      height,
      z_index,
    } = body;

    if (!moodboard_id || !item_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('moodboard_items')
      .insert({
        moodboard_id,
        item_type,
        image_url: image_url || null,
        note: note || null,
        color_value: color_value || null,
        position_x: position_x || 0,
        position_y: position_y || 0,
        width: width || 100,
        height: height || 100,
        z_index: z_index || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Moodboard items POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('moodboard_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Moodboard items PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('moodboard_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Moodboard items DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
