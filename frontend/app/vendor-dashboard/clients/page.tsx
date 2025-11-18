'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, User, Mail, Phone, MapPin, DollarSign, ArrowRight, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  bride_name: string;
  email: string;
  phone: string;
  wedding_date: string;
  venue: string;
  budget_range: string;
  message: string;
  status: string;
  created_at: string;
}

export default function VendorClients() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    initializeClients();
  }, []);

  const initializeClients = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/auth');
        return;
      }

      setVendorId(user.id);
      await fetchClients(user.id);
    } catch (err) {
      console.error('Error initializing clients:', err);
      router.push('/auth');
    }
  };

  const fetchClients = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/vendor-bookings?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch clients');

      const data = await response.json();
      // Only show accepted bookings as "clients"
      const acceptedClients = (data || []).filter((b: Client) => b.status === 'accepted');
      setClients(acceptedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = searchQuery
    ? clients.filter(client =>
        client.bride_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.venue.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clients;

  // Sort by wedding date (upcoming first)
  const sortedClients = [...filteredClients].sort((a, b) => {
    return new Date(a.wedding_date).getTime() - new Date(b.wedding_date).getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-900">My Clients</h1>
              <p className="text-sm text-gray-500">{clients.length} active wedding projects</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/vendor-dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bride name, email, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-champagne-500"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {sortedClients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Clients Yet</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'No clients match your search. Try different keywords.'
                : 'When you accept booking requests, they\'ll appear here as active clients.'}
            </p>
            <button
              onClick={() => router.push('/vendor-dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-medium rounded-lg transition"
            >
              View Booking Requests
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClients.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const router = useRouter();
  const weddingDate = new Date(client.wedding_date);
  const daysUntilWedding = Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isPastWedding = daysUntilWedding < 0;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
      {/* Header */}
      <div className={`p-4 ${isPastWedding ? 'bg-gray-100' : 'bg-gradient-to-r from-champagne-100 to-rose-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{client.bride_name}</h3>
          {!isPastWedding && daysUntilWedding <= 30 && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              {daysUntilWedding}d
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {weddingDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="break-all">{client.email}</span>
        </div>

        {client.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{client.phone}</span>
          </div>
        )}

        {client.venue && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{client.venue}</span>
          </div>
        )}

        {client.budget_range && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span>{client.budget_range}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={() => router.push(`/vendor-dashboard/clients/${client.id}`)}
          className="w-full px-4 py-3 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          Open Project
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
