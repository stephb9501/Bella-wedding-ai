import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get sales tax reports
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
    const report_type = searchParams.get('report_type') || 'arkansas_monthly';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null;

    if (report_type === 'arkansas_monthly') {
      // Arkansas monthly sales tax report
      let query = supabase
        .from('arkansas_monthly_sales_tax')
        .select('*')
        .eq('tax_year', year);

      if (month) {
        query = query.eq('tax_month', month);
      }

      const { data: arkansasReport, error } = await query.order('tax_month', { ascending: false });

      if (error) {
        console.error('Arkansas tax report error:', error);
        return NextResponse.json({ error: 'Failed to fetch Arkansas tax report' }, { status: 500 });
      }

      // Calculate totals
      const totals = arkansasReport?.reduce((acc, row) => {
        return {
          gross_sales: acc.gross_sales + parseFloat(row.gross_taxable_sales_usd || '0'),
          state_tax: acc.state_tax + parseFloat(row.state_tax_collected_usd || '0'),
          county_tax: acc.county_tax + parseFloat(row.county_tax_collected_usd || '0'),
          city_tax: acc.city_tax + parseFloat(row.city_tax_collected_usd || '0'),
          total_tax: acc.total_tax + parseFloat(row.total_tax_collected_usd || '0'),
        };
      }, { gross_sales: 0, state_tax: 0, county_tax: 0, city_tax: 0, total_tax: 0 });

      return NextResponse.json({
        report_type: 'Arkansas Monthly Sales Tax',
        year,
        month: month || 'All months',
        transactions: arkansasReport || [],
        totals: totals || {},
        note: 'File this report with Arkansas Department of Finance & Administration',
      });

    } else if (report_type === 'all_states') {
      // All states summary
      let query = supabase
        .from('all_states_monthly_sales_tax')
        .select('*')
        .eq('tax_year', year);

      if (month) {
        query = query.eq('tax_month', month);
      }

      const { data: allStates, error } = await query.order('state');

      if (error) {
        console.error('All states tax error:', error);
        return NextResponse.json({ error: 'Failed to fetch all states report' }, { status: 500 });
      }

      return NextResponse.json({
        report_type: 'All States Monthly Tax Summary',
        year,
        month: month || 'All months',
        states: allStates || [],
      });

    } else if (report_type === 'dfa_export') {
      // Arkansas DFA export format
      let query = supabase
        .from('arkansas_dfa_monthly_export')
        .select('*');

      if (month) {
        query = query.like('reporting_period', `${year}-${month.toString().padStart(2, '0')}%`);
      } else {
        query = query.like('reporting_period', `${year}%`);
      }

      const { data: dfaExport, error } = await query;

      if (error) {
        console.error('DFA export error:', error);
        return NextResponse.json({ error: 'Failed to generate DFA export' }, { status: 500 });
      }

      return NextResponse.json({
        report_type: 'Arkansas DFA Export',
        year,
        month: month || 'All months',
        dfa_data: dfaExport || [],
        instructions: 'Use this data to file your monthly sales tax return with Arkansas DFA',
      });

    } else if (report_type === 'owed') {
      // What's owed (not yet remitted)
      const { data: owed, error } = await supabase
        .from('sales_tax_collected')
        .select('*')
        .eq('remitted_to_state', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Owed tax error:', error);
        return NextResponse.json({ error: 'Failed to fetch owed taxes' }, { status: 500 });
      }

      // Group by state
      const byState: any = {};
      owed?.forEach(row => {
        if (!byState[row.state]) {
          byState[row.state] = {
            state: row.state,
            transaction_count: 0,
            total_owed_cents: 0,
          };
        }
        byState[row.state].transaction_count++;
        byState[row.state].total_owed_cents += row.total_tax_cents;
      });

      const summary = Object.values(byState).map((s: any) => ({
        ...s,
        total_owed_usd: s.total_owed_cents / 100.0,
      }));

      return NextResponse.json({
        report_type: 'Taxes Owed (Not Remitted)',
        owed_summary: summary,
        detailed_transactions: owed || [],
      });

    } else {
      return NextResponse.json({ error: 'Invalid report_type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Sales tax report error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Export sales tax report as CSV
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

    const { year, month, report_type = 'arkansas_dfa' } = await request.json();

    if (!year) {
      return NextResponse.json({ error: 'year required' }, { status: 400 });
    }

    // Get Arkansas DFA export data
    let query = supabase
      .from('arkansas_dfa_monthly_export')
      .select('*');

    if (month) {
      query = query.like('reporting_period', `${year}-${month.toString().padStart(2, '0')}%`);
    } else {
      query = query.like('reporting_period', `${year}%`);
    }

    const { data: taxData, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tax data' }, { status: 500 });
    }

    // Convert to CSV
    const headers = ['Reporting Period', 'County', 'City', 'Transactions', 'Gross Sales', 'State Tax', 'County Tax', 'City Tax', 'Total Tax Due', 'Status'];
    const rows = taxData?.map(row => [
      row.reporting_period,
      row.county || '',
      row.city || '',
      row.number_of_transactions,
      row.gross_sales?.toFixed(2) || '0.00',
      row.state_tax?.toFixed(2) || '0.00',
      row.county_tax?.toFixed(2) || '0.00',
      row.city_tax?.toFixed(2) || '0.00',
      row.total_tax_due?.toFixed(2) || '0.00',
      row.status,
    ]) || [];

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Log export
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'sales_tax_export',
      p_entity_type: 'sales_tax_report',
      p_entity_id: null,
      p_description: `Exported Arkansas sales tax report for ${year}${month ? `-${month}` : ''}`,
      p_metadata: { year, month },
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="arkansas-sales-tax-${year}${month ? `-${month}` : ''}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Sales tax export error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Mark tax as remitted to state
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_view_financials',
    });

    if (!canManage.data) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { state, year, month } = await request.json();

    if (!state || !year || !month) {
      return NextResponse.json({ error: 'state, year, and month required' }, { status: 400 });
    }

    // Mark as remitted
    const { data, error } = await supabase.rpc('mark_tax_remitted', {
      p_state: state,
      p_year: year,
      p_month: month,
    });

    if (error) {
      console.error('Mark remitted error:', error);
      return NextResponse.json({ error: 'Failed to mark tax as remitted' }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'sales_tax_remitted',
      p_entity_type: 'sales_tax',
      p_entity_id: null,
      p_description: `Marked ${state} sales tax for ${year}-${month} as remitted`,
      p_metadata: { state, year, month, count: data },
    });

    return NextResponse.json({
      success: true,
      message: `Marked ${data} transactions as remitted`,
      count: data,
    });
  } catch (error: any) {
    console.error('Mark remitted error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
