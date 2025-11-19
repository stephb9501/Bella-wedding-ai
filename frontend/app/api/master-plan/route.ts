import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get master plan and items
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'get_plan';

    if (action === 'get_plan') {
      // Get bride's master plan
      const { data: plan, error } = await supabase
        .from('master_wedding_plans')
        .select('*')
        .eq('bride_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Get plan error:', error);
        return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
      }

      return NextResponse.json({
        plan: plan || null,
      });

    } else if (action === 'get_items') {
      // Get all plan items
      const approval_status = searchParams.get('approval_status'); // pending, approved, rejected
      const item_type = searchParams.get('item_type'); // vendor_selection, timeline_event, etc.

      let query = supabase
        .from('master_plan_items')
        .select('*')
        .eq('bride_id', user.id)
        .order('created_at', { ascending: false });

      if (approval_status) {
        query = query.eq('approval_status', approval_status);
      }

      if (item_type) {
        query = query.eq('item_type', item_type);
      }

      const { data: items, error } = await query;

      if (error) {
        console.error('Get items error:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
      }

      return NextResponse.json({
        items: items || [],
        total: items?.length || 0,
      });

    } else if (action === 'get_pending_approvals') {
      // Get items needing approval
      const { data: pendingItems, error } = await supabase
        .from('master_plan_items')
        .select('*')
        .eq('bride_id', user.id)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get pending approvals error:', error);
        return NextResponse.json({ error: 'Failed to fetch pending approvals' }, { status: 500 });
      }

      return NextResponse.json({
        pending_items: pendingItems || [],
        total: pendingItems?.length || 0,
      });

    } else if (action === 'get_versions') {
      // Get plan version history
      const plan_id = searchParams.get('plan_id');

      if (!plan_id) {
        return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
      }

      const { data: versions, error } = await supabase
        .from('master_plan_versions')
        .select('*')
        .eq('master_plan_id', plan_id)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Get versions error:', error);
        return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
      }

      return NextResponse.json({
        versions: versions || [],
        total: versions?.length || 0,
      });

    } else if (action === 'get_change_log') {
      // Get plan change log
      const plan_id = searchParams.get('plan_id');

      if (!plan_id) {
        return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
      }

      const { data: changes, error } = await supabase
        .from('master_plan_change_log')
        .select('*')
        .eq('master_plan_id', plan_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Get change log error:', error);
        return NextResponse.json({ error: 'Failed to fetch change log' }, { status: 500 });
      }

      return NextResponse.json({
        changes: changes || [],
        total: changes?.length || 0,
      });

    } else if (action === 'get_undo_history') {
      // Get undo history for current user
      const limit = parseInt(searchParams.get('limit') || '10');

      const { data: history, error } = await supabase.rpc('get_undo_history', {
        p_user_id: user.id,
        p_limit: limit,
      });

      if (error) {
        console.error('Get undo history error:', error);
        return NextResponse.json({ error: 'Failed to fetch undo history' }, { status: 500 });
      }

      return NextResponse.json({
        undo_history: history || [],
        total: history?.length || 0,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Master plan error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create plan, add items, approve/reject items, lock/unlock plan
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create_plan') {
      // Create master plan for bride
      const {
        wedding_id,
        plan_name = 'Wedding Plan',
        wedding_date,
        venue_name,
        guest_count,
      } = body;

      if (!wedding_id) {
        return NextResponse.json({ error: 'wedding_id is required' }, { status: 400 });
      }

      const { data: plan, error } = await supabase
        .from('master_wedding_plans')
        .insert({
          wedding_id,
          bride_id: user.id,
          plan_name,
          wedding_date,
          venue_name,
          guest_count,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Create plan error:', error);
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Master plan created successfully',
        plan,
      });

    } else if (action === 'add_item') {
      // Add item to master plan
      const {
        master_plan_id,
        wedding_id,
        item_type,
        category,
        title,
        description,
        item_data,
        vendor_id,
        booking_id,
        priority = 'medium',
        is_must_have = false,
      } = body;

      if (!master_plan_id || !item_type || !title) {
        return NextResponse.json(
          { error: 'master_plan_id, item_type, and title are required' },
          { status: 400 }
        );
      }

      const { data: item, error } = await supabase
        .from('master_plan_items')
        .insert({
          master_plan_id,
          wedding_id,
          bride_id: user.id,
          item_type,
          category,
          title,
          description,
          item_data,
          vendor_id,
          booking_id,
          priority,
          is_must_have,
          approval_status: 'pending',
          added_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Add item error:', error);
        return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Item added to plan',
        item,
      });

    } else if (action === 'approve_item') {
      // Approve a plan item
      const { item_id, notes } = body;

      if (!item_id) {
        return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
      }

      const { error } = await supabase.rpc('approve_plan_item', {
        p_item_id: item_id,
        p_user_id: user.id,
        p_notes: notes || null,
      });

      if (error) {
        console.error('Approve item error:', error);
        return NextResponse.json({ error: 'Failed to approve item' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Item approved successfully',
      });

    } else if (action === 'reject_item') {
      // Reject a plan item
      const { item_id, rejection_reason } = body;

      if (!item_id || !rejection_reason) {
        return NextResponse.json(
          { error: 'item_id and rejection_reason are required' },
          { status: 400 }
        );
      }

      const { error } = await supabase.rpc('reject_plan_item', {
        p_item_id: item_id,
        p_user_id: user.id,
        p_rejection_reason: rejection_reason,
      });

      if (error) {
        console.error('Reject item error:', error);
        return NextResponse.json({ error: 'Failed to reject item' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Item rejected',
      });

    } else if (action === 'lock_plan') {
      // Lock the master plan (finalize it)
      const { plan_id } = body;

      if (!plan_id) {
        return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
      }

      const { data: result, error } = await supabase.rpc('lock_master_plan', {
        p_plan_id: plan_id,
        p_user_id: user.id,
      });

      if (error) {
        console.error('Lock plan error:', error);
        return NextResponse.json({ error: 'Failed to lock plan' }, { status: 500 });
      }

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Plan locked and finalized',
        version_number: result.version_number,
        locked_at: result.locked_at,
      });

    } else if (action === 'unlock_plan') {
      // Unlock the master plan (allow editing)
      const { plan_id, unlock_reason } = body;

      if (!plan_id || !unlock_reason) {
        return NextResponse.json(
          { error: 'plan_id and unlock_reason are required' },
          { status: 400 }
        );
      }

      const { data: result, error } = await supabase.rpc('unlock_master_plan', {
        p_plan_id: plan_id,
        p_user_id: user.id,
        p_unlock_reason: unlock_reason,
      });

      if (error) {
        console.error('Unlock plan error:', error);
        return NextResponse.json({ error: 'Failed to unlock plan' }, { status: 500 });
      }

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Plan unlocked for editing',
        unlocked_at: result.unlocked_at,
        reason: result.reason,
      });

    } else if (action === 'undo') {
      // Undo last action for current user
      const { data: result, error } = await supabase.rpc('undo_last_action', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Undo error:', error);
        return NextResponse.json({ error: 'Failed to undo action' }, { status: 500 });
      }

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Action undone successfully',
        action_undone: result.action_undone,
        item_title: result.item_title,
        undone_at: result.undone_at,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Master plan operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update plan or item
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      item_id,
      title,
      description,
      item_data,
      priority,
      is_must_have,
    } = body;

    if (!item_id) {
      return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
    }

    // Build update object
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (item_data !== undefined) updates.item_data = item_data;
    if (priority !== undefined) updates.priority = priority;
    if (is_must_have !== undefined) updates.is_must_have = is_must_have;

    // Update item
    const { data: item, error } = await supabase
      .from('master_plan_items')
      .update(updates)
      .eq('id', item_id)
      .eq('bride_id', user.id) // Only bride can update
      .select()
      .single();

    if (error) {
      console.error('Update item error:', error);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Item updated successfully',
      item,
    });
  } catch (error: any) {
    console.error('Item update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove item from plan
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const item_id = searchParams.get('item_id');

    if (!item_id) {
      return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
    }

    // Delete item
    const { error } = await supabase
      .from('master_plan_items')
      .delete()
      .eq('id', item_id)
      .eq('bride_id', user.id); // Only bride can delete

    if (error) {
      console.error('Delete item error:', error);
      return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Item removed from plan',
    });
  } catch (error: any) {
    console.error('Item deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
