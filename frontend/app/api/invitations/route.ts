import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('wedding_id');
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabaseServer
        .from('invitations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (weddingId) {
      const { data, error } = await supabaseServer
        .from('invitations')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Invitations GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wedding_id,
      template_id,
      bride_name,
      groom_name,
      ceremony_date,
      ceremony_time,
      ceremony_venue,
      ceremony_address,
      reception_venue,
      reception_address,
      rsvp_deadline,
      rsvp_contact,
      custom_message,
      custom_colors,
      header_image_url,
      is_finalized,
    } = body;

    if (!wedding_id || !template_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('invitations')
      .insert({
        wedding_id,
        template_id,
        bride_name: bride_name || '',
        groom_name: groom_name || '',
        ceremony_date: ceremony_date || null,
        ceremony_time: ceremony_time || null,
        ceremony_venue: ceremony_venue || '',
        ceremony_address: ceremony_address || '',
        reception_venue: reception_venue || '',
        reception_address: reception_address || '',
        rsvp_deadline: rsvp_deadline || null,
        rsvp_contact: rsvp_contact || '',
        custom_message: custom_message || '',
        custom_colors: custom_colors || {},
        header_image_url: header_image_url || null,
        is_finalized: is_finalized || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Invitations POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing invitation id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('invitations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Invitations PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing invitation id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('invitations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Invitations DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
