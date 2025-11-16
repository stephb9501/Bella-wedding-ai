import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { calculateDistance, getCoordinatesFromZip } from '@/lib/geoUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function generateVendorId(): string {
  return `vendor_${randomBytes(12).toString('hex')}`;
}

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const zipCode = searchParams.get('zipCode');
    const radius = parseInt(searchParams.get('radius') || '50');
    const priceTier = searchParams.get('priceTier');

    let query = supabase.from('vendors').select('*');

    // Single vendor lookup
    if (id) {
      query = query.eq('id', id);
      const { data, error } = await query.single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    // Category filter
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // Price tier filter
    if (priceTier && priceTier !== 'All') {
      query = query.eq('price_tier', priceTier);
    }

    // Legacy city search (keep for backwards compatibility)
    if (city && !zipCode) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    let vendors = data || [];

    // ZIP code + radius filtering
    if (zipCode && vendors.length > 0) {
      const userCoords = await getCoordinatesFromZip(zipCode);

      if (userCoords) {
        // Calculate distance for each vendor
        vendors = vendors
          .map(vendor => {
            if (vendor.latitude && vendor.longitude) {
              const distance = calculateDistance(
                userCoords.lat,
                userCoords.lng,
                vendor.latitude,
                vendor.longitude
              );

              return { ...vendor, distance };
            }
            return vendor;
          })
          .filter(vendor => {
            // Filter by radius if distance is calculated
            if (vendor.distance !== undefined) {
              return vendor.distance <= radius;
            }
            // Keep vendors without coordinates (they can still appear in results)
            return true;
          });
      }
    }

    // Sort by tier first, then by distance within each tier
    const tierOrder = { elite: 4, featured: 3, premium: 2, free: 1 };
    vendors.sort((a, b) => {
      const tierDiff = (tierOrder[b.tier as keyof typeof tierOrder] || 0) -
                       (tierOrder[a.tier as keyof typeof tierOrder] || 0);

      // If same tier and both have distance, sort by distance
      if (tierDiff === 0 && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }

      return tierDiff;
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Vendors GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const body = await request.json();
    const {
      businessName,
      email,
      password,
      phone,
      category,
      city,
      state,
      zipCode,
      startingPrice,
      priceTier,
      travelRadius,
      description,
      tier
    } = body;

    if (!businessName || !email || !password || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vendorId = generateVendorId();

    // Get coordinates from ZIP code if provided
    let latitude = null;
    let longitude = null;
    if (zipCode) {
      const coords = await getCoordinatesFromZip(zipCode);
      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      }
    }

    // TODO: Hash password before storing
    const { data, error } = await supabase
      .from('vendors')
      .insert({
        id: vendorId,
        business_name: businessName,
        email,
        password, // TODO: Hash this
        phone: phone || '',
        category,
        city: city || '',
        state: state || '',
        zip_code: zipCode || null,
        latitude,
        longitude,
        starting_price: startingPrice || null,
        price_tier: priceTier || null,
        travel_radius: travelRadius || 50,
        description: description || '',
        tier: tier || 'free',
        photo_count: 0,
        message_count_this_month: 0,
        booking_requests: 0,
        profile_views: 0,
        is_featured: tier === 'featured' || tier === 'elite',
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Vendors POST error:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });

    const { data, error } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error('Vendors PUT error:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });

    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vendors DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
