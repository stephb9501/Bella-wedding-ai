import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET all packing boxes for a bride
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brideId = searchParams.get('brideId');

    if (!brideId) {
      return NextResponse.json({ error: 'Bride ID required' }, { status: 400 });
    }

    const { data: boxes, error } = await supabase
      .from('packing_boxes')
      .select('*, decor_zones(zone_name, zone_type)')
      .eq('bride_id', brideId)
      .order('load_in_priority', { ascending: true });

    if (error) {
      console.error('Error fetching boxes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ boxes: boxes || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/decor/boxes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new packing box
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brideId, boxName, zoneId, boxColor, assignedTo, notes } = body;

    if (!brideId || !boxName) {
      return NextResponse.json(
        { error: 'Bride ID and box name required' },
        { status: 400 }
      );
    }

    // Get max priority
    const { data: maxBox } = await supabase
      .from('packing_boxes')
      .select('load_in_priority')
      .eq('bride_id', brideId)
      .order('load_in_priority', { ascending: false })
      .limit(1)
      .single();

    const newPriority = (maxBox?.load_in_priority || 0) + 1;

    const { data: box, error } = await supabase
      .from('packing_boxes')
      .insert({
        bride_id: brideId,
        box_name: boxName,
        zone_id: zoneId || null,
        box_color: boxColor || null,
        assigned_to: assignedTo || null,
        load_in_priority: newPriority,
        setup_priority: newPriority,
        notes: notes || null,
        is_packed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating box:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ box }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/decor/boxes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update box
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { boxId, isPacked, assignedTo, notes, loadInPriority, setupPriority } = body;

    if (!boxId) {
      return NextResponse.json({ error: 'Box ID required' }, { status: 400 });
    }

    const updates: any = {};
    if (isPacked !== undefined) updates.is_packed = isPacked;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;
    if (notes !== undefined) updates.notes = notes;
    if (loadInPriority !== undefined) updates.load_in_priority = loadInPriority;
    if (setupPriority !== undefined) updates.setup_priority = setupPriority;

    const { data: box, error } = await supabase
      .from('packing_boxes')
      .update(updates)
      .eq('id', boxId)
      .select()
      .single();

    if (error) {
      console.error('Error updating box:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ box }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/decor/boxes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE box
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boxId = searchParams.get('boxId');

    if (!boxId) {
      return NextResponse.json({ error: 'Box ID required' }, { status: 400 });
    }

    const { error } = await supabase.from('packing_boxes').delete().eq('id', boxId);

    if (error) {
      console.error('Error deleting box:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/decor/boxes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
