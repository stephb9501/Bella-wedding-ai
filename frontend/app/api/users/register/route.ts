import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Create Supabase admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, weddingDate, plan } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for better UX
      user_metadata: {
        full_name: fullName,
        wedding_date: weddingDate,
      },
    });

    if (signUpError) throw signUpError;

    if (authData.user) {
      // Create user profile in database
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          wedding_date: weddingDate || null,
          subscription_tier: plan || 'standard',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway, we'll handle this gracefully
      }

      // Send admin notification email
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);

          const weddingDateFormatted = weddingDate
            ? new Date(weddingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Not specified';

          const planName = plan === 'early-access'
            ? 'Early Beta (FREE for 3 months)'
            : plan === 'discount-access'
            ? '30% Off Discount'
            : plan === 'premium'
            ? 'Premium ($29.99/mo)'
            : 'Standard ($19.99/mo)';

          await resend.emails.send({
            from: 'Bella Wedding AI <onboarding@resend.dev>',
            to: adminEmail,
            subject: `💕 New Bride Signup - ${fullName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #E11D48;">New Bride/Couple Signup! 💍</h2>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Name:</strong> ${fullName}</p>
                  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                  <p><strong>Wedding Date:</strong> ${weddingDateFormatted}</p>
                  <p><strong>Plan:</strong> ${planName}</p>
                  <p><strong>Signed Up:</strong> ${new Date().toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}</p>
                </div>
                <p><a href="https://bellaweddingai.com/admin/dashboard" style="background: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Admin Dashboard</a></p>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">User ID: ${authData.user.id}</p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        // Log error but don't fail the registration
        console.error('Failed to send bride signup notification email:', emailError);
      }

      return NextResponse.json({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        }
      }, { status: 201 });
    }

    throw new Error('Failed to create user');

  } catch (error: any) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
