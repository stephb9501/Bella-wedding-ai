import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

// POST: Bulk import vendors from CSV/paste
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { vendors, send_invites = false } = await request.json();

    if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
      return NextResponse.json(
        { error: 'vendors array is required' },
        { status: 400 }
      );
    }

    const results = {
      total: vendors.length,
      imported: 0,
      invites_sent: 0,
      errors: [] as any[],
    };

    // Process each vendor
    for (const vendor of vendors) {
      try {
        // Validate required fields
        if (!vendor.business_name || !vendor.category) {
          results.errors.push({
            business_name: vendor.business_name || 'Unknown',
            error: 'Missing required fields: business_name, category',
          });
          continue;
        }

        // Check if listing already exists
        const { data: existing } = await supabase
          .from('vendor_listings')
          .select('id')
          .eq('business_name', vendor.business_name)
          .eq('city', vendor.city || '')
          .eq('state', vendor.state || '')
          .single();

        if (existing) {
          results.errors.push({
            business_name: vendor.business_name,
            error: 'Listing already exists',
          });
          continue;
        }

        // Create vendor listing
        const { data: listing, error: insertError } = await supabase
          .from('vendor_listings')
          .insert({
            business_name: vendor.business_name,
            category: vendor.category,
            city: vendor.city || null,
            state: vendor.state || null,
            country: vendor.country || 'USA',
            zip_code: vendor.zip_code || null,
            phone: vendor.phone || null,
            email: vendor.email || null,
            website_url: vendor.website || null,
            short_description: vendor.description?.substring(0, 200) || null,
            source: 'bulk_import',
            imported_by: user.id,
          })
          .select()
          .single();

        if (insertError) {
          results.errors.push({
            business_name: vendor.business_name,
            error: insertError.message,
          });
          continue;
        }

        results.imported++;

        // Send invitation if email provided and send_invites is true
        if (send_invites && vendor.email && listing) {
          try {
            // Generate invitation token
            const inviteToken = `${listing.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

            // Create invitation record
            const { error: inviteError } = await supabase
              .from('vendor_invitations')
              .insert({
                invited_by_user_id: user.id,
                invited_by_user_type: 'admin',
                invited_by_name: user.user_metadata?.full_name || 'Bella Wedding Team',
                vendor_listing_id: listing.id,
                business_name: vendor.business_name,
                email: vendor.email,
                phone: vendor.phone || null,
                invitation_token: inviteToken,
                invitation_message: `We've added ${vendor.business_name} to Bella Wedding! Join to connect with couples planning their dream weddings.`,
              });

            if (inviteError) {
              console.error('Invite creation error:', inviteError);
            } else {
              // Send email invitation
              if (process.env.RESEND_API_KEY) {
                try {
                  const resend = new Resend(process.env.RESEND_API_KEY);
                  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vendor-register?invite=${inviteToken}`;

                  await resend.emails.send({
                    from: 'Bella Wedding AI <onboarding@resend.dev>',
                    to: vendor.email,
                    subject: `${vendor.business_name} - You're Invited to Bella Wedding! 🎉`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #E11D48;">Welcome to Bella Wedding!</h2>

                        <p>Hi ${vendor.business_name} team,</p>

                        <p>Great news! We've added your business to Bella Wedding, a platform that connects wedding vendors with couples planning their special day.</p>

                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                          <p><strong>Your Business:</strong> ${vendor.business_name}</p>
                          <p><strong>Category:</strong> ${vendor.category}</p>
                          ${vendor.city && vendor.state ? `<p><strong>Location:</strong> ${vendor.city}, ${vendor.state}</p>` : ''}
                        </div>

                        <h3>Why Join Bella Wedding?</h3>
                        <ul>
                          <li>✅ Connect with couples actively planning weddings</li>
                          <li>✅ Receive booking inquiries directly</li>
                          <li>✅ Showcase your work with a beautiful profile</li>
                          <li>✅ FREE to get started!</li>
                        </ul>

                        <p style="text-align: center; margin: 30px 0;">
                          <a href="${inviteUrl}" style="background: #E11D48; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Claim Your Profile & Get Started
                          </a>
                        </p>

                        <p style="color: #666; font-size: 14px;">
                          This invitation expires in 30 days. If you have any questions, reply to this email!
                        </p>

                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                          If you didn't expect this invitation, you can safely ignore this email.
                        </p>
                      </div>
                    `,
                  });

                  results.invites_sent++;
                } catch (emailError) {
                  console.error('Email send error:', emailError);
                }
              }
            }
          } catch (inviteError) {
            console.error('Invitation error:', inviteError);
          }
        }
      } catch (error: any) {
        results.errors.push({
          business_name: vendor.business_name || 'Unknown',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get import history
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get recent imports
    const { data: imports, error } = await supabase
      .from('vendor_listings')
      .select('*')
      .eq('source', 'bulk_import')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      imports: imports || [],
      total: imports?.length || 0,
    });
  } catch (error: any) {
    console.error('Get imports error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
