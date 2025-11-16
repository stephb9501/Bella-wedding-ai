import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get('zip');

    if (!zip) {
      return NextResponse.json({ error: 'ZIP code required' }, { status: 400 });
    }

    // Query local ZIP codes table
    const { data, error } = await supabase
      .from('zip_codes')
      .select('latitude, longitude, city, state_code')
      .eq('zip', zip)
      .single();

    if (error) {
      console.error('ZIP lookup error:', error);
      return NextResponse.json({ error: 'ZIP not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('ZIP lookup error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
