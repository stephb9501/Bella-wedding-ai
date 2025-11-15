import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function generateGuestToken(): string {
  return randomBytes(16).toString('hex');
}

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });

    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Guests GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const { wedding_id, name, email, phone } = await request.json();

    if (!wedding_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const guest_token = generateGuestToken();

    const { data, error } = await supabase
      .from('guests')
      .insert({
        wedding_id,
        guest_token,
        name,
        email: email || '',
        phone: phone || '',
        address: '',
        city: '',
        state: '',
        zip: '',
        rsvp_status: 'pending',
        has_plus_one: false,
        plus_one_name: '',
        dietary_restrictions: '',
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
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Missing guest id' }, { status: 400 });

    const { data, error } = await supabase
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
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing guest id' }, { status: 400 });

    const { error } = await supabase
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
