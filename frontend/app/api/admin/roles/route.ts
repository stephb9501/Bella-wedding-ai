import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Predefined role templates
const ROLE_TEMPLATES = {
  super_admin: {
    can_moderate_reviews: true,
    can_approve_vendors: true,
    can_change_vendor_tiers: true,
    can_delete_users: true,
    can_view_analytics: true,
    can_manage_bookings: true,
    can_view_financials: true,
    can_edit_content: true,
    can_manage_admins: true,
    can_impersonate_users: true,
    can_view_sensitive_data: true,
  },
  admin: {
    can_moderate_reviews: true,
    can_approve_vendors: true,
    can_change_vendor_tiers: true,
    can_delete_users: true,
    can_view_analytics: true,
    can_manage_bookings: true,
    can_view_financials: true,
    can_edit_content: true,
    can_manage_admins: false, // Cannot manage other admins
    can_impersonate_users: true,
    can_view_sensitive_data: true,
  },
  moderator: {
    can_moderate_reviews: true,
    can_approve_vendors: false,
    can_change_vendor_tiers: false,
    can_delete_users: false,
    can_view_analytics: true,
    can_manage_bookings: false,
    can_view_financials: false,
    can_edit_content: true,
    can_manage_admins: false,
    can_impersonate_users: false,
    can_view_sensitive_data: false,
  },
  support: {
    can_moderate_reviews: true,
    can_approve_vendors: false,
    can_change_vendor_tiers: false,
    can_delete_users: false,
    can_view_analytics: true,
    can_manage_bookings: true,
    can_view_financials: false,
    can_edit_content: false,
    can_manage_admins: false,
    can_impersonate_users: true,
    can_view_sensitive_data: false,
  },
  analyst: {
    can_moderate_reviews: false,
    can_approve_vendors: false,
    can_change_vendor_tiers: false,
    can_delete_users: false,
    can_view_analytics: true,
    can_manage_bookings: false,
    can_view_financials: true,
    can_edit_content: false,
    can_manage_admins: false,
    can_impersonate_users: false,
    can_view_sensitive_data: false,
  },
};

// POST: Assign or update admin role
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user can manage admins
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_admins',
    });

    if (!canManage.data) {
      return NextResponse.json({ error: 'Permission denied: can_manage_admins required' }, { status: 403 });
    }

    const { target_email, role_name, custom_permissions, expires_in_days } = await request.json();

    if (!target_email || !role_name) {
      return NextResponse.json(
        { error: 'Missing required fields: target_email, role_name' },
        { status: 400 }
      );
    }

    // Find target user by email
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', target_email)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get permissions (template or custom)
    const permissions = custom_permissions || ROLE_TEMPLATES[role_name as keyof typeof ROLE_TEMPLATES] || {};

    // Calculate expiration if specified
    let expiresAt = null;
    if (expires_in_days) {
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + expires_in_days);
      expiresAt = expiration.toISOString();
    }

    // Update user role in users table
    const { error: userRoleError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', targetUser.id);

    if (userRoleError) {
      console.error('User role update error:', userRoleError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    // Upsert admin_roles
    const { error: roleError } = await supabase
      .from('admin_roles')
      .upsert({
        user_id: targetUser.id,
        role_name,
        permissions,
        created_by: user.id,
        expires_at: expiresAt,
        is_active: true,
      });

    if (roleError) {
      console.error('Admin role error:', roleError);
      return NextResponse.json({ error: 'Failed to assign admin role' }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'role_assignment',
      p_entity_type: 'user',
      p_entity_id: targetUser.id,
      p_description: `Assigned ${role_name} role to ${target_email}`,
      p_metadata: { role_name, permissions, expires_at: expiresAt },
    });

    return NextResponse.json({
      success: true,
      message: `${role_name} role assigned to ${target_email}`,
      user_id: targetUser.id,
    });
  } catch (error: any) {
    console.error('Role assignment error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: List all admin roles
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { data: adminRoles, error } = await supabase
      .from('admin_roles')
      .select(`
        *,
        user:users!admin_roles_user_id_fkey(id, email, full_name),
        created_by_user:users!admin_roles_created_by_fkey(email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin roles fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch admin roles' }, { status: 500 });
    }

    // Include role templates for reference
    return NextResponse.json({
      admin_roles: adminRoles || [],
      role_templates: ROLE_TEMPLATES,
    });
  } catch (error: any) {
    console.error('Get admin roles error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Revoke admin role
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user can manage admins
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_admins',
    });

    if (!canManage.data) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id');

    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    // Cannot revoke own admin access
    if (targetUserId === user.id) {
      return NextResponse.json({ error: 'Cannot revoke your own admin access' }, { status: 400 });
    }

    // Deactivate admin role
    const { error: roleError } = await supabase
      .from('admin_roles')
      .update({ is_active: false })
      .eq('user_id', targetUserId);

    if (roleError) {
      console.error('Role deactivation error:', roleError);
      return NextResponse.json({ error: 'Failed to revoke role' }, { status: 500 });
    }

    // Update user role back to regular user
    const { error: userError } = await supabase
      .from('users')
      .update({ role: 'user' })
      .eq('id', targetUserId);

    if (userError) {
      console.error('User role update error:', userError);
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'role_revocation',
      p_entity_type: 'user',
      p_entity_id: targetUserId,
      p_description: 'Revoked admin role',
      p_metadata: {},
    });

    return NextResponse.json({
      success: true,
      message: 'Admin role revoked successfully',
    });
  } catch (error: any) {
    console.error('Role revocation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
