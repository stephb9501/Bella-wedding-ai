import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const weddingId = searchParams.get('wedding_id');
    const id = searchParams.get('id');

    if (id) {
      // Fetch form and verify ownership
      const { data: form, error } = await supabase
        .from('custom_forms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
      }

      // Authorization check - vendor must own this form
      if (form.vendor_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(form);
    }

    // Build query with authorization
    let query = supabase
      .from('custom_forms')
      .select('*')
      .order('created_at', { ascending: false });

    // If vendor_id specified, verify it matches authenticated user
    if (vendorId) {
      if (vendorId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query = query.eq('vendor_id', vendorId);
    } else {
      // If no vendor_id specified, default to authenticated user's forms
      query = query.eq('vendor_id', session.user.id);
    }

    if (weddingId) {
      query = query.eq('wedding_id', weddingId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Custom forms GET error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vendor_id,
      wedding_id,
      form_name,
      description,
      fields,
      is_published,
    } = body;

    if (!vendor_id || !form_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Authorization check - vendor_id must match authenticated user
    if (vendor_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed fields
    const insertData = {
      vendor_id,
      wedding_id: wedding_id || null,
      form_name,
      description: description || '',
      fields: fields || [],
      is_published: is_published || false,
    };

    const { data, error } = await supabase
      .from('custom_forms')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Custom forms POST error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...rawUpdates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing form id' }, { status: 400 });
    }

    // Verify ownership
    const { data: form, error: fetchError } = await supabase
      .from('custom_forms')
      .select('vendor_id')
      .eq('id', id)
      .single();

    if (fetchError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Authorization check - vendor must own this form
    if (form.vendor_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Whitelist allowed update fields (don't allow changing vendor_id)
    const allowedFields = [
      'wedding_id',
      'form_name',
      'description',
      'fields',
      'is_published',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (rawUpdates[field] !== undefined) {
        updates[field] = rawUpdates[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_forms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Custom forms PUT error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing form id' }, { status: 400 });
    }

    // Verify ownership
    const { data: form, error: fetchError } = await supabase
      .from('custom_forms')
      .select('vendor_id')
      .eq('id', id)
      .single();

    if (fetchError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Authorization check - vendor must own this form
    if (form.vendor_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('custom_forms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Custom forms DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
