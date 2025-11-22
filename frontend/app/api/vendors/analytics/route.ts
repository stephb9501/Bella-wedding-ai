import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const period = searchParams.get('period') || '30d';

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });
    }

    // Calculate date range
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[period as keyof typeof daysMap] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch vendor profile for tier info
    const { data: vendor } = await supabaseServer
      .from('vendors')
      .select('tier, category')
      .eq('id', vendorId)
      .single();

    // In production, these would come from actual tracking tables
    // For now, generating sample analytics data

    // Mock trend data
    const viewTrends = [];
    const messageTrends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      viewTrends.push({
        date: dateStr,
        views: Math.floor(Math.random() * 50) + 10,
      });

      messageTrends.push({
        date: dateStr,
        messages: Math.floor(Math.random() * 10) + 1,
      });
    }

    const totalViews = viewTrends.reduce((sum, d) => sum + d.views, 0);
    const totalMessages = messageTrends.reduce((sum, d) => sum + d.messages, 0);
    const bookingRequests = Math.floor(totalMessages * 0.3);
    const conversionRate = totalViews > 0 ? (bookingRequests / totalViews) * 100 : 0;

    // Mock commission rates by tier
    const commissionRates = {
      free: 0.10,
      premium: 0.05,
      featured: 0.02,
      elite: 0.00,
    };

    const avgBookingValue = 2500; // Average wedding vendor booking
    const estimatedRevenue = bookingRequests * avgBookingValue * (1 - (commissionRates[vendor?.tier as keyof typeof commissionRates] || 0.10));

    const analytics = {
      profile_views: totalViews,
      profile_views_change: Math.floor(Math.random() * 40) - 10, // -10% to +30%
      messages_sent: totalMessages,
      messages_change: Math.floor(Math.random() * 50) - 10,
      booking_requests: bookingRequests,
      bookings_change: Math.floor(Math.random() * 60) - 15,
      conversion_rate: conversionRate,
      revenue_estimate: Math.floor(estimatedRevenue),
      revenue_change: Math.floor(Math.random() * 45) - 10,
      popular_days: [
        'Saturday (40% of views)',
        'Sunday (25% of views)',
        'Friday (20% of views)',
      ],
      top_search_terms: [
        `${vendor?.category || 'Wedding'} near me`,
        'Affordable wedding vendors',
        `Best ${vendor?.category?.toLowerCase() || 'vendors'}`,
        'Wedding planning',
        'Local wedding services',
      ],
      view_trends: viewTrends,
      message_trends: messageTrends,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
