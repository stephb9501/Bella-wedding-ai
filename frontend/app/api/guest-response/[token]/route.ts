import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const token = params.token;

    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Fetch guest by token
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('guest_token', token)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    // Mark link as clicked
    await supabase
      .from('guests')
      .update({ link_clicked: true })
      .eq('guest_token', token);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Guest response GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch guest data' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const token = params.token;
    const body = await request.json();

    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    // Verify token exists
    const { data: existingGuest, error: fetchError } = await supabase
      .from('guests')
      .select('id')
      .eq('guest_token', token)
      .single();

    if (fetchError || !existingGuest) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    // Update guest data
    const { data, error } = await supabase
      .from('guests')
      .update({
        ...body,
        response_submitted: true,
      })
      .eq('guest_token', token)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Guest response POST error:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}
