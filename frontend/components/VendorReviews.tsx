'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ThumbsUp } from 'lucide-react';

interface Review {
  id: string;
  bride_name: string;
  rating: number;
  title: string;
  review_text: string;
  wedding_date: string;
  verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface Props {
  vendorId: string;
}

export function VendorReviews({ vendorId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/vendors/reviews?vendor_id=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.average_rating || 0);
    } catch (err) {
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
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

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    stars: rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Testimonials</h3>

      {/* Overall Rating */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} />
            <p className="text-sm text-gray-600 mt-2">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-12">{dist.stars} stars</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-amber-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${dist.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Quote className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No reviews yet</p>
          <p className="text-sm">
            After completing bookings, couples can leave reviews about your service
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900">{review.bride_name}</h4>
                    {review.verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Verified
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
                <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
              )}

              <p className="text-gray-700 mb-3">{review.review_text}</p>

              <div className="flex items-center justify-between text-sm">
                <p className="text-gray-500">
                  Wedding: {new Date(review.wedding_date).toLocaleDateString()}
                </p>
                <button className="flex items-center gap-1 text-gray-600 hover:text-champagne-600">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful_count})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {reviews.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Respond to reviews to show you value feedback and engage with
            your clients. Premium and above tiers can respond to reviews.
          </p>
        </div>
      )}
    </div>
  );
}
