import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    // Support both id and email lookup
    if (!id && !email) {
      return NextResponse.json({ error: 'Missing user id or email' }, { status: 400 });
    }

    // Build query - users table has integer IDs, so lookup by email is more reliable
    let query = supabaseServer
      .from('users')
      .select('id, email, first_name, partner_name, wedding_date, subscription_tier, role, subscription_status');

    if (email) {
      query = query.eq('email', email);
    } else if (id) {
      // Try to lookup by id (integer), but this might fail if passed a UUID
      query = query.eq('id', id);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('User fetch error:', error);
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    // Update user data
    const { data, error } = await supabaseServer
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('User update error:', error);
      throw error;
    }

    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Users PUT error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
