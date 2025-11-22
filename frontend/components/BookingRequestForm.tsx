'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MessageSquare, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  price_range?: string;
  location?: string;
}

interface Props {
  vendor: Vendor;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BookingRequestForm({ vendor, userId, onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState({
    wedding_date: '',
    time_slot: 'all_day',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (formData.wedding_date) {
      checkAvailability();
    } else {
      setIsAvailable(null);
    }
  }, [formData.wedding_date, formData.time_slot]);

  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      const response = await fetch(
        `/api/vendors/availability?vendor_id=${vendor.id}&start_date=${formData.wedding_date}&end_date=${formData.wedding_date}`
      );

      if (response.ok) {
        const data = await response.json();
        const availRecord = data.find(
          (a: any) =>
            a.date === formData.wedding_date &&
            (a.time_slot === formData.time_slot || a.time_slot === 'all_day')
        );

        if (availRecord) {
          setIsAvailable(availRecord.is_available);
        } else {
          // No record means vendor hasn't set availability for this date
          setIsAvailable(null);
        }
      }
    } catch (err) {
      console.error('Failed to check availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!formData.wedding_date) {
        throw new Error('Please select a wedding date');
      }

      // Check if date is in the past
      const selectedDate = new Date(formData.wedding_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        throw new Error('Wedding date cannot be in the past');
      }

      const response = await fetch('/api/vendor-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          vendor_id: vendor.id,
          wedding_date: formData.wedding_date,
          time_slot: formData.time_slot,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send booking request');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
          <p className="text-gray-600 mb-6">
            Your booking request has been sent to {vendor.name}. You'll receive an email when they
            respond.
          </p>
          <button
            onClick={onSuccess}
            className="px-6 py-2 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-medium rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Request Booking
        </h3>
        <div className="p-4 bg-gradient-to-r from-champagne-50 to-rose-50 rounded-lg border border-champagne-200">
          <h4 className="font-bold text-gray-900 mb-1">{vendor.name}</h4>
          <p className="text-sm text-gray-600">{vendor.category}</p>
          {vendor.location && (
            <p className="text-sm text-gray-600">{vendor.location}</p>
          )}
          {vendor.price_range && (
            <p className="text-sm text-gray-700 font-medium mt-1">{vendor.price_range}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wedding Date */}
        <div>
          <label htmlFor="wedding_date" className="block text-sm font-medium text-gray-700 mb-2">
            Wedding Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="date"
              id="wedding_date"
              name="wedding_date"
              value={formData.wedding_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
            />
          </div>

          {/* Availability Indicator */}
          {checkingAvailability && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking availability...
            </div>
          )}
          {!checkingAvailability && isAvailable === true && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Vendor is available on this date
            </div>
          )}
          {!checkingAvailability && isAvailable === false && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              Vendor may not be available on this date
            </div>
          )}
          {!checkingAvailability && isAvailable === null && formData.wedding_date && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              Vendor hasn't set availability for this date yet
            </div>
          )}
        </div>

        {/* Time Slot */}
        <div>
          <label htmlFor="time_slot" className="block text-sm font-medium text-gray-700 mb-2">
            Time Slot
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <select
              id="time_slot"
              name="time_slot"
              value={formData.time_slot}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all_day">All Day</option>
              <option value="morning">Morning (8am - 12pm)</option>
              <option value="afternoon">Afternoon (12pm - 5pm)</option>
              <option value="evening">Evening (5pm - 11pm)</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message to Vendor <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none" />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              placeholder="Tell the vendor about your wedding vision, specific needs, or ask any questions..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:border-transparent resize-none"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Include details about your wedding theme, guest count, or any special requirements
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting || !formData.wedding_date}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Request...
              </>
            ) : (
              'Send Booking Request'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>The vendor will receive your booking request via email</li>
              <li>They'll review your request and respond within 24-48 hours</li>
              <li>You'll receive an email notification when they accept or decline</li>
              <li>If accepted, you can finalize the details directly with the vendor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
