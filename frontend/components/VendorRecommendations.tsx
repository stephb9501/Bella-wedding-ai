'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RecommendationScore } from '@/lib/recommendation-engine';
import { BadgeGrid } from './badges/BadgeGrid';

interface VendorRecommendationsProps {
  weddingId: string;
  category?: string;
  limit?: number;
  onNeedPreferences?: () => void;
}

interface EnrichedRecommendation extends RecommendationScore {
  vendor: any;
}

export default function VendorRecommendations({
  weddingId,
  category,
  limit = 10,
  onNeedPreferences,
}: VendorRecommendationsProps) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<EnrichedRecommendation[]>([]);
  const [hasPreferences, setHasPreferences] = useState(true);
  const [message, setMessage] = useState('');
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [weddingId, category]);

  const fetchRecommendations = async (refresh = false) => {
    try {
      setLoading(true);
      let url = `/api/recommendations?wedding_id=${weddingId}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      if (refresh) url += '&refresh=true';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch recommendations');

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setHasPreferences(data.has_preferences !== false);
      setMessage(data.message || '');
      setFromCache(data.from_cache === true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setMessage('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async (vendorId: string, interested: boolean) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedding_id: weddingId,
          vendor_id: vendorId,
          interested,
        }),
      });

      // Update local state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.vendor_id === vendorId
            ? { ...rec, interested }
            : rec
        )
      );

      // Track interaction
      await fetch('/api/vendor-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          wedding_id: weddingId,
          interaction_type: interested ? 'save' : 'dismiss',
        }),
      });
    } catch (error) {
      console.error('Error updating interest:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!hasPreferences) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Let's Find Your Perfect Vendors!
          </h3>
          <p className="text-gray-600 mb-6">
            To get personalized recommendations, please tell us about your wedding preferences first.
          </p>
          <button
            onClick={onNeedPreferences}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            Set Your Preferences
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <div className="max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {message || 'No Recommendations Yet'}
          </h3>
          <p className="text-gray-600">
            We're working on finding the perfect vendors for you. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {category ? `${category} Recommendations` : 'Recommended for You'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {fromCache && '✓ '}
            Personalized matches based on your preferences
            {fromCache && ' (cached)'}
          </p>
        </div>
        <button
          onClick={() => fetchRecommendations(true)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.vendor_id}
            recommendation={rec}
            onInterest={handleInterest}
          />
        ))}
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: EnrichedRecommendation;
  onInterest: (vendorId: string, interested: boolean) => void;
}

function RecommendationCard({ recommendation, onInterest }: RecommendationCardProps) {
  const vendor = recommendation.vendor;
  const [expanded, setExpanded] = useState(false);

  if (!vendor) return null;

  // Match score color
  const scoreColor =
    recommendation.match_score >= 85
      ? 'bg-green-100 text-green-800'
      : recommendation.match_score >= 70
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800';

  // Confidence badge
  const confidenceColor =
    recommendation.confidence_level === 'very_high'
      ? 'bg-green-50 text-green-700'
      : recommendation.confidence_level === 'high'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-gray-50 text-gray-700';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link
              href={`/vendors/${vendor.id}`}
              className="text-xl font-bold text-gray-900 hover:text-rose-600 transition-colors"
            >
              {vendor.business_name}
            </Link>
            <p className="text-sm text-gray-600">{vendor.category}</p>
          </div>

          {/* Match Score */}
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${scoreColor}`}>
            {Math.round(recommendation.match_score)}% Match
          </div>
        </div>

        {/* Badges */}
        {vendor.badges && vendor.badges.length > 0 && (
          <div className="mb-4">
            <BadgeGrid badges={vendor.badges.map((b: any) => b.badge_type)} size="sm" />
          </div>
        )}

        {/* Recommendation Reason */}
        <p className="text-gray-700 mb-4">{recommendation.reason}</p>

        {/* Match Highlights */}
        {recommendation.match_highlights.length > 0 && (
          <div className="space-y-2 mb-4">
            {recommendation.match_highlights.slice(0, expanded ? undefined : 3).map((highlight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        )}

        {/* Concerns */}
        {expanded && recommendation.potential_concerns.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700">Things to Consider:</p>
            {recommendation.potential_concerns.map((concern, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-0.5">⚠</span>
                <span className="text-gray-600">{concern}</span>
              </div>
            ))}
          </div>
        )}

        {/* Expand/Collapse for score breakdown */}
        {expanded && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-3">Match Breakdown:</p>
            {[
              { label: 'Budget Match', score: recommendation.budget_match_score },
              { label: 'Style Match', score: recommendation.style_match_score },
              { label: 'Location Match', score: recommendation.location_match_score },
              { label: 'Rating', score: recommendation.rating_score },
              { label: 'Availability', score: recommendation.availability_score },
              { label: 'Popularity', score: recommendation.popularity_score },
            ].map(({ label, score }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-28">{label}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-rose-600 h-2 rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-10 text-right">
                  {Math.round(score)}%
                </span>
              </div>
            ))}
            <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${confidenceColor}`}>
              Confidence: {recommendation.confidence_level.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        )}

        {/* Toggle Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-rose-600 hover:text-rose-700 font-medium mb-4"
        >
          {expanded ? '▼ Hide Details' : '▶ View Match Details'}
        </button>

        {/* Vendor Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {vendor.city && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{vendor.city}, {vendor.state}</span>
            </div>
          )}
          {vendor.average_rating && (
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{vendor.average_rating.toFixed(1)} ({vendor.review_count} reviews)</span>
            </div>
          )}
          {vendor.price_range && (
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>{'$'.repeat(vendor.price_range)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/vendors/${vendor.id}`}
            className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg text-center font-medium hover:bg-rose-700 transition-colors"
          >
            View Profile
          </Link>
          <button
            onClick={() => onInterest(vendor.id, true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              recommendation.interested === true
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Save to favorites"
          >
            {recommendation.interested === true ? '❤️ Saved' : '🤍 Save'}
          </button>
          <button
            onClick={() => onInterest(vendor.id, false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            title="Not interested"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
