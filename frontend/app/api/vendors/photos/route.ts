import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    if (!vendorId) return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });

    const { data, error } = await supabaseServer
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
    const timestamp = Date.now();
    const fileName = `${vendorId}/${timestamp}.${fileExt}`;

    // Convert file to buffer for Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseServer
      .storage
      .from('vendor-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw new Error('Failed to upload to storage');
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseServer
      .storage
      .from('vendor-photos')
      .getPublicUrl(fileName);

    // Save to database
    const { data, error } = await supabaseServer
      .from('vendor_photos')
      .insert({
        vendor_id: vendorId,
        photo_url: publicUrl,
        file_name: file.name,
      })
      .select();

    if (error) throw error;

    // Update vendor photo count
    const { data: photos } = await supabaseServer
      .from('vendor_photos')
      .select('id')
      .eq('vendor_id', vendorId);

    await supabaseServer
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
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) return NextResponse.json({ error: 'Missing photo id' }, { status: 400 });

    // Get photo details before deleting
    const { data: photo } = await supabaseServer
      .from('vendor_photos')
      .select('vendor_id, photo_url')
      .eq('id', photoId)
      .single();

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Extract file path from URL for Supabase Storage
    // URL format: https://[project].supabase.co/storage/v1/object/public/vendor-photos/[vendorId]/[timestamp].[ext]
    const urlParts = photo.photo_url.split('/vendor-photos/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];

      // Delete from Supabase Storage
      await supabaseServer
        .storage
        .from('vendor-photos')
        .remove([filePath]);
    }

    // Delete from database
    const { error } = await supabaseServer
      .from('vendor_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    // Update vendor photo count
    const { data: photos } = await supabaseServer
      .from('vendor_photos')
      .select('id')
      .eq('vendor_id', photo.vendor_id);

    await supabaseServer
      .from('vendors')
      .update({ photo_count: photos?.length || 0 })
      .eq('id', photo.vendor_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendor photo delete error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
