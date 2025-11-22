import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role to bypass RLS for admin operations
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/vendors/weddings - Fetch all weddings a vendor has access to
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendor_id');

    if (!vendorId) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    }

    // Get all weddings this vendor is a collaborator on
    const { data: collaborations, error: collabError } = await supabaseServer
      .from('wedding_collaborators')
      .select(`
        wedding_id,
        vendor_role,
        permissions,
        invite_status,
        weddings:wedding_id (
          id,
          wedding_name,
          wedding_date,
          venue_name,
          bride_id,
          users:bride_id (
            full_name
          )
        )
      `)
      .eq('user_id', vendorId)
      .eq('invite_status', 'accepted')
      .order('created_at', { ascending: false });

    if (collabError) {
      console.error('Error fetching vendor weddings:', collabError);
      return NextResponse.json({ error: collabError.message }, { status: 500 });
    }

    // Transform the data to a flatter structure
    const weddings = collaborations?.map((collab: any) => ({
      id: collab.weddings.id,
      wedding_name: collab.weddings.wedding_name,
      wedding_date: collab.weddings.wedding_date,
      venue_name: collab.weddings.venue_name,
      bride_name: collab.weddings.users?.full_name || 'Bride',
      vendor_role: collab.vendor_role,
      permissions: collab.permissions,
    })) || [];

    return NextResponse.json(weddings);
  } catch (error) {
    console.error('Error in GET /api/vendors/weddings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
