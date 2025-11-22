import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
      // Fetch invitation and verify ownership
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('*, weddings(bride_id, groom_id)')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }

      // Authorization check
      const wedding = invitation.weddings as any;
      const isOwner = wedding.bride_id === session.user.id ||
                      wedding.groom_id === session.user.id;

      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(invitation);
    }

    if (weddingId) {
      // Authorization check
      const isOwner = await verifyWeddingOwnership(supabase, weddingId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Invitations GET error:', error);
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
      template_id,
      bride_name,
      groom_name,
      ceremony_date,
      ceremony_time,
      ceremony_venue,
      ceremony_address,
      reception_venue,
      reception_address,
      rsvp_deadline,
      rsvp_contact,
      custom_message,
      custom_colors,
      header_image_url,
      is_finalized,
    } = body;

    if (!wedding_id || !template_id) {
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
      template_id,
      bride_name: bride_name || '',
      groom_name: groom_name || '',
      ceremony_date: ceremony_date || null,
      ceremony_time: ceremony_time || null,
      ceremony_venue: ceremony_venue || '',
      ceremony_address: ceremony_address || '',
      reception_venue: reception_venue || '',
      reception_address: reception_address || '',
      rsvp_deadline: rsvp_deadline || null,
      rsvp_contact: rsvp_contact || '',
      custom_message: custom_message || '',
      custom_colors: custom_colors || {},
      header_image_url: header_image_url || null,
      is_finalized: is_finalized || false,
    };

    const { data, error } = await supabase
      .from('invitations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Invitations POST error:', error);
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
      return NextResponse.json({ error: 'Missing invitation id' }, { status: 400 });
    }

    // Verify ownership
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('wedding_id, weddings(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Authorization check
    const wedding = invitation.weddings as any;
      const isOwner = wedding.bride_id === session.user.id ||
                    wedding.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields
    const allowedFields = [
      'template_id',
      'bride_name',
      'groom_name',
      'ceremony_date',
      'ceremony_time',
      'ceremony_venue',
      'ceremony_address',
      'reception_venue',
      'reception_address',
      'rsvp_deadline',
      'rsvp_contact',
      'custom_message',
      'custom_colors',
      'header_image_url',
      'is_finalized',
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
      .from('invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Invitations PUT error:', error);
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
      return NextResponse.json({ error: 'Missing invitation id' }, { status: 400 });
    }

    // Verify ownership
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('wedding_id, weddings(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Authorization check
    const wedding = invitation.weddings as any;
      const isOwner = wedding.bride_id === session.user.id ||
                    wedding.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Invitations DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
