import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET - Load user's invitations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email parameter' },
        { status: 400 }
      );
    }

    // Get user ID
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all invitations for this user
    const { data: invitations, error } = await supabaseServer
      .from('invitations')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(invitations || []);
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// POST - Create new invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      design_type,
      canva_design_url,
      template_name,
      couple_name_1,
      couple_name_2,
      wedding_date,
      wedding_time,
      venue_name,
      venue_address,
      custom_message,
      color_scheme,
      font_style,
      image_url,
    } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('invitations')
      .insert({
        user_id,
        design_type: design_type || 'builtin',
        canva_design_url,
        template_name,
        couple_name_1,
        couple_name_2,
        wedding_date,
        wedding_time,
        venue_name,
        venue_address,
        custom_message,
        color_scheme,
        font_style,
        image_url,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
