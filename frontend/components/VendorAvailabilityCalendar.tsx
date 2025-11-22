'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock, Loader2 } from 'lucide-react';

interface AvailabilityRecord {
  id: string;
  vendor_id: string;
  date: string;
  is_available: boolean;
  time_slot: 'all_day' | 'morning' | 'afternoon' | 'evening';
  price_override?: number;
  notes?: string;
}

interface BookingRequest {
  id: string;
  wedding_date: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  time_slot: string;
}

interface Props {
  vendorId: string;
  isVendorView?: boolean; // If true, vendor can edit; if false, bride can only view
}

export function VendorAvailabilityCalendar({ vendorId, isVendorView = false }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchData();
  }, [vendorId, year, month]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // Fetch availability
      const availResponse = await fetch(
        `/api/vendors/availability?vendor_id=${vendorId}&start_date=${startDate}&end_date=${endDate}`
      );
      if (availResponse.ok) {
        const availData = await availResponse.json();
        setAvailability(availData || []);
      }

      // Fetch booking requests
      const bookingsResponse = await fetch(`/api/vendor-bookings?vendor_id=${vendorId}`);
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookingRequests(bookingsData || []);
      }
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const getDateString = (day: number) => {
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  const getDateStatus = (day: number) => {
    const dateString = getDateString(day);
    const availRecord = availability.find((a) => a.date === dateString);
    const booking = bookingRequests.find((b) => b.wedding_date === dateString);

    if (booking) {
      if (booking.status === 'accepted') return 'booked';
      if (booking.status === 'pending') return 'pending';
    }

    if (availRecord) {
      return availRecord.is_available ? 'available' : 'unavailable';
    }

    return 'unset';
  };

  const getDateColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'booked':
        return 'bg-red-100 border-red-300';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300';
      case 'unavailable':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const handleDateClick = (day: number) => {
    if (!isVendorView) return;

    const dateString = getDateString(day);
    if (bulkActionMode) {
      const newSelected = new Set(selectedDates);
      if (newSelected.has(dateString)) {
        newSelected.delete(dateString);
      } else {
        newSelected.add(dateString);
      }
      setSelectedDates(newSelected);
    } else {
      toggleDateAvailability(dateString);
    }
  };

  const toggleDateAvailability = async (dateString: string) => {
    try {
      setSaving(true);
      const existingRecord = availability.find((a) => a.date === dateString);
      const isCurrentlyAvailable = existingRecord?.is_available ?? false;

      const response = await fetch('/api/vendors/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          dates: [
            {
              date: dateString,
              is_available: !isCurrentlyAvailable,
              time_slot: 'all_day',
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to update availability');

      setSuccess('Availability updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      await fetchData();
    } catch (err) {
      setError('Failed to update availability');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAction = async (action: 'available' | 'unavailable') => {
    if (selectedDates.size === 0) {
      setError('Please select at least one date');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSaving(true);
      const dates = Array.from(selectedDates).map((date) => ({
        date,
        is_available: action === 'available',
        time_slot: 'all_day' as const,
      }));

      const response = await fetch('/api/vendors/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          dates,
        }),
      });

      if (!response.ok) throw new Error('Failed to bulk update');

      setSuccess(`Marked ${selectedDates.size} dates as ${action}`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedDates(new Set());
      setBulkActionMode(false);
      await fetchData();
    } catch (err) {
      setError('Failed to update availability');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-champagne-600" />
            {isVendorView ? 'Manage Availability' : 'Vendor Availability'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isVendorView
              ? 'Click dates to toggle availability or use bulk actions'
              : 'View available dates for booking'}
          </p>
        </div>

        {isVendorView && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setBulkActionMode(!bulkActionMode);
                setSelectedDates(new Set());
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                bulkActionMode
                  ? 'bg-champagne-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bulkActionMode ? 'Cancel Bulk' : 'Bulk Select'}
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {isVendorView && bulkActionMode && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedDates.size} date(s) selected
            </span>
            <button
              onClick={() => handleBulkAction('available')}
              disabled={saving || selectedDates.size === 0}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Mark Available
            </button>
            <button
              onClick={() => handleBulkAction('unavailable')}
              disabled={saving || selectedDates.size === 0}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Mark Unavailable
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h4 className="text-lg font-bold text-gray-900">
          {monthNames[month]} {year}
        </h4>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {getDaysInMonth().map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateString = getDateString(day);
          const status = getDateStatus(day);
          const isSelected = selectedDates.has(dateString);
          const isPast = new Date(dateString) < new Date(new Date().toISOString().split('T')[0]);
          const booking = bookingRequests.find((b) => b.wedding_date === dateString);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!isVendorView || (isPast && status !== 'booked')}
              className={`
                aspect-square p-1 md:p-2 border-2 rounded-lg transition relative
                ${getDateColor(status)}
                ${isSelected ? 'ring-2 ring-champagne-600' : ''}
                ${isPast && status !== 'booked' ? 'opacity-40 cursor-not-allowed' : ''}
                ${!isVendorView ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="text-sm md:text-base font-medium">{day}</div>
              {status === 'booked' && (
                <div className="absolute top-0 right-0 m-0.5">
                  <X className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                </div>
              )}
              {status === 'pending' && (
                <div className="absolute top-0 right-0 m-0.5">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />
                </div>
              )}
              {status === 'available' && (
                <div className="absolute top-0 right-0 m-0.5">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Legend:</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
