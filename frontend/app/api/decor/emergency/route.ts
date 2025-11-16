import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// GET all emergency items for a bride
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { searchParams } = new URL(request.url);
    const brideId = searchParams.get('brideId');

    if (!brideId) {
      return NextResponse.json({ error: 'Bride ID required' }, { status: 400 });
    }

    const { data: items, error } = await supabase
      .from('emergency_items')
      .select('*')
      .eq('bride_id', brideId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching emergency items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no items, create from template
    if (!items || items.length === 0) {
      const defaultItems = await createEmergencyItemsFromTemplate(brideId);
      return NextResponse.json({ items: defaultItems }, { status: 200 });
    }

    return NextResponse.json({ items }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/decor/emergency:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new emergency item
export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await request.json();
    const { brideId, itemName, itemType, quantity, packedInBox, notes } = body;

    if (!brideId || !itemName) {
      return NextResponse.json(
        { error: 'Bride ID and item name required' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from('emergency_items')
      .insert({
        bride_id: brideId,
        item_name: itemName,
        item_type: itemType || 'other',
        quantity: quantity || 1,
        packed_in_box: packedInBox || null,
        is_packed: false,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating emergency item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/decor/emergency:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update emergency item
export async function PATCH(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await request.json();
    const { itemId, isPacked, quantity, packedInBox, notes } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const updates: any = {};
    if (isPacked !== undefined) updates.is_packed = isPacked;
    if (quantity !== undefined) updates.quantity = quantity;
    if (packedInBox !== undefined) updates.packed_in_box = packedInBox;
    if (notes !== undefined) updates.notes = notes;

    const { data: item, error } = await supabase
      .from('emergency_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating emergency item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/decor/emergency:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper: Create emergency items from template
async function createEmergencyItemsFromTemplate(brideId: string) {
  // Get template items
  const { data: templates, error: fetchError } = await supabase
    .from('emergency_items_template')
    .select('*')
    .order('display_order', { ascending: true });

  if (fetchError || !templates || templates.length === 0) {
    console.error('Error fetching emergency items template:', fetchError);
    return [];
  }

  // Convert to actual items
  const itemsToCreate = templates.map((template) => ({
    bride_id: brideId,
    item_name: template.item_name,
    item_type: template.item_type,
    quantity: 1,
    is_packed: false,
    notes: template.description || null,
  }));

  const { data: items, error: insertError } = await supabase
    .from('emergency_items')
    .insert(itemsToCreate)
    .select();

  if (insertError) {
    console.error('Error creating emergency items:', insertError);
    return [];
  }

  return items || [];
}
