import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Export wedding data based on vendor's export preferences
// Only includes sections that are enabled to save paper/ink
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const vendorId = searchParams.get('vendor_id');
    const format = searchParams.get('format') || 'json'; // json, pdf (future)

    if (!bookingId || !vendorId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get vendor's export preferences
    const { data: vendorRoles } = await supabaseServer
      .from('wedding_vendor_roles')
      .select('export_preferences, enabled_tools')
      .eq('booking_id', bookingId)
      .eq('vendor_id', vendorId)
      .single();

    const exportPrefs = vendorRoles?.export_preferences || {
      include_timeline: true,
      include_checklist: true,
      include_role_specific: true
    };

    const enabledTools = vendorRoles?.enabled_tools || [];

    // Get booking details
    const { data: booking } = await supabaseServer
      .from('vendor_bookings')
      .select('*, vendors(*)')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get project_id
    const { data: project } = await supabaseServer
      .from('wedding_projects')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    const projectId = project?.id;

    // Build export data object
    const exportData: any = {
      wedding_info: {
        bride_name: booking.bride_name,
        wedding_date: booking.wedding_date,
        venue: booking.venue,
        vendor_category: booking.vendors?.category
      },
      exported_at: new Date().toISOString(),
      export_preferences: exportPrefs
    };

    // Include timeline if enabled
    if (exportPrefs.include_timeline && projectId) {
      const { data: timeline } = await supabaseServer
        .from('wedding_timeline')
        .select('*')
        .eq('project_id', projectId)
        .eq('vendor_id', vendorId)
        .order('time_slot', { ascending: true });

      exportData.timeline = timeline || [];
    }

    // Include checklist if enabled
    if (exportPrefs.include_checklist && projectId) {
      const { data: checklist } = await supabaseServer
        .from('wedding_info_checklist')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: false });

      exportData.checklist = checklist || [];
    }

    // Include role-specific tools if enabled
    if (exportPrefs.include_role_specific && projectId) {
      // Music playlists (for DJs)
      if (enabledTools.includes('music_playlists')) {
        const { data: playlists } = await supabaseServer
          .from('music_playlists')
          .select('*')
          .eq('project_id', projectId);

        if (playlists && playlists.length > 0) {
          exportData.music_playlists = playlists;
        }
      }

      // Shot lists (for photographers)
      if (enabledTools.includes('shot_lists')) {
        const { data: shotLists } = await supabaseServer
          .from('shot_lists')
          .select('*')
          .eq('project_id', projectId);

        if (shotLists && shotLists.length > 0) {
          exportData.shot_lists = shotLists;
        }
      }

      // Catering menu (for caterers)
      if (enabledTools.includes('catering_menu')) {
        const { data: cateringMenus } = await supabaseServer
          .from('catering_menu_plans')
          .select('*')
          .eq('project_id', projectId);

        if (cateringMenus && cateringMenus.length > 0) {
          exportData.catering_menus = cateringMenus;
        }
      }

      // Floral designs (for florists)
      if (enabledTools.includes('floral_designs')) {
        const { data: floralDesigns } = await supabaseServer
          .from('floral_designs')
          .select('*')
          .eq('project_id', projectId);

        if (floralDesigns && floralDesigns.length > 0) {
          exportData.floral_designs = floralDesigns;
        }
      }

      // Venue logistics (for venue coordinators)
      if (enabledTools.includes('venue_logistics')) {
        const { data: venueLogistics } = await supabaseServer
          .from('venue_logistics')
          .select('*')
          .eq('project_id', projectId);

        if (venueLogistics && venueLogistics.length > 0) {
          exportData.venue_logistics = venueLogistics;
        }
      }

      // Cake designs (for cake designers)
      if (enabledTools.includes('cake_designs')) {
        const { data: cakeDesigns } = await supabaseServer
          .from('cake_designs')
          .select('*')
          .eq('project_id', projectId);

        if (cakeDesigns && cakeDesigns.length > 0) {
          exportData.cake_designs = cakeDesigns;
        }
      }

      // Beauty schedules (for hair/makeup artists)
      if (enabledTools.includes('beauty_schedules')) {
        const { data: beautySchedules } = await supabaseServer
          .from('beauty_schedules')
          .select('*')
          .eq('project_id', projectId);

        if (beautySchedules && beautySchedules.length > 0) {
          exportData.beauty_schedules = beautySchedules;
        }
      }

      // Transportation plans (for transportation vendors)
      if (enabledTools.includes('transportation_plans')) {
        const { data: transportationPlans } = await supabaseServer
          .from('transportation_plans')
          .select('*')
          .eq('project_id', projectId);

        if (transportationPlans && transportationPlans.length > 0) {
          exportData.transportation_plans = transportationPlans;
        }
      }

      // Ceremony scripts (for officiants)
      if (enabledTools.includes('ceremony_scripts')) {
        const { data: ceremonyScripts } = await supabaseServer
          .from('ceremony_scripts')
          .select('*')
          .eq('project_id', projectId);

        if (ceremonyScripts && ceremonyScripts.length > 0) {
          exportData.ceremony_scripts = ceremonyScripts;
        }
      }

      // Stationery orders (for stationery designers)
      if (enabledTools.includes('stationery_orders')) {
        const { data: stationeryOrders } = await supabaseServer
          .from('stationery_orders')
          .select('*')
          .eq('project_id', projectId);

        if (stationeryOrders && stationeryOrders.length > 0) {
          exportData.stationery_orders = stationeryOrders;
        }
      }

      // Rental orders (for rental companies)
      if (enabledTools.includes('rental_orders')) {
        const { data: rentalOrders } = await supabaseServer
          .from('rental_orders')
          .select('*')
          .eq('project_id', projectId);

        if (rentalOrders && rentalOrders.length > 0) {
          exportData.rental_orders = rentalOrders;
        }
      }
    }

    // Return JSON (PDF export would be future enhancement)
    return NextResponse.json({
      success: true,
      data: exportData,
      sections_included: Object.keys(exportData).filter(k => !['wedding_info', 'exported_at', 'export_preferences'].includes(k)),
      sections_count: Object.keys(exportData).length - 3 // Exclude metadata
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export wedding data' }, { status: 500 });
  }
}

// Update export preferences
export async function PUT(request: NextRequest) {
  try {
    const {
      booking_id,
      vendor_id,
      export_preferences
    } = await request.json();

    if (!booking_id || !vendor_id || !export_preferences) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('wedding_vendor_roles')
      .update({ export_preferences })
      .eq('booking_id', booking_id)
      .eq('vendor_id', vendor_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Export preferences updated'
    });
  } catch (error) {
    console.error('Update export preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
