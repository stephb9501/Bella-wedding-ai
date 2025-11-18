import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Get vendor's roles for a wedding
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const vendorId = searchParams.get('vendor_id');
    const getDefinitions = searchParams.get('get_definitions'); // Get available role options

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });
    }

    // Get available role definitions (for dropdown)
    if (getDefinitions === 'true') {
      const { data: roleDefinitions, error } = await supabaseServer
        .from('vendor_role_definitions')
        .select('*')
        .order('parent_category', { ascending: true })
        .order('role_display_name', { ascending: true });

      if (error) throw error;

      // Group by parent category for organized dropdown
      const grouped = roleDefinitions?.reduce((acc: any, role: any) => {
        const category = role.parent_category || 'other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(role);
        return acc;
      }, {});

      return NextResponse.json({ role_definitions: grouped });
    }

    // Get vendor's selected roles for this wedding
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('wedding_vendor_roles')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('vendor_id', vendorId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    // If no roles set yet, return empty with vendor's default category
    if (!data) {
      const { data: vendor } = await supabaseServer
        .from('vendors')
        .select('category')
        .eq('id', vendorId)
        .single();

      return NextResponse.json({
        selected_roles: [],
        enabled_tools: ['timeline', 'checklist'], // Default tools
        vendor_category: vendor?.category,
        export_preferences: {
          include_timeline: true,
          include_checklist: true,
          include_role_specific: true
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get vendor roles error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor roles' }, { status: 500 });
  }
}

// Set or update vendor's roles for a wedding
export async function POST(request: NextRequest) {
  try {
    const {
      booking_id,
      vendor_id,
      selected_roles,
      export_preferences
    } = await request.json();

    if (!booking_id || !vendor_id || !selected_roles) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if roles already exist
    const { data: existing } = await supabaseServer
      .from('wedding_vendor_roles')
      .select('id')
      .eq('booking_id', booking_id)
      .eq('vendor_id', vendor_id)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabaseServer
        .from('wedding_vendor_roles')
        .update({
          selected_roles: JSON.stringify(selected_roles),
          export_preferences: export_preferences || undefined
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      // Get enabled tools
      const { data: enabledTools } = await supabaseServer
        .rpc('get_enabled_tools_for_wedding', {
          p_booking_id: booking_id,
          p_vendor_id: vendor_id
        });

      return NextResponse.json({
        success: true,
        message: 'Roles updated successfully',
        enabled_tools: enabledTools,
        data
      });
    } else {
      // Insert new
      const { data, error } = await supabaseServer
        .from('wedding_vendor_roles')
        .insert({
          booking_id,
          vendor_id,
          selected_roles: JSON.stringify(selected_roles),
          export_preferences: export_preferences || {
            include_timeline: true,
            include_checklist: true,
            include_role_specific: true
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Get enabled tools
      const { data: enabledTools } = await supabaseServer
        .rpc('get_enabled_tools_for_wedding', {
          p_booking_id: booking_id,
          p_vendor_id: vendor_id
        });

      return NextResponse.json({
        success: true,
        message: 'Roles set successfully',
        enabled_tools: enabledTools,
        data
      });
    }
  } catch (error) {
    console.error('Set vendor roles error:', error);
    return NextResponse.json({ error: 'Failed to set vendor roles' }, { status: 500 });
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
