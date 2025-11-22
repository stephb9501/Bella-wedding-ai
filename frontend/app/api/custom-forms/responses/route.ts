import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper to verify form ownership
async function verifyFormOwnership(supabase: any, formId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('custom_forms')
    .select('vendor_id')
    .eq('id', formId)
    .single();

  if (error || !data) return false;

  return data.vendor_id === userId;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('form_id');
    const id = searchParams.get('id');

    if (id) {
      // Fetch response and verify ownership through form
      const { data: response, error } = await supabase
        .from('form_responses')
        .select('*, custom_forms(vendor_id)')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Response not found' }, { status: 404 });
      }

      // Authorization check - vendor must own the form
      const customForm = response.custom_forms as any;
      if (!customForm || customForm.vendor_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(response);
    }

    if (formId) {
      // Authorization check - verify form ownership
      const isOwner = await verifyFormOwnership(supabase, formId, session.user.id);
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Form responses GET error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Form responses can be submitted anonymously (public forms)
    // But we should still validate the form exists and is published
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    const {
      form_id,
      respondent_email,
      response_data,
    } = body;

    if (!form_id || !response_data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify form exists and is published
    const { data: form, error: formError } = await supabase
      .from('custom_forms')
      .select('is_published')
      .eq('id', form_id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.is_published) {
      return NextResponse.json({ error: 'Form is not published' }, { status: 403 });
    }

    // Whitelist allowed fields
    const insertData = {
      form_id,
      respondent_email: respondent_email || null,
      response_data,
    };

    const { data, error } = await supabase
      .from('form_responses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create response' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Form responses POST error:', error);
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
      return NextResponse.json({ error: 'Missing response id' }, { status: 400 });
    }

    // Verify ownership through form
    const { data: response, error: fetchError } = await supabase
      .from('form_responses')
      .select('form_id, custom_forms(vendor_id)')
      .eq('id', id)
      .single();

    if (fetchError || !response) {
      return NextResponse.json({ error: 'Response not found' }, { status: 404 });
    }

    // Authorization check - vendor must own the form
    const customForm = response.custom_forms as any;
    if (!customForm || customForm.vendor_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('form_responses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Form responses DELETE error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
