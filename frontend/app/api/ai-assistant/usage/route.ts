import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Authorization check - user can only view their own usage
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current month's usage
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: usageData, error: usageError } = await supabase
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString());

    if (usageError) {
      console.error('Usage error:', usageError);
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
    }

    // Get user tier from vendor_profiles table
    const { data: vendorProfile, error: profileError } = await supabase
      .from('vendor_profiles')
      .select('tier')
      .eq('user_id', userId)
      .single();

    const tier = vendorProfile?.tier || 'free';
    const tierLimits: Record<string, number> = {
      free: 0,
      premium: 50,
      featured: 150,
      elite: 300,
    };

    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return NextResponse.json({
      current_usage: usageData?.length || 0,
      monthly_limit: tierLimits[tier] || 0,
      reset_date: nextResetDate.toISOString(),
      tier,
    });
  } catch (error: any) {
    console.error('AI usage GET error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
