import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit } from '@/lib/rate-limit';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Fetch user's wedding website
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch wedding website
    const { data: website, error } = await supabase
      .from('wedding_websites')
      .select('*')
      .eq('user_id', userData.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ website: website || null });
  } catch (error: any) {
    console.error('Error fetching wedding website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new wedding website
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Generate subdomain if couple names are provided
    let subdomain = body.subdomain;
    if (!subdomain && body.couple_name_1 && body.couple_name_2) {
      const { data: subdomainData, error: subdomainError } = await supabase
        .rpc('generate_wedding_subdomain', {
          p_couple_name_1: body.couple_name_1,
          p_couple_name_2: body.couple_name_2
        });

      if (!subdomainError && subdomainData) {
        subdomain = subdomainData;
      }
    }

    // Create wedding website
    const { data: website, error } = await supabase
      .from('wedding_websites')
      .insert({
        user_id: userData.id,
        subdomain,
        ...body
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ website }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating wedding website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update wedding website
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const websiteId = body.id;

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 });
    }

    // Verify ownership
    const { data: existingWebsite } = await supabase
      .from('wedding_websites')
      .select('user_id, published_at')
      .eq('id', websiteId)
      .single();

    if (!existingWebsite || existingWebsite.user_id !== userData.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limit publish operations
    if (body.published && body.published !== existingWebsite) {
      const rateLimitResult = checkRateLimit(request, 5, 60000); // 5 publishes per minute
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Update website
    const updateData: any = { ...body };
    delete updateData.id;

    // Set published_at timestamp if publishing for the first time
    if (body.published && !existingWebsite.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data: website, error } = await supabase
      .from('wedding_websites')
      .update(updateData)
      .eq('id', websiteId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ website });
  } catch (error: any) {
    console.error('Error updating wedding website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete wedding website
export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('id');

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID required' }, { status: 400 });
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('wedding_websites')
      .delete()
      .eq('id', websiteId)
      .eq('user_id', userData.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting wedding website:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
