import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

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

    // Get all text invites for this user
    const { data: invites, error } = await supabaseServer
      .from('text_invites')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(invites || []);
  } catch (error) {
    console.error('Get text invites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch text invites' },
      { status: 500 }
    );
  }
}
