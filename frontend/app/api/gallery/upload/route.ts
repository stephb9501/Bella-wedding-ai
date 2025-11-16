import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const galleryId = formData.get('gallery_id') as string;
    const weddingId = formData.get('wedding_id') as string;

    if (!file || !galleryId || !weddingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${randomBytes(16).toString('hex')}.${fileExt}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'gallery', weddingId);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Save to database
    const photoUrl = `/uploads/gallery/${weddingId}/${fileName}`;
    const { data, error } = await supabaseServer
      .from('gallery_photos')
      .insert({
        gallery_id: galleryId,
        wedding_id: weddingId,
        photo_url: photoUrl,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: 'bride', // TODO: Get from auth session
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) return NextResponse.json({ error: 'Missing photo id' }, { status: 400 });

    const { error } = await supabaseServer
      .from('gallery_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const galleryId = searchParams.get('gallery_id');

    if (!galleryId) return NextResponse.json({ error: 'Missing gallery_id' }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('gallery_photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Photos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
