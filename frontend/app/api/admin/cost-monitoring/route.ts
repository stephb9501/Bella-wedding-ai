import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get cost monitoring data
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
    const report_type = searchParams.get('report_type') || 'daily';

    if (report_type === 'daily') {
      // Daily cost summary
      const days = parseInt(searchParams.get('days') || '30');

      const { data: dailyCosts, error } = await supabase
        .from('daily_cost_summary')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(days);

      if (error) {
        console.error('Daily costs error:', error);
        return NextResponse.json({ error: 'Failed to fetch daily costs' }, { status: 500 });
      }

      return NextResponse.json({
        daily_costs: dailyCosts || [],
        period: `Last ${days} days`,
      });

    } else if (report_type === 'monthly') {
      // Monthly cost rollup
      const months = parseInt(searchParams.get('months') || '12');

      const { data: monthlyCosts, error } = await supabase
        .from('monthly_cost_summary')
        .select('*')
        .order('month', { ascending: false })
        .limit(months);

      if (error) {
        console.error('Monthly costs error:', error);
        return NextResponse.json({ error: 'Failed to fetch monthly costs' }, { status: 500 });
      }

      return NextResponse.json({
        monthly_costs: monthlyCosts || [],
        period: `Last ${months} months`,
      });

    } else if (report_type === 'alerts') {
      // Active cost alerts
      const { data: alerts, error } = await supabase
        .from('active_cost_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Alerts fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
      }

      return NextResponse.json({
        alerts: alerts || [],
        total: alerts?.length || 0,
      });

    } else if (report_type === 'limits') {
      // Current usage limits
      const { data: limits, error } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('is_active', true)
        .order('limit_name');

      if (error) {
        console.error('Limits fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch limits' }, { status: 500 });
      }

      return NextResponse.json({
        limits: limits || [],
        total: limits?.length || 0,
      });

    } else if (report_type === 'top_users') {
      // Top users by cost
      const limit = parseInt(searchParams.get('limit') || '50');

      const { data: topUsers, error } = await supabase
        .from('top_users_by_cost')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Top users error:', error);
        return NextResponse.json({ error: 'Failed to fetch top users' }, { status: 500 });
      }

      return NextResponse.json({
        top_users: topUsers || [],
        total: topUsers?.length || 0,
      });

    } else if (report_type === 'current') {
      // Current usage today
      const { data: today, error } = await supabase
        .from('daily_usage_metrics')
        .select('*')
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Current usage error:', error);
        return NextResponse.json({ error: 'Failed to fetch current usage' }, { status: 500 });
      }

      // Get limits
      const { data: limits } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('is_active', true);

      return NextResponse.json({
        current_usage: today || {},
        limits: limits || [],
        note: 'Real-time usage for today vs. configured limits',
      });

    } else if (report_type === 'pricing') {
      // Cost configuration (pricing per service)
      const { data: pricing, error } = await supabase
        .from('cost_configuration')
        .select('*')
        .order('service_name');

      if (error) {
        console.error('Pricing fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
      }

      return NextResponse.json({
        pricing: pricing || [],
        total: pricing?.length || 0,
      });

    } else {
      return NextResponse.json({ error: 'Invalid report_type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Cost monitoring error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update pricing or trigger cost calculation
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

    if (action === 'calculate_costs') {
      // Trigger cost calculation
      const { error } = await supabase.rpc('calculate_daily_costs');

      if (error) {
        console.error('Calculate costs error:', error);
        return NextResponse.json({ error: 'Failed to calculate costs' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Costs calculated successfully',
      });

    } else if (action === 'update_pricing') {
      // Update pricing for a service
      const {
        service_name,
        cost_per_unit,
        unit_type,
        provider,
        notes,
      } = body;

      if (!service_name || cost_per_unit === undefined) {
        return NextResponse.json(
          { error: 'service_name and cost_per_unit are required' },
          { status: 400 }
        );
      }

      const { data: pricing, error } = await supabase
        .from('cost_configuration')
        .upsert({
          service_name,
          cost_per_unit,
          unit_type,
          provider,
          notes,
        })
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

    } else if (action === 'track_usage') {
      // Manually track usage (called by other APIs)
      const {
        metric_type,
        increment_value = 1,
        user_id = null,
      } = body;

      if (!metric_type) {
        return NextResponse.json(
          { error: 'metric_type is required' },
          { status: 400 }
        );
      }

      // Increment usage metric
      const { error } = await supabase.rpc('increment_usage_metric', {
        p_metric_type: metric_type,
        p_increment_value: increment_value,
      });

      if (error) {
        console.error('Track usage error:', error);
        return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
      }

      // Check if limit exceeded
      const { data: currentMetrics } = await supabase
        .from('daily_usage_metrics')
        .select('*')
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .single();

      let currentValue = 0;
      let limitName = '';

      if (metric_type === 'storage_added') {
        currentValue = currentMetrics?.storage_added_today || 0;
        limitName = 'daily_storage_upload';
      } else if (metric_type === 'emails_sent') {
        currentValue = currentMetrics?.emails_sent_today || 0;
        limitName = 'daily_emails';
      } else if (metric_type === 'ai_requests') {
        currentValue = currentMetrics?.ai_requests_today || 0;
        limitName = 'daily_ai_requests';
      }

      if (limitName) {
        const { data: limitCheck } = await supabase.rpc('check_daily_limit', {
          p_metric_name: limitName,
          p_current_value: currentValue,
        });

        if (limitCheck && limitCheck.exceeded) {
          return NextResponse.json({
            message: 'Usage tracked, but limit exceeded',
            limit_exceeded: true,
            action: limitCheck.action,
            alert_id: limitCheck.alert_id,
          }, { status: 429 }); // Too Many Requests
        }

        return NextResponse.json({
          message: 'Usage tracked successfully',
          limit_exceeded: false,
          limit_check: limitCheck,
        });
      }

      return NextResponse.json({
        message: 'Usage tracked successfully',
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Cost monitoring operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update usage limits
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
      limit_name,
      daily_limit,
      monthly_limit,
      daily_cost_limit,
      monthly_cost_limit,
      alert_at_percentage,
      action_on_exceed,
    } = body;

    if (!limit_name) {
      return NextResponse.json(
        { error: 'limit_name is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (daily_limit !== undefined) updates.daily_limit = daily_limit;
    if (monthly_limit !== undefined) updates.monthly_limit = monthly_limit;
    if (daily_cost_limit !== undefined) updates.daily_cost_limit = daily_cost_limit;
    if (monthly_cost_limit !== undefined) updates.monthly_cost_limit = monthly_cost_limit;
    if (alert_at_percentage !== undefined) updates.alert_at_percentage = alert_at_percentage;
    if (action_on_exceed !== undefined) updates.action_on_exceed = action_on_exceed;

    // Update limit
    const { data: limit, error } = await supabase
      .from('usage_limits')
      .update(updates)
      .eq('limit_name', limit_name)
      .select()
      .single();

    if (error) {
      console.error('Update limit error:', error);
      return NextResponse.json({ error: 'Failed to update limit' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Usage limit updated successfully',
      limit,
    });
  } catch (error: any) {
    console.error('Limit update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
