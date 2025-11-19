import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Pricing map for calculating revenue
const PRICING_MAP = {
  'early-access': 0, // FREE for 3 months
  'discount-access-standard': 13.99, // 30% off standard
  'discount-access-premium': 20.99, // 30% off premium
  'standard': 19.99,
  'premium': 29.99,
  'free': 0,
};

const VENDOR_PRICING_MAP = {
  'free': 0,
  'premium': 34.99,
  'featured': 49.99,
  'elite': 79.99,
};

export async function GET(request: NextRequest) {
  try {
    // Create Supabase admin client inside the function to avoid build-time errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    // TODO: Add authentication to ensure only admin or cron job can access this endpoint
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get new bride/couple signups from today
    const { data: newBrides, error: bridesError } = await supabaseAdmin
      .from('users')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: true });

    if (bridesError) {
      console.error('Error fetching new brides:', bridesError);
    }

    // Get new vendor signups from today
    const { data: newVendors, error: vendorsError } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: true });

    if (vendorsError) {
      console.error('Error fetching new vendors:', vendorsError);
    }

    // Calculate bride revenue
    const brideRevenue = (newBrides || []).reduce((total, bride) => {
      const tier = bride.subscription_tier || 'standard';
      return total + (PRICING_MAP[tier as keyof typeof PRICING_MAP] || 0);
    }, 0);

    // Calculate vendor revenue
    const vendorRevenue = (newVendors || []).reduce((total, vendor) => {
      const tier = vendor.tier || 'free';
      return total + (VENDOR_PRICING_MAP[tier as keyof typeof VENDOR_PRICING_MAP] || 0);
    }, 0);

    const totalRevenue = brideRevenue + vendorRevenue;
    const totalSignups = (newBrides?.length || 0) + (newVendors?.length || 0);

    // TODO: When Stripe is integrated, query actual subscription events for the day
    // const { data: subscriptions } = await stripe.subscriptions.list({
    //   created: { gte: Math.floor(today.getTime() / 1000) }
    // });
    // const { data: cancellations } = await stripe.subscriptions.list({
    //   status: 'canceled',
    //   canceled_at: { gte: Math.floor(today.getTime() / 1000) }
    // });

    // For now, we'll track signups as potential revenue
    // Actual recurring revenue will be tracked when payment processing is added

    // Send daily summary email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const brideRows = (newBrides || [])
        .map(
          (bride, index) => `
          <tr style="background: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${bride.full_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${bride.email}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${bride.subscription_tier || 'standard'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(PRICING_MAP[(bride.subscription_tier || 'standard') as keyof typeof PRICING_MAP] || 0).toFixed(2)}/mo</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #666;">${new Date(bride.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
          </tr>
        `
        )
        .join('');

      const vendorRows = (newVendors || [])
        .map(
          (vendor, index) => `
          <tr style="background: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${vendor.business_name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${vendor.email}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${vendor.category}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${vendor.tier || 'free'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(VENDOR_PRICING_MAP[(vendor.tier || 'free') as keyof typeof VENDOR_PRICING_MAP] || 0).toFixed(2)}/mo</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #666;">${new Date(vendor.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
          </tr>
        `
        )
        .join('');

      await resend.emails.send({
        from: 'Bella Wedding AI <onboarding@resend.dev>',
        to: adminEmail,
        subject: `📊 Daily Revenue Summary - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
            <h2 style="color: #E11D48;">Daily Revenue Summary 💰</h2>
            <p style="color: #666; font-size: 14px;">${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>

            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Total Signups</p>
                <p style="color: white; margin: 8px 0 0 0; font-size: 32px; font-weight: bold;">${totalSignups}</p>
              </div>
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Potential MRR</p>
                <p style="color: white; margin: 8px 0 0 0; font-size: 32px; font-weight: bold;">$${totalRevenue.toFixed(2)}</p>
              </div>
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Cancellations</p>
                <p style="color: white; margin: 8px 0 0 0; font-size: 32px; font-weight: bold;">0</p>
                <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 12px;">(Coming when Stripe integrated)</p>
              </div>
            </div>

            <!-- Breakdown -->
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div>
                  <p style="margin: 0; color: #666; font-size: 14px;">💕 Bride/Couple Signups</p>
                  <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; color: #E11D48;">${newBrides?.length || 0}</p>
                  <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">$${brideRevenue.toFixed(2)}/mo potential</p>
                </div>
                <div>
                  <p style="margin: 0; color: #666; font-size: 14px;">🎉 Vendor Signups</p>
                  <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; color: #8b5cf6;">${newVendors?.length || 0}</p>
                  <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">$${vendorRevenue.toFixed(2)}/mo potential</p>
                </div>
              </div>
            </div>

            ${
              (newBrides?.length || 0) > 0
                ? `
            <!-- Bride Signups Table -->
            <div style="margin-top: 32px;">
              <h3 style="color: #E11D48; margin-bottom: 16px;">💕 New Bride/Couple Signups (${newBrides?.length})</h3>
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: #E11D48; color: white;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Name</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Email</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Plan</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600;">Revenue</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${brideRows}
                </tbody>
              </table>
            </div>
            `
                : ''
            }

            ${
              (newVendors?.length || 0) > 0
                ? `
            <!-- Vendor Signups Table -->
            <div style="margin-top: 32px;">
              <h3 style="color: #8b5cf6; margin-bottom: 16px;">🎉 New Vendor Signups (${newVendors?.length})</h3>
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: #8b5cf6; color: white;">
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Business</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Email</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Category</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Tier</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600;">Revenue</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600;">Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${vendorRows}
                </tbody>
              </table>
            </div>
            `
                : ''
            }

            ${
              totalSignups === 0
                ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e;">No new signups today. Keep marketing! 🚀</p>
            </div>
            `
                : ''
            }

            <!-- Footer Notes -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
              <p style="color: #666; font-size: 12px; margin: 8px 0;">
                <strong>Note:</strong> Revenue shown is potential Monthly Recurring Revenue (MRR) based on subscription tier.
                Actual billing begins when users convert from trial or complete payment setup.
              </p>
              <p style="color: #666; font-size: 12px; margin: 8px 0;">
                <strong>Coming Soon:</strong> Once Stripe integration is complete, this report will include:
              </p>
              <ul style="color: #666; font-size: 12px; margin: 8px 0; padding-left: 20px;">
                <li>Actual subscription payments received</li>
                <li>Cancellations and churn rate</li>
                <li>Failed payment attempts</li>
                <li>Net revenue (new - canceled)</li>
                <li>Trial conversions</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <a href="https://bellaweddingai.com/admin/dashboard" style="background: #E11D48; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Admin Dashboard</a>
            </div>

            <p style="color: #999; font-size: 11px; text-align: center; margin-top: 24px;">
              This is an automated daily summary from Bella Wedding AI<br/>
              Report generated at ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        summary: {
          date: today.toISOString(),
          totalSignups,
          newBrides: newBrides?.length || 0,
          newVendors: newVendors?.length || 0,
          brideRevenue,
          vendorRevenue,
          totalRevenue,
          cancellations: 0, // Will be populated when Stripe is integrated
        },
      });
    }

    return NextResponse.json({ error: 'Admin email or Resend API key not configured' }, { status: 500 });
  } catch (error: any) {
    console.error('Daily summary error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate daily summary' }, { status: 500 });
  }
}
