import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/website-builder?weddingId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('wedding_websites')
      .select('*')
      .eq('wedding_id', weddingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching website:', error);
    return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
  }
}

// POST /api/website-builder
export async function POST(request: NextRequest) {
  try {
    const { wedding_id, site_name, theme } = await request.json();

    const slug = site_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data: website, error } = await supabase
      .from('wedding_websites')
      .insert({
        wedding_id,
        site_name,
        site_slug: slug,
        theme: theme || 'classic',
        primary_color: '#D4AF37',
        secondary_color: '#B8860B',
      })
      .select()
      .single();

    if (error) throw error;

    // Create default sections
    const sections = ['couple', 'ceremony', 'reception', 'story', 'registry', 'gallery', 'rsvp'];
    for (let i = 0; i < sections.length; i++) {
      await supabase
        .from('website_sections')
        .insert({
          website_id: website.id,
          section_name: sections[i],
          section_order: i,
          is_visible: true,
        });
    }

    await supabase
      .from('website_analytics')
      .insert({
        website_id: website.id,
      });

    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    console.error('Error creating website:', error);
    return NextResponse.json({ error: 'Failed to create website' }, { status: 500 });
  }
}

// PUT /api/website-builder
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    const { data: updated, error } = await supabase
      .from('wedding_websites')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating website:', error);
    return NextResponse.json({ error: 'Failed to update website' }, { status: 500 });
  }
}

// DELETE /api/website-builder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('wedding_websites')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}