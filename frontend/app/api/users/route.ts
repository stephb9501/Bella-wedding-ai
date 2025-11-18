import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    // Fetch user data from database
    const { data, error } = await supabaseServer
      .from('users')
      .select('id, email, full_name, partner_name, wedding_date, wedding_location, subscription_tier')
      .eq('id', id)
      .single();

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
