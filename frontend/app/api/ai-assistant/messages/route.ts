import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const weddingId = searchParams.get('wedding_id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (weddingId) {
      query = query.eq('wedding_id', weddingId);
    }

    const { data, error } = await query;

    if (error) throw error;

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
