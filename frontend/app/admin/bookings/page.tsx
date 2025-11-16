'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Users, Calendar, CheckCircle, Clock,
  Search, Filter, Download, Eye, AlertCircle, Award
} from 'lucide-react';

interface Booking {
  id: string;
  brideName: string;
  vendorName: string;
  vendorTier: 'free' | 'premium' | 'featured' | 'elite';
  serviceType: string;
  eventDate: string;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  depositAmount: number;
  escrowAmount: number;
  status: 'pending' | 'paid' | 'confirmed' | 'in_progress' | 'completed';
  escrowStatus: 'held' | 'released' | 'refunded';
  createdDate: string;
  completedDate?: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEscrow, setFilterEscrow] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    // Demo data - in production, fetch from API
    const demoBookings: Booking[] = [
      {
        id: '1',
        brideName: 'Sarah Johnson',
        vendorName: 'Michael Davis Photography',
        vendorTier: 'featured',
        serviceType: 'Photography',
        eventDate: '2026-06-15',
        totalAmount: 4500,
        commissionRate: 0.02,
        commissionAmount: 90,
        depositAmount: 1323, // 30% of (4500 - 90)
        escrowAmount: 3087, // 70% of (4500 - 90)
        status: 'confirmed',
        escrowStatus: 'held',
        createdDate: '2025-11-01',
      },
      {
        id: '2',
        brideName: 'Emily Chen',
        vendorName: 'Elegant Events Catering',
        vendorTier: 'premium',
        serviceType: 'Catering',
        eventDate: '2026-08-20',
        totalAmount: 8500,
        commissionRate: 0.05,
        commissionAmount: 425,
        depositAmount: 2422.5,
        escrowAmount: 5652.5,
        status: 'in_progress',
        escrowStatus: 'held',
        createdDate: '2025-10-15',
      },
      {
        id: '3',
        brideName: 'Jessica Martinez',
        vendorName: 'Blooms & Petals Florist',
        vendorTier: 'free',
        serviceType: 'Florist',
        eventDate: '2025-12-05',
        totalAmount: 2000,
        commissionRate: 0.10,
        commissionAmount: 200,
        depositAmount: 540,
        escrowAmount: 1260,
        status: 'completed',
        escrowStatus: 'released',
        createdDate: '2025-09-20',
        completedDate: '2025-12-06',
      },
      {
        id: '4',
        brideName: 'Amanda Wilson',
        vendorName: 'Elite DJ Services',
        vendorTier: 'elite',
        serviceType: 'DJ',
        eventDate: '2026-07-10',
        totalAmount: 1800,
        commissionRate: 0.00,
        commissionAmount: 0,
        depositAmount: 540,
        escrowAmount: 1260,
        status: 'confirmed',
        escrowStatus: 'held',
        createdDate: '2025-11-05',
      },
    ];
    setBookings(demoBookings);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus !== 'all' && booking.status !== filterStatus) return false;
    if (filterEscrow !== 'all' && booking.escrowStatus !== filterEscrow) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.brideName.toLowerCase().includes(search) ||
        booking.vendorName.toLowerCase().includes(search) ||
        booking.serviceType.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    totalCommission: bookings.reduce((sum, b) => sum + b.commissionAmount, 0),
    escrowHeld: bookings
      .filter(b => b.escrowStatus === 'held')
      .reduce((sum, b) => sum + b.escrowAmount, 0),
    completed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.escrowStatus === 'held').length,
  };

  const getCommissionBadge = (rate: number, tier: string) => {
    const percentage = Math.round(rate * 100);
    if (percentage === 0) return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">0% - Elite</span>;
    if (percentage === 2) return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">2% - Featured</span>;
    if (percentage === 5) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">5% - Premium</span>;
    if (percentage === 10) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">10% - Free</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{percentage}%</span>;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, any> = {
      pending: <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>,
      paid: <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex items-center gap-1"><DollarSign className="w-3 h-3" />Paid</span>,
      confirmed: <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded flex items-center gap-1"><Calendar className="w-3 h-3" />Confirmed</span>,
      in_progress: <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex items-center gap-1"><AlertCircle className="w-3 h-3" />In Progress</span>,
      completed: <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" />Completed</span>,
    };
    return badges[status] || <span className="text-xs">{status}</span>;
  };

  const getEscrowBadge = (status: string) => {
    const badges: Record<string, any> = {
      held: <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">Held</span>,
      released: <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Released</span>,
      refunded: <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Refunded</span>,
    };
    return badges[status] || <span className="text-xs">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-serif text-champagne-900 mb-3">Bookings & Commission</h1>
          <p className="text-xl text-champagne-700">Track all vendor bookings and platform revenue</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-champagne-900">{stats.totalBookings}</div>
            <div className="text-sm text-champagne-600">Total Bookings</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-champagne-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">${stats.totalCommission.toLocaleString()}</div>
            <div className="text-sm text-champagne-600">Your Commission</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">${stats.escrowHeld.toLocaleString()}</div>
            <div className="text-sm text-champagne-600">Escrow Held</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-champagne-600">Completed</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-champagne-600">Pending Release</div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-gradient-to-r from-purple-600 to-green-600 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm opacity-90 mb-1">Elite Vendors (0%)</div>
              <div className="text-2xl font-bold">
                ${bookings.filter(b => b.commissionRate === 0).reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}
              </div>
              <div className="text-xs opacity-75">No commission</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Featured Vendors (2%)</div>
              <div className="text-2xl font-bold">
                ${bookings.filter(b => b.commissionRate === 0.02).reduce((s, b) => s + b.commissionAmount, 0).toLocaleString()}
              </div>
              <div className="text-xs opacity-75">Commission earned</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Premium Vendors (5%)</div>
              <div className="text-2xl font-bold">
                ${bookings.filter(b => b.commissionRate === 0.05).reduce((s, b) => s + b.commissionAmount, 0).toLocaleString()}
              </div>
              <div className="text-xs opacity-75">Commission earned</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Free Vendors (10%)</div>
              <div className="text-2xl font-bold">
                ${bookings.filter(b => b.commissionRate === 0.10).reduce((s, b) => s + b.commissionAmount, 0).toLocaleString()}
              </div>
              <div className="text-xs opacity-75">Commission earned</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterEscrow}
              onChange={(e) => setFilterEscrow(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Escrow</option>
              <option value="held">Held</option>
              <option value="released">Released</option>
              <option value="refunded">Refunded</option>
            </select>

            <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-champagne-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Booking Details</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Event Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Commission</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Escrow</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-champagne-900">{booking.brideName}</div>
                      <div className="text-sm text-champagne-600">{booking.vendorName}</div>
                      <div className="text-xs text-gray-500">Booked {new Date(booking.createdDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-champagne-700">{booking.serviceType}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1 text-champagne-700">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.eventDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-champagne-900">${booking.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Deposit: ${booking.depositAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Escrow: ${booking.escrowAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getCommissionBadge(booking.commissionRate, booking.vendorTier)}
                      <div className="text-sm font-bold text-purple-600 mt-1">${booking.commissionAmount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getEscrowBadge(booking.escrowStatus)}
                      {booking.completedDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Released {new Date(booking.completedDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No bookings found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
