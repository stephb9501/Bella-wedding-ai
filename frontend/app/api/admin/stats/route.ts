import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // In production, verify admin role
    // const { user } = await verifyAuth(request);
    // if (user.role !== 'admin') return unauthorized response

    // Mock admin stats
    // In production, these would be real database queries

    const stats = {
      total_brides: 247,
      total_vendors: 89,
      active_subscriptions: 156,
      monthly_revenue: 12450,
      new_signups_this_week: 23,
      pending_vendor_approvals: 5,
      messages_sent_today: 142,
      bookings_this_month: 78,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
