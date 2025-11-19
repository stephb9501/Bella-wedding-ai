import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

// CREATE TABLE vendor_suggestions (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   vendor_id UUID NOT NULL REFERENCES vendors(id),
//   vendor_email VARCHAR(255),
//   vendor_name VARCHAR(255),
//   category VARCHAR(100), -- feature_request, bug_report, improvement
//   title VARCHAR(255) NOT NULL,
//   description TEXT NOT NULL,
//   priority VARCHAR(20) DEFAULT 'medium',
//   status VARCHAR(50) DEFAULT 'submitted', -- submitted, reviewing, implemented, declined
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

export async function POST(request: NextRequest) {
  try {
    const { vendor_id, category, title, description, priority, vendor_email, vendor_name } = await request.json();

    if (!vendor_id || !category || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save suggestion to database
    const { data, error } = await supabaseServer
      .from('vendor_suggestions')
      .insert({
        vendor_id,
        vendor_email,
        vendor_name,
        category,
        title,
        description,
        priority: priority || 'medium',
        status: 'submitted'
      })
      .select();

    if (error) throw error;

    // Send email notification to admin (optional)
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const categoryLabels = {
          feature_request: 'Feature Request',
          bug_report: 'Bug Report',
          improvement: 'Improvement Suggestion',
          other: 'Other'
        };

        await resend.emails.send({
          from: 'Bella Wedding <notifications@bellawedding.com>',
          to: process.env.ADMIN_EMAIL,
          subject: `Vendor Suggestion: ${categoryLabels[category as keyof typeof categoryLabels]} - ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B4789;">New Vendor Suggestion</h2>

              <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Category:</strong> ${categoryLabels[category as keyof typeof categoryLabels]}</p>
                <p><strong>Priority:</strong> ${priority || 'medium'}</p>
                <p><strong>From:</strong> ${vendor_name || 'Unknown'} (${vendor_email || 'No email'})</p>
                <p><strong>Vendor ID:</strong> ${vendor_id}</p>

                <h3 style="margin-top: 20px; color: #333;">${title}</h3>
                <p style="white-space: pre-wrap;">${description}</p>
              </div>

              <p style="color: #666; font-size: 14px;">
                This suggestion was submitted through the vendor dashboard.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      suggestion_id: data?.[0]?.id
    }, { status: 201 });
  } catch (error) {
    console.error('Vendor suggestion error:', error);
    return NextResponse.json({ error: 'Failed to submit suggestion' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    let query = supabaseServer.from('vendor_suggestions').select('*');

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Vendor suggestions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
