'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ThumbsUp, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import { DisplayStarRating } from './StarRating';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title?: string;
  review_text?: string;
  verified_booking: boolean;
  helpful_count: number;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
}

interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

interface Props {
  vendorId: string;
  userId?: string; // Optional: to show helpful button state
  showWriteButton?: boolean;
  onWriteReview?: () => void;
}

export function VendorReviews({ vendorId, userId, showWriteButton = false, onWriteReview }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  const limit = 10;

  useEffect(() => {
    fetchReviews(true);
  }, [vendorId, sortBy]);

  const fetchReviews = async (reset = false) => {
    try {
      const currentPage = reset ? 0 : page;
      const offset = currentPage * limit;

      const response = await fetch(
        `/api/vendors/reviews?vendor_id=${vendorId}&sort=${sortBy}&limit=${limit}&offset=${offset}`
      );
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();

      if (reset) {
        setReviews(data.reviews || []);
        setPage(0);
      } else {
        setReviews((prev) => [...prev, ...(data.reviews || [])]);
      }

      setAverageRating(data.average_rating || 0);
      setTotalReviews(data.total_reviews || 0);
      setRatingDistribution(data.rating_distribution || []);
      setHasMore(data.reviews?.length === limit);
    } catch (err) {
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
    fetchReviews(false);
  };

  const handleSortChange = (newSort: 'recent' | 'rating' | 'helpful') => {
    setSortBy(newSort);
    setShowSortMenu(false);
  };

  const handleHelpful = async (reviewId: string) => {
    if (!userId) {
      alert('Please sign in to mark reviews as helpful');
      return;
    }

    try {
      const response = await fetch('/api/vendors/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId, user_id: userId }),
      });

      if (!response.ok) throw new Error('Failed to vote');

      const data = await response.json();

      // Update local state
      setReviews((prev) =>
        prev.map((review) => {
          if (review.id === reviewId) {
            return {
              ...review,
              helpful_count:
                data.action === 'added'
                  ? review.helpful_count + 1
                  : review.helpful_count - 1,
            };
          }
          return review;
        })
      );

      // Update voted set
      if (data.action === 'added') {
        setVotedReviews((prev) => new Set(prev).add(reviewId));
      } else {
        setVotedReviews((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Helpful vote error:', err);
    }
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating':
        return 'Highest Rated';
      case 'helpful':
        return 'Most Helpful';
      default:
        return 'Most Recent';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h3>
        {showWriteButton && onWriteReview && (
          <button
            onClick={onWriteReview}
            className="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold rounded-lg transition shadow-md"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Overall Rating */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center md:text-left">
            <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center md:justify-start">
              <DisplayStarRating rating={averageRating} size="lg" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-12 sm:w-16">{dist.stars} stars</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3">
                  <div
                    className="bg-amber-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 sm:w-12 text-right">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {reviews.length} of {totalReviews} reviews
          </p>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              <Filter className="w-4 h-4" />
              {getSortLabel()}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleSortChange('recent')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Most Recent
                </button>
                <button
                  onClick={() => handleSortChange('rating')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Highest Rated
                </button>
                <button
                  onClick={() => handleSortChange('helpful')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Most Helpful
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Quote className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No reviews yet</p>
          <p className="text-sm">
            Be the first to share your experience with this vendor
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-gray-900">
                        {review.users?.full_name || 'Anonymous'}
                      </h4>
                      {review.verified_booking && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Booking
                        </span>
                      )}
                    </div>
                    <DisplayStarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>

                {review.title && (
                  <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                )}

                {review.review_text && (
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.review_text}</p>
                )}

                <div className="flex items-center justify-end text-sm">
                  <button
                    onClick={() => handleHelpful(review.id)}
                    disabled={!userId}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition ${
                      votedReviews.has(review.id)
                        ? 'bg-rose-100 text-rose-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${votedReviews.has(review.id) ? 'fill-current' : ''}`} />
                    Helpful ({review.helpful_count})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
