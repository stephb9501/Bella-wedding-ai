'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Eye, MessageCircle, Calendar, DollarSign, Users, ArrowUp, ArrowDown } from 'lucide-react';

interface AnalyticsData {
  profile_views: number;
  profile_views_change: number;
  messages_sent: number;
  messages_change: number;
  booking_requests: number;
  bookings_change: number;
  conversion_rate: number;
  revenue_estimate: number;
  revenue_change: number;
  popular_days: string[];
  top_search_terms: string[];
  view_trends: { date: string; views: number }[];
  message_trends: { date: string; messages: number }[];
}

interface Props {
  vendorId: string;
  tier: string;
}

export function VendorAnalytics({ vendorId, tier }: Props) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/analytics?vendor_id=${vendorId}&period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color
  }: {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    color: string;
  }) => {
    const isPositive = change >= 0;
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{title}</span>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span>{Math.abs(change)}% vs last period</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Performance Analytics</h3>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  period === p
                    ? 'bg-champagne-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Profile Views"
            value={analytics.profile_views}
            change={analytics.profile_views_change}
            icon={Eye}
            color="text-blue-600"
          />
          <StatCard
            title="Messages Received"
            value={analytics.messages_sent}
            change={analytics.messages_change}
            icon={MessageCircle}
            color="text-green-600"
          />
          <StatCard
            title="Booking Requests"
            value={analytics.booking_requests}
            change={analytics.bookings_change}
            icon={Calendar}
            color="text-purple-600"
          />
          <StatCard
            title="Est. Revenue"
            value={`$${analytics.revenue_estimate.toLocaleString()}`}
            change={analytics.revenue_change}
            icon={DollarSign}
            color="text-amber-600"
          />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-bold text-gray-900 mb-4">Conversion Funnel</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Profile Views</span>
              <span className="font-bold text-gray-900">{analytics.profile_views}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-700">Messages Sent</span>
              <span className="font-bold text-gray-900">{analytics.messages_sent}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${analytics.profile_views > 0 ? (analytics.messages_sent / analytics.profile_views) * 100 : 0}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-gray-700">Booking Requests</span>
              <span className="font-bold text-gray-900">{analytics.booking_requests}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${analytics.messages_sent > 0 ? (analytics.booking_requests / analytics.messages_sent) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion Rate (View to Booking)</span>
              <span className="text-lg font-bold text-champagne-600">{analytics.conversion_rate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">Most Popular Days</h4>
            <ul className="space-y-2">
              {analytics.popular_days.map((day, idx) => (
                <li key={idx} className="flex items-center gap-2 text-blue-800">
                  <Users className="w-4 h-4" />
                  {day}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">Top Search Terms</h4>
            <ul className="space-y-2">
              {analytics.top_search_terms.map((term, idx) => (
                <li key={idx} className="text-purple-800">
                  {idx + 1}. {term}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Simple Trend Charts */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">Trends Over Time</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Views Trend */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Profile Views</h5>
            <div className="h-48 flex items-end gap-1">
              {analytics.view_trends.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition"
                    style={{
                      height: `${(day.views / Math.max(...analytics.view_trends.map((d) => d.views))) * 100}%`,
                      minHeight: '4px',
                    }}
                    title={`${day.date}: ${day.views} views`}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{analytics.view_trends[0]?.date}</span>
              <span>{analytics.view_trends[analytics.view_trends.length - 1]?.date}</span>
            </div>
          </div>

          {/* Messages Trend */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Messages Received</h5>
            <div className="h-48 flex items-end gap-1">
              {analytics.message_trends.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t hover:bg-green-600 transition"
                    style={{
                      height: `${(day.messages / Math.max(...analytics.message_trends.map((d) => d.messages))) * 100}%`,
                      minHeight: '4px',
                    }}
                    title={`${day.date}: ${day.messages} messages`}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{analytics.message_trends[0]?.date}</span>
              <span>{analytics.message_trends[analytics.message_trends.length - 1]?.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-champagne-50 to-rose-50 rounded-2xl border-2 border-champagne-200 p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-champagne-600 mt-1" />
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Growth Recommendations</h4>
            <ul className="space-y-2 text-gray-700">
              {analytics.profile_views < 50 && (
                <li>• Add more photos to your portfolio to attract more views</li>
              )}
              {analytics.conversion_rate < 5 && (
                <li>• Improve your profile description and add customer reviews to increase conversions</li>
              )}
              {analytics.messages_sent < 10 && (
                <li>• Consider upgrading your tier to appear higher in search results</li>
              )}
              {tier === 'free' && (
                <li>• Upgrade to Premium to unlock more photos and reduce commission fees</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
