'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Check, Loader2, Crown, Star, Zap } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  icon?: any;
  badge?: string;
}

const BRIDE_PLANS: Record<string, Plan> = {
  standard: {
    id: 'standard',
    name: 'Standard Plan',
    price: 0,
    priceId: '',
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
    icon: Crown,
    badge: 'Most Popular',
  },
};

const VENDOR_PLANS: Record<string, Plan> = {
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
    icon: Star,
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
    icon: Zap,
    badge: 'Best Value',
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
    icon: Crown,
    badge: 'Premium',
  },
};

export default function SubscriptionPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('standard');
  const [userType, setUserType] = useState<'bride' | 'vendor'>('bride');

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if vendor or bride
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (vendorData) {
        setUserType('vendor');
        setCurrentPlan(vendorData.subscription_tier || 'free');
      } else {
        const { data: userData } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        setUserType('bride');
        setCurrentPlan(userData?.subscription_tier || 'standard');
      }
    } catch (err) {
      console.error('Load user data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);

    try {
      const plans = userType === 'bride' ? BRIDE_PLANS : VENDOR_PLANS;
      const plan = plans[planId];

      if (plan.price === 0) {
        // Free/downgrade - just update in database
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const table = userType === 'bride' ? 'users' : 'vendors';
        const { error } = await supabase
          .from(table)
          .update({ subscription_tier: planId })
          .eq('id', user.id);

        if (error) throw error;

        setCurrentPlan(planId);
        alert('Plan updated successfully!');
        return;
      }

      // Paid plan - redirect to Stripe checkout
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          userType,
          userId: user.id,
          planId: plan.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { url } = await response.json();
      window.location.href = url;
    } catch (err: any) {
      console.error('Upgrade error:', err);
      alert(err.message || 'Failed to upgrade plan');
    } finally {
      setUpgrading(null);
    }
  };

  const plans = userType === 'bride' ? BRIDE_PLANS : VENDOR_PLANS;
  const plansList = Object.values(plans);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Subscription Plans</h1>
          </div>
          <button
            onClick={() => router.push(userType === 'bride' ? '/dashboard' : '/vendor-dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600">
            {userType === 'bride'
              ? 'Upgrade to unlock premium wedding planning features'
              : 'Grow your wedding business with our vendor tools'}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-champagne-100 rounded-full">
            <span className="text-sm font-medium text-champagne-900">Current Plan:</span>
            <span className="text-sm font-bold text-champagne-700 uppercase">{currentPlan}</span>
          </div>
        </div>

        <div className={`grid gap-8 ${plansList.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : plansList.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {plansList.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition hover:shadow-xl ${
                  plan.badge ? 'ring-2 ring-champagne-400' : ''
                }`}
              >
                {plan.badge && (
                  <div className="bg-gradient-to-r from-champagne-400 to-rose-400 text-white text-center py-2 px-4 text-sm font-bold">
                    {plan.badge}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    {Icon && <Icon className="w-8 h-8 text-champagne-600" />}
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    {plan.price > 0 && <span className="text-gray-600">/month</span>}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || upgrading === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-bold transition ${
                      isCurrent
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white shadow-md'
                    }`}
                  >
                    {upgrading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </span>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : plan.price > 0 ? (
                      'Upgrade Now'
                    ) : (
                      'Downgrade'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>All plans include a 7-day money-back guarantee.</p>
          <p className="mt-1">Cancel anytime, no questions asked.</p>
        </div>
      </div>
    </div>
  );
}
