'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Search, Star, Crown, Zap, MapPin, MessageCircle, Phone, Mail, X } from 'lucide-react';
import Image from 'next/image';

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  city: string;
  state: string;
  description: string;
  tier: 'free' | 'premium' | 'featured' | 'elite';
  photo_count: number;
  profile_views: number;
  is_featured: boolean;
  email: string;
  phone: string;
}

const CATEGORIES = [
  'All', 'Venue', 'Catering', 'Photography', 'Videography', 'Florist',
  'DJ/Music', 'Hair & Makeup', 'Wedding Planner', 'Cake', 'Transportation',
  'Officiant', 'Invitations', 'Dress & Attire', 'Rentals', 'Other'
];

const TIER_INFO = {
  free: { name: 'Free', icon: Star, color: 'text-gray-600', bg: 'bg-gray-100' },
  premium: { name: 'Premium', icon: Star, color: 'text-blue-600', bg: 'bg-blue-100' },
  featured: { name: 'Featured', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' },
  elite: { name: 'Elite', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
};

export default function Vendors() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [selectedCategory, searchQuery, vendors]);

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by tier: elite > featured > premium > free
    const tierOrder = { elite: 4, featured: 3, premium: 2, free: 1 };
    filtered.sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier]);

    setFilteredVendors(filtered);
  };

  const featuredVendors = filteredVendors.filter(v => v.is_featured).slice(0, 3);
  const regularVendors = filteredVendors.filter(v => !v.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/vendor-register')}
              className="px-4 py-2 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-medium rounded-lg transition"
            >
              I'm a Vendor
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-4">
            Find Your Perfect Vendors
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse verified wedding professionals in your area
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by business name, city, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-champagne-500 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-2 pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-champagne-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-champagne-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading vendors...</p>
          </div>
        ) : (
          <>
            {/* Featured Vendors */}
            {featuredVendors.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                  Featured Vendors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredVendors.map(vendor => (
                    <VendorCard key={vendor.id} vendor={vendor} featured onMessage={(v) => {
                      setSelectedVendor(v);
                      setShowBookingModal(true);
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* All Vendors */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                All Vendors ({filteredVendors.length})
              </h3>
              {filteredVendors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl">
                  <p className="text-gray-500 text-lg">No vendors found. Try adjusting your filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularVendors.map(vendor => (
                    <VendorCard key={vendor.id} vendor={vendor} onMessage={(v) => {
                      setSelectedVendor(v);
                      setShowBookingModal(true);
                    }} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedVendor && (
        <BookingModal
          vendor={selectedVendor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
}

function VendorCard({ vendor, featured = false, onMessage }: { vendor: Vendor; featured?: boolean; onMessage: (vendor: Vendor) => void }) {
  const tierInfo = TIER_INFO[vendor.tier];
  const TierIcon = tierInfo.icon;

  return (
    <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden ${featured ? 'ring-2 ring-purple-300' : ''}`}>
      {/* Photo Placeholder */}
      <div className="h-48 bg-gradient-to-br from-champagne-200 to-rose-200 relative">
        {vendor.photo_count > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            {/* TODO: Show actual first photo */}
            <p className="text-sm">{vendor.photo_count} photos</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <p className="text-sm">No photos yet</p>
          </div>
        )}
        {featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              FEATURED
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-xl font-bold text-gray-900">{vendor.business_name}</h4>
          <div className={`flex items-center gap-1 px-2 py-1 ${tierInfo.bg} rounded`}>
            <TierIcon className={`w-4 h-4 ${tierInfo.color}`} />
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-2">{vendor.category}</p>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{vendor.city}, {vendor.state}</span>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {vendor.description || 'Professional wedding vendor'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>4.9</span>
          </div>
          <span>{vendor.profile_views || 0} views</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onMessage(vendor)}
            className="flex-1 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    wedding_date: '',
    venue_location: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Get bride_id from session/auth
      const brideId = 'demo-bride-123';

      const response = await fetch('/api/vendor-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bride_id: brideId,
          vendor_id: vendor.id,
          wedding_date: formData.wedding_date,
          venue_location: formData.venue_location,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send booking request');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      alert(error.message || 'Failed to send booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-champagne-500 to-rose-500 px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Connect with {vendor.business_name}</h3>
            <p className="text-champagne-50 text-sm">{vendor.category} • {vendor.city}, {vendor.state}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h4>
            <p className="text-gray-600">
              {vendor.business_name} will receive your message and get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8">
            <p className="text-gray-600 mb-6">
              Tell {vendor.business_name} about your wedding and they'll reach out to discuss how they can make your day perfect.
            </p>

            <div className="space-y-5">
              {/* Wedding Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={formData.wedding_date}
                  onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                />
              </div>

              {/* Venue Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue/Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., The Grand Ballroom, Chicago, IL"
                  value={formData.venue_location}
                  onChange={(e) => setFormData({ ...formData, venue_location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Tell them about your vision, guest count, budget range, or any specific requests..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 resize-none"
                />
              </div>
            </div>

            {/* Vendor Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">Vendor Contact</h5>
              <div className="space-y-1 text-sm text-gray-600">
                {vendor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{vendor.email}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
