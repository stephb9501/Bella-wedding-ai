import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function generateGuestToken(): string {
  return randomBytes(16).toString('hex');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId') || searchParams.get('wedding_id');

    if (!weddingId) return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('guests')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Guests GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      wedding_id,
      name,
      email,
      phone,
      group_name,
      rsvp_status,
      plus_one_allowed,
      plus_one_name,
      plus_one_rsvp,
      dietary_restrictions,
      table_number,
      notes,
    } = await request.json();

    if (!wedding_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const guest_token = generateGuestToken();

    const { data, error } = await supabaseServer
      .from('guests')
      .insert({
        wedding_id,
        guest_token,
        name,
        email: email || '',
        phone: phone || '',
        group_name: group_name || null,
        address: '',
        city: '',
        state: '',
        zip: '',
        rsvp_status: rsvp_status || 'pending',
        has_plus_one: plus_one_allowed || false,
        plus_one_name: plus_one_name || '',
        plus_one_rsvp: plus_one_rsvp || 'pending',
        dietary_restrictions: dietary_restrictions || '',
        table_number: table_number || null,
        notes: notes || '',
        link_clicked: false,
        response_submitted: false,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Guests POST error:', error);
    return NextResponse.json({ error: 'Failed to add guest' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Missing guest id' }, { status: 400 });

    const { data, error } = await supabaseServer
      .from('guests')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Guests PUT error:', error);
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing guest id' }, { status: 400 });

    const { error } = await supabaseServer
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guests DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
