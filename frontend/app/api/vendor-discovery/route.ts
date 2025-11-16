import { NextRequest, NextResponse } from 'next/server';
import { searchVendorsNearZip } from '@/lib/googlePlaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, zipCode, radius } = body;

    if (!category || !zipCode) {
      return NextResponse.json(
        { error: 'Category and ZIP code are required' },
        { status: 400 }
      );
    }

    // Search Google Places for vendors
    const vendors = await searchVendorsNearZip(category, zipCode, radius);

    return NextResponse.json({ vendors, count: vendors.length });
  } catch (error: any) {
    console.error('Vendor discovery error:', error);
    return NextResponse.json(
      { error: error.message || 'Discovery failed' },
      { status: 500 }
    );
  }
}
