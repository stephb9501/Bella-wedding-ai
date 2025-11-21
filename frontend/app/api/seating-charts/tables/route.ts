import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seatingChartId = searchParams.get('seating_chart_id');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabaseServer
        .from('seating_tables')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (seatingChartId) {
      const { data, error } = await supabaseServer
        .from('seating_tables')
        .select('*')
        .eq('seating_chart_id', seatingChartId)
        .order('table_number', { ascending: true });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Seating tables GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      seating_chart_id,
      table_number,
      table_name,
      table_shape,
      capacity,
      position_x,
      position_y,
      rotation,
      notes,
    } = body;

    if (!seating_chart_id || table_number === undefined || !capacity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('seating_tables')
      .insert({
        seating_chart_id,
        table_number,
        table_name: table_name || null,
        table_shape: table_shape || 'round',
        capacity,
        position_x: position_x || 0,
        position_y: position_y || 0,
        rotation: rotation || 0,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Seating tables POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('seating_tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Seating tables PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
    }

    // First, unassign all guests from this table
    const table = await supabaseServer
      .from('seating_tables')
      .select('table_number')
      .eq('id', id)
      .single();

    if (table.data) {
      await supabaseServer
        .from('guests')
        .update({ table_number: null })
        .eq('table_number', table.data.table_number);
    }

    // Then delete the table
    const { error } = await supabaseServer
      .from('seating_tables')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Seating tables DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
