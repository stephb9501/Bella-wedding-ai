import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get all feature toggles or check if a specific feature is enabled
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
    const feature_key = searchParams.get('feature_key');
    const vendor_tier = searchParams.get('vendor_tier');

    if (action === 'check' && feature_key) {
      // Check if a feature is enabled for this user
      const { data: isEnabled, error } = await supabase.rpc('is_feature_enabled', {
        p_feature_key: feature_key,
        p_user_id: user.id,
        p_vendor_tier: vendor_tier || null,
      });

      if (error) {
        console.error('Feature check error:', error);
        return NextResponse.json({ error: 'Failed to check feature' }, { status: 500 });
      }

      return NextResponse.json({
        feature_key,
        enabled: isEnabled,
      });

    } else if (action === 'list') {
      // Check if user is admin
      const canManage = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_manage_features',
      });

      if (!canManage.data) {
        return NextResponse.json({
          error: 'Permission denied: can_manage_features required'
        }, { status: 403 });
      }

      // Get all feature toggles
      const { data: features, error } = await supabase
        .from('feature_toggles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('List features error:', error);
        return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
      }

      return NextResponse.json({
        features: features || [],
        total: features?.length || 0,
      });

    } else if (action === 'history' && feature_key) {
      // Get feature toggle history
      const canManage = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_manage_features',
      });

      if (!canManage.data) {
        return NextResponse.json({
          error: 'Permission denied: can_manage_features required'
        }, { status: 403 });
      }

      const { data: history, error } = await supabase
        .from('feature_toggle_history')
        .select('*')
        .eq('feature_key', feature_key)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('History fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
      }

      return NextResponse.json({
        feature_key,
        history: history || [],
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Feature toggle error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new feature toggle
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage features
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_features',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_features required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      feature_key,
      feature_name,
      description,
      is_enabled = false,
      enabled_for_all = true,
      enabled_user_ids = null,
      enabled_vendor_tiers = null,
      rollout_percentage = null,
      scheduled_enable_at = null,
      scheduled_disable_at = null,
    } = body;

    if (!feature_key || !feature_name) {
      return NextResponse.json(
        { error: 'feature_key and feature_name are required' },
        { status: 400 }
      );
    }

    // Insert feature toggle
    const { data: feature, error } = await supabase
      .from('feature_toggles')
      .insert({
        feature_key,
        feature_name,
        description,
        is_enabled,
        enabled_for_all,
        enabled_user_ids,
        enabled_vendor_tiers,
        rollout_percentage,
        scheduled_enable_at,
        scheduled_disable_at,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create feature error:', error);
      return NextResponse.json({ error: 'Failed to create feature toggle' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Feature toggle created successfully',
      feature,
    });
  } catch (error: any) {
    console.error('Feature toggle creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing feature toggle
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage features
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_features',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_features required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      feature_key,
      is_enabled,
      enabled_for_all,
      enabled_user_ids,
      enabled_vendor_tiers,
      rollout_percentage,
      scheduled_enable_at,
      scheduled_disable_at,
      description,
    } = body;

    if (!feature_key) {
      return NextResponse.json(
        { error: 'feature_key is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (is_enabled !== undefined) updates.is_enabled = is_enabled;
    if (enabled_for_all !== undefined) updates.enabled_for_all = enabled_for_all;
    if (enabled_user_ids !== undefined) updates.enabled_user_ids = enabled_user_ids;
    if (enabled_vendor_tiers !== undefined) updates.enabled_vendor_tiers = enabled_vendor_tiers;
    if (rollout_percentage !== undefined) updates.rollout_percentage = rollout_percentage;
    if (scheduled_enable_at !== undefined) updates.scheduled_enable_at = scheduled_enable_at;
    if (scheduled_disable_at !== undefined) updates.scheduled_disable_at = scheduled_disable_at;
    if (description !== undefined) updates.description = description;

    // Update feature toggle
    const { data: feature, error } = await supabase
      .from('feature_toggles')
      .update(updates)
      .eq('feature_key', feature_key)
      .select()
      .single();

    if (error) {
      console.error('Update feature error:', error);
      return NextResponse.json({ error: 'Failed to update feature toggle' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Feature toggle updated successfully',
      feature,
    });
  } catch (error: any) {
    console.error('Feature toggle update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a feature toggle
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage features
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_features',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_features required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const feature_key = searchParams.get('feature_key');

    if (!feature_key) {
      return NextResponse.json(
        { error: 'feature_key is required' },
        { status: 400 }
      );
    }

    // Delete feature toggle
    const { error } = await supabase
      .from('feature_toggles')
      .delete()
      .eq('feature_key', feature_key);

    if (error) {
      console.error('Delete feature error:', error);
      return NextResponse.json({ error: 'Failed to delete feature toggle' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Feature toggle deleted successfully',
    });
  } catch (error: any) {
    console.error('Feature toggle deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
