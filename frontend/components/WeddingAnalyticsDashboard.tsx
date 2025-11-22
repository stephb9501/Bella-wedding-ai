'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle, DollarSign, Users, Calendar,
  TrendingUp, AlertCircle, Clock, Target
} from 'lucide-react';

interface WeddingAnalytics {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_budget: number;
  total_spent: number;
  budget_utilization: number;
  largest_expense_category: string;
  vendors_contacted: number;
  vendors_booked: number;
  total_guests: number;
  rsvp_yes: number;
  rsvp_no: number;
  rsvp_pending: number;
  rsvp_rate: number;
  days_until_wedding: number;
  weeks_until_wedding: number;
  months_until_wedding: number;
  on_track: boolean;
  calculated_at: string;
}

interface WeddingAnalyticsDashboardProps {
  weddingId: string;
}

export default function WeddingAnalyticsDashboard({ weddingId }: WeddingAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<WeddingAnalytics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [weddingId]);

  const fetchAnalytics = async (refresh = false) => {
    try {
      setRefreshing(refresh);
      const url = `/api/analytics/wedding?wedding_id=${weddingId}${refresh ? '&refresh=true' : ''}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Failed to fetch analytics');

      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      name: 'Days Until Wedding',
      value: analytics.days_until_wedding,
      suffix: ' days',
      icon: Calendar,
      color: 'bg-rose-50',
      iconColor: 'text-rose-600',
      subtext: `${analytics.weeks_until_wedding} weeks (${analytics.months_until_wedding} months)`,
    },
    {
      name: 'Task Completion',
      value: analytics.completion_rate,
      suffix: '%',
      icon: CheckCircle,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      subtext: `${analytics.completed_tasks} of ${analytics.total_tasks} tasks done`,
    },
    {
      name: 'Budget Utilization',
      value: analytics.budget_utilization,
      suffix: '%',
      icon: DollarSign,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      subtext: `$${analytics.total_spent.toLocaleString()} of $${analytics.total_budget.toLocaleString()}`,
    },
    {
      name: 'RSVP Rate',
      value: analytics.rsvp_rate,
      suffix: '%',
      icon: Users,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      subtext: `${analytics.rsvp_yes + analytics.rsvp_no} of ${analytics.total_guests} responded`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wedding Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {new Date(analytics.calculated_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {refreshing ? 'Refreshing...' : '🔄 Refresh'}
        </button>
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
              <p className="text-3xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
                <span className="text-lg">{stat.suffix}</span>
              </p>
              <p className="text-xs text-gray-600">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Task Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Overall Progress</span>
                <span className="font-medium">{analytics.completion_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${analytics.completion_rate}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.completed_tasks}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.total_tasks - analytics.completed_tasks}
                </p>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{analytics.overdue_tasks}</p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </div>

            {analytics.overdue_tasks > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">Attention Needed</p>
                  <p className="text-red-700">
                    You have {analytics.overdue_tasks} overdue task{analytics.overdue_tasks !== 1 ? 's' : ''}.
                    Consider prioritizing these items.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Budget Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Budget Used</span>
                <span className="font-medium">{analytics.budget_utilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    analytics.budget_utilization > 100
                      ? 'bg-red-600'
                      : analytics.budget_utilization > 90
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(analytics.budget_utilization, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-xl font-bold text-gray-900">
                  ${analytics.total_budget.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">
                  ${analytics.total_spent.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Largest Expense: </span>
                {analytics.largest_expense_category || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Remaining: </span>
                ${(analytics.total_budget - analytics.total_spent).toLocaleString()}
              </p>
            </div>

            {analytics.budget_utilization > 100 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">Over Budget</p>
                  <p className="text-red-700">
                    You're ${(analytics.total_spent - analytics.total_budget).toLocaleString()} over budget.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guest Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Guest Status
          </h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-gray-900">{analytics.total_guests}</p>
              <p className="text-sm text-gray-600">Total Guests Invited</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
              <div>
                <p className="text-2xl font-bold text-green-600">{analytics.rsvp_yes}</p>
                <p className="text-xs text-gray-600">Attending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{analytics.rsvp_no}</p>
                <p className="text-xs text-gray-600">Declined</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{analytics.rsvp_pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Response Rate</span>
                <span className="font-medium">{analytics.rsvp_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${analytics.rsvp_rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-600" />
            Vendor Progress
          </h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-gray-900">{analytics.vendors_booked}</p>
              <p className="text-sm text-gray-600">Vendors Booked</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center border-t pt-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.vendors_contacted}</p>
                <p className="text-xs text-gray-600">Contacted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.vendors_contacted - analytics.vendors_booked}
                </p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>

            {analytics.vendors_booked > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700">Booking Success Rate</span>
                  <span className="font-medium">
                    {((analytics.vendors_booked / analytics.vendors_contacted) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-rose-600 h-3 rounded-full transition-all"
                    style={{ width: `${(analytics.vendors_booked / analytics.vendors_contacted) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Keep reaching out to vendors to secure your dream team!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Status */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Timeline Status
            </h3>
            <p className="text-gray-700">
              {analytics.days_until_wedding > 365 ? (
                <>You have plenty of time! Start with venue and vendor research.</>
              ) : analytics.days_until_wedding > 180 ? (
                <>6 months to go! Time to finalize major vendors and send save-the-dates.</>
              ) : analytics.days_until_wedding > 90 ? (
                <>3 months to go! Focus on final details and RSVP follow-ups.</>
              ) : analytics.days_until_wedding > 30 ? (
                <>Final month! Confirm all vendors and finalize day-of timeline.</>
              ) : (
                <>The big day is almost here! Enjoy this special time!</>
              )}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-rose-600">{analytics.days_until_wedding}</div>
            <div className="text-sm text-gray-600 mt-1">days to go</div>
          </div>
        </div>
      </div>
    </div>
  );
}
