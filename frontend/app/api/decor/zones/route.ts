import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DecorZone {
  id?: string;
  bride_id: string;
  zone_name: string;
  zone_type: string;
  is_applicable: boolean;
  is_custom: boolean;
  display_order: number;
  notes?: string;
}

// GET all zones for a bride
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brideId = searchParams.get('brideId');

    if (!brideId) {
      return NextResponse.json({ error: 'Bride ID required' }, { status: 400 });
    }

    const { data: zones, error } = await supabase
      .from('decor_zones')
      .select('*')
      .eq('bride_id', brideId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching zones:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no zones exist, create default zones
    if (!zones || zones.length === 0) {
      const defaultZones = await createDefaultZones(brideId);
      return NextResponse.json({ zones: defaultZones }, { status: 200 });
    }

    return NextResponse.json({ zones }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/decor/zones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new zone (custom zone)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brideId, zoneName, zoneType, notes } = body;

    if (!brideId || !zoneName) {
      return NextResponse.json(
        { error: 'Bride ID and zone name required' },
        { status: 400 }
      );
    }

    // Get current max display order
    const { data: maxOrder } = await supabase
      .from('decor_zones')
      .select('display_order')
      .eq('bride_id', brideId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = (maxOrder?.display_order || 0) + 1;

    const { data: zone, error } = await supabase
      .from('decor_zones')
      .insert({
        bride_id: brideId,
        zone_name: zoneName,
        zone_type: zoneType || 'custom',
        is_applicable: true,
        is_custom: true,
        display_order: newOrder,
        notes: notes || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating zone:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ zone }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/decor/zones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update zone (mark as applicable/not applicable, update notes)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { zoneId, isApplicable, notes, zoneName } = body;

    if (!zoneId) {
      return NextResponse.json({ error: 'Zone ID required' }, { status: 400 });
    }

    const updates: any = { updated_at: new Date().toISOString() };
    if (typeof isApplicable !== 'undefined') updates.is_applicable = isApplicable;
    if (notes !== undefined) updates.notes = notes;
    if (zoneName) updates.zone_name = zoneName;

    const { data: zone, error } = await supabase
      .from('decor_zones')
      .update(updates)
      .eq('id', zoneId)
      .select()
      .single();

    if (error) {
      console.error('Error updating zone:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ zone }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/decor/zones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE zone (only custom zones)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zoneId');

    if (!zoneId) {
      return NextResponse.json({ error: 'Zone ID required' }, { status: 400 });
    }

    // Only allow deletion of custom zones
    const { data: zone } = await supabase
      .from('decor_zones')
      .select('is_custom')
      .eq('id', zoneId)
      .single();

    if (!zone?.is_custom) {
      return NextResponse.json(
        { error: 'Only custom zones can be deleted. Mark as not applicable instead.' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('decor_zones').delete().eq('id', zoneId);

    if (error) {
      console.error('Error deleting zone:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/decor/zones:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper: Create default zones for a new bride
async function createDefaultZones(brideId: string) {
  const defaultZones = [
    { zone_name: 'Entrance or Welcome', zone_type: 'entrance', display_order: 1 },
    { zone_name: 'Guestbook or Memory Table', zone_type: 'guestbook', display_order: 2 },
    { zone_name: 'Ceremony', zone_type: 'ceremony', display_order: 3 },
    { zone_name: 'Cocktail Area', zone_type: 'cocktail', display_order: 4 },
    { zone_name: 'Reception Guest Tables', zone_type: 'reception_tables', display_order: 5 },
    { zone_name: 'Head or Sweetheart Table', zone_type: 'head_table', display_order: 6 },
    { zone_name: 'Cake or Dessert Station', zone_type: 'cake_station', display_order: 7 },
    { zone_name: 'Photo or Selfie Area', zone_type: 'photo_area', display_order: 8 },
    { zone_name: 'Kids or Comfort Area', zone_type: 'kids_area', display_order: 9 },
    { zone_name: 'Exit or Send-Off', zone_type: 'exit', display_order: 10 },
  ];

  const zonesToInsert = defaultZones.map((zone) => ({
    bride_id: brideId,
    zone_name: zone.zone_name,
    zone_type: zone.zone_type,
    is_applicable: true,
    is_custom: false,
    display_order: zone.display_order,
    notes: '',
  }));

  const { data, error } = await supabase
    .from('decor_zones')
    .insert(zonesToInsert)
    .select();

  if (error) {
    console.error('Error creating default zones:', error);
    throw error;
  }

  return data;
}
