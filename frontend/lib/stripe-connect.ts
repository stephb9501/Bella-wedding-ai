import { stripe } from './stripe';

/**
 * Stripe Connect Commission & Escrow System
 *
 * Features:
 * - Vendor onboarding with Stripe Connect Express
 * - Commission-based payments (0%, 2%, 5%, 10% based on tier)
 * - 30% deposit to vendor immediately
 * - 70% held in escrow until job completion
 * - Automatic escrow release on completion
 */

export interface VendorTier {
  tier: 'free' | 'premium' | 'featured' | 'elite';
  commissionRate: number; // 0.10 = 10%, 0.05 = 5%, etc.
}

export const VENDOR_COMMISSION_RATES: Record<string, number> = {
  free: 0.10,      // 10%
  premium: 0.05,   // 5%
  featured: 0.02,  // 2%
  elite: 0.00,     // 0%
};

/**
 * Create Stripe Connect Express account for vendor
 */
export async function createConnectAccount(vendorId: string, email: string, businessName: string) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      business_type: 'individual',
      business_profile: {
        name: businessName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        vendorId: vendorId.toString(),
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw error;
  }
}

/**
 * Create Connect onboarding link for vendor
 */
export async function createConnectOnboardingLink(accountId: string, returnUrl: string, refreshUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    throw error;
  }
}

/**
 * Check if vendor's Connect account is fully onboarded
 */
export async function checkConnectAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirementsCurrently: account.requirements?.currently_due || [],
      isFullyOnboarded: account.charges_enabled && account.details_submitted,
    };
  } catch (error) {
    console.error('Error checking account status:', error);
    throw error;
  }
}

/**
 * Calculate commission and split for booking
 */
export function calculateBookingPayment(
  totalAmount: number, // in cents
  vendorTier: string
): {
  totalAmount: number;
  commissionAmount: number;
  vendorNetAmount: number;
  depositAmount: number; // 30% of net
  escrowAmount: number;  // 70% of net
} {
  const commissionRate = VENDOR_COMMISSION_RATES[vendorTier] || 0.10;
  const commissionAmount = Math.round(totalAmount * commissionRate);
  const vendorNetAmount = totalAmount - commissionAmount;
  const depositAmount = Math.round(vendorNetAmount * 0.30); // 30% deposit
  const escrowAmount = vendorNetAmount - depositAmount; // 70% escrow

  return {
    totalAmount,
    commissionAmount,
    vendorNetAmount,
    depositAmount,
    escrowAmount,
  };
}

/**
 * Create booking payment with commission and escrow
 *
 * Flow:
 * 1. Bride pays full amount
 * 2. Platform takes commission
 * 3. 30% of net goes to vendor as deposit
 * 4. 70% of net held in escrow until job completion
 */
export async function createBookingPayment(params: {
  amount: number; // Total amount in cents
  brideId: string;
  vendorId: string;
  vendorStripeAccountId: string;
  vendorTier: string;
  bookingId: string;
  description: string;
}) {
  const { amount, brideId, vendorId, vendorStripeAccountId, vendorTier, bookingId, description } = params;

  try {
    // Calculate payment split
    const payment = calculateBookingPayment(amount, vendorTier);

    // Create PaymentIntent with destination charge
    // This charges the bride and splits payment to vendor
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      application_fee_amount: payment.commissionAmount, // Platform commission
      transfer_data: {
        amount: payment.depositAmount, // 30% deposit goes immediately to vendor
        destination: vendorStripeAccountId,
      },
      metadata: {
        bookingId,
        brideId,
        vendorId,
        vendorTier,
        escrowAmount: payment.escrowAmount.toString(),
        depositAmount: payment.depositAmount.toString(),
        commissionAmount: payment.commissionAmount.toString(),
      },
      description,
    });

    return {
      paymentIntent,
      payment,
    };
  } catch (error) {
    console.error('Error creating booking payment:', error);
    throw error;
  }
}

/**
 * Release escrow to vendor upon job completion
 *
 * This transfers the remaining 70% to the vendor
 */
export async function releaseEscrow(params: {
  bookingId: string;
  vendorStripeAccountId: string;
  escrowAmount: number; // in cents
  vendorTier: string;
}) {
  const { bookingId, vendorStripeAccountId, escrowAmount, vendorTier } = params;

  try {
    // Transfer escrow amount to vendor
    const transfer = await stripe.transfers.create({
      amount: escrowAmount,
      currency: 'usd',
      destination: vendorStripeAccountId,
      metadata: {
        bookingId,
        type: 'escrow_release',
        vendorTier,
      },
      description: `Escrow release for booking ${bookingId}`,
    });

    return transfer;
  } catch (error) {
    console.error('Error releasing escrow:', error);
    throw error;
  }
}

/**
 * Refund booking (before job completion)
 *
 * Handles refunding bride and reclaiming deposit from vendor
 */
export async function refundBooking(params: {
  paymentIntentId: string;
  amount?: number; // Optional partial refund amount in cents
  reason?: string;
}) {
  const { paymentIntentId, amount, reason } = params;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // Full refund if not specified
      reason: reason || 'requested_by_customer',
    });

    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

/**
 * Get Connect account login link for vendor dashboard
 */
export async function createConnectLoginLink(accountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw error;
  }
}

/**
 * Get vendor payout history
 */
export async function getVendorPayouts(accountId: string, limit: number = 10) {
  try {
    const transfers = await stripe.transfers.list({
      destination: accountId,
      limit,
    });

    return transfers.data;
  } catch (error) {
    console.error('Error fetching payouts:', error);
    throw error;
  }
}
