import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper to verify moodboard ownership
async function verifyMoodboardOwnership(supabase: any, moodboardId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('moodboards')
    .select('id, wedding_id, weddings!inner(bride_id, groom_id)')
    .eq('id', moodboardId)
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
    const moodboardId = searchParams.get('moodboard_id');
    const id = searchParams.get('id');

    if (id) {
      // Fetch item and verify ownership through moodboard
      const { data: item, error } = await supabase
        .from('moodboard_items')
        .select('*, moodboards!inner(wedding_id, weddings!inner(bride_id, groom_id))')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      // Authorization check
      const isOwner = item.moodboards.weddings.bride_id === session.user.id ||
                      item.moodboards.weddings.groom_id === session.user.id;

      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(item);
    }

    if (moodboardId) {
      // Authorization check
      const isOwner = await verifyMoodboardOwnership(supabase, moodboardId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('moodboard_items')
        .select('*')
        .eq('moodboard_id', moodboardId)
        .order('z_index', { ascending: true });

      if (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Moodboard items GET error:', error);
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

    // Authorization check
    const isOwner = await verifyMoodboardOwnership(supabase, moodboard_id, session.user.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields
    const insertData = {
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
    };

    const { data, error } = await supabase
      .from('moodboard_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Moodboard items POST error:', error);
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
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    // Verify ownership through moodboard
    const { data: item, error: fetchError } = await supabase
      .from('moodboard_items')
      .select('moodboard_id, moodboards!inner(wedding_id, weddings!inner(bride_id, groom_id))')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = item.moodboards.weddings.bride_id === session.user.id ||
                    item.moodboards.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields
    const allowedFields = [
      'item_type',
      'image_url',
      'note',
      'color_value',
      'position_x',
      'position_y',
      'width',
      'height',
      'z_index',
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
      .from('moodboard_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Moodboard items PUT error:', error);
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
      return NextResponse.json({ error: 'Missing item id' }, { status: 400 });
    }

    // Verify ownership through moodboard
    const { data: item, error: fetchError } = await supabase
      .from('moodboard_items')
      .select('moodboard_id, moodboards!inner(wedding_id, weddings!inner(bride_id, groom_id))')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = item.moodboards.weddings.bride_id === session.user.id ||
                    item.moodboards.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('moodboard_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Moodboard items DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
