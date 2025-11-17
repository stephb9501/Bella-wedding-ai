import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { priceId, userType, userId, planId } = await request.json();

    if (!priceId || !userId || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const successUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl + '/settings/subscription?success=true',
      cancel_url: successUrl + '/settings/subscription?canceled=true',
      metadata: {
        userId,
        userType: userType || 'bride',
        planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
