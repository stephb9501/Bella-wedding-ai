import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');
    if (!weddingId) return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });
    const { data, error } = await supabase.from('registry_links').select('*').eq('wedding_id', weddingId).eq('is_active', true);
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch registries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  try {
    const { wedding_id, platform, url, link_title } = await request.json();

    if (!wedding_id || !platform || !url || !link_title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase.from('registry_links').insert({
      wedding_id,
      platform,
      url,
      link_title,
      is_active: true,
    }).select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Registry POST error:', error);
    return NextResponse.json({ error: 'Failed to add registry' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing registry id' }, { status: 400 });

    const { error } = await supabase.from('registry_links').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registry DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete registry' }, { status: 500 });
  }
}
