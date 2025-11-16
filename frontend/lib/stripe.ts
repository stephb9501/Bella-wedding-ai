import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Bride subscription price IDs (replace with your actual Stripe price IDs)
export const BRIDE_PRICE_IDS = {
  standard_monthly: process.env.NEXT_PUBLIC_STRIPE_STANDARD_MONTHLY_PRICE_ID || 'price_standard_monthly',
  standard_yearly: process.env.NEXT_PUBLIC_STRIPE_STANDARD_YEARLY_PRICE_ID || 'price_standard_yearly',
  premium_monthly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly',
  premium_yearly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly',
};

// Vendor subscription price IDs
export const VENDOR_PRICE_IDS = {
  premium_monthly: process.env.NEXT_PUBLIC_STRIPE_VENDOR_PREMIUM_MONTHLY_PRICE_ID || 'price_vendor_premium_monthly',
  premium_yearly: process.env.NEXT_PUBLIC_STRIPE_VENDOR_PREMIUM_YEARLY_PRICE_ID || 'price_vendor_premium_yearly',
  featured_monthly: process.env.NEXT_PUBLIC_STRIPE_VENDOR_FEATURED_MONTHLY_PRICE_ID || 'price_vendor_featured_monthly',
  featured_yearly: process.env.NEXT_PUBLIC_STRIPE_VENDOR_FEATURED_YEARLY_PRICE_ID || 'price_vendor_featured_yearly',
  elite_monthly: process.env.NEXT_PUBLIC_STRIPE_VENDOR_ELITE_MONTHLY_PRICE_ID || 'price_vendor_elite_monthly',
  elite_yearly: process.env.NEXT_PUBLIC_STRIPE_VENDOR_ELITE_YEARLY_PRICE_ID || 'price_vendor_elite_yearly',
};

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  userEmail: string;
  customerType: 'bride' | 'vendor';
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const { priceId, userId, userEmail, customerType, successUrl, cancelUrl } = params;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        customerType,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          userId,
          customerType,
        },
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}
