import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Pricing plans for brides
export const BRIDE_PLANS = {
  standard: {
    id: 'standard',
    name: 'Standard Plan',
    price: 0,
    priceId: '', // Free plan, no Stripe price ID needed
    features: [
      'Basic wedding planning tools',
      'Timeline & checklist',
      'Budget tracker (basic)',
      '5 vendor messages/month',
      'Guest list up to 100',
      'Basic invitation creator',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 29.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    features: [
      'All Standard features',
      'Advanced budget tracking',
      '50 vendor messages/month',
      'Guest list up to 300',
      'Premium invitation templates',
      'Website builder',
      'AI wedding assistant',
      'Seating chart tool',
      'Registry aggregator',
      'Priority support',
    ],
  },
};

// Pricing plans for vendors
export const VENDOR_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    features: [
      'Basic profile',
      '5 messages/month',
      'View booking requests',
      'Basic analytics',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 49.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_VENDOR_PREMIUM_PRICE_ID || 'price_vendor_premium',
    features: [
      'Enhanced profile',
      'Unlimited messages',
      'Priority in search results',
      'Portfolio gallery (20 photos)',
      'Advanced analytics',
      'Lead notifications',
    ],
  },
  featured: {
    id: 'featured',
    name: 'Featured',
    price: 99.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_VENDOR_FEATURED_PRICE_ID || 'price_vendor_featured',
    features: [
      'All Premium features',
      'Featured badge',
      'Top of search results',
      'Portfolio gallery (50 photos)',
      'Social media integration',
      'Priority support',
    ],
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 199.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_VENDOR_ELITE_PRICE_ID || 'price_vendor_elite',
    features: [
      'All Featured features',
      'Exclusive spotlight placement',
      'Unlimited portfolio photos',
      'Dedicated account manager',
      'Custom branding',
      'White-glove onboarding',
    ],
  },
};

// Helper to get plan by ID
export function getBridePlan(planId: string) {
  return BRIDE_PLANS[planId as keyof typeof BRIDE_PLANS] || BRIDE_PLANS.standard;
}

export function getVendorPlan(planId: string) {
  return VENDOR_PLANS[planId as keyof typeof VENDOR_PLANS] || VENDOR_PLANS.free;
}
