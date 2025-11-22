import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST: Mark a review as helpful (or remove the vote)
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { review_id, user_id } = body;

    if (!review_id || !user_id) {
      return NextResponse.json({ error: 'Missing review_id or user_id' }, { status: 400 });
    }

    // Check if user already voted for this review
    const { data: existingVote } = await supabase
      .from('review_votes')
      .select('id')
      .eq('review_id', review_id)
      .eq('user_id', user_id)
      .single();

    if (existingVote) {
      // Remove vote (toggle off)
      const { error } = await supabase
        .from('review_votes')
        .delete()
        .eq('id', existingVote.id);

      if (error) throw error;

      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add vote
      const { data, error } = await supabase
        .from('review_votes')
        .insert({ review_id, user_id })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, action: 'added', vote: data });
    }
  } catch (error: any) {
    console.error('Review vote error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process vote' }, { status: 500 });
  }
}

// GET: Check if user has voted for a review
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('review_id');
    const userId = searchParams.get('user_id');

    if (!reviewId || !userId) {
      return NextResponse.json({ error: 'Missing review_id or user_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('review_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is ok
      throw error;
    }

    return NextResponse.json({ has_voted: !!data });
  } catch (error: any) {
    console.error('Review vote check error:', error);
    return NextResponse.json({ error: error.message || 'Failed to check vote' }, { status: 500 });
  }
}
