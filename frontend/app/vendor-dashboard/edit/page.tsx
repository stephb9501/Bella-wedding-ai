'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Save, X } from 'lucide-react';

const CATEGORIES = [
  'Venue', 'Catering', 'Photography', 'Videography', 'Florist',
  'DJ/Music', 'Hair & Makeup', 'Wedding Planner', 'Cake', 'Transportation',
  'Officiant', 'Invitations', 'Dress & Attire', 'Rentals', 'Other'
];

interface VendorProfile {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  categories: string[]; // Now an array
  city: string;
  state: string;
  description: string;
  tier: 'free' | 'premium' | 'featured' | 'elite';
}

export default function EditVendorProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    categories: [] as string[],
    city: '',
    state: '',
    description: '',
  });

  // TODO: Get vendor ID from auth session
  const vendorId = 'demo-vendor-123';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/vendors?id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data: VendorProfile = await response.json();

      setFormData({
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        categories: Array.isArray(data.categories) ? data.categories : [data.categories], // Handle old single category
        city: data.city,
        state: data.state,
        description: data.description || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    // Validate at least one category
    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vendorId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      setSuccess(true);
      setTimeout(() => {
        router.push('/vendor-dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Edit Profile</h1>
          </div>
          <button
            onClick={() => router.push('/vendor-dashboard')}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Profile updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Categories * <span className="text-xs text-gray-500">(Select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                {CATEGORIES.map(cat => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="w-4 h-4 text-champagne-600 border-gray-300 rounded focus:ring-champagne-500"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
              {formData.categories.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {formData.categories.join(', ')}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                💡 You can select multiple categories if you offer different services (e.g., DJ + Wedding Planning)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="CA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                placeholder="Tell couples about your business, experience, and what makes you unique..."
              />
              <p className="mt-1 text-xs text-gray-500">
                A detailed description helps couples understand your services and increases booking requests.
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.push('/vendor-dashboard')}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Update your categories if you expand your services</li>
            <li>• Keep your description current with your latest offerings</li>
            <li>• Mention your experience, awards, and unique selling points</li>
            <li>• Include keywords couples might search for</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
