import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get('wedding_id');
    const userId = searchParams.get('user_id'); // Legacy support

    // Support both new wedding_id and legacy user_id
    const query = supabaseServer.from('checklist_items').select('*');

    if (weddingId) {
      query.eq('wedding_id', weddingId);
    } else if (userId) {
      query.eq('user_id', userId);
    } else {
      return NextResponse.json({ error: 'wedding_id or user_id is required' }, { status: 400 });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Checklist GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wedding_id,
      user_id, // Legacy support
      title,
      task, // Legacy support
      description,
      category,
      priority,
      due_date,
      status,
      created_by,
      created_by_role,
      is_visible_to_team,
      completed,
      order_index,
    } = body;

    const itemTitle = title || task;

    // New wedding collaboration system
    if (wedding_id && created_by && created_by_role) {
      if (!itemTitle) {
        return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
      }

      const insertData: any = {
        wedding_id,
        title: itemTitle,
        description: description || '',
        category: category || 'other',
        priority: priority || 'medium',
        due_date: due_date || null,
        status: status || 'published',
        created_by,
        created_by_role,
        is_visible_to_team: is_visible_to_team !== undefined ? is_visible_to_team : true,
        is_completed: false,
        last_edited_by: created_by,
        last_edited_at: new Date().toISOString(),
      };

      if (insertData.status === 'published') {
        insertData.published_by = created_by;
        insertData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabaseServer
        .from('checklist_items')
        .insert(insertData)
        .select();

      if (error) throw error;

      const item = data?.[0];

      // Log activity
      await supabaseServer.from('activity_log').insert({
        wedding_id,
        user_id: created_by,
        user_name: created_by_role,
        user_role: created_by_role,
        action_type: 'created',
        entity_type: 'checklist_item',
        entity_id: item.id,
        entity_name: itemTitle,
        changes: { status: insertData.status },
      });

      return NextResponse.json(item, { status: 201 });
    }
    // Legacy system
    else if (user_id) {
      if (!itemTitle) {
        return NextResponse.json({ error: 'Missing required field: task' }, { status: 400 });
      }

      const { data, error } = await supabaseServer
        .from('checklist_items')
        .insert({
          user_id,
          task: itemTitle,
          title: itemTitle,
          category: category || 'General',
          due_date: due_date || null,
          completed: completed || false,
          is_completed: completed || false,
          order_index: order_index || 0,
        })
        .select();

      if (error) throw error;

      return NextResponse.json(data?.[0] || {}, { status: 201 });
    } else {
      return NextResponse.json(
        { error: 'Either (wedding_id, created_by, created_by_role) or user_id is required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Checklist POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item id is required' }, { status: 400 });
    }

    // Get current item for activity logging
    const { data: currentItem } = await supabaseServer
      .from('checklist_items')
      .select('*')
      .eq('id', id)
      .single();

    const updateData: any = { ...updates };

    // Handle collaboration fields
    if (updates.last_edited_by) {
      updateData.last_edited_at = new Date().toISOString();
    }

    // If status is changing to published, set published_by and published_at
    if (updates.status === 'published' && !updates.published_at) {
      updateData.published_at = new Date().toISOString();
      if (updates.published_by) {
        updateData.published_by = updates.published_by;
      }
    }

    // Handle legacy completed field
    if (updates.completed !== undefined) {
      updateData.is_completed = updates.completed;
    }
    if (updates.is_completed !== undefined) {
      updateData.completed = updates.is_completed;
    }

    // Handle legacy task field
    if (updates.task) {
      updateData.title = updates.task;
    }
    if (updates.title) {
      updateData.task = updates.title;
    }

    // Legacy updated_at
    if (!updateData.last_edited_at) {
      updateData.updated_at = new Date().toISOString();
    }

    const { data, error } = await supabaseServer
      .from('checklist_items')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    const item = data?.[0];

    // Log activity
    if (currentItem && item && currentItem.wedding_id) {
      const changes: any = {};
      Object.keys(updateData).forEach(key => {
        if (currentItem[key] !== updateData[key]) {
          changes[key] = { old: currentItem[key], new: updateData[key] };
        }
      });

      let actionType = 'updated';
      if (updates.status === 'published') actionType = 'published';
      if (updates.is_completed !== undefined) actionType = updates.is_completed ? 'completed' : 'uncompleted';
      if (updates.completed !== undefined) actionType = updates.completed ? 'completed' : 'uncompleted';

      await supabaseServer.from('activity_log').insert({
        wedding_id: item.wedding_id,
        user_id: updates.last_edited_by || currentItem.created_by,
        user_name: updates.last_edited_by || currentItem.created_by_role,
        user_role: currentItem.created_by_role,
        action_type: actionType,
        entity_type: 'checklist_item',
        entity_id: item.id,
        entity_name: item.title || item.task,
        changes,
      });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Checklist PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item id is required' }, { status: 400 });
    }

    // Get item for activity logging
    const { data: item } = await supabaseServer
      .from('checklist_items')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabaseServer
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    if (item && item.wedding_id) {
      await supabaseServer.from('activity_log').insert({
        wedding_id: item.wedding_id,
        user_id: item.created_by,
        user_name: item.created_by_role,
        user_role: item.created_by_role,
        action_type: 'deleted',
        entity_type: 'checklist_item',
        entity_id: item.id,
        entity_name: item.title || item.task,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Checklist DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
