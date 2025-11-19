import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiter for RSVP submissions
const rsvpLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// GET - Fetch RSVPs for a website (owner only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('website_id');

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 });
    }

    // Verify ownership
    const { data: website } = await supabase
      .from('wedding_websites')
      .select('user_id')
      .eq('id', websiteId)
      .single();

    if (!website || website.user_id !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch RSVPs
    const { data: rsvps, error } = await supabase
      .from('wedding_rsvps')
      .select('*')
      .eq('website_id', websiteId)
      .order('responded_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate statistics
    const stats = {
      total: rsvps?.length || 0,
      attending: rsvps?.filter(r => r.attending).length || 0,
      notAttending: rsvps?.filter(r => !r.attending).length || 0,
      totalGuests: rsvps?.reduce((sum, r) => sum + (r.attending ? r.number_of_guests : 0), 0) || 0,
    };

    return NextResponse.json({ rsvps: rsvps || [], stats });
  } catch (error: any) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit RSVP (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { website_id, guest_name, guest_email, guest_phone, number_of_guests, attending, meal_choice, dietary_restrictions, song_request, additional_notes } = body;

    if (!website_id || !guest_name || !guest_email || attending === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Rate limit RSVP submissions by email
    try {
      await rsvpLimiter.check(3, guest_email); // 3 submissions per minute per email
    } catch {
      return NextResponse.json(
        { error: 'Too many RSVP attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify website exists and is published
    const { data: website } = await supabase
      .from('wedding_websites')
      .select('id, published, rsvp_enabled')
      .eq('id', website_id)
      .single();

    if (!website || !website.published || !website.rsvp_enabled) {
      return NextResponse.json(
        { error: 'RSVP not available for this website' },
        { status: 400 }
      );
    }

    // Get client IP for tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || null;

    // Insert or update RSVP
    const { data: rsvp, error } = await supabase
      .from('wedding_rsvps')
      .upsert({
        website_id,
        guest_name,
        guest_email,
        guest_phone,
        number_of_guests: number_of_guests || 1,
        attending,
        meal_choice,
        dietary_restrictions,
        song_request,
        additional_notes,
        ip_address: ip,
        responded_at: new Date().toISOString(),
      }, {
        onConflict: 'website_id,guest_email'
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting RSVP:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rsvp, message: 'RSVP submitted successfully!' }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete RSVP (owner only)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const rsvpId = searchParams.get('id');

    if (!rsvpId) {
      return NextResponse.json({ error: 'RSVP ID required' }, { status: 400 });
    }

    // Verify ownership through website
    const { data: rsvp } = await supabase
      .from('wedding_rsvps')
      .select('website_id')
      .eq('id', rsvpId)
      .single();

    if (!rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    const { data: website } = await supabase
      .from('wedding_websites')
      .select('user_id')
      .eq('id', rsvp.website_id)
      .single();

    if (!website || website.user_id !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete RSVP
    const { error } = await supabase
      .from('wedding_rsvps')
      .delete()
      .eq('id', rsvpId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
