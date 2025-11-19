import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST: Manage vendor (approve, suspend, change tier, verify, ban)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { vendor_id, action, reason, changes } = await request.json();

    if (!vendor_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor_id, action' },
        { status: 400 }
      );
    }

    // Get current vendor state
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendor_id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    let updateData: any = {};
    let changesLog: any = {};

    switch (action) {
      case 'approve':
        updateData = { status: 'active', is_verified: true };
        changesLog = { status: { from: vendor.status, to: 'active' } };
        break;

      case 'suspend':
        updateData = { status: 'suspended' };
        changesLog = { status: { from: vendor.status, to: 'suspended' } };
        break;

      case 'ban':
        updateData = { status: 'banned' };
        changesLog = { status: { from: vendor.status, to: 'banned' } };
        break;

      case 'activate':
        updateData = { status: 'active' };
        changesLog = { status: { from: vendor.status, to: 'active' } };
        break;

      case 'verify':
        updateData = { is_verified: true };
        changesLog = { is_verified: { from: vendor.is_verified, to: true } };
        break;

      case 'unverify':
        updateData = { is_verified: false };
        changesLog = { is_verified: { from: vendor.is_verified, to: false } };
        break;

      case 'change_tier':
        if (!changes?.new_tier) {
          return NextResponse.json({ error: 'new_tier required for change_tier action' }, { status: 400 });
        }

        // Update tier and corresponding limits
        const tierLimits: any = {
          free: { portfolio_photo_limit: 1, files_per_wedding_limit: 25, storage_per_wedding_mb: 250 },
          premium: { portfolio_photo_limit: 15, files_per_wedding_limit: 50, storage_per_wedding_mb: 500 },
          featured: { portfolio_photo_limit: 30, files_per_wedding_limit: 100, storage_per_wedding_mb: 1024 },
          elite: { portfolio_photo_limit: 75, files_per_wedding_limit: 200, storage_per_wedding_mb: 2048 },
        };

        const limits = tierLimits[changes.new_tier] || tierLimits.free;

        updateData = {
          tier: changes.new_tier,
          ...limits,
        };

        changesLog = {
          tier: { from: vendor.tier, to: changes.new_tier },
          limits: { from: { portfolio_photo_limit: vendor.portfolio_photo_limit }, to: limits },
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update vendor
    const { error: updateError } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('id', vendor_id);

    if (updateError) {
      console.error('Vendor update error:', updateError);
      return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
    }

    // Get client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || '0.0.0.0';

    // Log moderation action
    const { error: logError } = await supabase
      .from('vendor_moderation_log')
      .insert({
        vendor_id,
        admin_id: user.id,
        action,
        reason: reason || '',
        changes: changesLog,
        ip_address: ip,
      });

    if (logError) {
      console.error('Moderation log error:', logError);
    }

    // Log admin activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'vendor_management',
      p_entity_type: 'vendor',
      p_entity_id: vendor_id,
      p_description: `${action} vendor: ${vendor.business_name}`,
      p_metadata: { action, reason, changes: changesLog },
    });

    return NextResponse.json({
      success: true,
      message: `Vendor ${action} successfully`,
    });
  } catch (error: any) {
    console.error('Vendor management error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get all vendors for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('admin_vendor_overview')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('status', 'pending');
    } else if (filter === 'active') {
      query = query.eq('status', 'active');
    } else if (filter === 'suspended') {
      query = query.eq('status', 'suspended');
    } else if (filter === 'verified') {
      query = query.eq('is_verified', true);
    }

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,email.ilike.%${search}%,contact_person.ilike.%${search}%`);
    }

    const { data: vendors, error } = await query.limit(100);

    if (error) {
      console.error('Vendors fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    return NextResponse.json({ vendors: vendors || [] });
  } catch (error: any) {
    console.error('Get vendors error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
