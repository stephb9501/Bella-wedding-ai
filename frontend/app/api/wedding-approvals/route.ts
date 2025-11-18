import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

// Request approval from bride or planner
export async function POST(request: NextRequest) {
  try {
    const {
      booking_id,
      item_type,
      item_id,
      vendor_id,
      vendor_name,
      request_approval_from
    } = await request.json();

    if (!booking_id || !item_type || !item_id || !vendor_id || !request_approval_from) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tableName = item_type === 'timeline' ? 'wedding_timeline'
      : item_type === 'playlist' ? 'music_playlists'
      : item_type === 'shotlist' ? 'shot_lists'
      : null;

    if (!tableName) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    // Update item to pending approval
    const { error: updateError } = await supabaseServer
      .from(tableName)
      .update({
        approval_status: 'pending_approval',
        approval_requested_at: new Date().toISOString()
      })
      .eq('id', item_id)
      .eq('vendor_id', vendor_id); // Security check

    if (updateError) throw updateError;

    // Create approval notification
    const { error: notifError } = await supabaseServer
      .from('approval_notifications')
      .insert({
        booking_id,
        item_type,
        item_id,
        requesting_vendor_id: vendor_id,
        requesting_vendor_name: vendor_name,
        awaiting_approval_from: request_approval_from,
        awaiting_role: 'bride', // Could be 'planner' if approver is planner
        status: 'pending'
      });

    if (notifError) throw notifError;

    // Send email notification (optional)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Get bride email
        const { data: booking } = await supabaseServer
          .from('vendor_bookings')
          .select('bride_name, email')
          .eq('id', booking_id)
          .single();

        if (booking?.email) {
          await resend.emails.send({
            from: 'Bella Wedding <notifications@bellawedding.com>',
            to: booking.email,
            subject: `${vendor_name} needs your approval`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B4789;">Approval Requested</h2>

                <p>Hi ${booking.bride_name},</p>

                <p><strong>${vendor_name}</strong> has submitted their ${item_type} for your approval.</p>

                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/bride-dashboard"
                     style="background: linear-gradient(to right, #8B4789, #D97757); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Review & Approve
                  </a>
                </p>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  Once approved, this will be added to your master wedding timeline.
                </p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Approval request sent. Awaiting response.'
    });
  } catch (error) {
    console.error('Approval request error:', error);
    return NextResponse.json({ error: 'Failed to request approval' }, { status: 500 });
  }
}

// Approve or reject an item
export async function PUT(request: NextRequest) {
  try {
    const {
      item_type,
      item_id,
      action,
      approved_by,
      approved_by_role,
      rejection_reason
    } = await request.json();

    if (!item_type || !item_id || !action || !approved_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tableName = item_type === 'timeline' ? 'wedding_timeline'
      : item_type === 'playlist' ? 'music_playlists'
      : item_type === 'shotlist' ? 'shot_lists'
      : null;

    if (!tableName) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    if (action === 'approve') {
      // Approve the item
      const { error: updateError } = await supabaseServer
        .from(tableName)
        .update({
          approval_status: 'approved',
          approved_by_user_id: approved_by,
          approved_by_role: approved_by_role || 'bride',
          approved_at: new Date().toISOString()
        })
        .eq('id', item_id);

      if (updateError) throw updateError;

      // Update notification
      await supabaseServer
        .from('approval_notifications')
        .update({
          status: 'approved',
          resolved_at: new Date().toISOString()
        })
        .eq('item_id', item_id)
        .eq('item_type', item_type);

      // For timeline items, the trigger will auto-add to master_wedding_timeline

      return NextResponse.json({
        success: true,
        message: 'Approved! This has been added to the master timeline.'
      });
    }

    if (action === 'reject') {
      // Reject the item
      const { error: updateError } = await supabaseServer
        .from(tableName)
        .update({
          approval_status: 'rejected',
          approved_by_user_id: approved_by,
          approved_by_role: approved_by_role || 'bride',
          approved_at: new Date().toISOString(),
          rejection_reason: rejection_reason || null
        })
        .eq('id', item_id);

      if (updateError) throw updateError;

      // Update notification
      await supabaseServer
        .from('approval_notifications')
        .update({
          status: 'rejected',
          resolved_at: new Date().toISOString()
        })
        .eq('item_id', item_id)
        .eq('item_type', item_type);

      return NextResponse.json({
        success: true,
        message: rejection_reason
          ? `Rejected: ${rejection_reason}`
          : 'Rejected. Vendor will be notified.'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Approval action error:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}

// Get pending approval requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const userId = searchParams.get('user_id');
    const role = searchParams.get('role'); // 'bride' or 'vendor'

    if (!bookingId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (role === 'bride') {
      // Get items awaiting bride's approval
      const { data, error } = await supabaseServer
        .from('approval_notifications')
        .select(`
          *,
          vendors:requesting_vendor_id (
            business_name,
            category
          )
        `)
        .eq('booking_id', bookingId)
        .eq('awaiting_approval_from', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    if (role === 'vendor') {
      // Get vendor's approval requests and their status
      const { data, error } = await supabaseServer
        .from('approval_notifications')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('requesting_vendor_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error) {
    console.error('Get approvals error:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}
