import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/gallery?weddingId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('weddingId');

    if (!weddingId) {
      return NextResponse.json({ error: 'Missing weddingId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('photo_galleries')
      .select('*')
      .eq('wedding_id', weddingId);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json({ error: 'Failed to fetch galleries' }, { status: 500 });
  }
}

// POST /api/gallery - Create gallery
export async function POST(request: NextRequest) {
  try {
    const { wedding_id, gallery_name, gallery_description } = await request.json();

    const { data: gallery, error } = await supabase