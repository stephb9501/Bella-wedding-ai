import { NextRequest, NextResponse } from 'next/server';
import { createBookingPayment } from '@/lib/stripe-connect';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/bookings/create
 *
 * Creates a booking with commission-based payment and escrow
 *
 * Flow:
 * 1. Bride pays full amount
 * 2. Platform takes commission (based on vendor tier)
 * 3. 30% of net goes to vendor as deposit
 * 4. 70% of net held in escrow until job completion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brideId,
      vendorId,
      serviceType,
      eventDate,
      totalAmount, // in dollars
      description,
    } = body;

    // Validate inputs
    if (!brideId || !vendorId || !serviceType || !eventDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get vendor's Stripe Connect account
    const { data: vendorAccount, error: vendorError } = await supabase
      .from('vendor_stripe_accounts')
      .select('*')
      .eq('vendor_user_id', vendorId)
      .single();

    if (vendorError || !vendorAccount) {
      return NextResponse.json(
        { error: 'Vendor has not completed Stripe onboarding' },
        { status: 400 }
      );
    }

    if (!vendorAccount.charges_enabled || !vendorAccount.details_submitted) {
      return NextResponse.json(
        { error: 'Vendor account not fully activated' },
        { status: 400 }
      );
    }

    // Convert dollars to cents
    const amountInCents = Math.round(totalAmount * 100);

    // Create booking record first
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        bride_user_id: brideId,
        vendor_user_id: vendorId,
        service_type: serviceType,
        event_date: eventDate,
        total_amount: totalAmount,
        commission_rate: 0, // Will be updated after payment calculation
        commission_amount: 0,
        vendor_net_amount: 0,
        deposit_amount: 0,
        escrow_amount: 0,
        vendor_stripe_account_id: vendorAccount.stripe_account_id,
        status: 'pending',
        escrow_status: 'held',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Create payment with commission and escrow
    const { paymentIntent, payment } = await createBookingPayment({
      amount: amountInCents,
      brideId: brideId.toString(),
      vendorId: vendorId.toString(),
      vendorStripeAccountId: vendorAccount.stripe_account_id,
      vendorTier: vendorAccount.vendor_tier,
      bookingId: booking.id,
      description: description || `${serviceType} service booking`,
    });

    // Update booking with payment details
    await supabase
      .from('bookings')
      .update({
        payment_intent_id: paymentIntent.id,
        commission_rate: payment.commissionAmount / payment.totalAmount,
        commission_amount: payment.commissionAmount / 100, // Convert cents to dollars
        vendor_net_amount: payment.vendorNetAmount / 100,
        deposit_amount: payment.depositAmount / 100,
        escrow_amount: payment.escrowAmount / 100,
      })
      .eq('id', booking.id);

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        payment_intent_id: paymentIntent.id,
      },
      payment: {
        totalAmount: payment.totalAmount / 100,
        commissionAmount: payment.commissionAmount / 100,
        vendorNetAmount: payment.vendorNetAmount / 100,
        depositAmount: payment.depositAmount / 100,
        escrowAmount: payment.escrowAmount / 100,
      },
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
