import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, getCurrentUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

// Check if user is admin
async function isAdmin(email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const adminEmails = [
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    'stephb9501@gmail.com',
  ];
  return adminEmails.includes(email);
}

// GET: List vendors pending verification or all vendors with verification status
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user and check admin status
    const user = await getCurrentUser(request);
    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'verified', 'all'
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('vendors')
      .select(`
        id,
        business_name,
        email,
        phone,
        category,
        city,
        state,
        description,
        tier,
        is_verified,
        verified_at,
        verified_by,
        verification_notes,
        is_featured,
        featured_until,
        average_rating,
        review_count,
        response_rate,
        avg_response_time_hours,
        created_at
      `, { count: 'exact' });

    // Filter by verification status
    if (status === 'pending') {
      query = query.eq('is_verified', false);
    } else if (status === 'verified') {
      query = query.eq('is_verified', true);
    }

    // Search filter
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
    }

    // Pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: vendors, error, count } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get badges for each vendor
    const vendorIds = vendors?.map(v => v.id) || [];
    const { data: badges } = await supabase
      .from('vendor_badges')
      .select('*')
      .in('vendor_id', vendorIds)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    // Group badges by vendor_id
    const badgesByVendor = (badges || []).reduce((acc, badge) => {
      if (!acc[badge.vendor_id]) acc[badge.vendor_id] = [];
      acc[badge.vendor_id].push(badge);
      return acc;
    }, {} as Record<string, any[]>);

    // Attach badges to vendors
    const vendorsWithBadges = vendors?.map(vendor => ({
      ...vendor,
      badges: badgesByVendor[vendor.id] || [],
    }));

    return NextResponse.json({
      vendors: vendorsWithBadges,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin vendor verification GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Verify a vendor
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user and check admin status
    const user = await getCurrentUser(request);
    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { vendor_id, notes, badges_to_award, featured_days } = body;

    if (!vendor_id) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    }

    // Verify the vendor using the database function
    const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_vendor', {
      vendor_id_param: vendor_id,
      admin_user_id: user.id,
      notes: notes || null,
    });

    if (verifyError) {
      console.error('Error verifying vendor:', verifyError);
      return NextResponse.json({ error: verifyError.message }, { status: 500 });
    }

    // Award additional badges if specified
    if (badges_to_award && Array.isArray(badges_to_award)) {
      for (const badgeType of badges_to_award) {
        await supabase.rpc('award_vendor_badge', {
          vendor_id_param: vendor_id,
          badge_type_param: badgeType,
          metadata_param: { awarded_by: user.id, awarded_at: new Date().toISOString() },
        });
      }
    }

    // Set featured status if specified
    if (featured_days && featured_days > 0) {
      await supabase.rpc('set_vendor_featured', {
        vendor_id_param: vendor_id,
        featured_days: featured_days,
      });
    }

    // Get updated vendor data
    const { data: vendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendor_id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Vendor verified successfully',
      vendor,
    });
  } catch (error: any) {
    console.error('Admin vendor verification POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update verification notes or modify verification
export async function PATCH(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user and check admin status
    const user = await getCurrentUser(request);
    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { vendor_id, verification_notes } = body;

    if (!vendor_id) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    }

    // Update verification notes
    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({ verification_notes })
      .eq('id', vendor_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating verification notes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification notes updated',
      vendor,
    });
  } catch (error: any) {
    console.error('Admin vendor verification PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Revoke verification
export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user and check admin status
    const user = await getCurrentUser(request);
    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const vendor_id = searchParams.get('vendor_id');
    const notes = searchParams.get('notes');

    if (!vendor_id) {
      return NextResponse.json({ error: 'vendor_id is required' }, { status: 400 });
    }

    // Revoke verification using the database function
    const { data: revokeResult, error: revokeError } = await supabase.rpc('revoke_vendor_verification', {
      vendor_id_param: vendor_id,
      admin_user_id: user.id,
      notes: notes || null,
    });

    if (revokeError) {
      console.error('Error revoking verification:', revokeError);
      return NextResponse.json({ error: revokeError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor verification revoked',
    });
  } catch (error: any) {
    console.error('Admin vendor verification DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
