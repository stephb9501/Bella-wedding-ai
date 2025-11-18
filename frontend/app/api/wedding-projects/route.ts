import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Archive, delete, or restore a wedding project
export async function PUT(request: NextRequest) {
  try {
    const { booking_id, action, deleted_by } = await request.json();

    if (!booking_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ARCHIVE - Start 90-day countdown, still visible in archived view
    if (action === 'archive') {
      const archivedAt = new Date();
      const autoDeleteAt = new Date();
      autoDeleteAt.setDate(autoDeleteAt.getDate() + 90); // Hard delete after 90 days

      // Update booking status to archived
      const { error: bookingError } = await supabaseServer
        .from('vendor_bookings')
        .update({
          status: 'archived',
          updated_at: archivedAt.toISOString()
        })
        .eq('id', booking_id);

      if (bookingError) throw bookingError;

      // Check if wedding_projects entry exists, create or update
      const { data: existingProject } = await supabaseServer
        .from('wedding_projects')
        .select('id')
        .eq('booking_id', booking_id)
        .single();

      if (existingProject) {
        const { error: projectError } = await supabaseServer
          .from('wedding_projects')
          .update({
            status: 'archived',
            archived_at: archivedAt.toISOString(),
            auto_delete_at: autoDeleteAt.toISOString(),
            updated_at: archivedAt.toISOString()
          })
          .eq('booking_id', booking_id);

        if (projectError) throw projectError;
      }

      return NextResponse.json({
        success: true,
        archived_at: archivedAt.toISOString(),
        auto_delete_at: autoDeleteAt.toISOString(),
        message: 'Wedding archived. Will be permanently deleted in 90 days unless restored.'
      });
    }

    // UNARCHIVE - Restore from archived status
    if (action === 'unarchive') {
      const { error: bookingError } = await supabaseServer
        .from('vendor_bookings')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', booking_id);

      if (bookingError) throw bookingError;

      const { error: projectError } = await supabaseServer
        .from('wedding_projects')
        .update({
          status: 'active',
          archived_at: null,
          auto_delete_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('booking_id', booking_id);

      if (projectError) throw projectError;

      return NextResponse.json({
        success: true,
        message: 'Wedding restored to active status.'
      });
    }

    // SOFT DELETE - Remove from vendor or bride's view only
    if (action === 'soft_delete') {
      if (!deleted_by || (deleted_by !== 'vendor' && deleted_by !== 'bride')) {
        return NextResponse.json({ error: 'Must specify deleted_by as vendor or bride' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const updateData: any = {};

      if (deleted_by === 'vendor') {
        updateData.deleted_by_vendor = true;
        updateData.vendor_deleted_at = now;
      } else {
        updateData.deleted_by_bride = true;
        updateData.bride_deleted_at = now;
      }

      // Soft delete from vendor_bookings
      const { error: bookingError } = await supabaseServer
        .from('vendor_bookings')
        .update(updateData)
        .eq('id', booking_id);

      if (bookingError) throw bookingError;

      // Also mark in wedding_projects if vendor is deleting
      if (deleted_by === 'vendor') {
        const { error: projectError } = await supabaseServer
          .from('wedding_projects')
          .update({
            deleted_by_vendor: true,
            vendor_deleted_at: now
          })
          .eq('booking_id', booking_id);

        if (projectError && projectError.code !== 'PGRST116') { // Ignore "not found" errors
          throw projectError;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Wedding removed from ${deleted_by}'s view. Data is preserved and can be restored by admin if needed.`
      });
    }

    // RESTORE FROM SOFT DELETE
    if (action === 'restore') {
      if (!deleted_by || (deleted_by !== 'vendor' && deleted_by !== 'bride')) {
        return NextResponse.json({ error: 'Must specify deleted_by as vendor or bride' }, { status: 400 });
      }

      const updateData: any = {};

      if (deleted_by === 'vendor') {
        updateData.deleted_by_vendor = false;
        updateData.vendor_deleted_at = null;
      } else {
        updateData.deleted_by_bride = false;
        updateData.bride_deleted_at = null;
      }

      const { error: bookingError } = await supabaseServer
        .from('vendor_bookings')
        .update(updateData)
        .eq('id', booking_id);

      if (bookingError) throw bookingError;

      if (deleted_by === 'vendor') {
        const { error: projectError } = await supabaseServer
          .from('wedding_projects')
          .update({
            deleted_by_vendor: false,
            vendor_deleted_at: null
          })
          .eq('booking_id', booking_id);

        if (projectError && projectError.code !== 'PGRST116') {
          throw projectError;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Wedding restored to ${deleted_by}'s view.`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Project management error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// Delete archived projects (manual or auto-cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const cleanup = searchParams.get('cleanup'); // For automated cleanup

    if (cleanup === 'auto') {
      // Delete all projects past their auto_delete_at date
      const { data: expiredProjects } = await supabaseServer
        .from('wedding_projects')
        .select('booking_id')
        .eq('status', 'archived')
        .lt('auto_delete_at', new Date().toISOString());

      if (expiredProjects && expiredProjects.length > 0) {
        const bookingIds = expiredProjects.map(p => p.booking_id);

        // Delete vendor_bookings (CASCADE will delete related wedding_projects)
        const { error } = await supabaseServer
          .from('vendor_bookings')
          .delete()
          .in('id', bookingIds);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          deleted_count: bookingIds.length
        });
      }

      return NextResponse.json({ success: true, deleted_count: 0 });
    }

    if (bookingId) {
      // Manual delete of specific booking
      const { error } = await supabaseServer
        .from('vendor_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Project delete error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
