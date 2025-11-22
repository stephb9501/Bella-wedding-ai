import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';
import { sendMessageNotificationEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const conversationId = searchParams.get('conversation_id');
    const userId = searchParams.get('user_id');

    if (!bookingId && !conversationId) {
      return NextResponse.json({ error: 'Missing booking_id or conversation_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    } else if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Mark messages as read for the current user
    if (userId) {
      await supabaseServer
        .from('messages')
        .update({ read: true })
        .eq('booking_id', bookingId)
        .neq('sender_id', userId)
        .eq('read', false);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { booking_id, conversation_id, sender_id, sender_type, message_text, message } = await request.json();
    const messageContent = message_text || message;

    if ((!booking_id && !conversation_id) || !sender_id || !sender_type || !messageContent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check bride tier limits (if sender is bride)
    if (sender_type === 'bride') {
      // Get bride's tier
      const { data: brideData } = await supabaseServer
        .from('brides')
        .select('tier')
        .eq('id', sender_id)
        .single();

      const tier = brideData?.tier || 'standard';

      // Count messages sent this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: messageCount } = await supabaseServer
        .from('messages')
        .select('id')
        .eq('sender_id', sender_id)
        .eq('sender_type', 'bride')
        .gte('created_at', startOfMonth.toISOString());

      const count = messageCount?.length || 0;

      // Tier limits: standard = 5, premium = 50
      const limits = { standard: 5, premium: 50 };
      if (count >= limits[tier as keyof typeof limits]) {
        return NextResponse.json({
          error: `You've reached your ${tier} plan limit of ${limits[tier as keyof typeof limits]} messages per month. Upgrade for more!`
        }, { status: 403 });
      }
    }

    // Check vendor tier limits (if sender is vendor)
    if (sender_type === 'vendor') {
      const { data: vendorData } = await supabaseServer
        .from('vendors')
        .select('tier, message_count_this_month')
        .eq('id', sender_id)
        .single();

      const tier = vendorData?.tier || 'free';
      const count = vendorData?.message_count_this_month || 0;

      // Tier limits: free = 5, premium+ = unlimited (999)
      const limits = { free: 5, premium: 999, featured: 999, elite: 999 };
      if (count >= limits[tier as keyof typeof limits]) {
        return NextResponse.json({
          error: `You've reached your ${tier} plan limit. Upgrade for unlimited messages!`
        }, { status: 403 });
      }

      // Increment vendor message count
      await supabaseServer
        .from('vendors')
        .update({ message_count_this_month: count + 1 })
        .eq('id', sender_id);
    }

    const insertData: any = {
      sender_id,
      sender_type,
      message_text: messageContent,
      message: messageContent,
      read: false,
    };

    if (booking_id) {
      insertData.booking_id = booking_id;
    }
    if (conversation_id) {
      insertData.conversation_id = conversation_id;
    }

    const { data, error } = await supabaseServer
      .from('messages')
      .insert(insertData)
      .select();

    if (error) throw error;

    // Send email notification to the recipient
    try {
      // Determine recipient based on sender type
      let recipientId: string | null = null;
      let recipientEmail: string | null = null;
      let recipientName: string | null = null;

      if (booking_id) {
        // Get booking details to find recipient
        const { data: bookingData } = await supabaseServer
          .from('booking_requests')
          .select('vendor_id, user_id')
          .eq('id', booking_id)
          .single();

        if (bookingData) {
          recipientId = sender_type === 'vendor' ? bookingData.user_id : bookingData.vendor_id;

          // Get recipient details
          if (sender_type === 'vendor') {
            const { data: userData } = await supabaseServer
              .from('users')
              .select('email, full_name')
              .eq('id', recipientId)
              .single();
            recipientEmail = userData?.email;
            recipientName = userData?.full_name;
          } else {
            const { data: vendorData } = await supabaseServer
              .from('vendors')
              .select('email, business_name')
              .eq('id', recipientId)
              .single();
            recipientEmail = vendorData?.email;
            recipientName = vendorData?.business_name;
          }
        }
      }

      // Get sender name
      let senderName = 'Someone';
      if (sender_type === 'vendor') {
        const { data: vendorData } = await supabaseServer
          .from('vendors')
          .select('business_name')
          .eq('id', sender_id)
          .single();
        senderName = vendorData?.business_name || 'A vendor';
      } else {
        const { data: userData } = await supabaseServer
          .from('users')
          .select('full_name')
          .eq('id', sender_id)
          .single();
        senderName = userData?.full_name || 'A couple';
      }

      // Send notification email if we have recipient details
      if (recipientEmail && recipientName && recipientId) {
        await sendMessageNotificationEmail(
          recipientEmail,
          {
            recipientName,
            senderName,
            senderType: sender_type,
            message: messageContent,
            conversationId: conversation_id,
            bookingId: booking_id,
            contextType: booking_id ? 'booking' : 'general',
          },
          recipientId
        );
      }
    } catch (emailError) {
      // Log but don't fail the message send
      console.error('Failed to send message notification email:', emailError);
    }

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing message id' }, { status: 400 });

    const { error } = await supabaseServer
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Messages DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
