import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

interface GuestRow {
  name: string;
  email?: string;
  phone?: string;
  rsvp_status?: 'pending' | 'attending' | 'declined';
  plus_one?: boolean;
  dietary_restrictions?: string;
  table_number?: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { wedding_id, guests } = await request.json();

    if (!wedding_id || !guests || !Array.isArray(guests)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate and sanitize guest data
    const validatedGuests = guests.map((guest: GuestRow) => ({
      wedding_id,
      name: guest.name?.trim() || 'Unknown',
      email: guest.email?.trim() || null,
      phone: guest.phone?.trim() || null,
      rsvp_status: guest.rsvp_status || 'pending',
      plus_one: guest.plus_one || false,
      dietary_restrictions: guest.dietary_restrictions?.trim() || null,
      table_number: guest.table_number || null,
      notes: guest.notes?.trim() || null,
    }));

    // Insert guests in bulk
    const { data, error } = await supabaseServer
      .from('guests')
      .insert(validatedGuests)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      guests: data,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Guest import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
