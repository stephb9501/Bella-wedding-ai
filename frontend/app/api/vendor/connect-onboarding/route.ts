import { NextRequest, NextResponse } from 'next/server';
import { createConnectAccount, createConnectOnboardingLink } from '@/lib/stripe-connect';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/vendor/connect-onboarding
 *
 * Creates a Stripe Connect Express account for vendor and returns onboarding link
 */
export async function POST(request: NextRequest) {
  try {
    const { vendorId, email, businessName } = await request.json();

    if (!vendorId || !email || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if vendor already has Connect account
    const { data: existingAccount } = await supabase
      .from('vendor_stripe_accounts')
      .select('*')
      .eq('vendor_user_id', vendorId)
      .single();

    let stripeAccountId: string;

    if (existingAccount) {
      // Use existing account
      stripeAccountId = existingAccount.stripe_account_id;
    } else {
      // Create new Stripe Connect account
      const account = await createConnectAccount(vendorId, email, businessName);
      stripeAccountId = account.id;

      // Get vendor tier from subscriptions table
      const { data: subscription } = await supabase
        .from('vendor_subscriptions')
        .select('plan_tier')
        .eq('user_id', vendorId)
        .single();

      const vendorTier = subscription?.plan_tier || 'free';

      // Save to database
      await supabase.from('vendor_stripe_accounts').insert({
        vendor_user_id: vendorId,
        stripe_account_id: stripeAccountId,
        vendor_tier: vendorTier,
      });
    }

    // Create onboarding link
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor-dashboard?onboarding=success`;
    const refreshUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor-dashboard?onboarding=refresh`;

    const accountLink = await createConnectOnboardingLink(
      stripeAccountId,
      returnUrl,
      refreshUrl
    );

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      stripeAccountId,
    });
  } catch (error: any) {
    console.error('Error in connect-onboarding:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vendor/connect-onboarding?vendorId=123
 *
 * Check vendor's Connect onboarding status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Missing vendorId parameter' },
        { status: 400 }
      );
    }

    // Get vendor's Connect account from database
    const { data: account, error } = await supabase
      .from('vendor_stripe_accounts')
      .select('*')
      .eq('vendor_user_id', vendorId)
      .single();

    if (error || !account) {
      return NextResponse.json({
        hasAccount: false,
        isOnboarded: false,
      });
    }

    return NextResponse.json({
      hasAccount: true,
      isOnboarded: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      stripeAccountId: account.stripe_account_id,
      vendorTier: account.vendor_tier,
    });
  } catch (error: any) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}
