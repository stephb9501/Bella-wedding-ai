import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role to bypass RLS for admin operations
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

// POST /api/approvals - Approve or reject a timeline/checklist/budget item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      item_type, // 'timeline_event', 'checklist_item', 'budget_item'
      item_id,
      action, // 'approve' or 'reject'
      approved_by, // bride user_id
      rejection_reason,
    } = body;

    if (!item_type || !item_id || !action || !approved_by) {
      return NextResponse.json(
        { error: 'Missing required fields: item_type, item_id, action, approved_by' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'rejection_reason is required when rejecting' },
        { status: 400 }
      );
    }

    // Map item_type to table name
    const tableMap: Record<string, string> = {
      timeline_event: 'timeline_events',
      checklist_item: 'checklist_items',
      budget_item: 'budget_items',
    };

    const tableName = tableMap[item_type];
    if (!tableName) {
      return NextResponse.json(
        { error: 'Invalid item_type. Must be timeline_event, checklist_item, or budget_item' },
        { status: 400 }
      );
    }

    // Update the item
    const updateData: any = {
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: approved_by,
      approved_at: new Date().toISOString(),
    };

    if (action === 'reject') {
      updateData.rejection_reason = rejection_reason;
    }

    const { data: item, error } = await supabaseServer
      .from(tableName)
      .update(updateData)
      .eq('id', item_id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${item_type}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create approval request record
    const { error: requestError } = await supabaseServer
      .from('approval_requests')
      .insert({
        wedding_id: item.wedding_id,
        item_type,
        item_id,
        requested_by: item.created_by,
        requested_by_role: item.created_by_role,
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: approved_by,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === 'reject' ? rejection_reason : null,
      });

    if (requestError) {
      console.error('Error creating approval request:', requestError);
      // Don't fail the whole request if approval_requests insert fails
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error in POST /api/approvals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/approvals - Get pending approval requests for a wedding
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weddingId = searchParams.get('wedding_id');
    const itemType = searchParams.get('item_type'); // optional filter

    if (!weddingId) {
      return NextResponse.json({ error: 'wedding_id is required' }, { status: 400 });
    }

    // Map item_type to table names
    const queries = [];

    if (!itemType || itemType === 'timeline_event') {
      const { data: timelineEvents } = await supabaseServer
        .from('timeline_events')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('status', 'published')
        .eq('approval_status', 'pending');

      queries.push({ type: 'timeline_event', items: timelineEvents || [] });
    }

    if (!itemType || itemType === 'checklist_item') {
      const { data: checklistItems } = await supabaseServer
        .from('checklist_items')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('status', 'published')
        .eq('approval_status', 'pending');

      queries.push({ type: 'checklist_item', items: checklistItems || [] });
    }

    if (!itemType || itemType === 'budget_item') {
      const { data: budgetItems } = await supabaseServer
        .from('budget_items')
        .select('*')
        .eq('wedding_id', weddingId)
        .eq('status', 'published')
        .eq('approval_status', 'pending');

      queries.push({ type: 'budget_item', items: budgetItems || [] });
    }

    return NextResponse.json(queries);
  } catch (error) {
    console.error('Error in GET /api/approvals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
