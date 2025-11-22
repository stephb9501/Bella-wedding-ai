import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const weddingId = searchParams.get('wedding_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Authorization check - user can only view their own messages
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let query = supabase
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (weddingId) {
      query = query.eq('wedding_id', weddingId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Transform data into message format
    const messages = data.flatMap(item => {
      const msgs = [];
      if (item.prompt) {
        msgs.push({
          role: 'user',
          content: item.prompt,
          created_at: item.created_at,
        });
      }
      if (item.response) {
        msgs.push({
          role: 'assistant',
          content: item.response,
          created_at: item.created_at,
        });
      }
      return msgs;
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('AI messages GET error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
