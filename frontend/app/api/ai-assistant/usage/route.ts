import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Get current month's usage
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: usageData, error: usageError } = await supabaseServer
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString());

    if (usageError) throw usageError;

    // Get user tier from users table
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const tier = userData?.subscription_tier || 'free';
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
