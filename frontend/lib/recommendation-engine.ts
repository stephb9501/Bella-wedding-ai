/**
 * AI-Powered Vendor Recommendation Engine
 * Matches vendors with brides based on preferences, budget, style, and more
 */

export interface WeddingPreferences {
  total_budget?: number;
  budget_flexibility?: 'strict' | 'flexible' | 'very_flexible';
  wedding_style?: string[];
  color_scheme?: string[];
  formality_level?: 'casual' | 'semi_formal' | 'formal' | 'black_tie';
  preferred_cities?: string[];
  max_distance_miles?: number;
  outdoor_indoor?: 'outdoor' | 'indoor' | 'both' | 'no_preference';
  venue_priority?: number;
  photographer_priority?: number;
  caterer_priority?: number;
  florist_priority?: number;
  dj_priority?: number;
  guest_count?: number;
  dietary_restrictions?: string[];
  special_requirements?: string;
  must_haves?: string[];
  deal_breakers?: string[];
}

export interface Vendor {
  id: string;
  business_name: string;
  category: string;
  price_range?: number; // 1-4 ($-$$$$)
  average_rating?: number;
  review_count?: number;
  response_rate?: number;
  response_time_hours?: number;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  style_tags?: string[];
  specialties?: string[];
  ideal_for?: string[];
  tier: 'free' | 'basic' | 'pro' | 'premium';
  is_verified?: boolean;
  badges?: Array<{ badge_type: string }>;
  capacity?: number;
  description?: string;
}

export interface RecommendationScore {
  vendor_id: string;
  match_score: number; // 0-100
  confidence_level: 'low' | 'medium' | 'high' | 'very_high';
  budget_match_score: number;
  style_match_score: number;
  location_match_score: number;
  rating_score: number;
  availability_score: number;
  popularity_score: number;
  reason: string;
  match_highlights: string[];
  potential_concerns: string[];
}

/**
 * Calculate Haversine distance between two coordinates
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate budget match score (0-100)
 */
function calculateBudgetScore(
  vendor: Vendor,
  preferences: WeddingPreferences
): number {
  if (!preferences.total_budget || !vendor.price_range) return 50; // neutral score

  // Estimate typical vendor costs as percentage of total budget
  const categoryBudgetMap: Record<string, number> = {
    'Venues': 0.40, // 40% of budget
    'Photographers': 0.10,
    'Videographers': 0.10,
    'Caterers': 0.25,
    'Florists': 0.08,
    'Bakers/Cakes': 0.03,
    'DJs/Bands': 0.08,
    'Hair & Makeup': 0.04,
    'Transportation': 0.03,
    'Planners': 0.12,
    'Officiants': 0.02,
    'Rentals': 0.05,
  };

  const categoryBudget = (preferences.total_budget || 0) * (categoryBudgetMap[vendor.category] || 0.05);

  // Price range mapping to actual costs
  const priceRangeEstimates: Record<number, { min: number; max: number }> = {
    1: { min: 0, max: categoryBudget * 0.5 },
    2: { min: categoryBudget * 0.4, max: categoryBudget * 1.0 },
    3: { min: categoryBudget * 0.8, max: categoryBudget * 1.5 },
    4: { min: categoryBudget * 1.2, max: categoryBudget * 3.0 },
  };

  const vendorPriceRange = priceRangeEstimates[vendor.price_range];

  // Check if vendor is within budget
  if (vendorPriceRange.min <= categoryBudget) {
    if (vendorPriceRange.max <= categoryBudget) {
      return 100; // Well within budget
    } else if (vendorPriceRange.min <= categoryBudget * 1.1) {
      // Slightly over budget
      if (preferences.budget_flexibility === 'very_flexible') return 90;
      if (preferences.budget_flexibility === 'flexible') return 75;
      return 50; // strict budget
    }
  }

  // Over budget
  if (preferences.budget_flexibility === 'very_flexible') return 60;
  if (preferences.budget_flexibility === 'flexible') return 40;
  return 20; // Too expensive for strict budget
}

/**
 * Calculate style match score (0-100)
 */
function calculateStyleScore(
  vendor: Vendor,
  preferences: WeddingPreferences
): number {
  if (!preferences.wedding_style?.length || !vendor.style_tags?.length) {
    return 50; // neutral if no style info
  }

  const matchingStyles = vendor.style_tags.filter(tag =>
    preferences.wedding_style?.some(style =>
      style.toLowerCase() === tag.toLowerCase()
    )
  );

  const matchPercentage = matchingStyles.length / preferences.wedding_style.length;

  // Boost score if vendor has ANY matching styles
  if (matchPercentage === 1.0) return 100;
  if (matchPercentage >= 0.5) return 80 + (matchPercentage - 0.5) * 40;
  if (matchPercentage > 0) return 60 + (matchPercentage * 40);

  return 30; // No matching styles
}

/**
 * Calculate location match score (0-100)
 */
function calculateLocationScore(
  vendor: Vendor,
  preferences: WeddingPreferences,
  brideLocation?: { latitude: number; longitude: number }
): number {
  // Check if vendor is in preferred cities
  if (preferences.preferred_cities?.length && vendor.city) {
    const cityMatch = preferences.preferred_cities.some(
      city => city.toLowerCase() === vendor.city?.toLowerCase()
    );
    if (cityMatch) return 100;
  }

  // Calculate distance if coordinates available
  if (brideLocation && vendor.latitude && vendor.longitude) {
    const distance = calculateDistance(
      brideLocation.latitude,
      brideLocation.longitude,
      vendor.latitude,
      vendor.longitude
    );

    const maxDistance = preferences.max_distance_miles || 50;

    if (distance <= maxDistance * 0.25) return 100; // Very close
    if (distance <= maxDistance * 0.5) return 90;
    if (distance <= maxDistance * 0.75) return 75;
    if (distance <= maxDistance) return 60;
    if (distance <= maxDistance * 1.5) return 40; // Slightly over
    return 20; // Too far
  }

  return 50; // Neutral if no location data
}

/**
 * Calculate rating score (0-100)
 */
function calculateRatingScore(vendor: Vendor): number {
  if (!vendor.average_rating) return 50;

  const rating = vendor.average_rating;
  const reviewCount = vendor.review_count || 0;

  // Base score from rating
  let score = (rating / 5) * 100;

  // Boost based on review count (more reviews = more confidence)
  if (reviewCount >= 50) score = Math.min(100, score + 10);
  else if (reviewCount >= 20) score = Math.min(100, score + 5);
  else if (reviewCount < 5) score = Math.max(0, score - 15); // Penalize few reviews

  return score;
}

/**
 * Calculate availability score (0-100)
 * Higher score for vendors with better response rates and faster response times
 */
function calculateAvailabilityScore(vendor: Vendor): number {
  let score = 50; // Start neutral

  if (vendor.response_rate !== undefined) {
    score = vendor.response_rate; // response_rate is already 0-100
  }

  // Boost for fast response times
  if (vendor.response_time_hours !== undefined) {
    if (vendor.response_time_hours <= 2) score = Math.min(100, score + 20);
    else if (vendor.response_time_hours <= 6) score = Math.min(100, score + 10);
    else if (vendor.response_time_hours <= 24) score = Math.min(100, score + 5);
    else score = Math.max(0, score - 10); // Penalize slow response
  }

  return score;
}

/**
 * Calculate popularity score (0-100)
 * Based on tier, verification, badges
 */
function calculatePopularityScore(vendor: Vendor): number {
  let score = 50;

  // Tier bonuses
  if (vendor.tier === 'premium') score += 30;
  else if (vendor.tier === 'pro') score += 20;
  else if (vendor.tier === 'basic') score += 10;

  // Verification bonus
  if (vendor.is_verified) score += 15;

  // Badge bonuses
  const badgeCount = vendor.badges?.length || 0;
  score += Math.min(20, badgeCount * 5);

  return Math.min(100, score);
}

/**
 * Generate recommendation reason and highlights
 */
function generateRecommendationDetails(
  vendor: Vendor,
  preferences: WeddingPreferences,
  scores: Partial<RecommendationScore>
): {
  reason: string;
  highlights: string[];
  concerns: string[];
} {
  const highlights: string[] = [];
  const concerns: string[] = [];

  // Budget highlights
  if ((scores.budget_match_score || 0) >= 90) {
    highlights.push('Well within your budget');
  } else if ((scores.budget_match_score || 0) <= 40) {
    concerns.push('May be above your budget range');
  }

  // Style highlights
  if ((scores.style_match_score || 0) >= 80) {
    const matchingStyles = vendor.style_tags?.filter(tag =>
      preferences.wedding_style?.some(style =>
        style.toLowerCase() === tag.toLowerCase()
      )
    );
    if (matchingStyles?.length) {
      highlights.push(`Perfect match for ${matchingStyles.slice(0, 2).join(' & ')} style`);
    }
  }

  // Location highlights
  if ((scores.location_match_score || 0) >= 90) {
    highlights.push('Conveniently located near you');
  } else if ((scores.location_match_score || 0) <= 40) {
    concerns.push('Located outside your preferred area');
  }

  // Rating highlights
  if (vendor.average_rating && vendor.average_rating >= 4.8) {
    highlights.push(`Exceptional ${vendor.average_rating.toFixed(1)}★ rating with ${vendor.review_count} reviews`);
  } else if (vendor.average_rating && vendor.average_rating >= 4.5) {
    highlights.push(`Highly rated (${vendor.average_rating.toFixed(1)}★)`);
  } else if (!vendor.review_count || vendor.review_count < 5) {
    concerns.push('Limited customer reviews');
  }

  // Verification highlights
  if (vendor.is_verified) {
    highlights.push('Verified vendor');
  }

  // Badges
  const topBadges = vendor.badges?.filter(b =>
    ['elite', 'top_rated', 'featured', 'responsive'].includes(b.badge_type)
  );
  if (topBadges && topBadges.length > 0) {
    highlights.push(`${topBadges.length} premium badge${topBadges.length > 1 ? 's' : ''}`);
  }

  // Response time
  if (vendor.response_time_hours && vendor.response_time_hours <= 6) {
    highlights.push('Quick to respond (usually within 6 hours)');
  }

  // Generate reason summary
  let reason = '';
  if (scores.match_score && scores.match_score >= 85) {
    reason = `Excellent match based on your ${preferences.wedding_style?.join(', ')} style preferences and budget. `;
  } else if (scores.match_score && scores.match_score >= 70) {
    reason = `Great option for your wedding. `;
  } else {
    reason = `Good choice to consider. `;
  }

  if (highlights.length > 0) {
    reason += highlights[0];
  }

  return {
    reason,
    highlights: highlights.slice(0, 5),
    concerns: concerns.slice(0, 3),
  };
}

/**
 * Calculate overall match score for a vendor
 */
export function calculateVendorMatchScore(
  vendor: Vendor,
  preferences: WeddingPreferences,
  brideLocation?: { latitude: number; longitude: number }
): RecommendationScore {
  // Get category priority (default to 3 if not specified)
  const categoryPriorityMap: Record<string, keyof WeddingPreferences> = {
    'Venues': 'venue_priority',
    'Photographers': 'photographer_priority',
    'Caterers': 'caterer_priority',
    'Florists': 'florist_priority',
    'DJs/Bands': 'dj_priority',
  };

  const priorityKey = categoryPriorityMap[vendor.category];
  const categoryPriority = priorityKey ? (preferences[priorityKey] as number || 3) : 3;

  // Calculate individual scores
  const budgetScore = calculateBudgetScore(vendor, preferences);
  const styleScore = calculateStyleScore(vendor, preferences);
  const locationScore = calculateLocationScore(vendor, preferences, brideLocation);
  const ratingScore = calculateRatingScore(vendor);
  const availabilityScore = calculateAvailabilityScore(vendor);
  const popularityScore = calculatePopularityScore(vendor);

  // Weighted average based on category priority
  // Higher priority = more weight on quality factors (rating, availability)
  const priorityWeight = categoryPriority / 5; // 0.2 to 1.0

  const weights = {
    budget: 0.25,
    style: 0.20,
    location: 0.15,
    rating: 0.15 + (priorityWeight * 0.10), // 0.15-0.25
    availability: 0.10 + (priorityWeight * 0.05), // 0.10-0.15
    popularity: 0.15 - (priorityWeight * 0.05), // 0.15-0.10
  };

  const matchScore =
    budgetScore * weights.budget +
    styleScore * weights.style +
    locationScore * weights.location +
    ratingScore * weights.rating +
    availabilityScore * weights.availability +
    popularityScore * weights.popularity;

  // Determine confidence level
  let confidenceLevel: 'low' | 'medium' | 'high' | 'very_high';
  const hasGoodData = (vendor.review_count || 0) >= 10 && vendor.average_rating && vendor.style_tags?.length;

  if (matchScore >= 85 && hasGoodData) confidenceLevel = 'very_high';
  else if (matchScore >= 75 && hasGoodData) confidenceLevel = 'high';
  else if (matchScore >= 60) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  const details = generateRecommendationDetails(vendor, preferences, {
    budget_match_score: budgetScore,
    style_match_score: styleScore,
    location_match_score: locationScore,
    rating_score: ratingScore,
    availability_score: availabilityScore,
    popularity_score: popularityScore,
    match_score: matchScore,
  });

  return {
    vendor_id: vendor.id,
    match_score: Math.round(matchScore * 100) / 100,
    confidence_level: confidenceLevel,
    budget_match_score: Math.round(budgetScore * 100) / 100,
    style_match_score: Math.round(styleScore * 100) / 100,
    location_match_score: Math.round(locationScore * 100) / 100,
    rating_score: Math.round(ratingScore * 100) / 100,
    availability_score: Math.round(availabilityScore * 100) / 100,
    popularity_score: Math.round(popularityScore * 100) / 100,
    reason: details.reason,
    match_highlights: details.highlights,
    potential_concerns: details.concerns,
  };
}

/**
 * Get top N recommendations for a wedding
 */
export function getTopRecommendations(
  vendors: Vendor[],
  preferences: WeddingPreferences,
  brideLocation?: { latitude: number; longitude: number },
  limit: number = 10
): RecommendationScore[] {
  const scored = vendors
    .map(vendor => calculateVendorMatchScore(vendor, preferences, brideLocation))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);

  return scored;
}
