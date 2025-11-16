import { stripe } from './stripe';

/**
 * Launch Discount & Promo Code Management System
 *
 * Features:
 * - Create launch discount coupons
 * - Apply automatic discounts
 * - Manage trial periods
 * - Track promo code usage
 */

export interface DiscountConfig {
  code: string;
  percentOff?: number; // e.g., 20 for 20% off
  amountOff?: number; // e.g., 500 for $5.00 off (in cents)
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number; // Only for 'repeating'
  maxRedemptions?: number;
  expiresAt?: Date;
}

/**
 * Create a launch discount coupon in Stripe
 */
export async function createLaunchCoupon(config: DiscountConfig) {
  try {
    const couponData: any = {
      name: config.code,
      duration: config.duration,
    };

    if (config.percentOff) {
      couponData.percent_off = config.percentOff;
    } else if (config.amountOff) {
      couponData.amount_off = config.amountOff;
      couponData.currency = 'usd';
    }

    if (config.duration === 'repeating' && config.durationInMonths) {
      couponData.duration_in_months = config.durationInMonths;
    }

    if (config.maxRedemptions) {
      couponData.max_redemptions = config.maxRedemptions;
    }

    if (config.expiresAt) {
      couponData.redeem_by = Math.floor(config.expiresAt.getTime() / 1000);
    }

    const coupon = await stripe.coupons.create(couponData);

    // Create promotion code for easier customer use
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: config.code,
      active: true,
    });

    return { coupon, promotionCode };
  } catch (error) {
    console.error('Error creating launch coupon:', error);
    throw error;
  }
}

/**
 * Predefined launch discount codes
 * Call these functions to create coupons in Stripe
 */
export const LAUNCH_DISCOUNTS = {
  // 50% off first month for early adopters
  LAUNCH50: {
    code: 'LAUNCH50',
    percentOff: 50,
    duration: 'once' as const,
    maxRedemptions: 100,
  },

  // 30% off for 3 months
  EARLYADOPTER: {
    code: 'EARLYADOPTER',
    percentOff: 30,
    duration: 'repeating' as const,
    durationInMonths: 3,
    maxRedemptions: 50,
  },

  // Free first month
  FIRSTMONTHFREE: {
    code: 'FIRSTMONTHFREE',
    percentOff: 100,
    duration: 'once' as const,
    maxRedemptions: 25,
  },

  // 20% off forever for founding members
  FOUNDING20: {
    code: 'FOUNDING20',
    percentOff: 20,
    duration: 'forever' as const,
    maxRedemptions: 10,
  },

  // Vendor specific - 40% off first 3 months
  VENDORLAUNCH: {
    code: 'VENDORLAUNCH',
    percentOff: 40,
    duration: 'repeating' as const,
    durationInMonths: 3,
    maxRedemptions: 50,
  },

  // First 50 brides - FREE for 3 months (100% off)
  EARLYACCESS: {
    code: 'EARLYACCESS',
    percentOff: 100,
    duration: 'repeating' as const,
    durationInMonths: 3,
    maxRedemptions: 50,
  },

  // Next 50 brides - 50% off for 3 months
  DISCOUNTED50: {
    code: 'DISCOUNTED50',
    percentOff: 50,
    duration: 'repeating' as const,
    durationInMonths: 3,
    maxRedemptions: 50,
  },
};

/**
 * Get active promotion codes
 */
export async function getActivePromoCodes() {
  try {
    const promoCodes = await stripe.promotionCodes.list({
      active: true,
      limit: 100,
    });
    return promoCodes.data;
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    throw error;
  }
}

/**
 * Deactivate a promotion code
 */
export async function deactivatePromoCode(promoCodeId: string) {
  try {
    const promoCode = await stripe.promotionCodes.update(promoCodeId, {
      active: false,
    });
    return promoCode;
  } catch (error) {
    console.error('Error deactivating promo code:', error);
    throw error;
  }
}

/**
 * Get coupon usage statistics
 */
export async function getCouponStats(couponId: string) {
  try {
    const coupon = await stripe.coupons.retrieve(couponId);
    return {
      id: coupon.id,
      name: coupon.name,
      percentOff: coupon.percent_off,
      amountOff: coupon.amount_off,
      timesRedeemed: coupon.times_redeemed,
      maxRedemptions: coupon.max_redemptions,
      valid: coupon.valid,
    };
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    throw error;
  }
}

/**
 * Apply automatic discount for first X customers
 * Use this in your checkout session creation
 */
export function shouldApplyAutoDiscount(userCreatedAt: Date, launchDate: Date, maxDays: number = 30): boolean {
  const daysSinceLaunch = (userCreatedAt.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLaunch <= maxDays;
}

/**
 * Create trial period subscription (14-day free trial)
 */
export async function createTrialSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 14
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    throw error;
  }
}
