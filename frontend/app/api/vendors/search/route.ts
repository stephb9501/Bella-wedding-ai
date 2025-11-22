import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface SearchParams {
  query?: string;
  categories?: string;
  minPriceRange?: string;
  maxPriceRange?: string;
  city?: string;
  state?: string;
  radius?: string;
  latitude?: string;
  longitude?: string;
  minRating?: string;
  availabilityDate?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const params: SearchParams = {
      query: searchParams.get('query') || '',
      categories: searchParams.get('categories') || '',
      minPriceRange: searchParams.get('minPriceRange') || '',
      maxPriceRange: searchParams.get('maxPriceRange') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      radius: searchParams.get('radius') || '',
      latitude: searchParams.get('latitude') || '',
      longitude: searchParams.get('longitude') || '',
      minRating: searchParams.get('minRating') || '',
      availabilityDate: searchParams.get('availabilityDate') || '',
      sort: searchParams.get('sort') || 'rating',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    // Parse pagination
    const page = parseInt(params.page);
    const limit = parseInt(params.limit);
    const offset = (page - 1) * limit;

    // Start building the query
    let query = supabaseServer
      .from('vendors')
      .select('*', { count: 'exact' });

    // Full-text search on business_name and description
    if (params.query && params.query.trim()) {
      const searchTerm = params.query.trim().replace(/\s+/g, ' & ');
      query = query.textSearch('search_vector', searchTerm, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Multiple category filtering
    if (params.categories && params.categories !== 'All') {
      const categoryList = params.categories.split(',').map(c => c.trim()).filter(Boolean);
      if (categoryList.length === 1) {
        // Single category - use exact match or LIKE for partial match
        query = query.or(`category.eq.${categoryList[0]},category.ilike.%${categoryList[0]}%`);
      } else if (categoryList.length > 1) {
        // Multiple categories - use IN operator
        const categoryFilters = categoryList.map(cat => `category.ilike.%${cat}%`).join(',');
        query = query.or(categoryFilters);
      }
    }

    // Price range filtering
    if (params.minPriceRange) {
      query = query.gte('price_range', parseInt(params.minPriceRange));
    }
    if (params.maxPriceRange) {
      query = query.lte('price_range', parseInt(params.maxPriceRange));
    }

    // Location filtering
    if (params.city) {
      query = query.ilike('city', `%${params.city}%`);
    }
    if (params.state) {
      query = query.ilike('state', `%${params.state}%`);
    }

    // Rating filter
    if (params.minRating) {
      query = query.gte('average_rating', parseFloat(params.minRating));
    }

    // Execute the query to get count and data
    const { data, error, count } = await query;

    if (error) throw error;

    let vendors = data || [];

    // Distance filtering (if coordinates provided)
    if (params.latitude && params.longitude && params.radius) {
      const userLat = parseFloat(params.latitude);
      const userLon = parseFloat(params.longitude);
      const radiusMiles = parseFloat(params.radius);

      // Filter vendors with coordinates and calculate distance
      vendors = vendors
        .filter(v => v.latitude && v.longitude)
        .map(v => ({
          ...v,
          distance: calculateDistance(
            userLat,
            userLon,
            parseFloat(v.latitude),
            parseFloat(v.longitude)
          ),
        }))
        .filter(v => v.distance <= radiusMiles);
    }

    // Availability filtering (check against bookings table)
    if (params.availabilityDate) {
      const availabilityDate = params.availabilityDate;

      // Query bookings for the specified date
      const { data: bookedVendors } = await supabaseServer
        .from('bookings')
        .select('vendor_id')
        .eq('booking_date', availabilityDate)
        .eq('status', 'confirmed');

      const bookedVendorIds = new Set(bookedVendors?.map(b => b.vendor_id) || []);

      // Filter out booked vendors
      vendors = vendors.filter(v => !bookedVendorIds.has(v.id));
    }

    // Sorting
    switch (params.sort) {
      case 'price_low':
        vendors.sort((a, b) => (a.price_range || 0) - (b.price_range || 0));
        break;
      case 'price_high':
        vendors.sort((a, b) => (b.price_range || 0) - (a.price_range || 0));
        break;
      case 'rating':
        vendors.sort((a, b) => (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0));
        break;
      case 'distance':
        if (params.latitude && params.longitude) {
          vendors.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        break;
      case 'newest':
        vendors.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        // Default: prioritize featured/elite vendors, then by rating
        const tierOrder: Record<string, number> = { elite: 4, featured: 3, premium: 2, free: 1 };
        vendors.sort((a, b) => {
          const tierDiff = (tierOrder[b.tier as string] || 0) - (tierOrder[a.tier as string] || 0);
          if (tierDiff !== 0) return tierDiff;
          return (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0);
        });
    }

    // Apply pagination
    const totalCount = count || vendors.length;
    const paginatedVendors = vendors.slice(offset, offset + limit);

    // Enhance vendor data with photo URLs
    const enhancedVendors = paginatedVendors.map(v => ({
      ...v,
      photo_urls: v.photo_count > 0 ? ['/wedding-photos/deltalow-131.jpg'] : [],
    }));

    return NextResponse.json({
      vendors: enhancedVendors,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Vendor search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Haversine formula to calculate distance between two coordinates in miles
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
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
