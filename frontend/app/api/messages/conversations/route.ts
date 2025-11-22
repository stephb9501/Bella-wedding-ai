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
    const userType = searchParams.get('user_type');

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // In production, this would fetch from a conversations table
    // For now, returning mock data

    const mockConversations = [
      {
        id: 'conv-1',
        bride_id: 'bride-1',
        vendor_id: 'vendor-1',
        bride_name: 'Sarah Johnson',
        vendor_name: 'Elegant Events Catering',
        last_message: 'Thank you for your interest! We would love to cater your wedding.',
        last_message_time: new Date().toISOString(),
        unread_count: 2,
      },
      {
        id: 'conv-2',
        bride_id: 'bride-1',
        vendor_id: 'vendor-2',
        bride_name: 'Sarah Johnson',
        vendor_name: 'Petals & Blooms Florist',
        last_message: 'I can definitely work within that budget. Let me send you some options.',
        last_message_time: new Date(Date.now() - 3600000).toISOString(),
        unread_count: 0,
      },
    ];

    return NextResponse.json(mockConversations);
  } catch (error: any) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
