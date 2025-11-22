'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, Star, Eye, Heart,
  MessageCircle, Clock, Target, Award
} from 'lucide-react';

interface VendorAnalytics {
  vendor_id: string;
  period_start: string;
  period_end: string;
  total_inquiries: number;
  total_bookings: number;
  booking_conversion_rate: number;
  pending_requests: number;
  average_response_time_hours: number;
  response_rate: number;
  total_reviews: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
  profile_views: number;
  saved_count: number;
  shared_count: number;
  category_rank: number;
  calculated_at: string;
}

interface VendorAnalyticsDashboardProps {
  vendorId?: string;
}

export default function VendorAnalyticsDashboard({ vendorId }: VendorAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [vendorId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let periodStart: string | undefined;

      if (period === '7d') {
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (period === '30d') {
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (period === '90d') {
        periodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      let url = '/api/analytics/vendor';
      if (vendorId) url += `?vendor_id=${vendorId}`;
      if (periodStart) url += `${vendorId ? '&' : '?'}period_start=${periodStart}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch analytics');

      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-600">No analytics data available yet.</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Inquiries',
      value: analytics.total_inquiries,
      icon: MessageCircle,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtext: `${analytics.pending_requests} pending`,
    },
    {
      name: 'Bookings',
      value: analytics.total_bookings,
      icon: Target,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      subtext: `${analytics.booking_conversion_rate.toFixed(1)}% conversion`,
    },
    {
      name: 'Average Rating',
      value: analytics.average_rating.toFixed(1),
      icon: Star,
      color: 'bg-amber-50',
      iconColor: 'text-amber-600',
      subtext: `${analytics.total_reviews} reviews`,
    },
    {
      name: 'Profile Views',
      value: analytics.profile_views,
      icon: Eye,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtext: `${analytics.saved_count} saves`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(analytics.period_start).toLocaleDateString()} - {new Date(analytics.period_end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'all' ? 'All Time' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className={`${stat.color} rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Booking Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Conversion Rate</span>
                <span className="font-medium">{analytics.booking_conversion_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.booking_conversion_rate, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
              <div>
                <p className="text-2xl font-bold text-blue-600">{analytics.total_inquiries}</p>
                <p className="text-xs text-gray-600">Inquiries</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{analytics.total_bookings}</p>
                <p className="text-xs text-gray-600">Booked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{analytics.pending_requests}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>

            {analytics.pending_requests > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-amber-900">
                  <Clock className="h-4 w-4 inline mr-1" />
                  You have {analytics.pending_requests} pending request{analytics.pending_requests !== 1 ? 's' : ''} to respond to.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Response Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Response Metrics
          </h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-gray-900">{analytics.average_response_time_hours.toFixed(1)}h</p>
              <p className="text-sm text-gray-600">Average Response Time</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Response Rate</span>
                <span className="font-medium">{analytics.response_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    analytics.response_rate >= 90
                      ? 'bg-green-600'
                      : analytics.response_rate >= 70
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${analytics.response_rate}%` }}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-900">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                {analytics.average_response_time_hours <= 24 && analytics.response_rate >= 90
                  ? 'Excellent! Your quick responses help close more bookings.'
                  : analytics.average_response_time_hours <= 48
                  ? 'Good job! Try to respond within 24 hours to improve conversions.'
                  : 'Tip: Faster response times lead to higher booking rates.'}
              </p>
            </div>
          </div>
        </div>

        {/* Review Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-600" />
            Review Analytics
          </h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-10 w-10 text-amber-500 fill-amber-500" />
                <p className="text-4xl font-bold text-gray-900">{analytics.average_rating.toFixed(1)}</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">{analytics.total_reviews} total reviews</p>
            </div>

            <div className="space-y-2">
              {[
                { stars: 5, count: analytics.five_star },
                { stars: 4, count: analytics.four_star },
                { stars: 3, count: analytics.three_star },
                { stars: 2, count: analytics.two_star },
                { stars: 1, count: analytics.one_star },
              ].map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{
                        width: analytics.total_reviews > 0
                          ? `${(count / analytics.total_reviews) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visibility & Engagement */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Visibility & Engagement
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-purple-50 rounded-lg p-4">
                <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics.profile_views}</p>
                <p className="text-xs text-gray-600">Views</p>
              </div>
              <div className="bg-rose-50 rounded-lg p-4">
                <Heart className="h-6 w-6 text-rose-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics.saved_count}</p>
                <p className="text-xs text-gray-600">Saves</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics.shared_count}</p>
                <p className="text-xs text-gray-600">Shares</p>
              </div>
            </div>

            {analytics.category_rank && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 text-center">
                <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700">Category Ranking</p>
                <p className="text-3xl font-bold text-amber-700">#{analytics.category_rank}</p>
              </div>
            )}

            {analytics.profile_views > 0 && (
              <div className="text-center text-sm text-gray-600 pt-4 border-t">
                <p>
                  <span className="font-medium text-gray-900">
                    {((analytics.saved_count / analytics.profile_views) * 100).toFixed(1)}%
                  </span>{' '}
                  of viewers saved your profile
                </p>
                <p className="mt-1">
                  <span className="font-medium text-gray-900">
                    {((analytics.total_inquiries / analytics.profile_views) * 100).toFixed(1)}%
                  </span>{' '}
                  conversion from views to inquiries
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Performance Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.average_response_time_hours > 24 && (
            <div className="text-sm text-gray-700">
              • <strong>Respond faster:</strong> Try to reply within 24 hours to increase booking rates.
            </div>
          )}
          {analytics.average_rating < 4.5 && (
            <div className="text-sm text-gray-700">
              • <strong>Improve ratings:</strong> Follow up with clients and address any concerns promptly.
            </div>
          )}
          {analytics.total_reviews < 10 && (
            <div className="text-sm text-gray-700">
              • <strong>Get more reviews:</strong> Ask satisfied clients to leave reviews.
            </div>
          )}
          {analytics.profile_views < 50 && (
            <div className="text-sm text-gray-700">
              • <strong>Boost visibility:</strong> Complete your profile and add more photos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
