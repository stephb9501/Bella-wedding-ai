import { NextRequest, NextResponse } from 'next/server';
import { createLaunchCoupon, LAUNCH_DISCOUNTS } from '@/lib/discounts';

/**
 * Admin API Route: Create Launch Discount Coupons
 *
 * POST /api/admin/create-launch-coupons
 *
 * This creates all predefined launch discount codes in Stripe.
 * Run this ONCE before launch to set up your promo codes.
 *
 * Security: In production, protect this route with admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check here
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const results = [];
    const errors = [];

    // Create all launch discount coupons
    for (const [key, discount] of Object.entries(LAUNCH_DISCOUNTS)) {
      try {
        const result = await createLaunchCoupon(discount);
        results.push({
          name: key,
          code: discount.code,
          couponId: result.coupon.id,
          promoCodeId: result.promotionCode.id,
          percentOff: discount.percentOff,
          duration: discount.duration,
        });
      } catch (error: any) {
        // If coupon already exists, that's okay
        if (error.code === 'resource_already_exists') {
          results.push({
            name: key,
            code: discount.code,
            status: 'already_exists',
          });
        } else {
          errors.push({
            name: key,
            error: error.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Launch coupons created successfully',
      created: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error creating launch coupons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create launch coupons' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/create-launch-coupons
 * Returns list of available launch discounts without creating them
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    availableDiscounts: Object.entries(LAUNCH_DISCOUNTS).map(([key, discount]) => ({
      name: key,
      code: discount.code,
      percentOff: discount.percentOff,
      duration: discount.duration,
      durationInMonths: discount.durationInMonths,
      maxRedemptions: discount.maxRedemptions,
      description: getDiscountDescription(discount),
    })),
  });
}

function getDiscountDescription(discount: any): string {
  const percent = discount.percentOff;
  const duration = discount.duration;

  if (duration === 'once') {
    return `${percent}% off first payment`;
  } else if (duration === 'repeating') {
    return `${percent}% off for ${discount.durationInMonths} months`;
  } else if (duration === 'forever') {
    return `${percent}% off forever`;
  }

  return 'Discount';
}
