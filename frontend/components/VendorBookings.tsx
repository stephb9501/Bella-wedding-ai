'use client';

import { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, MapPin, Check, X, Clock } from 'lucide-react';

interface Booking {
  id: string;
  bride_name: string;
  email: string;
  phone: string;
  wedding_date: string;
  venue: string;
  budget_range: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

interface Props {
  vendorId: string;
}

export function VendorBookings({ vendorId }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/vendor-bookings?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data || []);
    } catch (err) {
      console.error('Bookings fetch error:', err);
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
    } catch (err) {
      console.error('Booking update error:', err);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    accepted: bookings.filter((b) => b.status === 'accepted').length,
    declined: bookings.filter((b) => b.status === 'declined').length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Requests</h3>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'all'
              ? 'border-champagne-600 bg-champagne-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'pending'
              ? 'border-amber-600 bg-amber-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
        </button>

        <button
          onClick={() => setFilter('accepted')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'accepted'
              ? 'border-green-600 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-sm text-gray-600">Accepted</div>
          <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
        </button>

        <button
          onClick={() => setFilter('declined')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'declined'
              ? 'border-red-600 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-sm text-gray-600">Declined</div>
          <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No booking requests</p>
          <p className="text-sm">
            {filter === 'all'
              ? 'When couples reach out, their requests will appear here'
              : `No ${filter} booking requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{booking.bride_name}</h4>
                  <p className="text-sm text-gray-500">
                    Requested {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : booking.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {booking.status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
                  {booking.status === 'accepted' && <Check className="w-4 h-4 inline mr-1" />}
                  {booking.status === 'declined' && <X className="w-4 h-4 inline mr-1" />}
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {booking.email}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {booking.phone || 'Not provided'}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Wedding: {new Date(booking.wedding_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {booking.venue || 'Venue TBD'}
                </div>
              </div>

              {booking.budget_range && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                  <strong className="text-blue-900">Budget:</strong>{' '}
                  <span className="text-blue-700">{booking.budget_range}</span>
                </div>
              )}

              {booking.message && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{booking.message}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {/* Contact Actions */}
                <a
                  href={`mailto:${booking.email}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                {booking.phone && (
                  <a
                    href={`tel:${booking.phone}`}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                )}

                {/* Accept/Decline Actions */}
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'accepted')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2 ml-auto"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'declined')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
