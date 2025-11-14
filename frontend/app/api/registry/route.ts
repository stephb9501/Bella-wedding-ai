import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/registry?weddingId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('registry_links')
      .select('*')
      .eq('wedding_id', weddingId);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching registries:', error);
    return NextResponse.json({ error: 'Failed to fetch registries' }, { status: 500 });
  }
}

// POST /api/registry
export async function POST(request: NextRequest) {
  try {
    const { wedding_id, platform, url, link_title } = await request.json();

    const { data: registryLink, error } = await supabase
      .from('registry_links')
      .insert({
        wedding_id,
        platform,
        url,
        link_title,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Create tracking record
    await supabase
      .from('registry_tracking')
      .insert({
        registry_link_id: registryLink.id,
        total_items: 0,
        items_purchased: 0,
        total_value: 0,
        value_purchased: 0,
      });

    return NextResponse.json(registryLink, { status: 201 });
  } catch (error) {
    console.error('Error creating registry:', error);
    return NextResponse.json({ error: 'Faile