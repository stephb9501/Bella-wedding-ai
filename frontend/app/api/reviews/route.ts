import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const userId = searchParams.get('user_id');

    if (!vendorId && !userId) {
      return NextResponse.json({ error: 'Missing vendor_id or user_id' }, { status: 400 });
    }

    let query = supabaseServer.from('reviews').select('*, vendors(business_name), users(full_name)');

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { user_id, vendor_id, rating, review_text, service_type } = body;

    if (!user_id || !vendor_id || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this vendor
    const { data: existingReview } = await supabaseServer
      .from('reviews')
      .select('id')
      .eq('user_id', user_id)
      .eq('vendor_id', vendor_id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this vendor' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('reviews')
      .insert({
        user_id,
        vendor_id,
        rating,
        review_text: review_text || null,
        service_type: service_type || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update vendor average rating (in production)
    // This would be a trigger or separate function

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Review POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { review_id, rating, review_text } = body;

    if (!review_id) {
      return NextResponse.json({ error: 'Missing review_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('reviews')
      .update({
        rating,
        review_text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', review_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Review PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Missing review id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Review DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
