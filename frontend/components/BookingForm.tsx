'use client';

import { useState } from 'react';
import { Calendar, Clock, DollarSign, MessageSquare, Loader2 } from 'lucide-react';

interface Props {
  userId: string;
  vendorId: string;
  vendorName: string;
  onSuccess?: () => void;
}

export function BookingForm({ userId, vendorId, vendorName, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    service_type: '',
    budget_range: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          vendor_id: vendorId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      alert('Booking request sent successfully!');
      setFormData({
        booking_date: '',
        booking_time: '',
        service_type: '',
        budget_range: '',
        message: '',
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Request Booking with {vendorName}
        </h3>
        <p className="text-gray-600">Fill out the details and the vendor will respond to your request</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              id="booking_date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="booking_time" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="time"
              id="booking_time"
              name="booking_time"
              value={formData.booking_time}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
          Service Type
        </label>
        <select
          id="service_type"
          name="service_type"
          value={formData.service_type}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
        >
          <option value="">Select service type</option>
          <option value="consultation">Consultation</option>
          <option value="full_service">Full Service</option>
          <option value="day_of">Day-Of Coordination</option>
          <option value="custom">Custom Package</option>
        </select>
      </div>

      <div>
        <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-2">
          Budget Range <span className="text-gray-400">(optional)</span>
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            id="budget_range"
            name="budget_range"
            value={formData.budget_range}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
          >
            <option value="">Select budget range</option>
            <option value="under_1000">Under $1,000</option>
            <option value="1000_2500">$1,000 - $2,500</option>
            <option value="2500_5000">$2,500 - $5,000</option>
            <option value="5000_10000">$5,000 - $10,000</option>
            <option value="over_10000">Over $10,000</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message to Vendor <span className="text-gray-400">(optional)</span>
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
            placeholder="Tell the vendor about your wedding plans, specific needs, or questions..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-4 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
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
    </form>
  );
}
