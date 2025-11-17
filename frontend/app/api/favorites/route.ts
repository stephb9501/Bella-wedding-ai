import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('favorites')
      .select('*, vendors(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { user_id, vendor_id, notes } = body;

    if (!user_id || !vendor_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already favorited
    const { data: existing } = await supabaseServer
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('vendor_id', vendor_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already added to favorites' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('favorites')
      .insert({
        user_id,
        vendor_id,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');
    const userId = searchParams.get('user_id');
    const vendorId = searchParams.get('vendor_id');

    if (favoriteId) {
      const { error } = await supabaseServer
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
    } else if (userId && vendorId) {
      const { error } = await supabaseServer
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('vendor_id', vendorId);

      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Missing id or user_id/vendor_id' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { favorite_id, notes } = body;

    if (!favorite_id) {
      return NextResponse.json({ error: 'Missing favorite_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('favorites')
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', favorite_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Favorites PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
