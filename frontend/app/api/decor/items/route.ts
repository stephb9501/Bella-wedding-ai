import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DecorItem {
  id?: string;
  bride_id: string;
  zone_id: string;
  item_name: string;
  item_category?: string;
  quantity?: number;
  packed_in_box?: string;
  packing_priority?: number;
  packing_notes?: string;
  assigned_to?: string;
  setup_time?: string;
  setup_notes?: string;
  setup_location?: string;
  is_rental?: boolean;
  rental_vendor?: string;
  estimated_cost?: number;
  actual_cost?: number;
  is_completed?: boolean;
  is_packed?: boolean;
  is_setup?: boolean;
  style_tags?: string[];
}

// GET all items for a bride or specific zone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brideId = searchParams.get('brideId');
    const zoneId = searchParams.get('zoneId');

    if (!brideId) {
      return NextResponse.json({ error: 'Bride ID required' }, { status: 400 });
    }

    let query = supabase
      .from('decor_items')
      .select('*, decor_zones(zone_name, zone_type)')
      .eq('bride_id', brideId);

    if (zoneId) {
      query = query.eq('zone_id', zoneId);
    }

    const { data: items, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/decor/items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brideId,
      zoneId,
      itemName,
      itemCategory,
      quantity,
      packedInBox,
      assignedTo,
      setupTime,
      setupNotes,
      estimatedCost,
      isRental,
      rentalVendor,
    } = body;

    if (!brideId || !zoneId || !itemName) {
      return NextResponse.json(
        { error: 'Bride ID, zone ID, and item name required' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from('decor_items')
      .insert({
        bride_id: brideId,
        zone_id: zoneId,
        item_name: itemName,
        item_category: itemCategory || null,
        quantity: quantity || 1,
        packed_in_box: packedInBox || null,
        assigned_to: assignedTo || null,
        setup_time: setupTime || null,
        setup_notes: setupNotes || null,
        estimated_cost: estimatedCost || null,
        is_rental: isRental || false,
        rental_vendor: rentalVendor || null,
        is_completed: false,
        is_packed: false,
        is_setup: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/decor/items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update item
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, ...updates } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    // Map camelCase to snake_case
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.itemName !== undefined) dbUpdates.item_name = updates.itemName;
    if (updates.itemCategory !== undefined) dbUpdates.item_category = updates.itemCategory;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.packedInBox !== undefined) dbUpdates.packed_in_box = updates.packedInBox;
    if (updates.packingPriority !== undefined) dbUpdates.packing_priority = updates.packingPriority;
    if (updates.packingNotes !== undefined) dbUpdates.packing_notes = updates.packingNotes;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.setupTime !== undefined) dbUpdates.setup_time = updates.setupTime;
    if (updates.setupNotes !== undefined) dbUpdates.setup_notes = updates.setupNotes;
    if (updates.setupLocation !== undefined) dbUpdates.setup_location = updates.setupLocation;
    if (updates.isRental !== undefined) dbUpdates.is_rental = updates.isRental;
    if (updates.rentalVendor !== undefined) dbUpdates.rental_vendor = updates.rentalVendor;
    if (updates.estimatedCost !== undefined) dbUpdates.estimated_cost = updates.estimatedCost;
    if (updates.actualCost !== undefined) dbUpdates.actual_cost = updates.actualCost;
    if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
    if (updates.isPacked !== undefined) dbUpdates.is_packed = updates.isPacked;
    if (updates.isSetup !== undefined) dbUpdates.is_setup = updates.isSetup;
    if (updates.styleTags !== undefined) dbUpdates.style_tags = updates.styleTags;

    const { data: item, error } = await supabase
      .from('decor_items')
      .update(dbUpdates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/decor/items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const { error } = await supabase.from('decor_items').delete().eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/decor/items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
