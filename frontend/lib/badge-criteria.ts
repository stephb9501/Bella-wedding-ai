/**
 * Badge Criteria System
 *
 * This module defines the criteria for awarding badges to vendors
 * and provides functions to check if a vendor qualifies for each badge.
 */

import { BadgeType } from '@/components/badges/VendorBadge';

export interface VendorData {
  id: string;
  tier: 'free' | 'premium' | 'featured' | 'elite';
  is_verified: boolean;
  average_rating: number;
  review_count: number;
  response_rate?: number;
  avg_response_time_hours?: number;
  featured_until?: string | null;
  certifications?: string[];
  eco_certifications?: string[];
}

export interface BadgeCriteria {
  type: BadgeType;
  name: string;
  description: string;
  check: (vendor: VendorData) => boolean;
  priority: number;
}

/**
 * All badge criteria definitions
 */
export const BADGE_CRITERIA: BadgeCriteria[] = [
  {
    type: 'verified',
    name: 'Verified',
    description: 'Vendor has been verified by admin',
    check: (vendor) => vendor.is_verified === true,
    priority: 1,
  },
  {
    type: 'elite',
    name: 'Elite',
    description: 'Premium tier + verified + top rated (4.5+ stars with 10+ reviews)',
    check: (vendor) =>
      (vendor.tier === 'premium' || vendor.tier === 'elite') &&
      vendor.is_verified &&
      vendor.average_rating >= 4.5 &&
      vendor.review_count >= 10,
    priority: 2,
  },
  {
    type: 'featured',
    name: 'Featured',
    description: 'Currently featured vendor',
    check: (vendor) => {
      if (!vendor.featured_until) return false;
      return new Date(vendor.featured_until) > new Date();
    },
    priority: 3,
  },
  {
    type: 'top_rated',
    name: 'Top Rated',
    description: '4.5+ star rating with at least 10 reviews',
    check: (vendor) =>
      vendor.average_rating >= 4.5 && vendor.review_count >= 10,
    priority: 4,
  },
  {
    type: 'responsive',
    name: 'Responsive',
    description: '90%+ response rate within 24 hours',
    check: (vendor) =>
      (vendor.response_rate ?? 0) >= 90 &&
      (vendor.avg_response_time_hours ?? Infinity) <= 24,
    priority: 5,
  },
  {
    type: 'certified',
    name: 'Certified',
    description: 'Has industry certifications',
    check: (vendor) =>
      Array.isArray(vendor.certifications) && vendor.certifications.length > 0,
    priority: 6,
  },
  {
    type: 'premium',
    name: 'Premium',
    description: 'Premium tier subscription',
    check: (vendor) => vendor.tier === 'premium' || vendor.tier === 'elite',
    priority: 7,
  },
  {
    type: 'eco_friendly',
    name: 'Eco-Friendly',
    description: 'Committed to sustainable practices',
    check: (vendor) =>
      Array.isArray(vendor.eco_certifications) && vendor.eco_certifications.length > 0,
    priority: 8,
  },
];

/**
 * Check which badges a vendor qualifies for
 */
export function getQualifyingBadges(vendor: VendorData): BadgeType[] {
  return BADGE_CRITERIA
    .filter(criteria => criteria.check(vendor))
    .sort((a, b) => a.priority - b.priority)
    .map(criteria => criteria.type);
}

/**
 * Check if a vendor qualifies for a specific badge
 */
export function qualifiesForBadge(vendor: VendorData, badgeType: BadgeType): boolean {
  const criteria = BADGE_CRITERIA.find(c => c.type === badgeType);
  if (!criteria) return false;
  return criteria.check(vendor);
}

/**
 * Get badge criteria by type
 */
export function getBadgeCriteria(badgeType: BadgeType): BadgeCriteria | undefined {
  return BADGE_CRITERIA.find(c => c.type === badgeType);
}

/**
 * Get all available badge types
 */
export function getAllBadgeTypes(): BadgeType[] {
  return BADGE_CRITERIA.map(c => c.type);
}

/**
 * Get badges that can be manually awarded (not auto-awarded)
 */
export function getManuallyAwardableBadges(): BadgeType[] {
  // These badges can be manually awarded by admins
  // Others are auto-awarded based on criteria
  return ['certified', 'eco_friendly', 'premium'];
}

/**
 * Get badges that are auto-awarded based on criteria
 */
export function getAutoAwardedBadges(): BadgeType[] {
  return ['verified', 'elite', 'featured', 'top_rated', 'responsive'];
}

/**
 * Calculate next badge milestones for a vendor
 * Returns suggestions on what the vendor needs to achieve next badges
 */
export function getNextBadgeMilestones(vendor: VendorData): {
  badge: BadgeType;
  name: string;
  requirements: string[];
}[] {
  const milestones: {
    badge: BadgeType;
    name: string;
    requirements: string[];
  }[] = [];

  // Top Rated
  if (!qualifiesForBadge(vendor, 'top_rated')) {
    const requirements: string[] = [];
    if (vendor.average_rating < 4.5) {
      requirements.push(`Increase rating to 4.5+ (currently ${vendor.average_rating.toFixed(2)})`);
    }
    if (vendor.review_count < 10) {
      requirements.push(`Get ${10 - vendor.review_count} more reviews (currently ${vendor.review_count})`);
    }
    milestones.push({
      badge: 'top_rated',
      name: 'Top Rated',
      requirements,
    });
  }

  // Responsive
  if (!qualifiesForBadge(vendor, 'responsive')) {
    const requirements: string[] = [];
    const responseRate = vendor.response_rate ?? 0;
    const responseTime = vendor.avg_response_time_hours ?? 0;

    if (responseRate < 90) {
      requirements.push(`Increase response rate to 90%+ (currently ${responseRate.toFixed(0)}%)`);
    }
    if (responseTime > 24) {
      requirements.push(`Reduce response time to under 24 hours (currently ${responseTime.toFixed(1)}h)`);
    }
    if (requirements.length > 0) {
      milestones.push({
        badge: 'responsive',
        name: 'Responsive',
        requirements,
      });
    }
  }

  // Elite
  if (!qualifiesForBadge(vendor, 'elite')) {
    const requirements: string[] = [];
    if (vendor.tier !== 'premium' && vendor.tier !== 'elite') {
      requirements.push('Upgrade to Premium tier');
    }
    if (!vendor.is_verified) {
      requirements.push('Get verified by admin');
    }
    if (vendor.average_rating < 4.5 || vendor.review_count < 10) {
      requirements.push('Achieve Top Rated status');
    }
    milestones.push({
      badge: 'elite',
      name: 'Elite',
      requirements,
    });
  }

  return milestones;
}

/**
 * Format badge award data for database insertion
 */
export function formatBadgeForAward(
  badgeType: BadgeType,
  metadata?: Record<string, any>,
  expiresInDays?: number
): {
  badge_type: BadgeType;
  metadata: Record<string, any>;
  expires_at: string | null;
} {
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  return {
    badge_type: badgeType,
    metadata: metadata || {},
    expires_at: expiresAt,
  };
}
