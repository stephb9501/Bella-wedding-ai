import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/preferences
 * Fetch user's email notification preferences
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Get user ID from auth header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch email preferences
    const { data: preferences, error } = await supabaseServer
      .from('email_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newPreferences, error: insertError } = await supabaseServer
          .from('email_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return NextResponse.json(newPreferences);
      }
      throw error;
    }

    return NextResponse.json(preferences);
  } catch (error: any) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/preferences
 * Update user's email notification preferences
 */
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      welcome,
      booking_confirmed,
      booking_reminder,
      message_notification,
      review_request,
      weekly_digest,
      vendor_lead,
      marketing_emails,
      product_updates,
    } = body;

    // Get user ID from auth header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Build update object (only include fields that were provided)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (typeof welcome === 'boolean') updateData.welcome = welcome;
    if (typeof booking_confirmed === 'boolean') updateData.booking_confirmed = booking_confirmed;
    if (typeof booking_reminder === 'boolean') updateData.booking_reminder = booking_reminder;
    if (typeof message_notification === 'boolean') updateData.message_notification = message_notification;
    if (typeof review_request === 'boolean') updateData.review_request = review_request;
    if (typeof weekly_digest === 'boolean') updateData.weekly_digest = weekly_digest;
    if (typeof vendor_lead === 'boolean') updateData.vendor_lead = vendor_lead;
    if (typeof marketing_emails === 'boolean') updateData.marketing_emails = marketing_emails;
    if (typeof product_updates === 'boolean') updateData.product_updates = product_updates;

    // Update preferences (upsert in case they don't exist)
    const { data, error } = await supabaseServer
      .from('email_preferences')
      .upsert(
        {
          user_id: user.id,
          ...updateData,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      preferences: data,
      message: 'Email preferences updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/preferences
 * Unsubscribe from all emails using token
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    if (action === 'unsubscribe') {
      // Unsubscribe from all emails
      const { data, error } = await supabaseServer
        .from('email_preferences')
        .update({
          unsubscribed_all: true,
          welcome: false,
          booking_confirmed: false,
          booking_reminder: false,
          message_notification: false,
          review_request: false,
          weekly_digest: false,
          vendor_lead: false,
          marketing_emails: false,
          product_updates: false,
          updated_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Invalid unsubscribe token' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'You have been unsubscribed from all emails',
      });
    } else if (action === 'resubscribe') {
      // Re-enable default emails
      const { data, error } = await supabaseServer
        .from('email_preferences')
        .update({
          unsubscribed_all: false,
          booking_confirmed: true,
          booking_reminder: true,
          message_notification: true,
          updated_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'You have been resubscribed to important notifications',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "unsubscribe" or "resubscribe"' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing unsubscribe request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
