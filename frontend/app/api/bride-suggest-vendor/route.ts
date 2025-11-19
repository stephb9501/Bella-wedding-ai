import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

// POST: Bride suggests a vendor
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_name, category, city, state, phone, email, website, why_suggesting } = body;

    if (!business_name || !category) {
      return NextResponse.json({ error: 'business_name and category are required' }, { status: 400 });
    }

    const { data: brideData } = await supabase.from('users').select('full_name, email').eq('id', user.id).single();
    const { data: suggestion, error } = await supabase.from('bride_vendor_suggestions').insert({
      bride_id: user.id,
      bride_name: brideData?.full_name || 'Unknown',
      bride_email: brideData?.email || user.email,
      business_name, category, city, state, phone, email, website, why_suggesting, status: 'pending',
    }).select().single();

    if (error) throw error;

    const { data: listing } = await supabase.from('vendor_listings').insert({
      business_name, category, city, state, phone, email,
      website_url: website,
      short_description: why_suggesting || 'Recommended vendor',
      source: 'bride_suggestion',
      imported_by: user.id,
    }).select().single();

    if (listing) {
      await supabase.from('bride_vendor_suggestions').update({
        status: 'listed', listing_created: true, listing_id: listing.id
      }).eq('id', suggestion.id);
    }

    return NextResponse.json({ success: true, message: 'Vendor added!', suggestion, listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
