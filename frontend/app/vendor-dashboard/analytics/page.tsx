'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Eye, MessageCircle, Calendar, DollarSign, TrendingUp, TrendingDown, Users, ArrowLeft, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  date: string;
  profile_views: number;
  leads_received: number;
  bookings_made: number;
  revenue: number;
}

interface Stats {
  totalViews: number;
  totalLeads: number;
  totalBookings: number;
  totalRevenue: number;
  conversionRate: number;
  avgBookingValue: number;
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    totalLeads: 0,
    totalBookings: 0,
    totalRevenue: 0,
    conversionRate: 0,
    avgBookingValue: 0
  });

  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setVendorId(user.id);
    };
    initializePage();
  }, [router]);

  useEffect(() => {
    if (vendorId) {
      fetchAnalytics();
    }
  }, [vendorId, period]);

  const fetchAnalytics = async () => {
    if (!vendorId) return;

    try {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();

      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case 'all':
          startDate = new Date(2020, 0, 1); // Far enough back
          break;
      }

      // Fetch analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('vendor_analytics')
        .select('*')
        .eq('vendor_id', vendorId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (analyticsError) throw analyticsError;

      // Fetch actual bookings for revenue
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('vendor_bookings')
        .select('price, status, created_at')
        .eq('vendor_id', vendorId)
        .gte('created_at', startDate.toISOString())
        .in('status', ['confirmed', 'completed']);

      if (bookingsError) throw bookingsError;

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('vendor_leads')
        .select('created_at, status')
        .eq('vendor_id', vendorId)
        .gte('created_at', startDate.toISOString());

      if (leadsError) throw leadsError;

      setAnalyticsData(analyticsData || []);

      // Calculate stats
      const totalViews = analyticsData?.reduce((sum, d) => sum + d.profile_views, 0) || 0;
      const totalLeads = leadsData?.length || 0;
      const totalBookings = bookingsData?.length || 0;
      const totalRevenue = bookingsData?.reduce((sum, b) => sum + (b.price || 0), 0) || 0;
      const conversionRate = totalLeads > 0 ? (totalBookings / totalLeads) * 100 : 0;
      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      setStats({
        totalViews,
        totalLeads,
        totalBookings,
        totalRevenue,
        conversionRate,
        avgBookingValue
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartMax = (data: number[]) => {
    const max = Math.max(...data);
    return max === 0 ? 1 : max;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/vendor-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-serif font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Time Period</h2>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    period === p
                      ? 'bg-champagne-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Profile Views */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Profile Views</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Total views in selected period</p>
          </div>

          {/* Leads Received */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Leads Received</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
            <p className="text-xs text-gray-500 mt-2">Inquiries from potential clients</p>
          </div>

          {/* Bookings Made */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Bookings Made</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            <p className="text-xs text-gray-500 mt-2">Confirmed and completed bookings</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">From confirmed bookings</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-champagne-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-champagne-600" />
              </div>
              {stats.conversionRate >= 20 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Conversion Rate</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">Leads to bookings ratio</p>
          </div>

          {/* Average Booking Value */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Booking Value</h3>
            <p className="text-3xl font-bold text-gray-900">${stats.avgBookingValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500 mt-2">Average revenue per booking</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Profile Views Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Views Trend</h3>
            {analyticsData.length > 0 ? (
              <div className="h-64">
                <div className="h-full flex items-end gap-1">
                  {analyticsData.map((day, idx) => {
                    const maxViews = getChartMax(analyticsData.map(d => d.profile_views));
                    const height = (day.profile_views / maxViews) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group">
                        <div className="w-full relative">
                          <div
                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition cursor-pointer"
                            style={{
                              height: `${Math.max(height * 2, 4)}px`,
                            }}
                            title={`${getMonthDay(day.date)}: ${day.profile_views} views`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                          {period === '7d' ? getDayName(day.date) : getMonthDay(day.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
            {analyticsData.length > 0 ? (
              <div className="h-64">
                <div className="h-full flex items-end gap-1">
                  {analyticsData.map((day, idx) => {
                    const maxRevenue = getChartMax(analyticsData.map(d => d.revenue));
                    const height = (day.revenue / maxRevenue) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group">
                        <div className="w-full relative">
                          <div
                            className="w-full bg-amber-500 rounded-t hover:bg-amber-600 transition cursor-pointer"
                            style={{
                              height: `${Math.max(height * 2, 4)}px`,
                            }}
                            title={`${getMonthDay(day.date)}: $${day.revenue.toLocaleString()}`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                          {period === '7d' ? getDayName(day.date) : getMonthDay(day.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-4">
            {stats.conversionRate >= 20 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800">
                  <strong>Great conversion rate!</strong> Your {stats.conversionRate.toFixed(1)}% conversion rate is excellent. Keep up the good work!
                </p>
              </div>
            )}

            {stats.conversionRate < 10 && stats.totalLeads > 5 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800">
                  <strong>Low conversion rate:</strong> Your conversion rate is {stats.conversionRate.toFixed(1)}%. Consider improving your response time and proposal quality.
                </p>
              </div>
            )}

            {stats.totalViews > 0 && stats.totalLeads === 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  <strong>Getting views but no leads:</strong> Your profile has {stats.totalViews} views but no inquiries. Consider updating your portfolio and pricing.
                </p>
              </div>
            )}

            {stats.totalBookings >= 5 && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-purple-800">
                  <strong>Strong booking performance:</strong> You've secured {stats.totalBookings} bookings with an average value of ${stats.avgBookingValue.toLocaleString()}!
                </p>
              </div>
            )}

            {stats.totalViews < 50 && period === '30d' && (
              <div className="p-4 bg-champagne-50 rounded-lg border border-champagne-200">
                <p className="text-champagne-800">
                  <strong>Boost your visibility:</strong> Your profile needs more exposure. Consider upgrading your tier to appear higher in search results.
                </p>
              </div>
            )}

            {/* Generic tips */}
            {stats.totalViews === 0 && stats.totalLeads === 0 && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800">
                  <strong>Getting started:</strong> Add high-quality photos to your portfolio and complete your profile to start attracting clients.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 bg-gradient-to-r from-champagne-50 to-rose-50 rounded-lg border-2 border-champagne-200 p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-champagne-600 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Growth Recommendations</h4>
              <ul className="space-y-2 text-gray-700">
                {stats.totalViews < 100 && (
                  <li>• Add more photos to your portfolio to attract more profile views</li>
                )}
                {stats.conversionRate < 15 && stats.totalLeads > 0 && (
                  <li>• Respond to leads faster to improve your conversion rate</li>
                )}
                {stats.avgBookingValue < 1000 && stats.totalBookings > 0 && (
                  <li>• Consider offering premium packages to increase your average booking value</li>
                )}
                {stats.totalLeads < 10 && (
                  <li>• Upgrade your tier to appear higher in search results and receive more inquiries</li>
                )}
                <li>• Request reviews from satisfied clients to build trust with potential customers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
