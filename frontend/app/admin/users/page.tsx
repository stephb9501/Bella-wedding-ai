'use client';

import { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Mail, Phone, Calendar, DollarSign,
  Crown, Star, UserX, Edit2, Ban, CheckCircle, X Circle, TrendingUp
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'bride' | 'vendor';
  subscriptionTier: 'free' | 'standard' | 'premium' | 'elite' | 'featured';
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trial';
  joinedDate: string;
  lastActive: string;
  totalSpent: number;
  weddingDate?: string;
  vendorCategory?: string;
  location?: string;
  status: 'active' | 'suspended' | 'banned';
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Demo data - in production, fetch from API
    const demoUsers: User[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(555) 123-4567',
        userType: 'bride',
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        joinedDate: '2025-10-15',
        lastActive: '2025-11-16',
        totalSpent: 299,
        weddingDate: '2026-06-20',
        location: 'Los Angeles, CA',
        status: 'active',
      },
      {
        id: '2',
        name: 'Emily Chen',
        email: 'emily.c@email.com',
        userType: 'bride',
        subscriptionTier: 'standard',
        subscriptionStatus: 'active',
        joinedDate: '2025-11-01',
        lastActive: '2025-11-15',
        totalSpent: 199,
        weddingDate: '2026-08-15',
        location: 'San Francisco, CA',
        status: 'active',
      },
      {
        id: '3',
        name: 'Michael Davis Photography',
        email: 'mike@mdphoto.com',
        phone: '(555) 987-6543',
        userType: 'vendor',
        subscriptionTier: 'featured',
        subscriptionStatus: 'active',
        joinedDate: '2025-09-20',
        lastActive: '2025-11-16',
        totalSpent: 599,
        vendorCategory: 'Photography',
        location: 'Los Angeles, CA',
        status: 'active',
      },
      {
        id: '4',
        name: 'Jessica Martinez',
        email: 'jess.m@email.com',
        userType: 'bride',
        subscriptionTier: 'free',
        subscriptionStatus: 'trial',
        joinedDate: '2025-11-10',
        lastActive: '2025-11-14',
        totalSpent: 0,
        weddingDate: '2026-10-05',
        location: 'San Diego, CA',
        status: 'active',
      },
      {
        id: '5',
        name: 'Elegant Events Catering',
        email: 'info@elegantevents.com',
        userType: 'vendor',
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        joinedDate: '2025-08-15',
        lastActive: '2025-11-12',
        totalSpent: 419,
        vendorCategory: 'Catering',
        location: 'San Francisco, CA',
        status: 'active',
      },
    ];
    setUsers(demoUsers);
  };

  const filteredUsers = users.filter(user => {
    if (filterType !== 'all' && user.userType !== filterType) return false;
    if (filterTier !== 'all' && user.subscriptionTier !== filterTier) return false;
    if (filterStatus !== 'all' && user.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.location?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: users.length,
    brides: users.filter(u => u.userType === 'bride').length,
    vendors: users.filter(u => u.userType === 'vendor').length,
    premium: users.filter(u => u.subscriptionTier === 'premium' || u.subscriptionTier === 'featured' || u.subscriptionTier === 'elite').length,
    mrr: users.reduce((sum, u) => {
      if (u.subscriptionStatus !== 'active') return sum;
      if (u.subscriptionTier === 'standard') return sum + 19.99;
      if (u.subscriptionTier === 'premium' && u.userType === 'bride') return sum + 29.99;
      if (u.subscriptionTier === 'premium' && u.userType === 'vendor') return sum + 34.99;
      if (u.subscriptionTier === 'featured') return sum + 49.99;
      if (u.subscriptionTier === 'elite') return sum + 79.99;
      return sum;
    }, 0),
    newThisMonth: users.filter(u => {
      const joinDate = new Date(u.joinedDate);
      const thisMonth = new Date().getMonth();
      return joinDate.getMonth() === thisMonth;
    }).length,
  };

  const getTierBadge = (tier: string, userType: string) => {
    if (tier === 'free') return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">Free</span>;
    if (tier === 'standard') return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex items-center gap-1"><Star className="w-3 h-3" />Standard</span>;
    if (tier === 'premium' && userType === 'bride') return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded flex items-center gap-1"><Crown className="w-3 h-3" />Premium</span>;
    if (tier === 'premium' && userType === 'vendor') return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex items-center gap-1"><Star className="w-3 h-3" />Premium</span>;
    if (tier === 'featured') return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded flex items-center gap-1"><Star className="w-3 h-3" />Featured</span>;
    if (tier === 'elite') return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded flex items-center gap-1"><Crown className="w-3 h-3" />Elite</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{tier}</span>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" />Active</span>;
    if (status === 'trial') return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">Trial</span>;
    if (status === 'cancelled') return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">Cancelled</span>;
    if (status === 'expired') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Expired</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-serif text-champagne-900 mb-3">User Management</h1>
          <p className="text-xl text-champagne-700">Manage all platform users and subscriptions</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-champagne-900">{stats.total}</div>
            <div className="text-sm text-champagne-600">Total Users</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Users className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-pink-600">{stats.brides}</div>
            <div className="text-sm text-champagne-600">Brides</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-600">{stats.vendors}</div>
            <div className="text-sm text-champagne-600">Vendors</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-600">{stats.premium}</div>
            <div className="text-sm text-champagne-600">Premium Users</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">${stats.mrr.toFixed(2)}</div>
            <div className="text-sm text-champagne-600">Monthly MRR</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Users</option>
              <option value="bride">Brides Only</option>
              <option value="vendor">Vendors Only</option>
            </select>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="featured">Featured</option>
              <option value="elite">Elite</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-champagne-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Subscription</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Activity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-champagne-900">{user.name}</div>
                      <div className="text-xs text-champagne-600">{user.email}</div>
                      {user.location && <div className="text-xs text-gray-500">{user.location}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.userType === 'bride' ? (
                          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                            Bride
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                            Vendor
                          </span>
                        )}
                      </div>
                      {user.vendorCategory && (
                        <div className="text-xs text-gray-500 mt-1">{user.vendorCategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getTierBadge(user.subscriptionTier, user.userType)}
                        {getStatusBadge(user.subscriptionStatus)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-600">${user.totalSpent}</div>
                      <div className="text-xs text-gray-500">Lifetime</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-xs text-gray-500">Joined: {new Date(user.joinedDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">Last: {new Date(user.lastActive).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                          title="Suspend User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          title="Ban User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your filters
            </div>
          )}
        </div>

        {/* Growth Chart */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif text-champagne-900">User Growth</h2>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">+{stats.newThisMonth} this month</span>
            </div>
          </div>
          <div className="text-gray-500 text-center py-8">
            Growth chart visualization coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
