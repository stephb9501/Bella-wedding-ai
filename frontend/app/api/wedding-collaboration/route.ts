import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Publish vendor work to bride or master timeline
export async function POST(request: NextRequest) {
  try {
    const { action, vendor_id, booking_id, item_type, item_id, publish_to } = await request.json();

    if (!action || !vendor_id || !booking_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // PUBLISH ITEM - Make visible to bride and/or other vendors
    if (action === 'publish') {
      if (!item_type || !item_id || !publish_to) {
        return NextResponse.json({ error: 'Missing publish parameters' }, { status: 400 });
      }

      const tableName = item_type === 'timeline' ? 'wedding_timeline'
        : item_type === 'playlist' ? 'music_playlists'
        : item_type === 'shotlist' ? 'shot_lists'
        : item_type === 'note' ? 'project_notes'
        : null;

      if (!tableName) {
        return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
      }

      const updateData: any = {
        is_published: true,
        published_at: new Date().toISOString()
      };

      if (publish_to === 'bride' || publish_to === 'all') {
        updateData.visible_to_bride = true;
      }

      if (publish_to === 'vendors' || publish_to === 'all') {
        updateData.visible_to_all_vendors = true;
      }

      const { error } = await supabaseServer
        .from(tableName)
        .update(updateData)
        .eq('id', item_id)
        .eq('vendor_id', vendor_id); // Security: only update your own items

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Published to ${publish_to === 'all' ? 'bride and all vendors' : publish_to}`
      });
    }

    // UNPUBLISH ITEM - Make private again
    if (action === 'unpublish') {
      if (!item_type || !item_id) {
        return NextResponse.json({ error: 'Missing unpublish parameters' }, { status: 400 });
      }

      const tableName = item_type === 'timeline' ? 'wedding_timeline'
        : item_type === 'playlist' ? 'music_playlists'
        : item_type === 'shotlist' ? 'shot_lists'
        : item_type === 'note' ? 'project_notes'
        : null;

      if (!tableName) {
        return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
      }

      const { error } = await supabaseServer
        .from(tableName)
        .update({
          is_published: false,
          published_at: null,
          visible_to_bride: false,
          visible_to_all_vendors: false
        })
        .eq('id', item_id)
        .eq('vendor_id', vendor_id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Made private'
      });
    }

    // PUBLISH TO MASTER TIMELINE - Add to consolidated view
    if (action === 'publish_to_master') {
      if (!item_id) {
        return NextResponse.json({ error: 'Missing timeline item ID' }, { status: 400 });
      }

      // Get the timeline item
      const { data: timelineItem, error: fetchError } = await supabaseServer
        .from('wedding_timeline')
        .select('*')
        .eq('id', item_id)
        .eq('vendor_id', vendor_id)
        .single();

      if (fetchError || !timelineItem) {
        return NextResponse.json({ error: 'Timeline item not found' }, { status: 404 });
      }

      // Get vendor info
      const { data: vendorInfo } = await supabaseServer
        .from('vendors')
        .select('category')
        .eq('id', vendor_id)
        .single();

      // Add to master timeline
      const { error: insertError } = await supabaseServer
        .from('master_wedding_timeline')
        .insert({
          booking_id,
          time_slot: timelineItem.time_slot,
          activity: timelineItem.activity,
          duration_minutes: timelineItem.duration_minutes,
          location: timelineItem.location,
          notes: timelineItem.notes,
          contributed_by_vendor_id: vendor_id,
          contributed_by_category: vendorInfo?.category || 'Unknown',
          status: 'published'
        });

      if (insertError) throw insertError;

      // Also mark original as published
      await supabaseServer
        .from('wedding_timeline')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          visible_to_all_vendors: true
        })
        .eq('id', item_id);

      return NextResponse.json({
        success: true,
        message: 'Added to master timeline. All vendors can now see this.'
      });
    }

    // REQUEST COLLABORATION - Ask to see other vendors' work
    if (action === 'request_collaboration') {
      const { target_vendor_id, request_type, reason } = await request.json();

      const { error } = await supabaseServer
        .from('vendor_collaboration_requests')
        .insert({
          booking_id,
          requesting_vendor_id: vendor_id,
          target_vendor_id: target_vendor_id || null, // null = all vendors
          request_type,
          reason,
          status: 'pending'
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Collaboration request sent. Waiting for bride approval.'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Collaboration error:', error);
    return NextResponse.json({ error: 'Failed to process collaboration action' }, { status: 500 });
  }
}

// Get shared items visible to current vendor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const vendorId = searchParams.get('vendor_id');
    const view = searchParams.get('view'); // 'master_timeline', 'shared_items', 'team'

    if (!bookingId || !vendorId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (view === 'master_timeline') {
      // Get consolidated timeline from all vendors
      const { data, error } = await supabaseServer
        .from('master_wedding_timeline')
        .select(`
          *,
          vendors:contributed_by_vendor_id (
            business_name,
            category
          )
        `)
        .eq('booking_id', bookingId)
        .order('time_slot', { ascending: true });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    if (view === 'team') {
      // Get all vendors working on this wedding
      const { data, error } = await supabaseServer
        .from('wedding_vendor_team')
        .select(`
          *,
          vendors:vendor_id (
            business_name,
            category,
            email,
            phone
          )
        `)
        .eq('booking_id', bookingId);

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    if (view === 'shared_items') {
      // Get items shared with this vendor
      // This would be more complex - need to check permissions
      // For now, return empty array
      return NextResponse.json([]);
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
  } catch (error) {
    console.error('Get collaboration data error:', error);
    return NextResponse.json({ error: 'Failed to fetch collaboration data' }, { status: 500 });
  }
}
