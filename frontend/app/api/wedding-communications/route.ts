import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Get communication log for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const communicationType = searchParams.get('communication_type'); // email, phone, meeting, text
    const userId = searchParams.get('user_id'); // Filter by participant
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('wedding_communications')
      .select('*')
      .eq('booking_id', bookingId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (communicationType) {
      query = query.eq('communication_type', communicationType);
    }

    if (userId) {
      query = query.or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate stats
    const emailCount = data?.filter(c => c.communication_type === 'email').length || 0;
    const phoneCount = data?.filter(c => c.communication_type === 'phone').length || 0;
    const meetingCount = data?.filter(c => c.communication_type === 'meeting').length || 0;
    const readCount = data?.filter(c => c.read_at !== null).length || 0;

    return NextResponse.json({
      success: true,
      communications: data || [],
      stats: {
        total: data?.length || 0,
        emails: emailCount,
        phone_calls: phoneCount,
        meetings: meetingCount,
        read_receipts: readCount
      }
    });
  } catch (error) {
    console.error('Get communications error:', error);
    return NextResponse.json({ error: 'Failed to fetch communications' }, { status: 500 });
  }
}

// Log a communication (email, call, meeting, text)
export async function POST(request: NextRequest) {
  try {
    const {
      booking_id,
      communication_type,
      from_user_id,
      from_user_name,
      to_user_id,
      to_user_name,
      subject,
      message,
      attachments,
      sent_at,
      delivered_at,
      read_at,
      read_receipt
    } = await request.json();

    if (!booking_id || !communication_type || !from_user_id || !to_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('wedding_communications')
      .insert({
        booking_id,
        communication_type,
        from_user_id,
        from_user_name,
        to_user_id,
        to_user_name,
        subject: subject || null,
        message: message || null,
        attachments: attachments || null,
        sent_at: sent_at || new Date().toISOString(),
        delivered_at: delivered_at || null,
        read_at: read_at || null,
        read_receipt: read_receipt || false
      })
      .select()
      .single();

    if (error) throw error;

    // Also log to audit trail if it involves the client
    if (to_user_name?.toLowerCase().includes('bride') || from_user_name?.toLowerCase().includes('bride')) {
      await supabaseServer
        .from('wedding_audit_trail')
        .insert({
          booking_id,
          action_type: `communication_${communication_type}`,
          user_id: from_user_id,
          user_name: from_user_name,
          description: `${communication_type.toUpperCase()}: ${subject || message?.substring(0, 100)}`,
          involves_client: true,
          after_data: { communication_id: data.id }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Communication logged',
      communication: data
    });
  } catch (error) {
    console.error('Log communication error:', error);
    return NextResponse.json({ error: 'Failed to log communication' }, { status: 500 });
  }
}

// Mark communication as read/delivered
export async function PUT(request: NextRequest) {
  try {
    const {
      communication_id,
      delivered_at,
      read_at,
      read_receipt
    } = await request.json();

    if (!communication_id) {
      return NextResponse.json({ error: 'Missing communication_id' }, { status: 400 });
    }

    const updateData: any = {};
    if (delivered_at) updateData.delivered_at = delivered_at;
    if (read_at) updateData.read_at = read_at;
    if (read_receipt !== undefined) updateData.read_receipt = read_receipt;

    const { error } = await supabaseServer
      .from('wedding_communications')
      .update(updateData)
      .eq('id', communication_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Communication status updated'
    });
  } catch (error) {
    console.error('Update communication error:', error);
    return NextResponse.json({ error: 'Failed to update communication' }, { status: 500 });
  }
}

// Delete communication (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communicationId = searchParams.get('communication_id');

    if (!communicationId) {
      return NextResponse.json({ error: 'Missing communication_id' }, { status: 400 });
    }

    // Don't actually delete - just mark in audit trail
    const { data: comm } = await supabaseServer
      .from('wedding_communications')
      .select('*')
      .eq('id', communicationId)
      .single();

    if (comm) {
      await supabaseServer
        .from('wedding_audit_trail')
        .insert({
          booking_id: comm.booking_id,
          action_type: 'communication_deleted',
          user_id: comm.from_user_id,
          description: `Deleted ${comm.communication_type}: ${comm.subject || comm.message?.substring(0, 50)}`,
          before_data: comm,
          involves_client: true
        });

      // Now delete
      const { error } = await supabaseServer
        .from('wedding_communications')
        .delete()
        .eq('id', communicationId);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Communication deleted (logged in audit trail)'
    });
  } catch (error) {
    console.error('Delete communication error:', error);
    return NextResponse.json({ error: 'Failed to delete communication' }, { status: 500 });
  }
}
