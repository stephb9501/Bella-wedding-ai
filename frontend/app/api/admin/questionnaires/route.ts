import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get feature suggestions or templates
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'suggestions';

    if (type === 'suggestions') {
      // Get feature suggestions (pending review)
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const status = searchParams.get('status') || 'pending';

      const { data: suggestions, error } = await supabase
        .from('feature_suggestions')
        .select('*')
        .eq('status', status)
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
      }

      return NextResponse.json({ suggestions: suggestions || [] });

    } else if (type === 'templates') {
      // Get approved question templates
      const category = searchParams.get('category');

      let query = supabase
        .from('questionnaire_templates')
        .select('*')
        .eq('status', 'approved')
        .order('is_popular', { ascending: false })
        .order('times_used', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data: templates, error } = await query.limit(200);

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
      }

      return NextResponse.json({ templates: templates || [] });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST: Create suggestion or approve/reject
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_suggestion';

    if (action === 'create_suggestion') {
      // Anyone can create suggestion
      const { suggestion_type, category, title, description, suggested_question, suggested_question_type, suggested_options } = body;

      const { data: insertedSuggestion, error } = await supabase
        .from('feature_suggestions')
        .insert({
          suggestion_type,
          category,
          title,
          description,
          suggested_question,
          suggested_question_type,
          suggested_options,
          suggested_by_user_id: user.id,
          suggested_by_email: user.email,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 });
      }

      return NextResponse.json({ success: true, suggestion: insertedSuggestion });

    } else if (action === 'approve_suggestion' || action === 'reject_suggestion') {
      // Admin only
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (userData?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const { suggestion_id, admin_notes } = body;

      if (action === 'approve_suggestion') {
        // Create template from suggestion
        const { data: suggestion } = await supabase
          .from('feature_suggestions')
          .select('*')
          .eq('id', suggestion_id)
          .single();

        if (!suggestion) {
          return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        const { data: template, error: templateError } = await supabase
          .from('questionnaire_templates')
          .insert({
            question_text: suggestion.suggested_question,
            question_type: suggestion.suggested_question_type || 'text',
            category: suggestion.category,
            options: suggestion.suggested_options,
            status: 'approved',
            suggested_by_user_id: suggestion.suggested_by_user_id,
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (templateError) {
          return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
        }

        // Update suggestion status
        await supabase
          .from('feature_suggestions')
          .update({
            status: 'approved',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            admin_notes,
            created_template_id: template.id,
          })
          .eq('id', suggestion_id);

        return NextResponse.json({ success: true, template });

      } else {
        // Reject suggestion
        const { error } = await supabase
          .from('feature_suggestions')
          .update({
            status: 'rejected',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            admin_notes,
          })
          .eq('id', suggestion_id);

        if (error) {
          return NextResponse.json({ error: 'Failed to reject suggestion' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }
    }

    // Get vendor custom questions (for admin review)
    if (action === 'get_vendor_custom_questions') {
      const canView = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_manage_content',
      });

      if (!canView.data) {
        return NextResponse.json({
          error: 'Permission denied: can_manage_content required'
        }, { status: 403 });
      }

      const { data: vendorQuestions, error } = await supabase.rpc('get_all_vendor_custom_questions');

      if (error) {
        console.error('Get vendor custom questions error:', error);
        return NextResponse.json({ error: 'Failed to fetch vendor custom questions' }, { status: 500 });
      }

      return NextResponse.json({
        vendor_custom_questions: vendorQuestions || [],
        total: vendorQuestions?.length || 0,
      });
    }

    // Get bride custom questions (for admin review)
    if (action === 'get_bride_custom_questions') {
      const canView = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_manage_content',
      });

      if (!canView.data) {
        return NextResponse.json({
          error: 'Permission denied: can_manage_content required'
        }, { status: 403 });
      }

      const { data: brideQuestions, error } = await supabase.rpc('get_all_bride_custom_questions');

      if (error) {
        console.error('Get bride custom questions error:', error);
        return NextResponse.json({ error: 'Failed to fetch bride custom questions' }, { status: 500 });
      }

      return NextResponse.json({
        bride_custom_questions: brideQuestions || [],
        total: brideQuestions?.length || 0,
      });
    }

    // Promote custom question to template library
    if (action === 'promote_to_template') {
      const canManage = await supabase.rpc('has_admin_permission', {
        p_user_id: user.id,
        p_permission: 'can_manage_content',
      });

      if (!canManage.data) {
        return NextResponse.json({
          error: 'Permission denied: can_manage_content required'
        }, { status: 403 });
      }

      const {
        question_text,
        question_type,
        category,
        options = null,
        is_required = false,
        help_text = null,
      } = body;

      if (!question_text || !question_type || !category) {
        return NextResponse.json(
          { error: 'question_text, question_type, and category are required' },
          { status: 400 }
        );
      }

      // Promote to template library
      const { data: templateId, error } = await supabase.rpc('promote_custom_question_to_template', {
        p_question_text: question_text,
        p_question_type: question_type,
        p_category: category,
        p_options: options,
        p_is_required: is_required,
        p_help_text: help_text,
        p_approved_by: user.id,
      });

      if (error) {
        console.error('Promote to template error:', error);
        return NextResponse.json({ error: 'Failed to promote question to template library' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Question promoted to template library successfully',
        template_id: templateId,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
