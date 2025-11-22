'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { InteractiveStarRating } from './StarRating';

interface WriteReviewProps {
  vendorId: string;
  vendorName: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  existingReview?: {
    id: string;
    rating: number;
    title?: string;
    review_text?: string;
  };
}

export function WriteReview({
  vendorId,
  vendorName,
  userId,
  onSuccess,
  onCancel,
  existingReview,
}: WriteReviewProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const maxTitleLength = 100;
  const maxReviewLength = 1000;

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      let response;

      if (isEditing) {
        // Update existing review
        response = await fetch('/api/vendors/reviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_id: existingReview.id,
            user_id: userId,
            rating,
            title: title.trim() || null,
            review_text: reviewText.trim() || null,
          }),
        });
      } else {
        // Create new review
        response = await fetch('/api/vendors/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            vendor_id: vendorId,
            rating,
            title: title.trim() || null,
            review_text: reviewText.trim() || null,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      setSuccess(true);

      // Reset form if creating new review
      if (!isEditing) {
        setRating(0);
        setTitle('');
        setReviewText('');
      }

      // Call success callback after a brief delay to show success message
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Select a rating';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? `Update your review for ${vendorName}` : `Share your experience with ${vendorName}`}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">
            {isEditing ? 'Review updated successfully!' : 'Thank you for your review!'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <InteractiveStarRating rating={rating} onChange={setRating} size="xl" />
            <span className={`text-lg font-medium ${rating > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
              {getRatingLabel(rating)}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-semibold text-gray-900 mb-2">
            Review Title <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
            placeholder="Summarize your experience in a few words"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
            maxLength={maxTitleLength}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {title.length}/{maxTitleLength} characters
          </p>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-text" className="block text-sm font-semibold text-gray-900 mb-2">
            Your Review <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, maxReviewLength))}
            rows={6}
            placeholder="Tell us about your experience. What did you love? What could be improved?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition resize-none"
            maxLength={maxReviewLength}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {reviewText.length}/{maxReviewLength} characters
          </p>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">Review Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be honest and constructive in your feedback</li>
            <li>• Focus on your personal experience</li>
            <li>• Avoid offensive language or personal attacks</li>
            <li>• Include specific details to help other couples</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || rating === 0 || success}
            className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditing ? 'Updating...' : 'Submitting...'}
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {isEditing ? 'Updated!' : 'Submitted!'}
              </>
            ) : (
              <>{isEditing ? 'Update Review' : 'Submit Review'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
