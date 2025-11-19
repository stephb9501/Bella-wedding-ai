'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  Crown,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';

interface DashboardStats {
  total_brides: number;
  total_vendors: number;
  active_subscriptions: number;
  monthly_revenue: number;
  new_signups_this_week: number;
  pending_vendor_approvals: number;
  messages_sent_today: number;
  bookings_this_month: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vendors' | 'analytics'>('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    color
  }: {
    icon: any;
    title: string;
    value: string | number;
    change?: string;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className="text-sm font-medium text-green-600">{change}</span>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Bella Wedding Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              Public Site
            </button>
            <button
              onClick={async () => {
                const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
                const supabase = createClientComponentClient();
                await supabase.auth.signOut();
                router.push('/');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow mb-6 flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-purple-50 border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-purple-50 border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'vendors'
                ? 'bg-purple-50 border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Crown className="w-5 h-5" />
            Vendors
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-purple-50 border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Total Brides"
                value={stats.total_brides}
                change="+12% this week"
                color="bg-blue-500"
              />
              <StatCard
                icon={Crown}
                title="Total Vendors"
                value={stats.total_vendors}
                change="+8% this week"
                color="bg-purple-500"
              />
              <StatCard
                icon={UserCheck}
                title="Active Subscriptions"
                value={stats.active_subscriptions}
                change="+15% this month"
                color="bg-green-500"
              />
              <StatCard
                icon={DollarSign}
                title="Monthly Revenue"
                value={`$${stats.monthly_revenue.toLocaleString()}`}
                change="+23% vs last month"
                color="bg-amber-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">New Signups This Week</span>
                    <span className="font-bold text-blue-600">{stats.new_signups_this_week}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Messages Sent Today</span>
                    <span className="font-bold text-green-600">{stats.messages_sent_today}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Bookings This Month</span>
                    <span className="font-bold text-purple-600">{stats.bookings_this_month}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-6 border-2 border-orange-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-orange-600" />
                  Pending Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-white hover:bg-gray-50 rounded-lg text-left transition border border-orange-200">
                    <div className="font-medium text-gray-900">Vendor Approvals</div>
                    <div className="text-sm text-gray-600">{stats.pending_vendor_approvals} pending</div>
                  </button>
                  <button className="w-full p-3 bg-white hover:bg-gray-50 rounded-lg text-left transition border border-orange-200">
                    <div className="font-medium text-gray-900">Reported Content</div>
                    <div className="text-sm text-gray-600">3 items to review</div>
                  </button>
                  <button
                    onClick={() => router.push('/admin/vendor-import')}
                    className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-left transition"
                  >
                    <div className="font-bold">📥 Bulk Import Vendors</div>
                    <div className="text-sm opacity-90">Add hundreds of vendors at once</div>
                  </button>
                  <button
                    onClick={() => router.push('/admin/incomplete-vendors')}
                    className="w-full p-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg text-left transition"
                  >
                    <div className="font-bold">⚠️ Incomplete Vendors</div>
                    <div className="text-sm opacity-90">Find & fix missing information</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">User Management</h3>
            <p className="text-gray-600 mb-6">View and manage all bride accounts on the platform</p>
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>User management interface coming soon</p>
              <p className="text-sm mt-2">Will include search, filtering, and account management tools</p>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Vendor Management</h3>
            <p className="text-gray-600 mb-6">Approve and manage vendor accounts and subscriptions</p>
            <div className="text-center py-12 text-gray-500">
              <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Vendor management interface coming soon</p>
              <p className="text-sm mt-2">Will include approval workflow, tier management, and verification</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Analytics</h3>
            <p className="text-gray-600 mb-6">Detailed analytics and insights about platform usage</p>
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Advanced analytics dashboard coming soon</p>
              <p className="text-sm mt-2">Will include charts, trends, and detailed metrics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
