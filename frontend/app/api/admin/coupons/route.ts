import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get coupons or validate a coupon code
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const code = searchParams.get('code');
    const user_type = searchParams.get('user_type');
    const tier = searchParams.get('tier');

    if (action === 'validate' && code) {
      // Validate a coupon code
      const { data: validation, error } = await supabase.rpc('validate_coupon', {
        p_code: code,
        p_user_id: user.id,
        p_user_type: user_type || 'vendor',
        p_tier: tier || null,
      });

      if (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
      }

      return NextResponse.json(validation);

    } else if (action === 'list') {
      // Check if user can manage coupons
      const canManage = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_manage_billing',
      });

      if (!canManage.data) {
        return NextResponse.json({
          error: 'Permission denied: can_manage_billing required'
        }, { status: 403 });
      }

      // Get all coupons
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('List coupons error:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
      }

      return NextResponse.json({
        coupons: coupons || [],
        total: coupons?.length || 0,
      });

    } else if (action === 'analytics') {
      // Check if user can view analytics
      const canView = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_view_analytics',
      });

      if (!canView.data) {
        return NextResponse.json({
          error: 'Permission denied: can_view_analytics required'
        }, { status: 403 });
      }

      // Get coupon analytics
      const { data: analytics, error } = await supabase
        .from('coupon_analytics')
        .select('*')
        .order('total_redemptions', { ascending: false });

      if (error) {
        console.error('Coupon analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
      }

      return NextResponse.json({
        analytics: analytics || [],
      });

    } else if (action === 'redemptions') {
      // Check if user can view redemptions
      const canView = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_view_analytics',
      });

      if (!canView.data) {
        return NextResponse.json({
          error: 'Permission denied: can_view_analytics required'
        }, { status: 403 });
      }

      const coupon_code = searchParams.get('coupon_code');
      let query = supabase
        .from('coupon_redemptions')
        .select('*')
        .order('redeemed_at', { ascending: false });

      if (coupon_code) {
        query = query.eq('coupon_code', coupon_code);
      }

      const { data: redemptions, error } = await query;

      if (error) {
        console.error('Redemptions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch redemptions' }, { status: 500 });
      }

      return NextResponse.json({
        redemptions: redemptions || [],
        total: redemptions?.length || 0,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Coupon error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new coupon or redeem an existing one
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      // Check if user can manage billing
      const canManage = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_manage_billing',
      });

      if (!canManage.data) {
        return NextResponse.json({
          error: 'Permission denied: can_manage_billing required'
        }, { status: 403 });
      }

      const {
        code,
        name,
        description,
        discount_type,
        discount_value = null,
        free_trial_days = null,
        free_tier_upgrade_to = null,
        free_tier_upgrade_months = null,
        applies_to,
        applies_to_tiers = null,
        max_uses = null,
        max_uses_per_user = 1,
        valid_from = null,
        valid_until = null,
        is_active = true,
        notes = null,
      } = body;

      if (!code || !name || !discount_type || !applies_to) {
        return NextResponse.json(
          { error: 'code, name, discount_type, and applies_to are required' },
          { status: 400 }
        );
      }

      // Insert coupon
      const { data: coupon, error } = await supabase
        .from('coupons')
        .insert({
          code: code.toUpperCase(),
          name,
          description,
          discount_type,
          discount_value,
          free_trial_days,
          free_tier_upgrade_to,
          free_tier_upgrade_months,
          applies_to,
          applies_to_tiers,
          max_uses,
          max_uses_per_user,
          valid_from,
          valid_until,
          is_active,
          created_by: user.id,
          notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Create coupon error:', error);
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Coupon created successfully',
        coupon,
      });

    } else if (action === 'redeem') {
      // Redeem a coupon
      const {
        coupon_code,
        user_email,
        user_type,
        discount_applied,
        original_amount,
        final_amount,
      } = body;

      if (!coupon_code || !user_email || !user_type || discount_applied === undefined || original_amount === undefined || final_amount === undefined) {
        return NextResponse.json(
          { error: 'coupon_code, user_email, user_type, discount_applied, original_amount, and final_amount are required' },
          { status: 400 }
        );
      }

      // Validate coupon first
      const { data: validation, error: validationError } = await supabase.rpc('validate_coupon', {
        p_code: coupon_code,
        p_user_id: user.id,
        p_user_type: user_type,
      });

      if (validationError) {
        console.error('Validation error:', validationError);
        return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
      }

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Record redemption
      const { data: redemptionId, error: redemptionError } = await supabase.rpc('record_coupon_redemption', {
        p_coupon_code: coupon_code,
        p_user_id: user.id,
        p_user_email: user_email,
        p_user_type: user_type,
        p_discount_applied: discount_applied,
        p_original_amount: original_amount,
        p_final_amount: final_amount,
      });

      if (redemptionError) {
        console.error('Redemption error:', redemptionError);
        return NextResponse.json({ error: 'Failed to redeem coupon' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Coupon redeemed successfully',
        redemption_id: redemptionId,
        discount_applied,
        final_amount,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Coupon operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing coupon
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage billing
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_billing',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_billing required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      is_active,
      valid_until,
      max_uses,
      description,
      notes,
    } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'code is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (valid_until !== undefined) updates.valid_until = valid_until;
    if (max_uses !== undefined) updates.max_uses = max_uses;
    if (description !== undefined) updates.description = description;
    if (notes !== undefined) updates.notes = notes;

    // Update coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('code', code)
      .select()
      .single();

    if (error) {
      console.error('Update coupon error:', error);
      return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error: any) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a coupon
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage billing
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_billing',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_billing required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'code is required' },
        { status: 400 }
      );
    }

    // Delete coupon
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('code', code);

    if (error) {
      console.error('Delete coupon error:', error);
      return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    console.error('Coupon deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
