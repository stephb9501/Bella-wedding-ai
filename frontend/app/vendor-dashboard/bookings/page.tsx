'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar as CalendarIcon, Plus, Edit2, Trash2, Check, X, ArrowLeft, ChevronLeft, ChevronRight, Clock, DollarSign, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Booking {
  id: string;
  vendor_id: string;
  bride_name: string;
  bride_email: string;
  bride_phone: string | null;
  event_date: string;
  event_time: string | null;
  service_type: string | null;
  price: number | null;
  deposit_paid: number | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  venue: string | null;
  guest_count: number | null;
  created_at: string;
  updated_at: string;
}

export default function BookingsCalendar() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    bride_name: '',
    bride_email: '',
    bride_phone: '',
    event_date: '',
    event_time: '',
    service_type: '',
    price: '',
    deposit_paid: '',
    status: 'pending' as Booking['status'],
    notes: '',
    venue: '',
    guest_count: ''
  });

  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setVendorId(user.id);
    };
    initializePage();
  }, [router]);

  useEffect(() => {
    if (vendorId) {
      fetchBookings();
    }
  }, [vendorId]);

  const fetchBookings = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('vendor_bookings')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const bookingData = {
        vendor_id: vendorId,
        bride_name: formData.bride_name,
        bride_email: formData.bride_email,
        bride_phone: formData.bride_phone || null,
        event_date: formData.event_date,
        event_time: formData.event_time || null,
        service_type: formData.service_type || null,
        price: formData.price ? parseFloat(formData.price) : null,
        deposit_paid: formData.deposit_paid ? parseFloat(formData.deposit_paid) : null,
        status: formData.status,
        notes: formData.notes || null,
        venue: formData.venue || null,
        guest_count: formData.guest_count ? parseInt(formData.guest_count) : null,
      };

      if (editingBooking) {
        const { error } = await supabase
          .from('vendor_bookings')
          .update(bookingData)
          .eq('id', editingBooking.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vendor_bookings')
          .insert([bookingData]);

        if (error) throw error;
      }

      setShowBookingModal(false);
      setEditingBooking(null);
      resetForm();
      await fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Failed to save booking');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const { error } = await supabase
        .from('vendor_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      bride_name: '',
      bride_email: '',
      bride_phone: '',
      event_date: '',
      event_time: '',
      service_type: '',
      price: '',
      deposit_paid: '',
      status: 'pending',
      notes: '',
      venue: '',
      guest_count: ''
    });
  };

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      bride_name: booking.bride_name,
      bride_email: booking.bride_email,
      bride_phone: booking.bride_phone || '',
      event_date: booking.event_date,
      event_time: booking.event_time || '',
      service_type: booking.service_type || '',
      price: booking.price?.toString() || '',
      deposit_paid: booking.deposit_paid?.toString() || '',
      status: booking.status,
      notes: booking.notes || '',
      venue: booking.venue || '',
      guest_count: booking.guest_count?.toString() || ''
    });
    setShowBookingModal(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date: string) => {
    return bookings.filter(b => b.event_date === date);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings.reduce((sum, b) => sum + (b.price || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/vendor-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-serif font-bold text-gray-900">Bookings Calendar</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-sm text-yellow-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-sm text-green-600">Confirmed</div>
            <div className="text-2xl font-bold text-green-900">{stats.confirmed}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-sm text-blue-600">Completed</div>
            <div className="text-2xl font-bold text-blue-900">{stats.completed}</div>
          </div>
          <div className="bg-champagne-50 rounded-lg shadow p-4">
            <div className="text-sm text-champagne-600">Total Revenue</div>
            <div className="text-2xl font-bold text-champagne-900">${stats.revenue.toLocaleString()}</div>
          </div>
        </div>

        {/* View Toggle and Add Button */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'month' ? 'bg-champagne-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'list' ? 'bg-champagne-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingBooking(null);
              setShowBookingModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Booking
          </button>
        </div>

        {/* Calendar View */}
        {view === 'month' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 hover:bg-gray-100 rounded-lg transition font-medium"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-bold text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayBookings = getBookingsForDate(dateStr);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                return (
                  <div
                    key={day}
                    className={`aspect-square border border-gray-200 rounded-lg p-2 ${
                      isToday ? 'bg-champagne-50 border-champagne-400' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-gray-900 mb-1">{day}</div>
                    <div className="space-y-1">
                      {dayBookings.map(booking => (
                        <div
                          key={booking.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                          onClick={() => openEditModal(booking)}
                          title={`${booking.bride_name} - ${booking.status}`}
                        >
                          {booking.bride_name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600">Click "Add Booking" to create your first booking.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{booking.bride_name}</h3>
                      <p className="text-gray-600">{booking.bride_email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>{new Date(booking.event_date).toLocaleDateString()}</span>
                    </div>
                    {booking.event_time && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{booking.event_time}</span>
                      </div>
                    )}
                    {booking.price && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>${booking.price.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.guest_count && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{booking.guest_count} guests</span>
                      </div>
                    )}
                  </div>

                  {booking.service_type && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Service: </span>
                      <span className="text-gray-900">{booking.service_type}</span>
                    </div>
                  )}

                  {booking.venue && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Venue: </span>
                      <span className="text-gray-900">{booking.venue}</span>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(booking)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBooking ? 'Edit Booking' : 'Add New Booking'}
                </h2>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setEditingBooking(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bride_name}
                      onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.bride_email}
                      onChange={(e) => setFormData({ ...formData, bride_email: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.bride_phone}
                      onChange={(e) => setFormData({ ...formData, bride_phone: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Booking['status'] })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Time
                    </label>
                    <input
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <input
                    type="text"
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    placeholder="e.g., Full Day Photography, Wedding Cake, DJ Service"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Paid
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.deposit_paid}
                      onChange={(e) => setFormData({ ...formData, deposit_paid: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Count
                    </label>
                    <input
                      type="number"
                      value={formData.guest_count}
                      onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Venue name or location"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes about this booking..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
                  >
                    {editingBooking ? 'Update Booking' : 'Create Booking'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setEditingBooking(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
