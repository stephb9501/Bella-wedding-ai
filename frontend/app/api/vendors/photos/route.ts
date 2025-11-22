import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// GET /api/vendors/photos - Get photos for a vendor
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const category = searchParams.get('category');

    if (!vendorId) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('vendor_photos')
      .select('*')
      .eq('vendor_id', vendorId);

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: photos, error } = await query
      .order('display_order')
      .order('uploaded_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(photos || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/vendors/photos - Upload a new photo
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vendorId = formData.get('vendor_id') as string;
    const caption = formData.get('caption') as string || '';
    const category = formData.get('category') as string || 'gallery';
    const isFeatured = formData.get('is_featured') === 'true';

    if (!file || !vendorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user owns this vendor profile
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor || vendor.id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - you do not own this vendor profile' }, { status: 403 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${randomBytes(16).toString('hex')}.${fileExt}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'vendors', vendorId);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Get the next display_order
    const { data: lastPhoto } = await supabase
      .from('vendor_photos')
      .select('display_order')
      .eq('vendor_id', vendorId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (lastPhoto?.display_order || 0) + 1;

    // Save to database
    const photoUrl = `/uploads/vendors/${vendorId}/${fileName}`;
    const { data, error } = await supabase
      .from('vendor_photos')
      .insert({
        vendor_id: vendorId,
        photo_url: photoUrl,
        caption: caption,
        category: category,
        display_order: nextOrder,
        is_featured: isFeatured,
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// PATCH /api/vendors/photos - Update photo details
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, vendor_id, caption, category, display_order, is_featured } = body;

    if (!id) {
      return NextResponse.json({ error: 'Photo id is required' }, { status: 400 });
    }

    // Get the photo to verify ownership
    const { data: photo, error: photoError } = await supabase
      .from('vendor_photos')
      .select('vendor_id')
      .eq('id', id)
      .single();

    if (photoError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Verify user owns this vendor profile
    if (photo.vendor_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - you do not own this photo' }, { status: 403 });
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (caption !== undefined) updateData.caption = caption;
    if (category !== undefined) updateData.category = category;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    // Update the photo
    const { data, error } = await supabase
      .from('vendor_photos')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Photo update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update photo' },
      { status: 500 }
    );
  }
}

// DELETE /api/vendors/photos - Delete a photo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo id is required' }, { status: 400 });
    }

    // Get the photo to verify ownership and get file path
    const { data: photo, error: photoError } = await supabase
      .from('vendor_photos')
      .select('vendor_id, photo_url')
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Verify user owns this vendor profile
    if (photo.vendor_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - you do not own this photo' }, { status: 403 });
    }

    // Delete from database
    const { error } = await supabase
      .from('vendor_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    // Delete physical file (best effort - don't fail if file doesn't exist)
    try {
      const filePath = join(process.cwd(), 'public', photo.photo_url);
      await unlink(filePath);
    } catch (fileError) {
      console.error('Failed to delete physical file:', fileError);
      // Continue anyway - database record is deleted
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
