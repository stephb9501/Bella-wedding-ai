import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Require authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('budget_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Budget GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Require authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { user_id, category, item_name, estimated_cost, actual_cost, paid, notes } = body;

    if (!user_id || !category || !item_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('budget_items')
      .insert({
        user_id,
        category,
        item_name,
        estimated_cost: estimated_cost || 0,
        actual_cost: actual_cost || 0,
        paid: paid || false,
        notes: notes || '',
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error: any) {
    console.error('Budget POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Require authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, estimated_cost, actual_cost, paid, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing budget item id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('budget_items')
      .update({
        estimated_cost,
        actual_cost,
        paid,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data?.[0] || {});
  } catch (error: any) {
    console.error('Budget PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Require authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing budget item id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('budget_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Budget DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
