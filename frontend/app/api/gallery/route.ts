import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/gallery?weddingId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('photo_galleries')
      .select('*')
      .eq('wedding_id', weddingId);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 });
  }
}

// POST /api/gallery - Create gallery
export async function POST(request: NextRequest) {
  try {
    const { wedding_id, gallery_name, gallery_description } = await request.json();

    const { data: gallery, error } = await supabase
      .from('photo_galleries')
      .insert({
        wedding_id,
        gallery_name,
        gallery_description,
        is_public: false,
        allow_guest_uploads: true,
        allow_comments: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(gallery, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery:', error);
    return NextResponse.json({ error: 'Failed to create gallery' }, { status: 500 });
  }
}

// PUT /api/gallery - Update gallery
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    const { data: updated, error } = await supabase
      .from('photo_galleries')
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
    console.error('Error updating gallery:', error);
    return NextResponse.json({ error: 'Failed to update gallery' }, { status: 500 });
  }
}

// DELETE /api/gallery - Delete gallery
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('photo_galleries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return NextResponse.json({ error: 'Failed to delete gallery' }, { status: 500 });
  }
}

// GET /api/gallery/photos - Get photos for a gallery
export async function GET_PHOTOS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('galleryId');

    if (!galleryId) {
      return NextResponse.json({ error: 'Missing galleryId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

// POST /api/gallery/photos - Upload photo
export async function POST_PHOTO(request: NextRequest) {
  try {
    const { gallery_id, photo_url, photo_title, photo_description, uploaded_by } = await request.json();

    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        gallery_id,
        photo_url,
        photo_title,
        photo_description,
        uploaded_by,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

// POST /api/gallery/comments - Add comment
export async function POST_COMMENT(request: NextRequest) {
  try {
    const { photo_id, comment_text, commented_by_name, commented_by_email } = await request.json();

    const { data: comment, error } = await supabase
      .from('photo_comments')
      .insert({
        photo_id,
        comment_text,
        commented_by_name,
        commented_by_email,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

// POST /api/gallery/favorites - Add favorite
export async function POST_FAVORITE(request: NextRequest) {
  try {
    const { photo_id, favorited_by_email } = await request.json();

    const { data: favorite, error } = await supabase
      .from('photo_favorites')
      .insert({
        photo_id,
        favorited_by_email,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}