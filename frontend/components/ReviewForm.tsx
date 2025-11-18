'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';

interface Props {
  userId: string;
  vendorId: string;
  vendorName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ userId, vendorId, vendorName, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          vendor_id: vendorId,
          rating,
          review_text: reviewText.trim() || null,
          service_type: serviceType || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      // Reset form
      setRating(0);
      setReviewText('');
      setServiceType('');

      onSuccess?.();
      alert('Review submitted successfully!');
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
          Review {vendorName}
        </h3>
        <p className="text-gray-600">Share your experience with other brides</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Overall Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {rating === 0 && 'Select a rating'}
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </p>
      </div>

      {/* Service Type */}
      <div>
        <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
          Service Type <span className="text-gray-400">(optional)</span>
        </label>
        <select
          id="serviceType"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
        >
          <option value="">Select service type</option>
          <option value="photography">Photography</option>
          <option value="videography">Videography</option>
          <option value="catering">Catering</option>
          <option value="venue">Venue</option>
          <option value="florist">Florist</option>
          <option value="music">Music/DJ</option>
          <option value="planning">Wedding Planning</option>
          <option value="decor">Decor</option>
          <option value="hair_makeup">Hair & Makeup</option>
          <option value="transportation">Transportation</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
          placeholder="Tell us about your experience with this vendor..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {reviewText.length}/500 characters
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full py-3 px-4 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}
