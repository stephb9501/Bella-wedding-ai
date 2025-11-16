import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      email_notifications: true,
      sms_notifications: false,
      task_reminders: true,
      vendor_messages: true,
      marketing_emails: false,
      reminder_days_before: 7,
      theme_preference: 'light',
      language: 'en'
    };

    return NextResponse.json({
      preferences: preferences || defaultPreferences
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const {
      userId,
      emailNotifications,
      smsNotifications,
      taskReminders,
      vendorMessages,
      marketingEmails,
      reminderDaysBefore,
      themePreference,
      language
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        task_reminders: taskReminders,
        vendor_messages: vendorMessages,
        marketing_emails: marketingEmails,
        reminder_days_before: reminderDaysBefore,
        theme_preference: themePreference,
        language: language,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving preferences:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
