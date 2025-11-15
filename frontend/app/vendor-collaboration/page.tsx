'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Users, Calendar, MapPin, MessageCircle, CheckCircle, Clock, XCircle, Crown } from 'lucide-react';
import { MessagingSystem } from '@/components/MessagingSystem';

interface VendorBooking {
  id: string;
  bride_id: string;
  vendor_id: string;
  vendor_category: string;
  wedding_date: string | null;
  venue_location: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  bride?: {
    name: string;
    email: string;
    phone: string;
  };
}

const STATUS_INFO = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  declined: { label: 'Declined', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function VendorCollaboration() {
  const router = useRouter();
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [activeChat, setActiveChat] = useState<VendorBooking | null>(null);
  const vendorId = 'vendor_demo_123'; // TODO: Get from session/auth

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/vendor-bookings?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch('/api/vendor-bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status }),
      });

      if (!response.ok) throw new Error('Failed to update booking');

      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    declined: bookings.filter(b => b.status === 'declined').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Vendor Collaboration</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/vendor-dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/vendors')}
              className="px-4 py-2 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-medium rounded-lg transition"
            >
              View Marketplace
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Crown className="w-10 h-10 text-purple-600" />
            My Couples
          </h2>
          <p className="text-lg text-gray-600">
            Manage your bookings and collaborate with couples on their special day
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100">
            <div className="text-3xl font-bold text-amber-600 mb-1">{stats.pending}</div>
            <div className="text-sm text-amber-700">Pending</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-100">
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.accepted}</div>
            <div className="text-sm text-green-700">Accepted</div>
          </div>
          <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-100">
            <div className="text-3xl font-bold text-red-600 mb-1">{stats.declined}</div>
            <div className="text-sm text-red-700">Declined</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'accepted', 'declined'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-champagne-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All Requests' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-champagne-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No booking requests yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Couples will find you in the marketplace and send booking requests
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdateStatus={updateBookingStatus}
                onMessage={(booking) => setActiveChat(booking)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Messaging System */}
      {activeChat && (
        <MessagingSystem
          bookingId={activeChat.id}
          currentUserId={vendorId}
          currentUserType="vendor"
          recipientName={activeChat.bride?.name || 'Bride'}
          recipientType="bride"
          onClose={() => setActiveChat(null)}
          minimizable={true}
        />
      )}
    </div>
  );
}

function BookingCard({ booking, onUpdateStatus, onMessage }: {
  booking: VendorBooking;
  onUpdateStatus: (id: string, status: 'accepted' | 'declined') => void;
  onMessage: (booking: VendorBooking) => void;
}) {
  const statusInfo = STATUS_INFO[booking.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md border-2 ${statusInfo.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {booking.bride?.name || 'Bride'}
            </h3>
            <span className={`flex items-center gap-1 px-3 py-1 ${statusInfo.bg} ${statusInfo.color} rounded-full text-sm font-medium`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Requested on {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>

        {booking.status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(booking.id, 'accepted')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => onUpdateStatus(booking.id, 'declined')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Decline
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {booking.wedding_date && (
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-champagne-600" />
            <div>
              <div className="text-xs text-gray-500">Wedding Date</div>
              <div className="font-medium">{new Date(booking.wedding_date).toLocaleDateString()}</div>
            </div>
          </div>
        )}

        {booking.venue_location && (
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-rose-600" />
            <div>
              <div className="text-xs text-gray-500">Venue</div>
              <div className="font-medium">{booking.venue_location}</div>
            </div>
          </div>
        )}
      </div>

      {booking.message && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Message from Bride</div>
          <p className="text-gray-700">{booking.message}</p>
        </div>
      )}

      {booking.bride && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {booking.bride.email && (
            <a
              href={`mailto:${booking.bride.email}`}
              className="flex items-center gap-1 hover:text-champagne-600 transition"
            >
              <MessageCircle className="w-4 h-4" />
              {booking.bride.email}
            </a>
          )}
          {booking.bride.phone && (
            <a
              href={`tel:${booking.bride.phone}`}
              className="flex items-center gap-1 hover:text-champagne-600 transition"
            >
              {booking.bride.phone}
            </a>
          )}
        </div>
      )}

      {booking.status === 'accepted' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onMessage(booking)}
            className="w-full px-4 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Open Chat
          </button>
        </div>
      )}
    </div>
  );
}
