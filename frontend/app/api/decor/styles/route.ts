import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// GET all available styles
export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const { data: styles, error } = await supabase
      .from('decor_styles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching styles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ styles: styles || [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/decor/styles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET bride's selected style preference
export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await request.json();
    const { brideId, styleId, customStyleName, customColorPalette } = body;

    if (!brideId) {
      return NextResponse.json({ error: 'Bride ID required' }, { status: 400 });
    }

    // Upsert (update or insert)
    const { data: preference, error } = await supabase
      .from('bride_decor_preferences')
      .upsert(
        {
          bride_id: brideId,
          selected_style_id: styleId || null,
          custom_style_name: customStyleName || null,
          custom_color_palette: customColorPalette || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'bride_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving preference:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ preference }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/decor/styles:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
