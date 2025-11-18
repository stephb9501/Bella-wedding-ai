import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Get version history for a timeline entry
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timelineId = searchParams.get('timeline_id');
    const bookingId = searchParams.get('booking_id');

    if (!timelineId && !bookingId) {
      return NextResponse.json({ error: 'Missing timeline_id or booking_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('timeline_versions')
      .select('*')
      .order('version_number', { ascending: false });

    if (timelineId) {
      query = query.eq('timeline_id', timelineId);
    }

    // If booking_id provided, get all timeline versions for that booking
    if (bookingId && !timelineId) {
      // First get all timeline IDs for this booking
      const { data: timelines } = await supabaseServer
        .from('wedding_timeline')
        .select('id')
        .eq('project_id', (
          await supabaseServer
            .from('wedding_projects')
            .select('id')
            .eq('booking_id', bookingId)
            .single()
        ).data?.id);

      const timelineIds = timelines?.map(t => t.id) || [];
      query = query.in('timeline_id', timelineIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      versions: data || [],
      total_versions: data?.length || 0
    });
  } catch (error) {
    console.error('Get timeline versions error:', error);
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

// Manually create a version snapshot (automatic versions are created by trigger)
export async function POST(request: NextRequest) {
  try {
    const {
      timeline_id,
      changed_by_user_id,
      changed_by_role,
      changed_by_name,
      change_type,
      changes_made,
      communicated_to_bride,
      bride_acknowledged
    } = await request.json();

    if (!timeline_id || !changed_by_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current version number
    const { data: existingVersions } = await supabaseServer
      .from('timeline_versions')
      .select('version_number')
      .eq('timeline_id', timeline_id)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (existingVersions?.[0]?.version_number || 0) + 1;

    // Get current timeline state
    const { data: timeline } = await supabaseServer
      .from('wedding_timeline')
      .select('*')
      .eq('id', timeline_id)
      .single();

    if (!timeline) {
      return NextResponse.json({ error: 'Timeline not found' }, { status: 404 });
    }

    // Create version
    const { data, error } = await supabaseServer
      .from('timeline_versions')
      .insert({
        timeline_id,
        version_number: nextVersion,
        time_slot: timeline.time_slot,
        activity: timeline.activity,
        duration_minutes: timeline.duration_minutes,
        location: timeline.location,
        notes: timeline.notes,
        changed_by_user_id,
        changed_by_role: changed_by_role || 'vendor',
        changed_by_name,
        change_type: change_type || 'manual_snapshot',
        changes_made: changes_made || {},
        communicated_to_bride: communicated_to_bride || false,
        bride_acknowledged: bride_acknowledged || false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Version snapshot created',
      version: data
    });
  } catch (error) {
    console.error('Create version error:', error);
    return NextResponse.json({ error: 'Failed to create version' }, { status: 500 });
  }
}

// Mark that bride was communicated with and/or acknowledged
export async function PUT(request: NextRequest) {
  try {
    const {
      version_id,
      communicated_to_bride,
      bride_acknowledged,
      bride_acknowledged_at
    } = await request.json();

    if (!version_id) {
      return NextResponse.json({ error: 'Missing version_id' }, { status: 400 });
    }

    const updateData: any = {};
    if (communicated_to_bride !== undefined) {
      updateData.communicated_to_bride = communicated_to_bride;
    }
    if (bride_acknowledged !== undefined) {
      updateData.bride_acknowledged = bride_acknowledged;
      updateData.bride_acknowledged_at = bride_acknowledged_at || new Date().toISOString();
    }

    const { error } = await supabaseServer
      .from('timeline_versions')
      .update(updateData)
      .eq('id', version_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Version communication status updated'
    });
  } catch (error) {
    console.error('Update version communication error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
