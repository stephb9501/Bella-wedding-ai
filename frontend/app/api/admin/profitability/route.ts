import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get profitability data
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can view analytics
    const canView = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_view_analytics',
    });

    if (!canView.data) {
      return NextResponse.json({
        error: 'Permission denied: can_view_analytics required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const report_type = searchParams.get('report_type') || 'summary';

    if (report_type === 'summary') {
      // Platform profitability summary
      const { data: platformProfit, error } = await supabase
        .from('monthly_profitability_trend')
        .select('*')
        .order('month', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Platform profit error:', error);
        return NextResponse.json({ error: 'Failed to fetch platform profitability' }, { status: 500 });
      }

      return NextResponse.json({
        platform: platformProfit || {},
        note: 'Current month profitability overview',
      });

    } else if (report_type === 'monthly_trend') {
      // Monthly profitability trend
      const months = parseInt(searchParams.get('months') || '12');

      const { data: trend, error } = await supabase
        .from('monthly_profitability_trend')
        .select('*')
        .order('month', { ascending: false })
        .limit(months);

      if (error) {
        console.error('Monthly trend error:', error);
        return NextResponse.json({ error: 'Failed to fetch monthly trend' }, { status: 500 });
      }

      return NextResponse.json({
        monthly_trend: trend || [],
        period: `Last ${months} months`,
      });

    } else if (report_type === 'most_profitable_users') {
      // Most profitable users
      const limit = parseInt(searchParams.get('limit') || '50');

      const { data: profitableUsers, error } = await supabase
        .from('most_profitable_users')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Profitable users error:', error);
        return NextResponse.json({ error: 'Failed to fetch profitable users' }, { status: 500 });
      }

      return NextResponse.json({
        profitable_users: profitableUsers || [],
        total: profitableUsers?.length || 0,
      });

    } else if (report_type === 'unprofitable_users') {
      // Unprofitable users (losing you money)
      const limit = parseInt(searchParams.get('limit') || '50');

      const { data: unprofitableUsers, error } = await supabase
        .from('unprofitable_users')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Unprofitable users error:', error);
        return NextResponse.json({ error: 'Failed to fetch unprofitable users' }, { status: 500 });
      }

      return NextResponse.json({
        unprofitable_users: unprofitableUsers || [],
        total: unprofitableUsers?.length || 0,
        warning: 'These users are costing you more than they pay',
      });

    } else if (report_type === 'cost_per_user_type') {
      // Average cost per user type (vendor vs bride)
      const { data: costPerType, error } = await supabase
        .from('cost_per_user_type')
        .select('*')
        .order('month', { ascending: false });

      if (error) {
        console.error('Cost per type error:', error);
        return NextResponse.json({ error: 'Failed to fetch cost per user type' }, { status: 500 });
      }

      return NextResponse.json({
        cost_per_type: costPerType || [],
      });

    } else if (report_type === 'user_detail') {
      // Profitability for a specific user
      const userId = searchParams.get('user_id');

      if (!userId) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
      }

      const { data: userProfit, error } = await supabase
        .from('user_profitability')
        .select('*')
        .eq('user_id', userId)
        .order('month', { ascending: false });

      if (error) {
        console.error('User detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch user profitability' }, { status: 500 });
      }

      return NextResponse.json({
        user_profitability: userProfit || [],
        total_months: userProfit?.length || 0,
      });

    } else if (report_type === 'pricing') {
      // Current pricing tiers
      const { data: pricing, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price');

      if (error) {
        console.error('Pricing fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
      }

      return NextResponse.json({
        pricing_tiers: pricing || [],
        total: pricing?.length || 0,
      });

    } else {
      return NextResponse.json({ error: 'Invalid report_type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Profitability error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Calculate profitability or update revenue/costs
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage billing
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_billing',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_billing required'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'calculate_user_profitability') {
      // Calculate profitability for all users for a month
      const month = body.month || new Date().toISOString().split('T')[0].substring(0, 7) + '-01';

      const { error } = await supabase.rpc('calculate_user_profitability', {
        p_month: month,
      });

      if (error) {
        console.error('Calculate user profitability error:', error);
        return NextResponse.json({ error: 'Failed to calculate user profitability' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'User profitability calculated successfully',
        month,
      });

    } else if (action === 'calculate_platform_profitability') {
      // Calculate platform-wide profitability
      const month = body.month || new Date().toISOString().split('T')[0].substring(0, 7) + '-01';

      const { error } = await supabase.rpc('calculate_platform_profitability', {
        p_month: month,
      });

      if (error) {
        console.error('Calculate platform profitability error:', error);
        return NextResponse.json({ error: 'Failed to calculate platform profitability' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Platform profitability calculated successfully',
        month,
      });

    } else if (action === 'record_user_revenue') {
      // Record revenue for a user
      const {
        user_id,
        user_type,
        user_email,
        revenue_month,
        subscription_tier,
        subscription_mrr,
        subscription_payments,
        commission_collected = 0.00,
        bookings_count = 0,
      } = body;

      if (!user_id || !revenue_month) {
        return NextResponse.json(
          { error: 'user_id and revenue_month are required' },
          { status: 400 }
        );
      }

      const total_revenue = (subscription_payments || 0) + (commission_collected || 0);

      const { data: revenue, error } = await supabase
        .from('user_revenue_tracking')
        .upsert({
          user_id,
          user_type: user_type || 'vendor',
          user_email,
          revenue_month,
          subscription_tier,
          subscription_mrr: subscription_mrr || 0.00,
          subscription_payments: subscription_payments || 0.00,
          commission_collected,
          bookings_count,
          total_revenue,
        })
        .select()
        .single();

      if (error) {
        console.error('Record revenue error:', error);
        return NextResponse.json({ error: 'Failed to record revenue' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Revenue recorded successfully',
        revenue,
      });

    } else if (action === 'record_user_cost') {
      // Record costs for a user
      const {
        user_id,
        user_type,
        user_email,
        cost_month,
        storage_used_gb,
        emails_sent,
        ai_requests,
        ai_tokens_used,
      } = body;

      if (!user_id || !cost_month) {
        return NextResponse.json(
          { error: 'user_id and cost_month are required' },
          { status: 400 }
        );
      }

      // Calculate costs based on pricing configuration
      const storage_cost = (storage_used_gb || 0) * 0.021 / 30; // $0.021/GB/month
      const email_cost = (emails_sent || 0) * 0.0001;
      const ai_cost = (ai_requests || 0) * 0.003;
      const total_cost = storage_cost + email_cost + ai_cost;

      const { data: cost, error } = await supabase
        .from('user_cost_attribution')
        .upsert({
          user_id,
          user_type: user_type || 'vendor',
          user_email,
          cost_month,
          storage_used_gb: storage_used_gb || 0,
          storage_cost,
          emails_sent: emails_sent || 0,
          email_cost,
          ai_requests: ai_requests || 0,
          ai_tokens_used: ai_tokens_used || 0,
          ai_cost,
          total_cost,
        })
        .select()
        .single();

      if (error) {
        console.error('Record cost error:', error);
        return NextResponse.json({ error: 'Failed to record cost' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Cost recorded successfully',
        cost,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Profitability operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update pricing tiers
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage billing
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_billing',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_billing required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      tier_name,
      monthly_price,
      commission_rate,
      storage_limit_gb,
      email_limit,
      ai_limit,
    } = body;

    if (!tier_name) {
      return NextResponse.json(
        { error: 'tier_name is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (monthly_price !== undefined) updates.monthly_price = monthly_price;
    if (commission_rate !== undefined) updates.commission_rate = commission_rate;
    if (storage_limit_gb !== undefined) updates.storage_limit_gb = storage_limit_gb;
    if (email_limit !== undefined) updates.email_limit = email_limit;
    if (ai_limit !== undefined) updates.ai_limit = ai_limit;

    // Update pricing tier
    const { data: pricing, error } = await supabase
      .from('pricing_tiers')
      .update(updates)
      .eq('tier_name', tier_name)
      .select()
      .single();

    if (error) {
      console.error('Update pricing error:', error);
      return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Pricing updated successfully',
      pricing,
    });
  } catch (error: any) {
    console.error('Pricing update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
