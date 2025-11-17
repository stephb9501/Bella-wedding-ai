import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const userId = searchParams.get('user_id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

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

  try {
    const { booking_id, sender_id, sender_type, message } = await request.json();

    if (!booking_id || !sender_id || !sender_type || !message) {
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

    const { data, error } = await supabaseServer
      .from('messages')
      .insert({
        booking_id,
        sender_id,
        sender_type,
        message,
        read: false,
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {

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
