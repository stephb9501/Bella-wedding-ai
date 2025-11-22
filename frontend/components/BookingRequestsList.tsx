'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Mail,
  Clock,
  Check,
  X,
  MessageSquare,
  User,
  Filter,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BookingRequest {
  id: string;
  vendor_id: string;
  user_id: string;
  wedding_date: string;
  time_slot: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string;
  vendor_response?: string;
  requested_at: string;
  responded_at?: string;
  vendors?: {
    name: string;
    email: string;
  };
}

interface Props {
  vendorId: string;
}

export function BookingRequestsList({ vendorId }: Props) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [vendorId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendor-bookings?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data || []);
    } catch (err) {
      console.error('Bookings fetch error:', err);
      setError('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    bookingId: string,
    status: 'accepted' | 'declined',
    vendorResponse?: string
  ) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/vendor-bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          status,
          vendor_response: vendorResponse,
        }),
      });

      if (!response.ok) throw new Error('Failed to update booking');

      setRespondingId(null);
      setResponse('');
      await fetchBookings();
    } catch (err) {
      console.error('Booking update error:', err);
      setError('Failed to update booking request');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getUserEmail = async (userId: string) => {
    // This would need to be fetched from an API endpoint
    return 'user@example.com'; // Placeholder
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    accepted: bookings.filter((b) => b.status === 'accepted').length,
    declined: bookings.filter((b) => b.status === 'declined').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning':
        return 'Morning (8am - 12pm)';
      case 'afternoon':
        return 'Afternoon (12pm - 5pm)';
      case 'evening':
        return 'Evening (5pm - 11pm)';
      default:
        return 'All Day';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-champagne-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
      {/* Header */}
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Requests</h3>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'all'
              ? 'border-champagne-600 bg-champagne-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs md:text-sm text-gray-600">Total</div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'pending'
              ? 'border-yellow-600 bg-yellow-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs md:text-sm text-gray-600">Pending</div>
          <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </button>

        <button
          onClick={() => setFilter('accepted')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'accepted'
              ? 'border-green-600 bg-green-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs md:text-sm text-gray-600">Accepted</div>
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats.accepted}</div>
        </button>

        <button
          onClick={() => setFilter('declined')}
          className={`p-3 rounded-lg border-2 transition ${
            filter === 'declined'
              ? 'border-red-600 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs md:text-sm text-gray-600">Declined</div>
          <div className="text-xl md:text-2xl font-bold text-red-600">{stats.declined}</div>
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No booking requests</p>
          <p className="text-sm">
            {filter === 'all'
              ? 'When couples send booking requests, they will appear here'
              : `No ${filter} booking requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              {/* Booking Header */}
              <div className="p-4 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-champagne-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-champagne-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Booking Request</h4>
                      <p className="text-sm text-gray-500">
                        Requested {new Date(booking.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
                      {booking.status === 'accepted' && <Check className="w-4 h-4 inline mr-1" />}
                      {booking.status === 'declined' && <X className="w-4 h-4 inline mr-1" />}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <button
                      onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition"
                    >
                      {expandedId === booking.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      <strong>Wedding Date:</strong> {new Date(booking.wedding_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      <strong>Time:</strong> {getTimeSlotLabel(booking.time_slot)}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === booking.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Customer Message */}
                    {booking.message && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                          <strong className="text-sm text-blue-900">Customer Message:</strong>
                        </div>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap ml-6">
                          {booking.message}
                        </p>
                      </div>
                    )}

                    {/* Vendor Response */}
                    {booking.vendor_response && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-start gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-green-600 mt-0.5" />
                          <strong className="text-sm text-green-900">Your Response:</strong>
                        </div>
                        <p className="text-sm text-green-800 whitespace-pre-wrap ml-6">
                          {booking.vendor_response}
                        </p>
                      </div>
                    )}

                    {/* Response Form */}
                    {booking.status === 'pending' && (
                      <div className="space-y-3">
                        {respondingId === booking.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Response Message (optional)
                              </label>
                              <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={3}
                                placeholder="Add a message to the couple (e.g., pricing details, next steps, questions...)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 resize-none text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'accepted', response)}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 text-sm"
                              >
                                {submitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Accept
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'declined', response)}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 text-sm"
                              >
                                {submitting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    Decline
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setRespondingId(null);
                                  setResponse('');
                                }}
                                disabled={submitting}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-medium rounded-lg transition text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setRespondingId(booking.id)}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-medium rounded-lg transition text-sm"
                            >
                              Respond to Request
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Response Date */}
                    {booking.responded_at && (
                      <p className="text-xs text-gray-500">
                        Responded on {new Date(booking.responded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions (for pending requests) */}
              {booking.status === 'pending' && expandedId !== booking.id && (
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => {
                      setExpandedId(booking.id);
                      setRespondingId(booking.id);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      setExpandedId(booking.id);
                      setRespondingId(booking.id);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
