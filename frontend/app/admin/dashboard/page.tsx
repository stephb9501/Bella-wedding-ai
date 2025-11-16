'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, DollarSign, TrendingUp, Activity, Star, MapPin,
  Calendar, Heart, Palette, Settings, BarChart3, Shield
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalBrides: number;
  totalVendors: number;
  paidSubscriptions: number;
  monthlyRevenue: number;
  activeWeddings: number;
  totalVendorListings: number;
  premiumVendors: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBrides: 0,
    totalVendors: 0,
    paidSubscriptions: 0,
    monthlyRevenue: 0,
    activeWeddings: 0,
    totalVendorListings: 0,
    premiumVendors: 0
  });

  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalUsers: 1247,
      totalBrides: 892,
      totalVendors: 355,
      paidSubscriptions: 234,
      monthlyRevenue: 12840,
      activeWeddings: 421,
      totalVendorListings: 355,
      premiumVendors: 87
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      <div className="text-3xl font-bold text-champagne-900 mb-1">{value}</div>
      <div className="text-sm text-champagne-600">{title}</div>
      {subtitle && <div className="text-xs text-champagne-500 mt-1">{subtitle}</div>}
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, color, onClick }: any) => (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 text-left w-full"
    >
      <div className={`inline-flex p-3 rounded-lg ${color} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-champagne-900 mb-2">{title}</h3>
      <p className="text-sm text-champagne-600">{description}</p>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-champagne-600" />
            <h1 className="text-4xl font-serif text-champagne-900">Admin Dashboard</h1>
          </div>
          <p className="text-champagne-700">Platform Overview & Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="bg-blue-600"
            subtitle={`${stats.totalBrides} brides • ${stats.totalVendors} vendors`}
          />
          <StatCard
            title="Paid Subscriptions"
            value={stats.paidSubscriptions}
            icon={DollarSign}
            color="bg-green-600"
            subtitle="19% conversion rate"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-purple-600"
            subtitle="+23% from last month"
          />
          <StatCard
            title="Active Weddings"
            value={stats.activeWeddings}
            icon={Heart}
            color="bg-rose-600"
            subtitle="Next 12 months"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Vendor Listings"
            value={stats.totalVendorListings}
            icon={MapPin}
            color="bg-orange-600"
          />
          <StatCard
            title="Premium Vendors"
            value={stats.premiumVendors}
            icon={Star}
            color="bg-yellow-600"
            subtitle="24% of total vendors"
          />
          <StatCard
            title="Décor Plans Created"
            value="687"
            icon={Palette}
            color="bg-fuchsia-600"
          />
          <StatCard
            title="Avg. Response Time"
            value="2.4 hrs"
            icon={Activity}
            color="bg-cyan-600"
            subtitle="Vendor to bride"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-champagne-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title="Media Manager"
              description="Upload and manage wedding photos"
              icon={Palette}
              color="bg-blue-600"
              onClick={() => router.push('/admin')}
            />
            <QuickAction
              title="User Analytics"
              description="View detailed platform analytics"
              icon={BarChart3}
              color="bg-purple-600"
              onClick={() => alert('Coming soon!')}
            />
            <QuickAction
              title="Database Manager"
              description="Run SQL migrations and manage data"
              icon={Settings}
              color="bg-gray-600"
              onClick={() => alert('Coming soon!')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Signups */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-serif text-champagne-900 mb-4">Recent Signups</h3>
            <div className="space-y-3">
              {[
                { name: 'Sarah Johnson', type: 'Bride', date: '2 hours ago', plan: 'Standard' },
                { name: 'Elite Photography', type: 'Vendor', date: '3 hours ago', plan: 'Gold' },
                { name: 'Michael & Emma', type: 'Bride', date: '5 hours ago', plan: 'Premium' },
                { name: 'Sunset Catering', type: 'Vendor', date: '6 hours ago', plan: 'Silver' },
                { name: 'Lisa Martinez', type: 'Bride', date: '8 hours ago', plan: 'Free' }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-champagne-100 last:border-0">
                  <div>
                    <div className="font-medium text-champagne-900">{user.name}</div>
                    <div className="text-sm text-champagne-600">{user.type} • {user.date}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.plan === 'Premium' || user.plan === 'Gold' || user.plan === 'Platinum'
                      ? 'bg-purple-100 text-purple-700'
                      : user.plan === 'Standard' || user.plan === 'Silver'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-serif text-champagne-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-champagne-700">Bride Subscriptions</span>
                  <span className="font-semibold text-champagne-900">$6,720</span>
                </div>
                <div className="w-full bg-champagne-100 rounded-full h-2">
                  <div className="bg-rose-600 h-2 rounded-full" style={{ width: '52%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-champagne-700">Vendor Subscriptions</span>
                  <span className="font-semibold text-champagne-900">$5,890</span>
                </div>
                <div className="w-full bg-champagne-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '46%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-champagne-700">Featured Listings</span>
                  <span className="font-semibold text-champagne-900">$230</span>
                </div>
                <div className="w-full bg-champagne-100 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '2%' }}></div>
                </div>
              </div>
              <div className="pt-4 border-t border-champagne-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-champagne-900">Total Monthly Revenue</span>
                  <span className="text-2xl font-bold text-green-600">$12,840</span>
                </div>
                <div className="text-xs text-green-600 text-right mt-1">↑ 23% from last month</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-serif text-champagne-900 mb-6">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">99.8%</div>
              <div className="text-sm text-champagne-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">142ms</div>
              <div className="text-sm text-champagne-600">Avg. Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">2.4M</div>
              <div className="text-sm text-champagne-600">API Calls/Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">89%</div>
              <div className="text-sm text-champagne-600">User Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Quick Links to Tools */}
        <div className="mt-8 bg-champagne-100 border-l-4 border-champagne-600 rounded-lg p-6">
          <h4 className="font-semibold text-champagne-900 mb-3">Admin Tools</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/pricing')}
              className="text-sm text-champagne-700 hover:text-champagne-900 text-left"
            >
              → Bride Pricing
            </button>
            <button
              onClick={() => router.push('/vendor-pricing')}
              className="text-sm text-champagne-700 hover:text-champagne-900 text-left"
            >
              → Vendor Pricing
            </button>
            <button
              onClick={() => router.push('/legal/terms')}
              className="text-sm text-champagne-700 hover:text-champagne-900 text-left"
            >
              → Terms of Service
            </button>
            <button
              onClick={() => router.push('/legal/privacy')}
              className="text-sm text-champagne-700 hover:text-champagne-900 text-left"
            >
              → Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
