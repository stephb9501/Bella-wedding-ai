import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET - Load invitation data by token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    const { data: invite, error } = await supabaseServer
      .from('text_invites')
      .select('*')
      .eq('rsvp_token', token)
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      guest_name: invite.guest_name,
      rsvp_status: invite.rsvp_status,
    });
  } catch (error) {
    console.error('Get RSVP error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}

// PATCH - Mark invitation as opened
export async function PATCH(request: NextRequest) {
  try {
    const { token, opened } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('text_invites')
      .update({ opened: opened || true })
      .eq('rsvp_token', token)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Update RSVP error:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    );
  }
}

// PUT - Submit RSVP response
export async function PUT(request: NextRequest) {
  try {
    const { token, rsvp_status, meal_choice, plus_ones, message } = await request.json();

    if (!token || !rsvp_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('text_invites')
      .update({
        rsvp_status,
        meal_choice: meal_choice || null,
        plus_ones: plus_ones || 0,
        message: message || null,
        rsvp_at: new Date().toISOString(),
      })
      .eq('rsvp_token', token)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Submit RSVP error:', error);
    return NextResponse.json(
      { error: 'Failed to submit RSVP' },
      { status: 500 }
    );
  }
}
