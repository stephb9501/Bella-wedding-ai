import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// POST: Start impersonation session
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user can impersonate
    const canImpersonate = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_impersonate_users',
    });

    if (!canImpersonate.data) {
      return NextResponse.json({
        error: 'Permission denied: can_impersonate_users required'
      }, { status: 403 });
    }

    const { target_email, reason, duration_minutes = 30 } = await request.json();

    if (!target_email || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: target_email, reason' },
        { status: 400 }
      );
    }

    // Reason must be meaningful (prevent abuse)
    if (reason.length < 10) {
      return NextResponse.json(
        { error: 'Reason must be at least 10 characters (e.g., "Support ticket #12345")' },
        { status: 400 }
      );
    }

    // Find target user
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('email', target_email)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cannot impersonate other admins (security)
    if (targetUser.role === 'admin') {
      return NextResponse.json({
        error: 'Cannot impersonate other admins'
      }, { status: 403 });
    }

    // Check for active session
    const { data: activeSession } = await supabase
      .from('admin_impersonation_log')
      .select('id')
      .eq('admin_id', user.id)
      .eq('is_active', true)
      .single();

    if (activeSession) {
      return NextResponse.json({
        error: 'You already have an active impersonation session. End it first.'
      }, { status: 400 });
    }

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + duration_minutes);

    // Get client info
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create impersonation log
    const { data: impersonationLog, error: logError } = await supabase
      .from('admin_impersonation_log')
      .insert({
        admin_id: user.id,
        target_user_id: targetUser.id,
        reason,
        duration_minutes,
        expires_at: expiresAt.toISOString(),
        ip_address: ip,
        user_agent: userAgent,
        is_active: true,
      })
      .select()
      .single();

    if (logError) {
      console.error('Impersonation log error:', logError);
      return NextResponse.json({ error: 'Failed to create impersonation session' }, { status: 500 });
    }

    // Log admin activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'user_impersonation_start',
      p_entity_type: 'user',
      p_entity_id: targetUser.id,
      p_description: `Started impersonation: ${reason}`,
      p_metadata: { duration_minutes, expires_at: expiresAt.toISOString() },
    });

    // TODO: Send email notification to target user
    // (In production, you'd send an email here)

    return NextResponse.json({
      success: true,
      message: `Impersonation session started for ${target_email}`,
      session: {
        id: impersonationLog.id,
        target_user_id: targetUser.id,
        target_email: targetUser.email,
        target_name: targetUser.full_name,
        expires_at: expiresAt.toISOString(),
        duration_minutes,
      },
      warning: '⚠️ All actions are logged. User will be notified.',
    });
  } catch (error: any) {
    console.error('Impersonation start error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update impersonation session (log actions, mark sensitive data viewed)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, action_taken, viewed_sensitive_data, sensitive_data_type } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    // Get active session
    const { data: session, error: sessionError } = await supabase
      .from('admin_impersonation_log')
      .select('*')
      .eq('id', session_id)
      .eq('admin_id', user.id)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Active session not found' }, { status: 404 });
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      // Auto-expire
      await supabase
        .from('admin_impersonation_log')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', session_id);

      return NextResponse.json({ error: 'Session expired' }, { status: 410 });
    }

    const updateData: any = {};

    if (action_taken) {
      const actions = session.actions_taken || [];
      actions.push(action_taken);
      updateData.actions_taken = actions;
    }

    if (viewed_sensitive_data) {
      updateData.viewed_sensitive_data = true;
      if (sensitive_data_type) {
        const types = session.sensitive_data_types || [];
        if (!types.includes(sensitive_data_type)) {
          types.push(sensitive_data_type);
          updateData.sensitive_data_types = types;
        }
      }
    }

    const { error: updateError } = await supabase
      .from('admin_impersonation_log')
      .update(updateData)
      .eq('id', session_id);

    if (updateError) {
      console.error('Session update error:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Impersonation update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: End impersonation session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    // End session
    const { error: endError } = await supabase
      .from('admin_impersonation_log')
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('admin_id', user.id);

    if (endError) {
      console.error('Session end error:', endError);
      return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_admin_activity', {
      p_admin_id: user.id,
      p_action_type: 'user_impersonation_end',
      p_entity_type: 'impersonation_session',
      p_entity_id: sessionId,
      p_description: 'Ended impersonation session',
      p_metadata: {},
    });

    return NextResponse.json({
      success: true,
      message: 'Impersonation session ended',
    });
  } catch (error: any) {
    console.error('Impersonation end error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get active/recent impersonation sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Run auto-expire function first
    await supabase.rpc('expire_impersonation_sessions');

    // Get recent sessions
    const { data: sessions, error } = await supabase
      .from('admin_impersonation_audit')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Sessions fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions: sessions || [] });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
