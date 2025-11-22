import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper to verify seating chart ownership
async function verifySeatingChartOwnership(supabase: any, seatingChartId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('seating_charts')
    .select('id, wedding_id, weddings(bride_id, groom_id)')
    .eq('id', seatingChartId)
    .single();

  if (error || !data) return false;

  return data.weddings.bride_id === userId || data.weddings.groom_id === userId;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seatingChartId = searchParams.get('seating_chart_id');
    const id = searchParams.get('id');

    if (id) {
      // Fetch table and verify ownership through seating chart
      const { data: table, error } = await supabase
        .from('seating_tables')
        .select('*, seating_charts!inner(wedding_id, weddings(bride_id, groom_id))')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 });
      }

      // Authorization check
      const chart = table.seating_charts as any;
      const wedding = chart?.weddings as any;
      const isOwner = wedding?.bride_id === session.user.id ||
                      wedding?.groom_id === session.user.id;

      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(table);
    }

    if (seatingChartId) {
      // Authorization check
      const isOwner = await verifySeatingChartOwnership(supabase, seatingChartId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('seating_tables')
        .select('*')
        .eq('seating_chart_id', seatingChartId)
        .order('table_number', { ascending: true });

      if (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Seating tables GET error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Authorization check
    const isOwner = await verifySeatingChartOwnership(supabase, seating_chart_id, session.user.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields
    const insertData = {
      seating_chart_id,
      table_number,
      table_name: table_name || null,
      table_shape: table_shape || 'round',
      capacity,
      position_x: position_x || 0,
      position_y: position_y || 0,
      rotation: rotation || 0,
      notes: notes || null,
    };

    const { data, error } = await supabase
      .from('seating_tables')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Seating tables POST error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...rawUpdates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
    }

    // Verify ownership through seating chart
    const { data: table, error: fetchError } = await supabase
      .from('seating_tables')
      .select('seating_chart_id, seating_charts!inner(wedding_id, weddings(bride_id, groom_id))')
      .eq('id', id)
      .single();

    if (fetchError || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = const chart = table.seating_charts as any;
      const wedding = chart?.weddings as any;
      const isOwner = wedding?.bride_id === session.user.id ||
                      wedding?.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields
    const allowedFields = [
      'table_number',
      'table_name',
      'table_shape',
      'capacity',
      'position_x',
      'position_y',
      'rotation',
      'notes',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (rawUpdates[field] !== undefined) {
        updates[field] = rawUpdates[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('seating_tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Seating tables PUT error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
    }

    // Verify ownership through seating chart
    const { data: table, error: fetchError } = await supabase
      .from('seating_tables')
      .select('seating_chart_id, table_number, seating_charts!inner(wedding_id, weddings(bride_id, groom_id))')
      .eq('id', id)
      .single();

    if (fetchError || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = const chart = table.seating_charts as any;
      const wedding = chart?.weddings as any;
      const isOwner = wedding?.bride_id === session.user.id ||
                      wedding?.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // First, unassign all guests from this table
    if (table.table_number) {
      await supabase
        .from('guests')
        .update({ table_number: null })
        .eq('table_number', table.table_number);
    }

    // Then delete the table
    const { error } = await supabase
      .from('seating_tables')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Seating tables DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
