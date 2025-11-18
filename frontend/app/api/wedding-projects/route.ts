import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Archive a wedding project
export async function PUT(request: NextRequest) {
  try {
    const { booking_id, action } = await request.json();

    if (!booking_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'archive') {
      const archivedAt = new Date();
      const autoDeleteAt = new Date();
      autoDeleteAt.setDate(autoDeleteAt.getDate() + 90); // Delete after 90 days

      // Update booking status to archived
      const { error: bookingError } = await supabaseServer
        .from('vendor_bookings')
        .update({
          status: 'archived',
          updated_at: archivedAt.toISOString()
        })
        .eq('id', booking_id);

      if (bookingError) throw bookingError;

      // Check if wedding_projects entry exists
      const { data: existingProject } = await supabaseServer
        .from('wedding_projects')
        .select('id')
        .eq('booking_id', booking_id)
        .single();

      if (existingProject) {
        // Update existing project
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
        auto_delete_at: autoDeleteAt.toISOString()
      });
    }

    if (action === 'unarchive') {
      // Restore from archive
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

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Project archive error:', error);
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
