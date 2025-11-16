// Google Places API integration for vendor discovery

interface PlaceResult {
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types?: string[];
}

interface VendorDiscovery {
  business_name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  category: string;
  zip_code?: string;
  city?: string;
  state?: string;
}

/**
 * Search for wedding vendors using Google Places API
 * @param category Wedding vendor category (e.g., "wedding photographer")
 * @param zipCode ZIP code to search near
 * @param radius Search radius in meters (default 40000m = ~25 miles)
 */
export async function searchVendorsNearZip(
  category: string,
  zipCode: string,
  radius: number = 40000
): Promise<VendorDiscovery[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  try {
    // First, get coordinates from ZIP code
    const zipResponse = await fetch(`/api/zip-lookup?zip=${zipCode}`);
    if (!zipResponse.ok) {
      throw new Error(`ZIP code ${zipCode} not found`);
    }

    const zipData = await zipResponse.json();
    const { latitude, longitude, city, state_code } = zipData;

    // Search Google Places
    const searchQuery = `wedding ${category} near ${zipCode}`;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`;

    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== 'OK' && placesData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${placesData.status}`);
    }

    const results: PlaceResult[] = placesData.results || [];

    // Convert to our vendor format
    const vendors: VendorDiscovery[] = results.map((place) => {
      // Extract address parts
      const addressParts = place.formatted_address?.split(',') || [];
      const zipMatch = place.formatted_address?.match(/\b\d{5}\b/);
      const extractedZip = zipMatch ? zipMatch[0] : zipCode;

      return {
        business_name: place.name,
        address: place.formatted_address,
        phone: place.formatted_phone_number,
        website: place.website,
        rating: place.rating,
        review_count: place.user_ratings_total,
        latitude: place.geometry?.location.lat,
        longitude: place.geometry?.location.lng,
        category: mapGoogleTypeToCategory(place.types || [], category),
        zip_code: extractedZip,
        city: city,
        state: state_code,
      };
    });

    return vendors;
  } catch (error) {
    console.error('Google Places search error:', error);
    throw error;
  }
}

/**
 * Map Google Place types to our vendor categories
 */
function mapGoogleTypeToCategory(types: string[], searchCategory: string): string {
  // Try to match based on search category first
  const categoryMap: { [key: string]: string } = {
    photographer: 'Photography',
    videographer: 'Videography',
    florist: 'Florist',
    'wedding venue': 'Venue',
    venue: 'Venue',
    caterer: 'Catering',
    'hair salon': 'Hair & Makeup',
    'makeup artist': 'Hair & Makeup',
    dj: 'DJ/Music',
    musician: 'DJ/Music',
    baker: 'Cake',
    bakery: 'Cake',
    'wedding planner': 'Wedding Planner',
    'event planner': 'Wedding Planner',
  };

  const lowerCategory = searchCategory.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }

  return 'Other';
}
