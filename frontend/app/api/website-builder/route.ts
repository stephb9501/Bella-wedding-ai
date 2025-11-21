import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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
      // Fetch website and verify ownership through wedding
      const { data: website, error } = await supabase
        .from('wedding_websites')
        .select('*, weddings!inner(bride_id, groom_id)')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Website not found' }, { status: 404 });
      }

      // Authorization check
      const isOwner = website.weddings.bride_id === session.user.id ||
                      website.weddings.groom_id === session.user.id;

      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(website);
    }

    if (weddingId) {
      // Authorization check - verify wedding ownership
      const isOwner = await verifyWeddingOwnership(supabase, weddingId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('wedding_websites')
        .select('*')
        .eq('wedding_id', weddingId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
      }

      return NextResponse.json(data || null);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Website GET error:', error);
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
      site_name,
      bride_name,
      groom_name,
      theme,
      ceremony_date,
      ceremony_location,
      reception_date,
      reception_location,
      design_settings,
    } = body;

    if (!wedding_id || !site_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Authorization check - verify wedding ownership
    const isOwner = await verifyWeddingOwnership(supabase, wedding_id, session.user.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const site_slug = generateSlug(site_name);

    // Whitelist allowed fields
    const insertData = {
      wedding_id,
      site_name,
      site_slug,
      bride_name: bride_name || '',
      groom_name: groom_name || '',
      theme: theme || 'classic',
      ceremony_date: ceremony_date || null,
      ceremony_location: ceremony_location || '',
      reception_date: reception_date || null,
      reception_location: reception_location || '',
      design_settings: design_settings || {},
      is_published: false,
      enable_rsvp: true,
      view_count: 0,
    };

    const { data, error } = await supabase
      .from('wedding_websites')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create website' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Website POST error:', error);
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
      return NextResponse.json({ error: 'Missing website id' }, { status: 400 });
    }

    // First, verify ownership
    const { data: website, error: fetchError } = await supabase
      .from('wedding_websites')
      .select('wedding_id, weddings!inner(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = website.weddings.bride_id === session.user.id ||
                    website.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields (fix mass assignment vulnerability)
    const allowedFields = [
      'site_name',
      'bride_name',
      'groom_name',
      'theme',
      'ceremony_date',
      'ceremony_time',
      'ceremony_location',
      'ceremony_venue',
      'reception_date',
      'reception_time',
      'reception_location',
      'reception_venue',
      'design_settings',
      'meta_description',
      'meta_image',
      'header_image_url',
      'custom_domain',
      'is_password_protected',
      'password_hash',
      'enable_rsvp',
      'is_published',
      'published_at',
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
      .from('wedding_websites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update website' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Website PUT error:', error);
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
      return NextResponse.json({ error: 'Missing website id' }, { status: 400 });
    }

    // Verify ownership before delete
    const { data: website, error: fetchError } = await supabase
      .from('wedding_websites')
      .select('wedding_id, weddings!inner(bride_id, groom_id)')
      .eq('id', id)
      .single();

    if (fetchError || !website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    // Authorization check
    const isOwner = website.weddings.bride_id === session.user.id ||
                    website.weddings.groom_id === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('wedding_websites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Website DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
