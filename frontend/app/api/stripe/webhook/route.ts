import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerType = session.metadata?.customerType;

  if (!userId || !customerType) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Update user record with Stripe customer ID
  await supabase
    .from('users')
    .update({
      stripe_customer_id: session.customer as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  console.log(`Checkout completed for user ${userId} (${customerType})`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const customerType = subscription.metadata?.customerType;

  if (!userId || !customerType) {
    console.error('Missing metadata in subscription');
    return;
  }

  const priceId = subscription.items.data[0].price.id;
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Determine plan tier from price ID
  const planTier = getPlanTierFromPriceId(priceId, customerType);

  if (customerType === 'bride') {
    // Create bride subscription record
    await supabase.from('bride_subscriptions').insert({
      user_id: parseInt(userId),
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan_tier: planTier,
      status: status,
      current_period_end: currentPeriodEnd.toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

    // Update user tier
    await supabase
      .from('users')
      .update({ subscription_tier: planTier })
      .eq('id', userId);
  } else if (customerType === 'vendor') {
    // Create vendor subscription record
    await supabase.from('vendor_subscriptions').insert({
      vendor_id: parseInt(userId),
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan_name: planTier,
      plan_price: subscription.items.data[0].price.unit_amount! / 100,
      billing_cycle: subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
      status: status === 'active' ? 'active' : 'inactive',
      starts_at: new Date(subscription.current_period_start * 1000).toISOString(),
      expires_at: currentPeriodEnd.toISOString(),
      auto_renew: !subscription.cancel_at_period_end,
    });

    // Update vendor premium status
    await supabase
      .from('vendors')
      .update({
        is_premium: true,
        premium_tier: planTier,
        monthly_leads_limit: getLeadsLimit(planTier),
      })
      .eq('id', userId);
  }

  console.log(`Subscription created for user ${userId} (${customerType}): ${planTier}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const customerType = subscription.metadata?.customerType;

  if (!userId || !customerType) return;

  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const priceId = subscription.items.data[0].price.id;
  const planTier = getPlanTierFromPriceId(priceId, customerType);

  if (customerType === 'bride') {
    await supabase
      .from('bride_subscriptions')
      .update({
        status: status,
        plan_tier: planTier,
        current_period_end: currentPeriodEnd.toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    await supabase
      .from('users')
      .update({ subscription_tier: planTier })
      .eq('id', userId);
  } else if (customerType === 'vendor') {
    await supabase
      .from('vendor_subscriptions')
      .update({
        status: status === 'active' ? 'active' : 'inactive',
        plan_name: planTier,
        expires_at: currentPeriodEnd.toISOString(),
        auto_renew: !subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    await supabase
      .from('vendors')
      .update({
        premium_tier: planTier,
        monthly_leads_limit: getLeadsLimit(planTier),
      })
      .eq('id', userId);
  }

  console.log(`Subscription updated for user ${userId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const customerType = subscription.metadata?.customerType;

  if (!userId || !customerType) return;

  if (customerType === 'bride') {
    await supabase
      .from('bride_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    await supabase
      .from('users')
      .update({ subscription_tier: 'free' })
      .eq('id', userId);
  } else if (customerType === 'vendor') {
    await supabase
      .from('vendor_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    await supabase
      .from('vendors')
      .update({
        is_premium: false,
        premium_tier: 'basic',
        monthly_leads_limit: 10,
      })
      .eq('id', userId);
  }

  console.log(`Subscription canceled for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`);
  // Could send success email here
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`);
  // Could send payment failed email here
}

function getPlanTierFromPriceId(priceId: string, customerType: string): string {
  // Map price IDs to plan tiers
  // In production, store this mapping in database or env vars
  if (customerType === 'bride') {
    if (priceId.includes('standard')) return 'standard';
    if (priceId.includes('premium')) return 'premium';
    return 'free';
  } else {
    if (priceId.includes('silver')) return 'silver';
    if (priceId.includes('gold')) return 'gold';
    if (priceId.includes('platinum')) return 'platinum';
    return 'basic';
  }
}

function getLeadsLimit(planTier: string): number {
  const limits: { [key: string]: number } = {
    basic: 10,
    silver: 50,
    gold: 150,
    platinum: 999999,
  };
  return limits[planTier] || 10;
}
