import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get financial reports and analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can view financials
    const canView = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_view_financials',
    });

    if (!canView.data) {
      return NextResponse.json({
        error: 'Permission denied: can_view_financials required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const report_type = searchParams.get('report_type') || 'overview';

    if (report_type === 'overview') {
      // Overall financial summary
      const { data: monthlyRevenue } = await supabase
        .from('admin_monthly_revenue')
        .select('*')
        .limit(12);

      const { data: commissionByTier } = await supabase
        .from('admin_commission_by_tier')
        .select('*');

      const { data: subscriptionRevenue } = await supabase
        .from('admin_subscription_revenue')
        .select('*');

      // Calculate totals
      const totalMRR = subscriptionRevenue?.reduce((sum, s) => sum + parseFloat(s.monthly_recurring_revenue_usd), 0) || 0;
      const totalARR = totalMRR * 12;
      const totalCommission = commissionByTier?.reduce((sum, c) => sum + parseFloat(c.total_commission_earned_usd), 0) || 0;

      return NextResponse.json({
        overview: {
          monthly_recurring_revenue: totalMRR,
          annual_recurring_revenue: totalARR,
          total_commission_earned: totalCommission,
          total_revenue: totalMRR + totalCommission,
        },
        monthly_revenue: monthlyRevenue || [],
        commission_by_tier: commissionByTier || [],
        subscription_revenue: subscriptionRevenue || [],
      });

    } else if (report_type === 'tax_quarterly') {
      // Quarterly tax report
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : null;

      let query = supabase
        .from('admin_tax_report_quarterly')
        .select('*')
        .eq('tax_year', year);

      if (quarter) {
        query = query.eq('tax_quarter', quarter);
      }

      const { data: taxReport } = await query;

      // Calculate totals for tax filing
      const totals = taxReport?.reduce((acc, row) => {
        return {
          total_gross: acc.total_gross + parseFloat(row.total_gross_usd),
          total_commission: acc.total_commission + parseFloat(row.total_commission_usd),
          total_stripe_fees: acc.total_stripe_fees + parseFloat(row.total_stripe_fees_usd),
          total_net_income: acc.total_net_income + parseFloat(row.net_income_usd),
        };
      }, { total_gross: 0, total_commission: 0, total_stripe_fees: 0, total_net_income: 0 });

      return NextResponse.json({
        tax_year: year,
        tax_quarter: quarter,
        transactions: taxReport || [],
        totals: totals || {},
        note: 'Use this report for IRS Form 1099 and quarterly tax filings',
      });

    } else if (report_type === 'escrow_schedule') {
      // Upcoming vendor payments to release from escrow
      const { data: escrowSchedule } = await supabase
        .from('admin_escrow_schedule')
        .select('*')
        .order('escrow_release_date', { ascending: true })
        .limit(50);

      const upcomingReleases = escrowSchedule?.filter(e => {
        const releaseDate = new Date(e.escrow_release_date);
        const today = new Date();
        const in30Days = new Date();
        in30Days.setDate(today.getDate() + 30);
        return releaseDate >= today && releaseDate <= in30Days;
      });

      return NextResponse.json({
        upcoming_releases: upcomingReleases || [],
        all_scheduled: escrowSchedule || [],
        note: 'Money held in escrow until 30 days before wedding. This is vendor money, not platform revenue.',
      });

    } else if (report_type === 'transactions') {
      // Recent transactions
      const limit = parseInt(searchParams.get('limit') || '50');
      const type = searchParams.get('type'); // commission, subscription, refund

      let query = supabase
        .from('platform_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('transaction_type', type);
      }

      const { data: transactions } = await query;

      return NextResponse.json({
        transactions: transactions || [],
      });

    } else {
      return NextResponse.json({ error: 'Invalid report_type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Financial report error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Export tax report as CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canView = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_view_financials',
    });

    if (!canView.data) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { year, quarter } = await request.json();

    if (!year) {
      return NextResponse.json({ error: 'year required' }, { status: 400 });
    }

    // Get tax data
    let query = supabase
      .from('admin_tax_report_quarterly')
      .select('*')
      .eq('tax_year', year);

    if (quarter) {
      query = query.eq('tax_quarter', quarter);
    }

    const { data: taxData, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tax data' }, { status: 500 });
    }

    // Convert to CSV
    const headers = ['Year', 'Quarter', 'Type', 'Transactions', 'Gross', 'Commission', 'Stripe Fees', 'Net Income'];
    const rows = taxData?.map(row => [
      row.tax_year,
      row.tax_quarter,
      row.transaction_type,
      row.transaction_count,
      row.total_gross_usd,
      row.total_commission_usd,
      row.total_stripe_fees_usd,
      row.net_income_usd,
    ]) || [];

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Log export
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'tax_report_export',
      p_entity_type: 'financial_report',
      p_entity_id: null,
      p_description: `Exported tax report for ${year}${quarter ? ` Q${quarter}` : ''}`,
      p_metadata: { year, quarter },
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tax-report-${year}${quarter ? `-Q${quarter}` : ''}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Tax export error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
