'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import {
  Heart, Star, MapPin, Phone, Mail, Globe, MessageCircle, Share2, Calendar,
  CheckCircle, ThumbsUp, Award, Verified, ChevronLeft, Crown, Sparkles, DollarSign
} from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string;
  bride_name: string;
  rating: number;
  review_title: string;
  review_text: string;
  would_recommend: boolean;
  value_rating: number;
  service_rating: number;
  quality_rating: number;
  verified_client: boolean;
  wedding_date: string;
  helpful_count: number;
  vendor_response?: string;
  created_at: string;
}

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  description: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  website?: string;
  premium_tier: string;
  is_premium: boolean;
  is_featured: boolean;
  verified_badge: boolean;
  average_rating: number;
  total_reviews: number;
  starting_price?: number;
  profile_video_url?: string;
  gallery_images: string[];
  business_hours?: any;
  social_media?: any;
  awards_certifications: string[];
  response_time_hours?: number;
}

export default function VendorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user } = useAuth();
  const vendorId = params?.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      // In real app, fetch from API
      // Mock data for demo
      setVendor({
        id: vendorId,
        business_name: 'Sarah\'s Photography Studio',
        category: 'Photography',
        description: 'Award-winning wedding photographer specializing in natural, candid moments. With over 10 years of experience capturing love stories across California, we pride ourselves on creating timeless memories that you\'ll cherish forever. Our style blends photojournalism with fine art to tell your unique story.',
        city: 'Los Angeles',
        state: 'CA',
        email: 'hello@sarahsphotography.com',
        phone: '(555) 123-4567',
        website: 'https://sarahsphotography.com',
        premium_tier: 'gold',
        is_premium: true,
        is_featured: true,
        verified_badge: true,
        average_rating: 4.8,
        total_reviews: 47,
        starting_price: 3500,
        gallery_images: [],
        awards_certifications: [
          'Best Wedding Photographer - LA Magazine 2024',
          'Featured in The Knot Hall of Fame',
          'WeddingWire Couples\' Choice Award 2023-2024'
        ],
        response_time_hours: 2,
        business_hours: {
          monday: '9 AM - 6 PM',
          tuesday: '9 AM - 6 PM',
          wednesday: '9 AM - 6 PM',
          thursday: '9 AM - 6 PM',
          friday: '9 AM - 6 PM',
          saturday: 'By Appointment',
          sunday: 'Closed'
        },
        social_media: {
          instagram: '@sarahsphotography',
          facebook: 'SarahsPhotographyStudio'
        }
      });

      // Mock reviews
      setReviews([
        {
          id: '1',
          bride_name: 'Emily Johnson',
          rating: 5,
          review_title: 'Absolutely Perfect!',
          review_text: 'Sarah captured our wedding day beautifully! The photos are stunning and truly tell the story of our day. She made us feel so comfortable and the whole experience was amazing. We couldn\'t be happier with the results. Every single photo is a work of art!',
          would_recommend: true,
          value_rating: 5,
          service_rating: 5,
          quality_rating: 5,
          verified_client: true,
          wedding_date: '2024-09-15',
          helpful_count: 24,
          vendor_response: 'Thank you so much Emily! It was an absolute joy capturing your beautiful day. Wishing you and James a lifetime of happiness!',
          created_at: '2024-09-20'
        },
        {
          id: '2',
          bride_name: 'Rachel Martinez',
          rating: 5,
          review_title: 'Dream photographer!',
          review_text: 'We are so grateful to have found Sarah! She went above and beyond to make sure we got all the shots we wanted. Very professional, creative, and easy to work with. The photos came out even better than we imagined!',
          would_recommend: true,
          value_rating: 5,
          service_rating: 5,
          quality_rating: 5,
          verified_client: true,
          wedding_date: '2024-07-20',
          helpful_count: 18,
          created_at: '2024-07-25'
        },
        {
          id: '3',
          bride_name: 'Amanda Chen',
          rating: 5,
          review_title: 'Worth Every Penny',
          review_text: 'Initially thought the price was a bit high, but after seeing our photos, I understand why. The quality is exceptional and Sarah\'s eye for detail is incredible. She captured moments we didn\'t even know happened!',
          would_recommend: true,
          value_rating: 4,
          service_rating: 5,
          quality_rating: 5,
          verified_client: true,
          wedding_date: '2024-06-08',
          helpful_count: 31,
          created_at: '2024-06-15'
        },
        {
          id: '4',
          bride_name: 'Jessica Taylor',
          rating: 4,
          review_title: 'Great Experience',
          review_text: 'Sarah did a fantastic job at our wedding. The photos are beautiful and she was very organized on the day. Only minor note is that delivery took a bit longer than expected, but the final product was worth the wait!',
          would_recommend: true,
          value_rating: 4,
          service_rating: 4,
          quality_rating: 5,
          verified_client: true,
          wedding_date: '2024-05-12',
          helpful_count: 12,
          created_at: '2024-05-20'
        }
      ]);
    } catch (error) {
      console.error('Error loading vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // In real app, send message via API
    alert(`✅ Message sent to ${vendor?.business_name}!\n\nThey typically respond within ${vendor?.response_time_hours} hours.`);
    setShowContactForm(false);
    setContactMessage('');
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    return 0;
  });

  const renderStars = (rating: number, size: string = 'w-5 h-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  const ratingBreakdown = [
    { stars: 5, count: 38, percentage: 81 },
    { stars: 4, count: 7, percentage: 15 },
    { stars: 3, count: 2, percentage: 4 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-champagne-700 hover:text-champagne-900 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Vendors
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-champagne-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-serif text-champagne-900">{vendor.business_name}</h1>
                {vendor.verified_badge && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    <Verified className="w-4 h-4" />
                    Verified
                  </div>
                )}
                {vendor.is_featured && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    <Crown className="w-4 h-4" />
                    Featured
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-champagne-600 mb-4">
                <span className="font-medium text-champagne-800">{vendor.category}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vendor.city}, {vendor.state}
                </div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(vendor.average_rating))}
                  <span className="text-2xl font-bold text-champagne-900">{vendor.average_rating}</span>
                  <span className="text-champagne-600">({vendor.total_reviews} reviews)</span>
                </div>
                {vendor.response_time_hours && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <Sparkles className="w-4 h-4" />
                    Responds in ~{vendor.response_time_hours} hours
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowContactForm(true)}
                className="px-6 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Vendor
              </button>
              <button className="px-6 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg font-medium hover:border-champagne-400 transition-colors flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Save
              </button>
              <button className="px-6 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg font-medium hover:border-champagne-400 transition-colors flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-serif text-champagne-900 mb-4">About</h2>
              <p className="text-champagne-700 leading-relaxed">{vendor.description}</p>
            </div>

            {/* Awards & Certifications */}
            {vendor.awards_certifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-serif text-champagne-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-600" />
                  Awards & Recognition
                </h2>
                <ul className="space-y-3">
                  {vendor.awards_certifications.map((award, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-champagne-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{award}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-champagne-900">Reviews ({vendor.total_reviews})</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>

              {/* Rating Breakdown */}
              <div className="bg-champagne-50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-champagne-900 mb-2">{vendor.average_rating}</div>
                    {renderStars(Math.round(vendor.average_rating), 'w-6 h-6')}
                    <div className="text-champagne-600 mt-2">{vendor.total_reviews} reviews</div>
                  </div>
                  <div className="space-y-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.stars} className="flex items-center gap-3">
                        <span className="text-sm text-champagne-700 w-6">{item.stars}★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-champagne-600 w-12 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {sortedReviews.map((review) => (
                  <div key={review.id} className="border-b border-champagne-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-champagne-900">{review.bride_name}</span>
                          {review.verified_client && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Verified Client
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-champagne-600">
                          Wedding: {new Date(review.wedding_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-sm text-champagne-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mb-3">{renderStars(review.rating, 'w-4 h-4')}</div>

                    <h3 className="font-semibold text-champagne-900 mb-2">{review.review_title}</h3>
                    <p className="text-champagne-700 leading-relaxed mb-4">{review.review_text}</p>

                    {/* Sub-ratings */}
                    <div className="flex gap-6 mb-4 text-sm">
                      <div>
                        <span className="text-champagne-600">Quality:</span>
                        <span className="ml-2 font-semibold text-champagne-900">{review.quality_rating}/5</span>
                      </div>
                      <div>
                        <span className="text-champagne-600">Service:</span>
                        <span className="ml-2 font-semibold text-champagne-900">{review.service_rating}/5</span>
                      </div>
                      <div>
                        <span className="text-champagne-600">Value:</span>
                        <span className="ml-2 font-semibold text-champagne-900">{review.value_rating}/5</span>
                      </div>
                    </div>

                    {/* Vendor Response */}
                    {review.vendor_response && (
                      <div className="bg-blue-50 border-l-4 border-blue-600 rounded p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">Response from {vendor.business_name}</span>
                        </div>
                        <p className="text-blue-800 text-sm">{review.vendor_response}</p>
                      </div>
                    )}

                    {/* Helpful Button */}
                    <button className="flex items-center gap-2 text-sm text-champagne-600 hover:text-champagne-800 mt-4">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful_count})
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="font-semibold text-champagne-900 mb-4">Pricing</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-champagne-900">${vendor.starting_price?.toLocaleString()}</div>
                <div className="text-sm text-champagne-600">Starting price</div>
              </div>
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 transition-colors"
              >
                Request Quote
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-champagne-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 text-champagne-700 hover:text-champagne-900">
                  <Phone className="w-5 h-5 text-champagne-600" />
                  <span>{vendor.phone}</span>
                </a>
                <a href={`mailto:${vendor.email}`} className="flex items-center gap-3 text-champagne-700 hover:text-champagne-900">
                  <Mail className="w-5 h-5 text-champagne-600" />
                  <span className="text-sm">{vendor.email}</span>
                </a>
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-champagne-700 hover:text-champagne-900">
                    <Globe className="w-5 h-5 text-champagne-600" />
                    <span className="text-sm">Visit Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Business Hours */}
            {vendor.business_hours && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-champagne-900 mb-4">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(vendor.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-champagne-700 capitalize">{day}</span>
                      <span className="text-champagne-900 font-medium">{hours as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif text-champagne-900">Contact {vendor.business_name}</h3>
              <button onClick={() => setShowContactForm(false)}>
                <MessageCircle className="w-6 h-6 text-champagne-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-champagne-900 mb-2">Your Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder={`Hi! I'm interested in your ${vendor.category.toLowerCase()} services for my wedding...`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg font-medium hover:border-champagne-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContact}
                  disabled={!contactMessage.trim()}
                  className="flex-1 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 disabled:opacity-50"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
