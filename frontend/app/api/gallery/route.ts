import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('galleries')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wedding_id, gallery_name, gallery_description } = await request.json();

    if (!wedding_id || !gallery_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('galleries')
      .insert({
        wedding_id,
        gallery_name,
        gallery_description: gallery_description || '',
        is_public: true,
        allow_guest_uploads: false,
        allow_comments: true,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, gallery_name, gallery_description, is_public, allow_guest_uploads, allow_comments } = await request.json();

    if (!id) return NextResponse.json({ error: 'Missing gallery id' }, { status: 400 });

    const updateData: any = {};
    if (gallery_name !== undefined) updateData.gallery_name = gallery_name;
    if (gallery_description !== undefined) updateData.gallery_description = gallery_description;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (allow_guest_uploads !== undefined) updateData.allow_guest_uploads = allow_guest_uploads;
    if (allow_comments !== undefined) updateData.allow_comments = allow_comments;

    const { data, error } = await supabaseServer
      .from('galleries')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Gallery PUT error:', error);
    return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing gallery id' }, { status: 400 });

    const { error } = await supabaseServer
      .from('galleries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 });
  }
}
