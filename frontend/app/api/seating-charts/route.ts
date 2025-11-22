import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper to verify wedding ownership
async function verifyWeddingOwnership(supabase: any, weddingId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('weddings')
    .select('id, bride_id, groom_id')
    .eq('id', weddingId)
    .single();

  if (error || !data) return false;

  return data.bride_id === userId || data.groom_id === userId;
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
    const weddingId = searchParams.get('wedding_id');
    const id = searchParams.get('id');

    if (id) {
      // Fetch seating chart and verify ownership
      const { data: chart, error } = await supabase
        .from('seating_charts')
        .select('*, weddings!inner(bride_id, groom_id)')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Seating chart not found' }, { status: 404 });
      }

      // Authorization check
      const isOwner = chart.weddings.bride_id === session.user.id ||
                      chart.weddings.groom_id === session.user.id;

      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(chart);
    }

    if (weddingId) {
      // Authorization check
      const isOwner = await verifyWeddingOwnership(supabase, weddingId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('seating_charts')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch seating charts' }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Seating charts GET error:', error);
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
      wedding_id,
      name,
      venue_name,
      layout_data,
      is_active,
    } = body;

    if (!wedding_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Authorization check
    const isOwner = await verifyWeddingOwnership(supabase, wedding_id, session.user.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields
    const insertData = {
      wedding_id,
      name,
      venue_name: venue_name || null,
      layout_data: layout_data || {},
      is_active: is_active !== undefined ? is_active : true,
    };

    const { data, error } = await supabase
      .from('seating_charts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create seating chart' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Seating charts POST error:', error);
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
      return NextResponse.json({ error: 'Missing chart id' }, { status: 400 });
    }

    // Verify ownership
    const { data: chart, error: fetchError } = await supabase
      .from('seating_charts')
      .select('wedding_id, weddings!inner(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !chart) {
      return NextResponse.json({ error: 'Seating chart not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = chart.weddings.bride_id === session.user.id ||
                    chart.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields
    const allowedFields = ['name', 'venue_name', 'layout_data', 'is_active'];
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
      .from('seating_charts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update seating chart' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Seating charts PUT error:', error);
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
      return NextResponse.json({ error: 'Missing chart id' }, { status: 400 });
    }

    // Verify ownership
    const { data: chart, error: fetchError } = await supabase
      .from('seating_charts')
      .select('wedding_id, weddings!inner(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !chart) {
      return NextResponse.json({ error: 'Seating chart not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = chart.weddings.bride_id === session.user.id ||
                    chart.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('seating_charts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete seating chart' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Seating charts DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
