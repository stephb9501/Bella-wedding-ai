'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import {
  Users, Calendar, DollarSign, MessageCircle, CheckCircle,
  Clock, MapPin, Phone, Mail, Star, Plus, Search, Filter
} from 'lucide-react';

interface Client {
  id: string;
  brideName: string;
  groomName?: string;
  weddingDate: string;
  eventType: string; // Wedding, Reception, Engagement, etc.
  venue?: string;
  location?: string;
  serviceBooked: string; // Photography, Catering, Flowers, etc.
  packageTier: string; // Basic, Standard, Premium
  totalCost: number;
  depositPaid: boolean;
  depositAmount: number;
  balanceDue: number;
  status: 'inquiry' | 'booked' | 'in_progress' | 'completed';
  lastContact?: string;
  email?: string;
  phone?: string;
  notes?: string;
  messages: number; // Unread message count
  tasks: number; // Incomplete tasks
}

export default function VendorClientsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/vendor-dashboard/clients');
      return;
    }

    loadClients();
  }, [isAuthenticated, router]);

  const loadClients = () => {
    // Load from localStorage for now
    const stored = localStorage.getItem(`bella_vendor_clients_${user?.id}`);
    if (stored) {
      const clientsData = JSON.parse(stored);
      setClients(clientsData);
      // Set active client to first if none selected
      if (!activeClient && clientsData.length > 0) {
        setActiveClient(clientsData[0].id);
      }
    } else {
      // Demo data for first time
      const demoClients: Client[] = [
        {
          id: '1',
          brideName: 'Sarah Johnson',
          groomName: 'Michael Davis',
          weddingDate: '2025-06-15',
          eventType: 'Wedding',
          venue: 'Garden Estate',
          location: 'Los Angeles, CA',
          serviceBooked: 'Photography',
          packageTier: 'Premium',
          totalCost: 4500,
          depositPaid: true,
          depositAmount: 1350,
          balanceDue: 3150,
          status: 'booked',
          lastContact: '2025-11-10',
          email: 'sarah.j@email.com',
          phone: '(555) 123-4567',
          messages: 3,
          tasks: 5,
          notes: 'Wants golden hour shots, prefers candid style',
        },
        {
          id: '2',
          brideName: 'Emily Chen',
          groomName: 'David Park',
          weddingDate: '2025-08-20',
          eventType: 'Wedding',
          venue: 'Beach Resort',
          location: 'San Diego, CA',
          serviceBooked: 'Photography',
          packageTier: 'Standard',
          totalCost: 2800,
          depositPaid: false,
          depositAmount: 0,
          balanceDue: 2800,
          status: 'inquiry',
          lastContact: '2025-11-15',
          email: 'emily.chen@email.com',
          messages: 1,
          tasks: 2,
        },
        {
          id: '3',
          brideName: 'Jessica Martinez',
          groomName: 'Robert Smith',
          weddingDate: '2025-04-10',
          eventType: 'Wedding',
          venue: 'Historic Mansion',
          location: 'San Francisco, CA',
          serviceBooked: 'Photography',
          packageTier: 'Premium',
          totalCost: 5200,
          depositPaid: true,
          depositAmount: 1560,
          balanceDue: 3640,
          status: 'in_progress',
          lastContact: '2025-11-14',
          email: 'j.martinez@email.com',
          phone: '(555) 987-6543',
          messages: 0,
          tasks: 12,
          notes: 'Wants drone shots, first look photos',
        },
      ];
      setClients(demoClients);
      saveClients(demoClients);
      setActiveClient(demoClients[0].id);
    }
  };

  const saveClients = (clientList: Client[]) => {
    localStorage.setItem(`bella_vendor_clients_${user?.id}`, JSON.stringify(clientList));
    setClients(clientList);
  };

  const switchToClient = (clientId: string) => {
    setActiveClient(clientId);
    // Store active client in session
    localStorage.setItem(`bella_active_client_${user?.id}`, clientId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inquiry':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'booked':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'inquiry':
        return <Clock className="w-4 h-4" />;
      case 'booked':
        return <Calendar className="w-4 h-4" />;
      case 'in_progress':
        return <Star className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const filteredClients = clients.filter(client => {
    if (filterStatus !== 'all' && client.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        client.brideName.toLowerCase().includes(search) ||
        client.groomName?.toLowerCase().includes(search) ||
        client.venue?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: clients.length,
    booked: clients.filter(c => c.status === 'booked' || c.status === 'in_progress').length,
    inquiries: clients.filter(c => c.status === 'inquiry').length,
    upcoming: clients.filter(c => new Date(c.weddingDate) > new Date()).length,
    revenue: clients.reduce((sum, c) => sum + (c.depositPaid ? c.depositAmount : 0), 0),
    outstanding: clients.reduce((sum, c) => sum + c.balanceDue, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-serif text-champagne-900 mb-3">My Clients</h1>
          <p className="text-xl text-champagne-700">
            Manage all your weddings and events in one place
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-champagne-900">{stats.total}</div>
            <div className="text-xs text-champagne-600">Total Clients</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.booked}</div>
            <div className="text-xs text-champagne-600">Active Projects</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.inquiries}</div>
            <div className="text-xs text-champagne-600">Inquiries</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
            <div className="text-xs text-champagne-600">Upcoming</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-green-600">${stats.revenue.toLocaleString()}</div>
            <div className="text-xs text-champagne-600">Collected</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <DollarSign className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-red-600">${stats.outstanding.toLocaleString()}</div>
            <div className="text-xs text-champagne-600">Outstanding</div>
          </div>
        </div>

        {/* Active Client Indicator */}
        {activeClient && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Currently Viewing:</div>
                <div className="text-2xl font-bold">
                  {clients.find(c => c.id === activeClient)?.brideName}'s Wedding
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {new Date(clients.find(c => c.id === activeClient)?.weddingDate || '').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <button
                onClick={() => setActiveClient(null)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Switch Client
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="inquiry">Inquiries</option>
              <option value="booked">Booked</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setView('grid')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Client Grid/List */}
        <div className={view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredClients.map((client) => (
            <div
              key={client.id}
              onClick={() => switchToClient(client.id)}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-2 ${
                activeClient === client.id ? 'border-purple-600 ring-4 ring-purple-100' : 'border-transparent'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-champagne-900 mb-1">
                      {client.brideName}
                      {client.groomName && <span className="text-gray-400"> & {client.groomName}</span>}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-champagne-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(client.weddingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(client.status)} flex items-center gap-1`}>
                    {getStatusIcon(client.status)}
                    {client.status.replace('_', ' ')}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {client.venue && (
                    <div className="flex items-center gap-2 text-sm text-champagne-700">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{client.venue}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-champagne-700">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span>
                      ${client.totalCost.toLocaleString()} • {client.packageTier}
                    </span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mb-4">
                  {client.depositPaid ? (
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Deposit Paid (${client.depositAmount.toLocaleString()})
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-600 font-medium">
                      ⚠ Deposit Pending (${client.depositAmount.toLocaleString()})
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Balance: ${client.balanceDue.toLocaleString()}
                  </div>
                </div>

                {/* Activity Indicators */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  {client.messages > 0 && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-semibold">{client.messages}</span> new
                    </div>
                  )}
                  {client.tasks > 0 && (
                    <div className="flex items-center gap-1 text-sm text-purple-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">{client.tasks}</span> tasks
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="w-4 h-4" />
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {activeClient === client.id && (
                <div className="bg-purple-50 px-6 py-3 border-t border-purple-100">
                  <div className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Currently Viewing This Client
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Your clients will appear here when you start booking'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
