// Geolocation utilities for ZIP code-based searches

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles (use 6371 for kilometers)
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get coordinates from ZIP code using geocoding API
 * This is a simple implementation using zipcodebase.com free tier (10k requests/month)
 * Alternative: Google Maps Geocoding API
 */
export async function getCoordinatesFromZip(
  zipCode: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Option 1: Use zipcodebase.com (free tier: 10k/month)
    // Sign up at https://zipcodebase.com for API key
    const apiKey = process.env.NEXT_PUBLIC_ZIPCODE_API_KEY;

    if (!apiKey) {
      console.warn('ZIP code API key not configured');
      return null;
    }

    const response = await fetch(
      `https://app.zipcodebase.com/api/v1/search?codes=${zipCode}&country=us`,
      {
        headers: {
          'apikey': apiKey,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.results?.[zipCode]?.[0];

    if (result) {
      return {
        lat: parseFloat(result.latitude),
        lng: parseFloat(result.longitude),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching ZIP coordinates:', error);
    return null;
  }
}

/**
 * Alternative: Use a local ZIP code database (no API calls needed)
 * This is more reliable but requires ~42k ZIP codes in your database
 * You can download free ZIP database from: https://www.unitedstateszipcodes.org/
 */
export async function getCoordinatesFromZipLocal(
  zipCode: string
): Promise<{ lat: number; lng: number } | null> {
  // TODO: Query your local zip_codes table
  // Example SQL: SELECT latitude, longitude FROM zip_codes WHERE zip = $1
  // For now, return null - implement this when you add zip_codes table
  return null;
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 1) return '< 1 mi';
  if (miles > 100) return '100+ mi';
  return `${miles} mi`;
}

/**
 * Sort vendors by distance
 */
export function sortByDistance<T extends { distance?: number; tier: string }>(
  vendors: T[]
): T[] {
  // Sort by tier first, then by distance within each tier
  const tierOrder = { elite: 4, featured: 3, premium: 2, free: 1 };

  return vendors.sort((a, b) => {
    const tierDiff = (tierOrder[b.tier as keyof typeof tierOrder] || 0) -
                     (tierOrder[a.tier as keyof typeof tierOrder] || 0);

    // If same tier, sort by distance
    if (tierDiff === 0 && a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }

    return tierDiff;
  });
}
