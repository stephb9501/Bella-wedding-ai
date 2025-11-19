import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    // Get user from session
    const cookieStore = cookies();
    const token =
      cookieStore.get('sb-access-token')?.value ||
      cookieStore.get('sb-cksukpgjkuarktbohseh-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userData.id;

    // Collect all user data
    const exportData: Record<string, any> = {
      export_date: new Date().toISOString(),
      user_id: userId,
      account_info: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        created_at: userData.created_at,
        last_login: userData.last_login,
      },
      wedding_events: [],
      guests: [],
      vendors: [],
      timeline: [],
      checklist: [],
      budget: [],
      rsvps: [],
      photos: [],
      notes: [],
    };

    // Fetch wedding events
    const { data: events } = await supabase
      .from('wedding_events')
      .select('*')
      .eq('user_id', userId);
    exportData.wedding_events = events || [];

    // Fetch guests
    const { data: guests } = await supabase
      .from('guests')
      .select('*')
      .eq('user_id', userId);
    exportData.guests = guests || [];

    // Fetch vendors
    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId);
    exportData.vendors = vendors || [];

    // Fetch timeline
    const { data: timeline } = await supabase
      .from('timeline')
      .select('*')
      .eq('user_id', userId);
    exportData.timeline = timeline || [];

    // Fetch checklist
    const { data: checklist } = await supabase
      .from('checklist')
      .select('*')
      .eq('user_id', userId);
    exportData.checklist = checklist || [];

    // Fetch budget
    const { data: budget } = await supabase
      .from('budget')
      .select('*')
      .eq('user_id', userId);
    exportData.budget = budget || [];

    // Fetch RSVPs
    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', userId);
    exportData.rsvps = rsvps || [];

    // Fetch notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);
    exportData.notes = notes || [];

    // Log the export request
    await supabase.from('user_privacy_requests').insert({
      user_id: userId,
      request_type: 'export',
      status: 'completed',
      processed_at: new Date().toISOString(),
    });

    // Return data as JSON file
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bella-wedding-data-export-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('GDPR export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
