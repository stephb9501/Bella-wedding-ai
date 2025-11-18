'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Check } from 'lucide-react';

interface GuestData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rsvp_status: 'pending' | 'yes' | 'no';
  has_plus_one: boolean;
  plus_one_name: string;
  dietary_restrictions: string;
}

export default function GuestResponse() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    rsvp_status: 'pending' as 'pending' | 'yes' | 'no',
    has_plus_one: false,
    plus_one_name: '',
    dietary_restrictions: '',
  });

  useEffect(() => {
    if (token) {
      fetchGuestData();
    }
  }, [token]);

  const fetchGuestData = async () => {
    try {
      const response = await fetch(`/api/guest-response/${token}`);
      if (!response.ok) throw new Error('Invalid or expired link');

      const data = await response.json();
      setGuestData(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip || '',
        rsvp_status: data.rsvp_status || 'pending',
        has_plus_one: data.has_plus_one || false,
        plus_one_name: data.plus_one_name || '',
        dietary_restrictions: data.dietary_restrictions || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/guest-response/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit response');

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-champagne-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-4">Your response has been submitted successfully.</p>
          <p className="text-sm text-gray-500">We're so excited to celebrate with you! 💕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              You're Invited!
            </h1>
            <p className="text-gray-600">
              Please share your details so we can send you updates
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                required
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="CA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>
            </div>

            {/* RSVP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Will you attend? *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rsvp_status"
                    value="yes"
                    checked={formData.rsvp_status === 'yes'}
                    onChange={handleChange}
                    className="mr-2"
                    required
                  />
                  <span className="text-gray-700">✅ Yes, I'll be there!</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rsvp_status"
                    value="no"
                    checked={formData.rsvp_status === 'no'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700">❌ Sorry, can't make it</span>
                </label>
              </div>
            </div>

            {/* Plus One */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="has_plus_one"
                  checked={formData.has_plus_one}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">I'm bringing a plus-one</span>
              </label>
              {formData.has_plus_one && (
                <input
                  type="text"
                  name="plus_one_name"
                  value={formData.plus_one_name}
                  onChange={handleChange}
                  placeholder="Plus-one's name"
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              )}
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
              <textarea
                name="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={handleChange}
                rows={3}
                placeholder="Any allergies or dietary preferences?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition shadow-md"
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
