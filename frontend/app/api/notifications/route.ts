import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // In production, fetch from notifications table
    // For now, returning mock data
    const mockNotifications = [
      {
        id: '1',
        user_id: userId,
        type: 'rsvp',
        title: 'New RSVP Response',
        message: 'John Smith has accepted your invitation',
        read: false,
        created_at: new Date().toISOString(),
        action_url: '/guests',
      },
      {
        id: '2',
        user_id: userId,
        type: 'task',
        title: 'Task Due Soon',
        message: 'Book photographer is due in 3 days',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        action_url: '/checklist',
      },
      {
        id: '3',
        user_id: userId,
        type: 'message',
        title: 'New Vendor Message',
        message: 'Elegant Events Catering sent you a message',
        read: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        action_url: '/messages',
      },
      {
        id: '4',
        user_id: userId,
        type: 'budget',
        title: 'Budget Alert',
        message: 'You have spent 75% of your budget',
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        action_url: '/budget',
      },
    ];

    const filtered = unreadOnly
      ? mockNotifications.filter(n => !n.read)
      : mockNotifications;

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { notification_id, read } = body;

    if (!notification_id) {
      return NextResponse.json({ error: 'Missing notification_id' }, { status: 400 });
    }

    // In production, update notification in database
    // For now, just return success
    return NextResponse.json({ success: true, read });
  } catch (error: any) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { user_id, type, title, message, action_url } = body;

    if (!user_id || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In production, insert notification into database
    const notification = {
      id: Math.random().toString(36).substring(7),
      user_id,
      type,
      title,
      message,
      action_url: action_url || null,
      read: false,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error('Notifications POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
