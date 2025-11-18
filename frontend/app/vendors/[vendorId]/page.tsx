'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Heart, MapPin, Star, Mail, Phone, ArrowLeft, MessageCircle, Crown, Zap } from 'lucide-react';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  average_rating: number | null;
  review_count: number;
  email: string;
  phone: string;
  first_photo_url: string | null;
}

interface Photo {
  id: string;
  photo_url: string;
  file_name: string;
  created_at: string;
}

const TIER_INFO = {
  free: { name: 'Free', icon: Star, color: 'text-gray-600', bg: 'bg-gray-100' },
  premium: { name: 'Premium', icon: Star, color: 'text-blue-600', bg: 'bg-blue-100' },
  featured: { name: 'Featured', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' },
  elite: { name: 'Elite', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
};

export default function VendorProfile() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params?.vendorId as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number>(0);

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  const fetchVendorData = async () => {
    try {
      // Fetch vendor details
      const vendorResponse = await fetch(`/api/vendors?id=${vendorId}`);
      if (!vendorResponse.ok) throw new Error('Failed to fetch vendor');
      const vendorData = await vendorResponse.json();
      setVendor(vendorData);

      // Fetch photos
      const photosResponse = await fetch(`/api/vendors/photos?vendor_id=${vendorId}`);
      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        setPhotos(photosData || []);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <button
            onClick={() => router.push('/vendors')}
            className="px-6 py-3 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  const tierInfo = TIER_INFO[vendor.tier];
  const TierIcon = tierInfo.icon;
  const mainPhoto = photos[selectedPhoto] || vendor.first_photo_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/vendors')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Vendors
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Main Photo */}
              <div className="h-96 bg-gradient-to-br from-champagne-200 to-rose-200 relative">
                {mainPhoto ? (
                  <Image
                    src={typeof mainPhoto === 'string' ? mainPhoto : mainPhoto.photo_url}
                    alt={vendor.business_name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Heart className="w-24 h-24 opacity-30" />
                  </div>
                )}
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedPhoto === index ? 'border-champagne-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={photo.photo_url}
                        alt={`Photo ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {vendor.description || 'Professional wedding vendor dedicated to making your special day perfect.'}
              </p>
            </div>

            {/* Reviews Section Placeholder */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              {vendor.review_count > 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{vendor.review_count} reviews coming soon</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews yet</p>
                  <p className="text-sm mt-2">Be the first to book and leave a review!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{vendor.business_name}</h1>
                <div className={`flex items-center gap-1 px-3 py-1 ${tierInfo.bg} rounded-full`}>
                  <TierIcon className={`w-4 h-4 ${tierInfo.color}`} />
                  <span className={`text-sm font-medium ${tierInfo.color}`}>{tierInfo.name}</span>
                </div>
              </div>

              <p className="text-lg text-champagne-700 font-medium mb-2">{vendor.category}</p>

              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{vendor.city}, {vendor.state}</span>
              </div>

              {/* Rating */}
              {vendor.average_rating !== null ? (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(vendor.average_rating!)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{vendor.average_rating.toFixed(1)}</span>
                  <span className="text-gray-500">({vendor.review_count} reviews)</span>
                </div>
              ) : (
                <div className="mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    New Vendor
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Request Booking
                </button>

                <a
                  href={`mailto:${vendor.email}`}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>

                {vendor.phone && (
                  <a
                    href={`tel:${vendor.phone}`}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call
                  </a>
                )}

                <button className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  Save Vendor
                </button>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{vendor.profile_views || 0}</div>
                    <div className="text-sm text-gray-500">Profile Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{vendor.photo_count}</div>
                    <div className="text-sm text-gray-500">Photos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal - Reuse from vendors page */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Booking</h3>
              <p className="text-gray-600 mb-6">
                Contact {vendor.business_name} directly using the contact buttons above, or send a booking request through our platform.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    router.push('/vendors');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-bold rounded-lg transition"
                >
                  Back to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
