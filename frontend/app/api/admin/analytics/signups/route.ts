import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get signup analytics
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
      // Overall signup summary
      const { data: summary, error } = await supabase
        .from('signup_summary')
        .select('*')
        .single();

      if (error) {
        console.error('Summary fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
      }

      return NextResponse.json({
        summary: summary || {},
        report_type: 'Signup Summary',
      });

    } else if (report_type === 'daily_vendors') {
      // Daily vendor signups
      const days = parseInt(searchParams.get('days') || '30');

      const { data: dailyVendors, error } = await supabase
        .from('daily_vendor_signups')
        .select('*')
        .gte('signup_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('signup_date', { ascending: false });

      if (error) {
        console.error('Daily vendors error:', error);
        return NextResponse.json({ error: 'Failed to fetch daily vendors' }, { status: 500 });
      }

      return NextResponse.json({
        daily_vendors: dailyVendors || [],
        period: `Last ${days} days`,
      });

    } else if (report_type === 'daily_brides') {
      // Daily bride signups
      const days = parseInt(searchParams.get('days') || '30');

      const { data: dailyBrides, error } = await supabase
        .from('daily_bride_signups')
        .select('*')
        .gte('signup_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('signup_date', { ascending: false });

      if (error) {
        console.error('Daily brides error:', error);
        return NextResponse.json({ error: 'Failed to fetch daily brides' }, { status: 500 });
      }

      return NextResponse.json({
        daily_brides: dailyBrides || [],
        period: `Last ${days} days`,
      });

    } else if (report_type === 'monthly') {
      // Monthly signups (vendors + brides)
      const months = parseInt(searchParams.get('months') || '12');

      const { data: monthlyVendors } = await supabase
        .from('monthly_vendor_signups')
        .select('*')
        .order('month_start', { ascending: false })
        .limit(months);

      const { data: monthlyBrides } = await supabase
        .from('monthly_bride_signups')
        .select('*')
        .order('month_start', { ascending: false })
        .limit(months);

      return NextResponse.json({
        monthly_vendors: monthlyVendors || [],
        monthly_brides: monthlyBrides || [],
        period: `Last ${months} months`,
      });

    } else if (report_type === 'growth') {
      // Month-over-month growth metrics
      const months = parseInt(searchParams.get('months') || '12');

      const { data: growth, error } = await supabase
        .from('monthly_growth_metrics')
        .select('*')
        .order('month', { ascending: false })
        .limit(months);

      if (error) {
        console.error('Growth metrics error:', error);
        return NextResponse.json({ error: 'Failed to fetch growth metrics' }, { status: 500 });
      }

      return NextResponse.json({
        growth_metrics: growth || [],
        period: `Last ${months} months`,
      });

    } else if (report_type === 'recent_vendors') {
      // Recent vendor signups (detailed)
      const limit = parseInt(searchParams.get('limit') || '50');

      const { data: recentVendors, error } = await supabase
        .from('recent_vendor_signups_detailed')
        .select('*')
        .order('signup_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Recent vendors error:', error);
        return NextResponse.json({ error: 'Failed to fetch recent vendors' }, { status: 500 });
      }

      return NextResponse.json({
        recent_vendors: recentVendors || [],
        count: recentVendors?.length || 0,
      });

    } else if (report_type === 'recent_brides') {
      // Recent bride signups (detailed)
      const limit = parseInt(searchParams.get('limit') || '50');

      const { data: recentBrides, error } = await supabase
        .from('recent_bride_signups_detailed')
        .select('*')
        .order('signup_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Recent brides error:', error);
        return NextResponse.json({ error: 'Failed to fetch recent brides' }, { status: 500 });
      }

      return NextResponse.json({
        recent_brides: recentBrides || [],
        count: recentBrides?.length || 0,
      });

    } else if (report_type === 'conversion_funnel') {
      // Vendor tier conversion funnel
      const { data: funnel, error } = await supabase
        .from('vendor_conversion_funnel')
        .select('*')
        .order('conversion_count', { ascending: false });

      if (error) {
        console.error('Conversion funnel error:', error);
        return NextResponse.json({ error: 'Failed to fetch conversion funnel' }, { status: 500 });
      }

      return NextResponse.json({
        conversion_funnel: funnel || [],
        note: 'Shows how many vendors upgraded from one tier to another',
      });

    } else {
      return NextResponse.json({ error: 'Invalid report_type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Signup analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
