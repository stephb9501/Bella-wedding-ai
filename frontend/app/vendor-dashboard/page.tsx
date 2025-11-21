'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Upload, X, Image as ImageIcon, TrendingUp, Users, MessageCircle, DollarSign, Crown, Star, Zap, BarChart3, Calendar, Quote, ChevronDown, ClipboardList, CheckSquare, Wallet, UserCircle, Armchair } from 'lucide-react';
import Image from 'next/image';
import { VendorAnalytics } from '@/components/VendorAnalytics';
import { VendorBookings } from '@/components/VendorBookings';
import { VendorReviews } from '@/components/VendorReviews';
import { VendorTimeline } from '@/components/VendorTimeline';

interface VendorProfile {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  state: string;
  description: string;
  tier: 'free' | 'premium' | 'featured' | 'elite';
  photo_count: number;
  message_count_this_month: number;
  booking_requests: number;
  profile_views: number;
  is_featured: boolean;
}

interface Photo {
  id: string;
  photo_url: string;
}

interface Wedding {
  id: string;
  wedding_name: string;
  bride_name: string;
  wedding_date: string;
  vendor_role: string;
}

const TIER_LIMITS = {
  free: { photos: 1, messages: 5, regions: 1, categories: 1, staff: 1 },
  premium: { photos: 25, messages: 999, regions: 1, categories: 1, staff: 1 },
  featured: { photos: 50, messages: 999, regions: 2, categories: 2, staff: 2 },
  elite: { photos: 999, messages: 999, regions: 3, categories: 3, staff: 5 },
};

const TIER_INFO = {
  free: { name: 'Free', commission: '10%', icon: Star, color: 'text-gray-600', bg: 'bg-gray-100' },
  premium: { name: 'Premium', commission: '5%', icon: Star, color: 'text-blue-600', bg: 'bg-blue-100' },
  featured: { name: 'Featured', commission: '2%', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' },
  elite: { name: 'Elite', commission: '0%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
};

export default function VendorDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWedding, setSelectedWedding] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'bookings' | 'reviews' | 'planning'>('overview');
  const [showWeddingDropdown, setShowWeddingDropdown] = useState(false);
  const [activePlanningTool, setActivePlanningTool] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Get vendor ID from auth session
  const vendorId = 'demo-vendor-123';

  useEffect(() => {
    fetchProfile();
    fetchPhotos();
    fetchWeddings();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/vendors?id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/vendors/photos?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchWeddings = async () => {
    try {
      const response = await fetch(`/api/vendors/weddings?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch weddings');
      const data = await response.json();
      setWeddings(data || []);
      // Auto-select first wedding if available
      if (data && data.length > 0 && !selectedWedding) {
        setSelectedWedding(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch weddings:', err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !profile) return;

    const tierLimit = TIER_LIMITS[profile.tier].photos;
    if (photos.length >= tierLimit) {
      setError(`Your ${profile.tier} plan allows only ${tierLimit} photo${tierLimit > 1 ? 's' : ''}. Upgrade to add more!`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        if (photos.length + i >= tierLimit) {
          setError(`Reached ${tierLimit} photo limit for ${profile.tier} tier`);
          break;
        }

        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('vendor_id', vendorId);

        const response = await fetch('/api/vendors/photos', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
      }

      await fetchPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      const response = await fetch(`/api/vendors/photos?id=${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete photo');
      await fetchPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
          <button
            onClick={() => router.push('/vendor-register')}
            className="mt-4 text-champagne-600 hover:text-champagne-700"
          >
            Register as Vendor
          </button>
        </div>
      </div>
    );
  }

  const tierInfo = TIER_INFO[profile.tier];
  const TierIcon = tierInfo.icon;
  const tierLimits = TIER_LIMITS[profile.tier];
  const photoLimitReached = photos.length >= tierLimits.photos;

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding - Vendor</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                Home
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>

          {/* Wedding Selector */}
          {weddings.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowWeddingDropdown(!showWeddingDropdown)}
                className="w-full md:w-auto flex items-center justify-between gap-3 px-4 py-2 bg-champagne-50 hover:bg-champagne-100 border border-champagne-200 rounded-lg transition"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-champagne-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {weddings.find(w => w.id === selectedWedding)?.wedding_name || 'Select Wedding'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({weddings.find(w => w.id === selectedWedding)?.vendor_role})
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showWeddingDropdown && (
                <div className="absolute top-full left-0 right-0 md:right-auto md:min-w-[400px] mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {weddings.map((wedding) => (
                      <button
                        key={wedding.id}
                        onClick={() => {
                          setSelectedWedding(wedding.id);
                          setShowWeddingDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg hover:bg-champagne-50 transition ${
                          selectedWedding === wedding.id ? 'bg-champagne-100' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{wedding.wedding_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {wedding.bride_name} • {new Date(wedding.wedding_date).toLocaleDateString()} • {wedding.vendor_role}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.businessName}</h2>
              <p className="text-gray-600">{profile.category} • {profile.city}, {profile.state}</p>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 ${tierInfo.bg} rounded-lg`}>
              <TierIcon className={`w-5 h-5 ${tierInfo.color}`} />
              <span className={`font-bold ${tierInfo.color}`}>{tierInfo.name}</span>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{profile.description}</p>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/vendor-dashboard/edit')}
              className="px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              Edit Profile
            </button>
            <button
              onClick={() => router.push('/vendor-dashboard/upgrade')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-medium rounded-lg transition"
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('planning')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'planning'
                ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            disabled={!selectedWedding}
          >
            <ClipboardList className="w-5 h-5" />
            Planning Tools
            {!selectedWedding && <span className="text-xs">(Select wedding)</span>}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 px-6 font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Quote className="w-5 h-5" />
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Profile Views</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{profile.profile_views || 0}</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Messages</span>
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {profile.message_count_this_month || 0}
              {tierLimits.messages !== 999 && <span className="text-sm text-gray-500">/{tierLimits.messages}</span>}
            </div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Booking Requests</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{profile.booking_requests || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Commission Rate</span>
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{tierInfo.commission}</div>
            <div className="text-xs text-gray-500 mt-1">Per booking</div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Photo Gallery</h3>
              <p className="text-sm text-gray-600">
                {photos.length} of {tierLimits.photos === 999 ? '∞' : tierLimits.photos} photos used
              </p>
            </div>

            {!photoLimitReached && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {photoLimitReached && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium">
                Photo limit reached! Upgrade to {profile.tier === 'free' ? 'Premium' : profile.tier === 'premium' ? 'Featured' : 'Elite'} to upload more photos.
              </p>
              <button
                onClick={() => router.push('/vendor-dashboard/upgrade')}
                className="mt-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                View Upgrade Options →
              </button>
            </div>
          )}

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={photo.photo_url}
                      alt="Portfolio photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No photos yet</p>
              <p className="text-sm">Upload photos to showcase your work to couples</p>
            </div>
          )}
        </div>
          </>
        )}

        {/* Planning Tools Tab */}
        {activeTab === 'planning' && selectedWedding && (
          <div className="space-y-6">
            {!activePlanningTool ? (
              /* Planning Tools Grid */
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Planning Tools</h3>
                <p className="text-gray-600 mb-6">
                  Access timeline, checklist, budget, and more for {weddings.find(w => w.id === selectedWedding)?.wedding_name}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Timeline */}
                  <button
                    onClick={() => setActivePlanningTool('timeline')}
                    className="p-6 border-2 border-champagne-200 hover:border-champagne-400 rounded-xl text-left transition group"
                  >
                    <ClipboardList className="w-8 h-8 text-champagne-600 mb-3 group-hover:scale-110 transition" />
                    <h4 className="font-bold text-gray-900 mb-2">Timeline</h4>
                    <p className="text-sm text-gray-600">Manage event timeline and schedule</p>
                  </button>

                  {/* Checklist */}
                  <button className="p-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-left transition group opacity-50 cursor-not-allowed">
                    <CheckSquare className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Checklist</h4>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </button>

                  {/* Budget */}
                  <button className="p-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-left transition group opacity-50 cursor-not-allowed">
                    <Wallet className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Budget</h4>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </button>

                  {/* Guests */}
                  <button className="p-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-left transition group opacity-50 cursor-not-allowed">
                    <UserCircle className="w-8 h-8 text-purple-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Guests</h4>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </button>

                  {/* Seating */}
                  <button className="p-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-left transition group opacity-50 cursor-not-allowed">
                    <Armchair className="w-8 h-8 text-rose-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Seating</h4>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </button>

                  {/* Activity Log */}
                  <button className="p-6 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-left transition group opacity-50 cursor-not-allowed">
                    <BarChart3 className="w-8 h-8 text-amber-600 mb-3" />
                    <h4 className="font-bold text-gray-900 mb-2">Activity Log</h4>
                    <p className="text-sm text-gray-600">Coming soon</p>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Your Role:</strong> {weddings.find(w => w.id === selectedWedding)?.vendor_role}
                    <br />
                    You can view and edit items based on your role permissions. Items you create will be attributed to you.
                  </p>
                </div>
              </div>
            ) : (
              /* Active Planning Tool */
              <div>
                <button
                  onClick={() => setActivePlanningTool(null)}
                  className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  ← Back to Planning Tools
                </button>

                {activePlanningTool === 'timeline' && (
                  <VendorTimeline
                    weddingId={selectedWedding}
                    vendorId={vendorId}
                    vendorRole={weddings.find(w => w.id === selectedWedding)?.vendor_role || 'vendor'}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && profile && (
          <VendorAnalytics vendorId={vendorId} tier={profile.tier} />
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <VendorBookings vendorId={vendorId} />
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <VendorReviews vendorId={vendorId} />
        )}
      </div>
    </div>
  );
}
