import { NextRequest, NextResponse } from 'next/server';
import { releaseEscrow } from '@/lib/stripe-connect';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/bookings/release-escrow
 *
 * Releases escrow to vendor when job is completed
 * Transfers the remaining 70% of net amount to vendor
 */
export async function POST(request: NextRequest) {
  try {
    const { bookingId, completedByUserId, reason } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing bookingId' },
        { status: 400 }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate booking status
    if (booking.escrow_status !== 'held') {
      return NextResponse.json(
        { error: `Escrow already ${booking.escrow_status}` },
        { status: 400 }
      );
    }

    if (booking.status === 'cancelled' || booking.status === 'refunded') {
      return NextResponse.json(
        { error: 'Cannot release escrow for cancelled/refunded booking' },
        { status: 400 }
      );
    }

    // Get vendor account details
    const { data: vendorAccount } = await supabase
      .from('vendor_stripe_accounts')
      .select('*')
      .eq('vendor_user_id', booking.vendor_user_id)
      .single();

    if (!vendorAccount) {
      return NextResponse.json(
        { error: 'Vendor account not found' },
        { status: 404 }
      );
    }

    // Convert escrow amount to cents
    const escrowAmountInCents = Math.round(booking.escrow_amount * 100);

    // Release escrow via Stripe transfer
    const transfer = await releaseEscrow({
      bookingId: booking.id,
      vendorStripeAccountId: vendorAccount.stripe_account_id,
      escrowAmount: escrowAmountInCents,
      vendorTier: vendorAccount.vendor_tier,
    });

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'completed',
        escrow_status: 'released',
        completed_at: new Date().toISOString(),
        escrow_released_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    // Record escrow release
    await supabase.from('escrow_releases').insert({
      booking_id: bookingId,
      amount: booking.escrow_amount,
      stripe_transfer_id: transfer.id,
      released_by_user_id: completedByUserId || null,
      release_reason: reason || 'Job completed',
    });

    return NextResponse.json({
      success: true,
      message: 'Escrow released successfully',
      transfer: {
        id: transfer.id,
        amount: booking.escrow_amount,
        releasedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to release escrow' },
      { status: 500 }
    );
  }
}
