import { NextRequest, NextResponse } from 'next/server';
import { stripe, BRIDE_PLANS, VENDOR_PLANS } from '@/lib/stripe';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { planId, userType, userId } = await request.json();

    if (!planId || !userType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, userType, userId' },
        { status: 400 }
      );
    }

    // Get the appropriate plan
    const plans = userType === 'bride' ? BRIDE_PLANS : VENDOR_PLANS;
    const plan = plans[planId as keyof typeof plans];

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Free plans don't need Stripe checkout
    if (plan.price === 0) {
      return NextResponse.json({
        message: 'Free plan selected. Updating tier directly.',
        redirect: '/dashboard',
      });
    }

    // Get user email from database
    const table = userType === 'bride' ? 'brides' : 'vendors';
    const { data: userData, error: userError } = await supabaseServer
      .from(table)
      .select('email, id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userData.email,
      client_reference_id: userId,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        userType,
        planId,
      },
      success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard?payment=success&plan=${planId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/bride-subscription?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
