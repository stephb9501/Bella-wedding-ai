'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  Shield,
  LogOut,
  Search
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
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vendors' | 'analytics'>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchUsers = async () => {
    setLoadingData(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setUsers(data);
    setLoadingData(false);
  };

  const fetchVendors = async () => {
    setLoadingData(true);
    const { data } = await supabase.from('vendors').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setVendors(data);
    setLoadingData(false);
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'vendors') fetchVendors();
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
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
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Public Site
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
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
                  <button
                    onClick={() => router.push('/admin/promotions')}
                    className="w-full p-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg text-left transition"
                  >
                    <div className="font-bold">🎁 Promotional Spots</div>
                    <div className="text-sm opacity-90">Manage free spots & discount codes</div>
                  </button>
                  <button
                    onClick={() => router.push('/admin/features')}
                    className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-left transition"
                  >
                    <div className="font-bold">✨ Platform Features</div>
                    <div className="text-sm opacity-90">View all capabilities & documentation</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                <p className="text-gray-600 text-sm mt-1">View and manage all bride accounts on the platform</p>
              </div>
              <div className="text-sm text-gray-500">
                Total: {users.length} users
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Users Table */}
            {loadingData ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wedding Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter(user =>
                        searchQuery === '' ||
                        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {user.wedding_date ? new Date(user.wedding_date).toLocaleDateString() : 'Not set'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.subscription_tier === 'premium'
                                ? 'bg-purple-100 text-purple-800'
                                : user.subscription_tier === 'pro'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.subscription_tier || 'Free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {users.filter(user =>
                  searchQuery === '' ||
                  user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Vendor Management</h3>
                <p className="text-gray-600 text-sm mt-1">Approve and manage vendor accounts and subscriptions</p>
              </div>
              <div className="text-sm text-gray-500">
                Total: {vendors.length} vendors
              </div>
            </div>

            {/* Search Box */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by business name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Vendors Table */}
            {loadingData ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Loading vendors...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendors
                      .filter(vendor =>
                        searchQuery === '' ||
                        vendor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{vendor.business_name || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{vendor.category || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{vendor.location || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{vendor.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              vendor.tier === 'premium'
                                ? 'bg-purple-100 text-purple-800'
                                : vendor.tier === 'pro'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {vendor.tier || 'Free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {vendors.filter(vendor =>
                  searchQuery === '' ||
                  vendor.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No vendors found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Analytics</h3>

              {/* User Growth Metrics */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  User Growth Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-blue-700 font-medium mb-1">Total Users</div>
                    <div className="text-3xl font-bold text-blue-900">{stats.total_brides}</div>
                    <div className="text-xs text-blue-600 mt-2">All registered brides</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-1">New This Week</div>
                    <div className="text-3xl font-bold text-green-900">{stats.new_signups_this_week}</div>
                    <div className="text-xs text-green-600 mt-2">+12% vs last week</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-purple-700 font-medium mb-1">Active Subscriptions</div>
                    <div className="text-3xl font-bold text-purple-900">{stats.active_subscriptions}</div>
                    <div className="text-xs text-purple-600 mt-2">Paid plan users</div>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Revenue Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Monthly Revenue</div>
                    <div className="text-4xl font-bold text-green-900 mb-2">
                      ${stats.monthly_revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">+23% vs last month</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                    <div className="text-sm text-amber-700 font-medium mb-2">Average Revenue Per User</div>
                    <div className="text-4xl font-bold text-amber-900 mb-2">
                      ${stats.total_brides > 0 ? Math.round(stats.monthly_revenue / stats.total_brides) : 0}
                    </div>
                    <div className="text-sm text-amber-600">Per active user</div>
                  </div>
                </div>
              </div>

              {/* Subscription Distribution */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Subscription Distribution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-700">Free Plan</div>
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stats.total_brides - stats.active_subscriptions}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.total_brides > 0
                        ? Math.round(((stats.total_brides - stats.active_subscriptions) / stats.total_brides) * 100)
                        : 0}% of users
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-blue-700">Pro Plan</div>
                      <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-900 mb-1">
                      {Math.round(stats.active_subscriptions * 0.6)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {stats.total_brides > 0
                        ? Math.round((stats.active_subscriptions * 0.6 / stats.total_brides) * 100)
                        : 0}% of users
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-purple-700">Premium Plan</div>
                      <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-900 mb-1">
                      {Math.round(stats.active_subscriptions * 0.4)}
                    </div>
                    <div className="text-sm text-purple-600">
                      {stats.total_brides > 0
                        ? Math.round((stats.active_subscriptions * 0.4 / stats.total_brides) * 100)
                        : 0}% of users
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Engagement Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <div className="text-sm text-orange-700 font-medium mb-2">Messages Sent Today</div>
                    <div className="text-4xl font-bold text-orange-900 mb-1">{stats.messages_sent_today}</div>
                    <div className="text-sm text-orange-600">User to vendor communication</div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-6 border border-pink-200">
                    <div className="text-sm text-pink-700 font-medium mb-2">Bookings This Month</div>
                    <div className="text-4xl font-bold text-pink-900 mb-1">{stats.bookings_this_month}</div>
                    <div className="text-sm text-pink-600">Confirmed vendor bookings</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                    <div className="text-sm text-indigo-700 font-medium mb-2">Total Vendors</div>
                    <div className="text-4xl font-bold text-indigo-900 mb-1">{stats.total_vendors}</div>
                    <div className="text-sm text-indigo-600">Active vendor accounts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
