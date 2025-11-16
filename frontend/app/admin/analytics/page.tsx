'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, Users, Calendar, Crown, Award,
  ArrowUp, ArrowDown, Target, PieChart, BarChart3
} from 'lucide-react';

interface MonthlyData {
  month: string;
  newUsers: number;
  revenue: number;
  bookings: number;
  churn: number;
}

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'7days' | '30days' | '90days' | '12months'>('30days');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = () => {
    // Demo data - in production, fetch from API
    const demo: MonthlyData[] = [
      { month: 'Jan', newUsers: 45, revenue: 2340, bookings: 12, churn: 3 },
      { month: 'Feb', newUsers: 68, revenue: 3520, bookings: 18, churn: 4 },
      { month: 'Mar', newUsers: 92, revenue: 4850, bookings: 25, churn: 5 },
      { month: 'Apr', newUsers: 110, revenue: 5980, bookings: 32, churn: 6 },
      { month: 'May', newUsers: 135, revenue: 7240, bookings: 38, churn: 7 },
      { month: 'Jun', newUsers: 156, revenue: 8450, bookings: 45, churn: 8 },
      { month: 'Jul', newUsers: 178, revenue: 9320, bookings: 52, churn: 9 },
      { month: 'Aug', newUsers: 198, revenue: 10200, bookings: 58, churn: 10 },
      { month: 'Sep', newUsers: 212, revenue: 11450, bookings: 65, churn: 11 },
      { month: 'Oct', newUsers: 234, revenue: 12840, bookings: 72, churn: 12 },
      { month: 'Nov', newUsers: 267, revenue: 14680, bookings: 89, churn: 13 },
      { month: 'Dec', newUsers: 289, revenue: 16240, bookings: 96, churn: 14 },
    ];
    setMonthlyData(demo);
  };

  // Calculate metrics
  const currentMonth = monthlyData[monthlyData.length - 1] || { newUsers: 0, revenue: 0, bookings: 0, churn: 0 };
  const previousMonth = monthlyData[monthlyData.length - 2] || { newUsers: 0, revenue: 0, bookings: 0, churn: 0 };

  const metrics = {
    totalUsers: monthlyData.reduce((sum, m) => sum + m.newUsers, 0),
    totalRevenue: monthlyData.reduce((sum, m) => sum + m.revenue, 0),
    totalBookings: monthlyData.reduce((sum, m) => sum + m.bookings, 0),
    currentMRR: 14680,
    userGrowth: ((currentMonth.newUsers - previousMonth.newUsers) / previousMonth.newUsers * 100).toFixed(1),
    revenueGrowth: ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1),
    avgBookingValue: currentMonth.revenue / currentMonth.bookings,
    conversionRate: (currentMonth.bookings / currentMonth.newUsers * 100).toFixed(1),
    churnRate: (currentMonth.churn / (monthlyData.reduce((sum, m) => sum + m.newUsers, 0)) * 100).toFixed(2),
  };

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-serif text-champagne-900 mb-3">Analytics Dashboard</h1>
          <p className="text-xl text-champagne-700">Platform performance and growth metrics</p>
        </div>

        {/* Timeframe Selector */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex gap-2">
            {(['7days', '30days', '90days', '12months'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  timeframe === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === '7days' && 'Last 7 Days'}
                {period === '30days' && 'Last 30 Days'}
                {period === '90days' && 'Last 90 Days'}
                {period === '12months' && 'Last 12 Months'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${parseFloat(metrics.userGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(metrics.userGrowth) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(parseFloat(metrics.userGrowth))}%
              </div>
            </div>
            <div className="text-3xl font-bold text-champagne-900">{metrics.totalUsers}</div>
            <div className="text-sm text-champagne-600 mt-1">Total Users</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${parseFloat(metrics.revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(metrics.revenueGrowth) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(parseFloat(metrics.revenueGrowth))}%
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">${metrics.currentMRR.toLocaleString()}</div>
            <div className="text-sm text-champagne-600 mt-1">Monthly MRR</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">{metrics.totalBookings}</div>
            <div className="text-sm text-champagne-600 mt-1">Total Bookings</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <ArrowUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{metrics.conversionRate}%</div>
            <div className="text-sm text-champagne-600 mt-1">Conversion Rate</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-champagne-900">Revenue Growth</h2>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Last 12 Months</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-3">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
                <div className="flex-1 relative">
                  <div className="h-10 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-end pr-3 text-white font-semibold text-sm transition-all"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%`, minWidth: '60px' }}
                    >
                      ${data.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <div className="text-xs text-gray-500">{data.newUsers} users</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">${metrics.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Avg. Booking Value</div>
              <div className="text-2xl font-bold text-purple-600">${metrics.avgBookingValue.toFixed(0)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
              <div className="text-2xl font-bold text-blue-600">+{metrics.revenueGrowth}%</div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* User Acquisition */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-serif text-champagne-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              User Acquisition
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Brides</span>
                <span className="font-bold text-pink-600">847 users</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: '68%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Vendors</span>
                <span className="font-bold text-purple-600">400 users</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '32%' }}></div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Churn Rate</span>
                  <span className={`font-semibold ${parseFloat(metrics.churnRate) < 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.churnRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Sources */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-serif text-champagne-900 mb-4 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-green-600" />
              Revenue Sources
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Bride Subscriptions</span>
                <span className="font-bold text-pink-600">$8,340</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: '57%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Vendor Subscriptions</span>
                <span className="font-bold text-purple-600">$4,890</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '33%' }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700">Booking Commissions</span>
                <span className="font-bold text-green-600">$1,450</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-serif text-champagne-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Top Performing Vendors
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
              <Crown className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
              <div className="font-bold text-lg text-champagne-900">Michael Davis</div>
              <div className="text-sm text-gray-600">Photography</div>
              <div className="text-2xl font-bold text-green-600 mt-2">$12,500</div>
              <div className="text-xs text-gray-500">18 bookings</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <Crown className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-lg text-champagne-900">Elegant Events</div>
              <div className="text-sm text-gray-600">Catering</div>
              <div className="text-2xl font-bold text-green-600 mt-2">$10,800</div>
              <div className="text-xs text-gray-500">15 bookings</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
              <Crown className="w-10 h-10 text-pink-600 mx-auto mb-2" />
              <div className="font-bold text-lg text-champagne-900">Blooms & Petals</div>
              <div className="text-sm text-gray-600">Florist</div>
              <div className="text-2xl font-bold text-green-600 mt-2">$8,200</div>
              <div className="text-xs text-gray-500">22 bookings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
