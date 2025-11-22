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
      // Fetch moodboard and verify ownership
      const { data: moodboard, error } = await supabase
        .from('moodboards')
        .select('*, weddings(bride_id, groom_id)')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Moodboard not found' }, { status: 404 });
      }

      // Authorization check
      const wedding = moodboard.weddings as any;
      const isOwner = wedding?.bride_id === session.user.id ||
                      wedding?.groom_id === session.user.id;

      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(moodboard);
    }

    if (weddingId) {
      // Authorization check
      const isOwner = await verifyWeddingOwnership(supabase, weddingId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('moodboards')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch moodboards' }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Moodboards GET error:', error);
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
      description,
      color_palette,
      is_public,
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
      description: description || '',
      color_palette: color_palette || [],
      is_public: is_public !== undefined ? is_public : true,
    };

    const { data, error } = await supabase
      .from('moodboards')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create moodboard' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Moodboards POST error:', error);
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
      return NextResponse.json({ error: 'Missing moodboard id' }, { status: 400 });
    }

    // Verify ownership
    const { data: moodboard, error: fetchError } = await supabase
      .from('moodboards')
      .select('wedding_id, weddings(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !moodboard) {
      return NextResponse.json({ error: 'Moodboard not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = const wedding = moodboard.weddings as any;
      const isOwner = wedding?.bride_id === session.user.id ||
                      wedding?.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields
    const allowedFields = ['name', 'description', 'color_palette', 'is_public'];
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
      .from('moodboards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update moodboard' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Moodboards PUT error:', error);
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
      return NextResponse.json({ error: 'Missing moodboard id' }, { status: 400 });
    }

    // Verify ownership
    const { data: moodboard, error: fetchError } = await supabase
      .from('moodboards')
      .select('wedding_id, weddings(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !moodboard) {
      return NextResponse.json({ error: 'Moodboard not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = const wedding = moodboard.weddings as any;
      const isOwner = wedding?.bride_id === session.user.id ||
                      wedding?.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('moodboards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete moodboard' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Moodboards DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
