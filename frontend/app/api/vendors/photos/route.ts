import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    if (!vendorId) return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });

    const { data, error } = await supabase
      .from('vendor_photos')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vendor photos GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vendorId = formData.get('vendor_id') as string;

    if (!file || !vendorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Save to database
    const photoUrl = `/uploads/vendors/${vendorId}/${fileName}`;
    const { data, error } = await supabase
      .from('vendor_photos')
      .insert({
        vendor_id: vendorId,
        photo_url: photoUrl,
        file_name: file.name,
      })
      .select();

    if (error) throw error;

    // Update vendor photo count
    const { data: photos } = await supabase
      .from('vendor_photos')
      .select('id')
      .eq('vendor_id', vendorId);

    await supabase
      .from('vendors')
      .update({ photo_count: photos?.length || 0 })
      .eq('id', vendorId);

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Vendor photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) return NextResponse.json({ error: 'Missing photo id' }, { status: 400 });

    // Get vendor_id before deleting
    const { data: photo } = await supabase
      .from('vendor_photos')
      .select('vendor_id')
      .eq('id', photoId)
      .single();

    const { error } = await supabase
      .from('vendor_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    // Update vendor photo count
    if (photo) {
      const { data: photos } = await supabase
        .from('vendor_photos')
        .select('id')
        .eq('vendor_id', photo.vendor_id);

      await supabase
        .from('vendors')
        .update({ photo_count: photos?.length || 0 })
        .eq('id', photo.vendor_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendor photo delete error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
