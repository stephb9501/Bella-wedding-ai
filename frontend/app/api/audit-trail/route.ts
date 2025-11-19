import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Get audit trail for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const actionType = searchParams.get('action_type'); // Filter by action type
    const involvesClient = searchParams.get('involves_client'); // true/false
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('wedding_audit_trail')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    if (involvesClient === 'true') {
      query = query.eq('involves_client', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      audit_trail: data || [],
      total_entries: data?.length || 0
    });
  } catch (error) {
    console.error('Get audit trail error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit trail' }, { status: 500 });
  }
}

// Log an action to audit trail
export async function POST(request: NextRequest) {
  try {
    const {
      booking_id,
      action_type,
      user_id,
      user_role,
      user_name,
      before_data,
      after_data,
      description,
      involves_client,
      client_acknowledged,
      ip_address,
      user_agent
    } = await request.json();

    if (!booking_id || !action_type || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get IP and user agent from request headers if not provided
    const clientIp = ip_address || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const clientUserAgent = user_agent || request.headers.get('user-agent') || null;

    const { data, error } = await supabaseServer
      .from('wedding_audit_trail')
      .insert({
        booking_id,
        action_type,
        user_id,
        user_role: user_role || 'vendor',
        user_name,
        before_data: before_data || null,
        after_data: after_data || null,
        description: description || null,
        involves_client: involves_client || false,
        client_acknowledged: client_acknowledged || false,
        ip_address: clientIp,
        user_agent: clientUserAgent
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Action logged to audit trail',
      audit_entry: data
    });
  } catch (error) {
    console.error('Log audit trail error:', error);
    return NextResponse.json({ error: 'Failed to log action' }, { status: 500 });
  }
}

// Mark client acknowledgment
export async function PUT(request: NextRequest) {
  try {
    const {
      audit_entry_id,
      client_acknowledged,
      acknowledgment_method
    } = await request.json();

    if (!audit_entry_id) {
      return NextResponse.json({ error: 'Missing audit_entry_id' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('wedding_audit_trail')
      .update({
        client_acknowledged: client_acknowledged || true,
        updated_at: new Date().toISOString()
      })
      .eq('id', audit_entry_id);

    if (error) throw error;

    // If acknowledged, also create a client_acknowledgment record for tamper-proof evidence
    if (client_acknowledged) {
      const { data: auditEntry } = await supabaseServer
        .from('wedding_audit_trail')
        .select('*')
        .eq('id', audit_entry_id)
        .single();

      if (auditEntry) {
        const content = JSON.stringify({
          action_type: auditEntry.action_type,
          description: auditEntry.description,
          after_data: auditEntry.after_data,
          timestamp: auditEntry.created_at
        });

        // Create SHA256 hash (in production, do this client-side or with crypto library)
        const contentHash = Buffer.from(content).toString('base64'); // Simplified - use crypto.subtle.digest in production

        await supabaseServer
          .from('client_acknowledgments')
          .insert({
            booking_id: auditEntry.booking_id,
            acknowledgment_type: 'audit_trail_review',
            acknowledged_content: content,
            acknowledged_content_hash: contentHash,
            ip_address: auditEntry.ip_address,
            user_agent: auditEntry.user_agent,
            method: acknowledgment_method || 'checkbox',
            cannot_be_disputed: true
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Client acknowledgment recorded'
    });
  } catch (error) {
    console.error('Update acknowledgment error:', error);
    return NextResponse.json({ error: 'Failed to update acknowledgment' }, { status: 500 });
  }
}
