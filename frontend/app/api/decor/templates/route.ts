import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// GET checklist templates for a specific zone type
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { searchParams } = new URL(request.url);
    const zoneType = searchParams.get('zoneType');
    const includeUniversal = searchParams.get('includeUniversal') === 'true';

    if (!zoneType) {
      return NextResponse.json({ error: 'Zone type required' }, { status: 400 });
    }

    let query = supabase
      .from('decor_checklist_templates')
      .select('*')
      .order('display_order', { ascending: true });

    if (includeUniversal) {
      // Get templates for this zone type OR universal items
      query = query.or(`zone_type.eq.${zoneType},is_universal.eq.true`);
    } else {
      // Get only zone-specific templates
      query = query.eq('zone_type', zoneType);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates: templates || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/decor/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add templates from a zone to bride's actual items
export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await request.json();
    const { brideId, zoneId, zoneType, includeUniversal } = body;

    if (!brideId || !zoneId || !zoneType) {
      return NextResponse.json(
        { error: 'Bride ID, zone ID, and zone type required' },
        { status: 400 }
      );
    }

    // Get templates for this zone
    let query = supabase
      .from('decor_checklist_templates')
      .select('*')
      .order('display_order', { ascending: true });

    if (includeUniversal) {
      query = query.or(`zone_type.eq.${zoneType},is_universal.eq.true`);
    } else {
      query = query.eq('zone_type', zoneType);
    }

    const { data: templates, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching templates:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!templates || templates.length === 0) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Convert templates to actual items
    const itemsToCreate = templates.map((template) => ({
      bride_id: brideId,
      zone_id: zoneId,
      item_name: template.item_name,
      item_category: template.item_category,
      quantity: 1,
      is_completed: false,
      is_packed: false,
      is_setup: false,
    }));

    const { data: items, error: insertError } = await supabase
      .from('decor_items')
      .insert(itemsToCreate)
      .select();

    if (insertError) {
      console.error('Error creating items from templates:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/decor/templates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
