import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// GET /api/activity - Fetch activity log for a wedding
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('wedding_id');
    const entityType = searchParams.get('entity_type'); // optional filter
    const actionType = searchParams.get('action_type'); // optional filter
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    if (!weddingId) {
      return NextResponse.json({ error: 'wedding_id is required' }, { status: 400 });
    }

    let query = supabaseServer
      .from('activity_log')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activity log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Activity GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/activity - Create a new activity log entry (optional - usually done automatically by other APIs)
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const {
      wedding_id,
      user_id,
      user_name,
      user_role,
      action_type,
      entity_type,
      entity_id,
      entity_name,
      changes,
      reason,
    } = body;

    if (!wedding_id || !user_id || !action_type || !entity_type) {
      return NextResponse.json(
        { error: 'Missing required fields: wedding_id, user_id, action_type, entity_type' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('activity_log')
      .insert({
        wedding_id,
        user_id,
        user_name: user_name || user_id,
        user_role: user_role || 'unknown',
        action_type,
        entity_type,
        entity_id: entity_id || null,
        entity_name: entity_name || '',
        changes: changes || {},
        reason: reason || null,
      })
      .select();

    if (error) {
      console.error('Error creating activity log entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] || {}, { status: 201 });
  } catch (error: any) {
    console.error('Activity POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
