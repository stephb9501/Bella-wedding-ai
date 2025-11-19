import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

// Helper to get admin client (lazy initialization to avoid build-time errors)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Get files for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const fileType = searchParams.get('file_type'); // contract, invoice, mood_board, etc.
    const userId = searchParams.get('user_id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('project_files')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('is_latest_version', true)
      .order('created_at', { ascending: false });

    if (fileType) {
      query = query.eq('file_type', fileType);
    }

    if (userId) {
      query = query.or(`uploaded_by_user_id.eq.${userId},shared_with_bride.eq.true,shared_with_all_vendors.eq.true`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get file statistics
    const { data: stats } = await supabaseServer
      .from('booking_file_stats')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    // Get storage usage/limits for this vendor
    let usageInfo = null;
    if (userId) {
      const { data: usage } = await supabaseServer
        .from('vendor_storage_usage')
        .select('*')
        .eq('vendor_id', userId)
        .eq('booking_id', bookingId)
        .single();

      usageInfo = usage;
    }

    return NextResponse.json({
      success: true,
      files: data || [],
      stats: stats || {
        total_files: 0,
        total_size_bytes: 0,
        contract_count: 0,
        invoice_count: 0,
        signed_documents: 0,
        pending_signatures: 0
      },
      usage: usageInfo
    });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

// Upload file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bookingId = formData.get('booking_id') as string;
    const fileType = formData.get('file_type') as string || 'other';
    const description = formData.get('description') as string || '';
    const sharedWithBride = formData.get('shared_with_bride') === 'true';
    const requiresSignature = formData.get('requires_signature') === 'true';
    const userId = formData.get('user_id') as string;
    const userName = formData.get('user_name') as string;
    const userRole = formData.get('user_role') as string || 'vendor';

    if (!file || !bookingId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file size (50MB max per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Check if vendor can upload to this booking (tier limits)
    const { data: limitCheck, error: limitError } = await supabaseServer
      .rpc('can_upload_file_to_booking', {
        p_vendor_id: userId,
        p_booking_id: bookingId,
        p_file_size_bytes: file.size
      });

    if (limitError) {
      console.error('Limit check error:', limitError);
      // Allow upload if check fails (don't block on technical error)
    } else if (limitCheck && !limitCheck.can_upload) {
      return NextResponse.json({
        error: limitCheck.message || 'Upload limit reached',
        limit_info: {
          reason: limitCheck.reason,
          current_file_count: limitCheck.current_file_count,
          file_limit: limitCheck.file_limit,
          current_storage_mb: limitCheck.current_storage_mb,
          storage_limit_mb: limitCheck.storage_limit_mb,
          vendor_tier: limitCheck.vendor_tier
        }
      }, { status: 403 });
    }

    // Create storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${bookingId}/${fileType}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const supabaseAdmin = getSupabaseAdmin();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('wedding-files')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
    }

    // Get public URL (or signed URL for private files)
    const { data: urlData } = supabaseAdmin.storage
      .from('wedding-files')
      .getPublicUrl(storagePath);

    // Create database record
    const { data: fileRecord, error: dbError } = await supabaseServer
      .from('project_files')
      .insert({
        booking_id: bookingId,
        file_name: file.name,
        file_type: fileType,
        file_category: getCategoryFromType(fileType),
        mime_type: file.type,
        file_size_bytes: file.size,
        storage_bucket: 'wedding-files',
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        uploaded_by_user_id: userId,
        uploaded_by_role: userRole,
        uploaded_by_name: userName,
        description,
        shared_with_bride: sharedWithBride,
        requires_signature: requiresSignature,
        version_number: 1,
        is_latest_version: true
      })
      .select()
      .single();

    if (dbError) {
      // Rollback: delete from storage
      await supabaseAdmin.storage
        .from('wedding-files')
        .remove([storagePath]);

      console.error('Database insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 });
    }

    // Log to audit trail
    await supabaseServer
      .from('wedding_audit_trail')
      .insert({
        booking_id: bookingId,
        action_type: 'file_uploaded',
        user_id: userId,
        user_role: userRole,
        user_name: userName,
        description: `Uploaded file: ${file.name} (${fileType})`,
        after_data: { file_id: fileRecord.id, file_name: file.name }
      });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileRecord
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// Download file (generates signed URL)
export async function PUT(request: NextRequest) {
  try {
    const {
      file_id,
      user_id,
      user_role,
      access_type
    } = await request.json();

    if (!file_id || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get file record
    const { data: file, error } = await supabaseServer
      .from('project_files')
      .select('*')
      .eq('id', file_id)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Generate signed URL (valid for 1 hour)
    const supabaseAdmin = getSupabaseAdmin();
    const { data: signedUrl, error: urlError } = await supabaseAdmin.storage
      .from('wedding-files')
      .createSignedUrl(file.storage_path, 3600); // 1 hour

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // Log access
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    await supabaseServer
      .from('file_access_log')
      .insert({
        file_id,
        accessed_by_user_id: user_id,
        accessed_by_role: user_role,
        access_type: access_type || 'download',
        ip_address: clientIp,
        user_agent: userAgent
      });

    return NextResponse.json({
      success: true,
      download_url: signedUrl.signedUrl,
      expires_in: 3600,
      file_name: file.file_name
    });
  } catch (error) {
    console.error('Download file error:', error);
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
  }
}

// Delete file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('file_id');
    const userId = searchParams.get('user_id');

    if (!fileId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get file record
    const { data: file } = await supabaseServer
      .from('project_files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check permission (only uploader can delete)
    if (file.uploaded_by_user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from storage
    const supabaseAdmin = getSupabaseAdmin();
    const { error: storageError } = await supabaseAdmin.storage
      .from('wedding-files')
      .remove([file.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabaseServer
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;

    // Log to audit trail
    await supabaseServer
      .from('wedding_audit_trail')
      .insert({
        booking_id: file.booking_id,
        action_type: 'file_deleted',
        user_id: userId,
        description: `Deleted file: ${file.file_name}`,
        before_data: { file_id: fileId, file_name: file.file_name }
      });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

// Helper function to categorize files
function getCategoryFromType(fileType: string): string {
  const categoryMap: { [key: string]: string } = {
    'contract': 'legal',
    'invoice': 'financial',
    'mood_board': 'creative',
    'inspiration': 'creative',
    'signed_document': 'legal',
    'proposal': 'legal',
    'receipt': 'financial',
    'quote': 'financial'
  };
  return categoryMap[fileType] || 'other';
}
