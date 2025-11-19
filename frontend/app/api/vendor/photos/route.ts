import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get vendor photos
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'get_photos';
    const vendor_id = searchParams.get('vendor_id');

    if (action === 'get_photos') {
      // Get all photos for a vendor
      if (!vendor_id) {
        return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
      }

      // Use the get_vendor_gallery function
      const { data: gallery, error } = await supabase.rpc('get_vendor_gallery', {
        p_vendor_id: vendor_id,
      });

      if (error) {
        console.error('Get vendor gallery error:', error);
        return NextResponse.json({ error: 'Failed to fetch vendor photos' }, { status: 500 });
      }

      return NextResponse.json({
        photos: gallery || [],
        total: gallery?.length || 0,
      });

    } else if (action === 'get_my_photos') {
      // Get photos for current logged-in vendor
      const { data: photos, error } = await supabase
        .from('vendor_photos')
        .select('*')
        .eq('vendor_id', user.id)
        .order('is_profile_photo', { ascending: false })
        .order('display_order')
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Get my photos error:', error);
        return NextResponse.json({ error: 'Failed to fetch your photos' }, { status: 500 });
      }

      return NextResponse.json({
        photos: photos || [],
        total: photos?.length || 0,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Vendor photos error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Upload new vendor photo
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'upload_photo') {
      // Upload a new photo
      const {
        photo_url,
        photo_path,
        file_name,
        file_size,
        caption,
        photo_type = 'portfolio',
        is_profile_photo = false,
      } = body;

      if (!photo_url) {
        return NextResponse.json({ error: 'photo_url is required' }, { status: 400 });
      }

      // Get current photo count for display order
      const { count } = await supabase
        .from('vendor_photos')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', user.id);

      const display_order = (count || 0) + 1;

      // Insert photo
      const { data: photo, error } = await supabase
        .from('vendor_photos')
        .insert({
          vendor_id: user.id,
          photo_url,
          photo_path,
          file_name,
          file_size,
          caption,
          photo_type,
          is_profile_photo,
          display_order,
        })
        .select()
        .single();

      if (error) {
        console.error('Upload photo error:', error);
        return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Photo uploaded successfully',
        photo,
      });

    } else if (action === 'set_profile_photo') {
      // Set a photo as the main profile photo
      const { photo_id } = body;

      if (!photo_id) {
        return NextResponse.json({ error: 'photo_id is required' }, { status: 400 });
      }

      // Use the set_profile_photo function
      const { error } = await supabase.rpc('set_profile_photo', {
        p_photo_id: photo_id,
        p_vendor_id: user.id,
      });

      if (error) {
        console.error('Set profile photo error:', error);
        return NextResponse.json({ error: 'Failed to set profile photo' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Profile photo updated successfully',
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update photo details or reorder
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'update_photo') {
      // Update photo details
      const {
        photo_id,
        caption,
        photo_type,
        is_visible,
      } = body;

      if (!photo_id) {
        return NextResponse.json({ error: 'photo_id is required' }, { status: 400 });
      }

      // Build update object
      const updates: any = {};
      if (caption !== undefined) updates.caption = caption;
      if (photo_type !== undefined) updates.photo_type = photo_type;
      if (is_visible !== undefined) updates.is_visible = is_visible;

      const { data: photo, error } = await supabase
        .from('vendor_photos')
        .update(updates)
        .eq('id', photo_id)
        .eq('vendor_id', user.id) // Only vendor can update their own photos
        .select()
        .single();

      if (error) {
        console.error('Update photo error:', error);
        return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Photo updated successfully',
        photo,
      });

    } else if (action === 'reorder_photos') {
      // Reorder photos
      const { photo_orders } = body; // Array of { photo_id, display_order }

      if (!photo_orders || !Array.isArray(photo_orders)) {
        return NextResponse.json({ error: 'photo_orders array is required' }, { status: 400 });
      }

      // Update each photo's display order
      const updates = photo_orders.map(async (item: any) => {
        return supabase
          .from('vendor_photos')
          .update({ display_order: item.display_order })
          .eq('id', item.photo_id)
          .eq('vendor_id', user.id);
      });

      await Promise.all(updates);

      return NextResponse.json({
        message: 'Photos reordered successfully',
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Photo update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove photo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photo_id = searchParams.get('photo_id');

    if (!photo_id) {
      return NextResponse.json({ error: 'photo_id is required' }, { status: 400 });
    }

    // Delete photo
    const { error } = await supabase
      .from('vendor_photos')
      .delete()
      .eq('id', photo_id)
      .eq('vendor_id', user.id); // Only vendor can delete their own photos

    if (error) {
      console.error('Delete photo error:', error);
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Photo deleted successfully',
    });
  } catch (error: any) {
    console.error('Photo deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
