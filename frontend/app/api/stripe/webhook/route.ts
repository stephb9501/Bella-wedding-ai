import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, userType, planId } = session.metadata || {};

        if (!userId || !userType || !planId) {
          throw new Error('Missing metadata in checkout session');
        }

        // Update user's tier in database
        const table = userType === 'bride' ? 'brides' : 'vendors';
        const { error } = await supabaseServer
          .from(table)
          .update({
            tier: planId,
            subscription_id: session.subscription,
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) throw error;

        console.log(` Subscription activated for ${userType} ${userId}: ${planId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const brideData = await supabaseServer
          .from('brides')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        const vendorData = await supabaseServer
          .from('vendors')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (brideData.data) {
          await supabaseServer
            .from('brides')
            .update({ subscription_status: subscription.status })
            .eq('id', brideData.data.id);
        } else if (vendorData.data) {
          await supabaseServer
            .from('vendors')
            .update({ subscription_status: subscription.status })
            .eq('id', vendorData.data.id);
        }

        console.log(` Subscription updated: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Downgrade to free tier
        const brideData = await supabaseServer
          .from('brides')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        const vendorData = await supabaseServer
          .from('vendors')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (brideData.data) {
          await supabaseServer
            .from('brides')
            .update({
              tier: 'standard',
              subscription_status: 'canceled',
              subscription_id: null,
            })
            .eq('id', brideData.data.id);
        } else if (vendorData.data) {
          await supabaseServer
            .from('vendors')
            .update({
              tier: 'free',
              subscription_status: 'canceled',
              subscription_id: null,
            })
            .eq('id', vendorData.data.id);
        }

        console.log(` Subscription canceled and downgraded to free tier`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Update subscription status to past_due
        const brideData = await supabaseServer
          .from('brides')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .single();

        const vendorData = await supabaseServer
          .from('vendors')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .single();

        if (brideData.data) {
          await supabaseServer
            .from('brides')
            .update({ subscription_status: 'past_due' })
            .eq('id', brideData.data.id);

          // TODO: Send email notification about failed payment
          console.log(`  Payment failed for bride: ${brideData.data.email}`);
        } else if (vendorData.data) {
          await supabaseServer
            .from('vendors')
            .update({ subscription_status: 'past_due' })
            .eq('id', vendorData.data.id);

          // TODO: Send email notification about failed payment
          console.log(`  Payment failed for vendor: ${vendorData.data.email}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
};
