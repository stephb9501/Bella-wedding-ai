import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // In production, verify admin role here
    // const { user } = await verifyAuth(request);
    // if (user.role !== 'admin') return unauthorized

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const tier = searchParams.get('tier');
    const status = searchParams.get('status');

    let query = supabaseServer
      .from('users')
      .select('id, email, first_name, partner_name, wedding_date, subscription_tier, subscription_status, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (tier && tier !== 'all') {
      query = query.eq('subscription_tier', tier);
    }

    if (status && status !== 'all') {
      query = query.eq('subscription_status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Admin users fetch error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      users: data || [],
      total: data?.length || 0
    });
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

// Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Update user
    const { data, error } = await supabaseServer
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Admin user update error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: data
    });
  } catch (error: any) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
