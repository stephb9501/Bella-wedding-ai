'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Star, Quote, MessageCircle, Flag, ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Review {
  id: string;
  vendor_id: string;
  bride_name: string;
  rating: number;
  title: string | null;
  review_text: string;
  response: string | null;
  wedding_date: string | null;
  verified: boolean;
  helpful_count: number;
  flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
}

export default function ReviewsAndRatings() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showFlagged, setShowFlagged] = useState(false);

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
      fetchReviews();
    }
  }, [vendorId]);

  const fetchReviews = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('vendor_reviews')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('vendor_reviews')
        .update({
          response: responseText,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReview.id);

      if (error) throw error;

      setResponseText('');
      setSelectedReview(null);
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const flagReview = async (reviewId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('vendor_reviews')
        .update({
          flagged: true,
          flag_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReviews();
      alert('Review flagged for admin review');
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Failed to flag review');
    }
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRating !== 'all' && review.rating !== filterRating) return false;
    if (!showFlagged && review.flagged) return false;
    return true;
  });

  const stats = {
    total: reviews.length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    fiveStars: reviews.filter(r => r.rating === 5).length,
    fourStars: reviews.filter(r => r.rating === 4).length,
    threeStars: reviews.filter(r => r.rating === 3).length,
    twoStars: reviews.filter(r => r.rating === 2).length,
    oneStar: reviews.filter(r => r.rating === 1).length,
    responded: reviews.filter(r => r.response !== null).length,
    flagged: reviews.filter(r => r.flagged).length
  };

  const ratingDistribution = [
    { stars: 5, count: stats.fiveStars },
    { stars: 4, count: stats.fourStars },
    { stars: 3, count: stats.threeStars },
    { stars: 2, count: stats.twoStars },
    { stars: 1, count: stats.oneStar }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

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
              <h1 className="text-xl font-serif font-bold text-gray-900">Reviews & Ratings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overall Rating Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {stats.avgRating}
              </div>
              <StarRating rating={Math.round(parseFloat(stats.avgRating))} />
              <p className="text-sm text-gray-600 mt-2">
                Based on {stats.total} review{stats.total !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2 col-span-2">
              <h3 className="font-bold text-gray-900 mb-3">Rating Distribution</h3>
              {ratingDistribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-16 flex items-center gap-1">
                    {dist.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${stats.total > 0 ? (dist.count / stats.total) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {dist.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-amber-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.responded}</div>
              <div className="text-sm text-gray-600">Responded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? ((stats.responded / stats.total) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.flagged}</div>
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
              <button
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  filterRating === 'all' ? 'bg-champagne-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                    filterRating === rating ? 'bg-champagne-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating} <Star className="w-3 h-3" />
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <input
                type="checkbox"
                id="showFlagged"
                checked={showFlagged}
                onChange={(e) => setShowFlagged(e.target.checked)}
                className="rounded text-champagne-600"
              />
              <label htmlFor="showFlagged" className="text-sm text-gray-700">
                Show flagged reviews
              </label>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Quote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
              </h3>
              <p className="text-gray-600">
                {reviews.length === 0
                  ? 'After completing bookings, clients can leave reviews about your service'
                  : 'Try adjusting your filters to see more reviews'
                }
              </p>
            </div>
          ) : (
            filteredReviews.map(review => (
              <div
                key={review.id}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${
                  review.flagged ? 'border-2 border-red-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{review.bride_name}</h3>
                      {review.verified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {review.flagged && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          Flagged
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}

                <p className="text-gray-700 mb-4">{review.review_text}</p>

                {review.wedding_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    Wedding: {new Date(review.wedding_date).toLocaleDateString()}
                  </div>
                )}

                {/* Vendor Response */}
                {review.response ? (
                  <div className="bg-champagne-50 rounded-lg p-4 mb-4 border-l-4 border-champagne-400">
                    <p className="text-sm font-medium text-champagne-700 mb-2">Your Response:</p>
                    <p className="text-gray-800">{review.response}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 italic">You haven't responded to this review yet</p>
                  </div>
                )}

                {/* Flagged Reason */}
                {review.flagged && review.flag_reason && (
                  <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>Flag Reason:</strong> {review.flag_reason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!review.response && (
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setResponseText('');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Respond
                    </button>
                  )}

                  {review.response && (
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setResponseText(review.response || '');
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Edit Response
                    </button>
                  )}

                  {!review.flagged && (
                    <button
                      onClick={() => {
                        const reason = prompt('Why are you flagging this review? (spam, inappropriate, fake, etc.)');
                        if (reason) flagReview(review.id, reason);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      Flag as Inappropriate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips */}
        {reviews.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h4 className="font-bold text-blue-900 mb-2">Tips for Responding to Reviews</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Thank the client for their review and feedback</li>
              <li>• Address any specific points they mentioned</li>
              <li>• Keep responses professional and courteous, even for negative reviews</li>
              <li>• Respond within 24-48 hours when possible</li>
              <li>• Use responses as an opportunity to showcase your customer service</li>
            </ul>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedReview.response ? 'Edit Response' : 'Respond to Review'}
                </h2>
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Review Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-900">{selectedReview.bride_name}</p>
                  <StarRating rating={selectedReview.rating} />
                </div>
                {selectedReview.title && (
                  <p className="font-semibold text-gray-800 mb-1">{selectedReview.title}</p>
                )}
                <p className="text-gray-700">{selectedReview.review_text}</p>
              </div>

              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitResponse}
                  disabled={!responseText.trim() || submitting}
                  className="flex-1 px-6 py-3 bg-champagne-600 hover:bg-champagne-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
                <button
                  onClick={() => {
                    setSelectedReview(null);
                    setResponseText('');
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
