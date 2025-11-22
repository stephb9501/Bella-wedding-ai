import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user for admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminEmails = [
      process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      'stephb9501@gmail.com',
    ];

    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { venues } = await request.json();

    if (!venues || !Array.isArray(venues)) {
      return NextResponse.json({ error: 'venues array required' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const venue of venues) {
      try {
        // Extract email from phone/email field
        const emailMatch = venue.contact?.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const email = emailMatch ? emailMatch[1] : `${venue.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@venue.placeholder`;

        // Extract phone from phone/email field
        const phoneMatch = venue.contact?.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        const phone = phoneMatch ? phoneMatch[0] : '';

        // Extract website
        const website = venue.website || '';

        // Create vendor entry
        const { data, error } = await supabase
          .from('vendors')
          .insert({
            business_name: venue.name,
            email: email,
            password: '', // No password - admin created
            phone: phone,
            category: 'Venues',
            city: venue.city || '',
            state: venue.state || 'AL',
            description: `Beautiful wedding venue in ${venue.city || 'Alabama'}. ${venue.address || ''}`,
            tier: 'free',
            website: website,
            // Additional venue-specific fields if your schema supports them
          })
          .select()
          .single();

        if (error) {
          errors.push({ venue: venue.name, error: error.message });
        } else {
          results.push(data);
        }
      } catch (err) {
        errors.push({ venue: venue.name, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Venue import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
