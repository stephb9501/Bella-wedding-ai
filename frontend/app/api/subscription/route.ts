import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Try to fetch bride subscription first
    let { data: brideSubscription } = await supabase
      .from('bride_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (brideSubscription) {
      return NextResponse.json({ subscription: brideSubscription });
    }

    // If no bride subscription, try vendor subscription
    let { data: vendorSubscription } = await supabase
      .from('vendor_subscriptions')
      .select('*')
      .eq('vendor_id', userId)
      .single();

    if (vendorSubscription) {
      // Transform vendor subscription to match bride subscription format
      const transformedSubscription = {
        id: vendorSubscription.id,
        plan_tier: vendorSubscription.plan_name,
        status: vendorSubscription.status,
        current_period_end: vendorSubscription.expires_at,
        cancel_at_period_end: !vendorSubscription.auto_renew,
        stripe_customer_id: vendorSubscription.stripe_customer_id,
        stripe_subscription_id: vendorSubscription.stripe_subscription_id,
      };
      return NextResponse.json({ subscription: transformedSubscription });
    }

    // No subscription found - user is on free plan
    return NextResponse.json({ subscription: null });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
