'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { Check, Heart, Sparkles, Crown, Zap, Loader2 } from 'lucide-react';
import { BRIDE_PRICE_IDS } from '@/lib/stripe';

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for browsing and exploring',
      icon: Heart,
      color: 'rose',
      features: [
        'Browse vendor directory',
        'View sample checklists',
        'Explore planning tools',
        'Limited vendor contacts (3/month)',
        'Basic wedding inspiration',
        'Community forums access'
      ],
      limitations: [
        'No custom checklists',
        'No budget tracking',
        'No timeline builder',
        'No décor planner',
        'Limited AI assistance'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Standard',
      price: { monthly: 19.99, annual: 199 },
      description: 'Everything you need to plan your wedding',
      icon: Sparkles,
      color: 'champagne',
      features: [
        '1 active wedding + 1 archived',
        'Up to 75 guests',
        '90+ Task Checklist with deadlines',
        'Complete Budget Planner',
        'Wedding Timeline Builder',
        'Décor Zone Planner',
        'Up to 30 photos',
        '3 website sections (Home, Schedule, RSVP)',
        'Save up to 5 vendors',
        '5 vendor messages per month',
        'Basic AI (checklist, timeline, budget, sorting)',
        '1 binder export',
        'Basic vendor search',
        'Email notifications'
      ],
      limitations: [],
      cta: 'Start Planning',
      popular: true,
      savings: billingCycle === 'annual' ? '$40/year' : null
    },
    {
      name: 'Premium',
      price: { monthly: 29.99, annual: 299 },
      description: 'Advanced features for sophisticated planning',
      icon: Crown,
      color: 'purple',
      features: [
        'Everything in Standard, plus:',
        '1 active wedding + 1 archived',
        'UNLIMITED guests',
        'Up to 150 photos',
        'Video support (30-sec, coming in Phase 2)',
        '8 website sections',
        'Save up to 50 vendors',
        'Vendor messages: 30/mo (first 3 months), then 50/mo',
        'Full AI Suite:',
        '• AI vendor matching',
        '• AI décor mockups',
        '• AI floor plans',
        '• AI palette builder',
        '• AI writing assistant',
        '• AI binder generator',
        'Unlimited binder exports',
        'Seating chart designer',
        'Priority support'
      ],
      limitations: [],
      cta: 'Go Premium',
      popular: false,
      savings: billingCycle === 'annual' ? '$80/year' : null
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'hover') => {
    const colors = {
      rose: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-600',
        hover: 'hover:bg-rose-700'
      },
      champagne: {
        bg: 'bg-champagne-50',
        text: 'text-champagne-600',
        border: 'border-champagne-600',
        hover: 'hover:bg-champagne-700'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-600',
        hover: 'hover:bg-purple-700'
      }
    };
    return colors[color as keyof typeof colors][type];
  };

  const handleSubscribe = async (planName: string) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.push('/auth?redirect=/pricing');
      return;
    }

    // Free plan - just redirect to dashboard
    if (planName === 'Free') {
      router.push('/dashboard');
      return;
    }

    setLoadingPlan(planName);

    try {
      // Determine price ID based on plan and billing cycle
      let priceId = '';
      if (planName === 'Standard') {
        priceId = billingCycle === 'monthly' ? BRIDE_PRICE_IDS.standard_monthly : BRIDE_PRICE_IDS.standard_yearly;
      } else if (planName === 'Premium') {
        priceId = billingCycle === 'monthly' ? BRIDE_PRICE_IDS.premium_monthly : BRIDE_PRICE_IDS.premium_yearly;
      }

      // Call API to create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id.toString(),
          userEmail: user.email,
          customerType: 'bride',
          plan: planName.toLowerCase(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-purple-50">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl font-serif text-champagne-900 mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-champagne-700 mb-8 max-w-2xl mx-auto">
          From free exploration to premium planning, we have the right tools for your dream wedding
        </p>

        {/* Early Access Banner */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl p-8 border-4 border-purple-300">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-8 h-8" />
              <h2 className="text-3xl font-serif">Early Access Special Offers!</h2>
              <Zap className="w-8 h-8" />
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border-2 border-white/30">
                <div className="text-2xl font-bold mb-2">🎁 First 50 Brides</div>
                <div className="text-xl mb-3">FREE for 3 Months!</div>
                <ul className="text-sm text-left space-y-1">
                  <li>✓ Premium features included</li>
                  <li>✓ Up to 30 photos</li>
                  <li>✓ Full AI Suite access</li>
                  <li>✓ Choose plan after 3 months</li>
                </ul>
                <div className="mt-4 text-xs opacity-90">Limited to first 50 signups only</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border-2 border-white/30">
                <div className="text-2xl font-bold mb-2">⭐ Next 50 Brides</div>
                <div className="text-xl mb-3">50% OFF for 3 Months!</div>
                <ul className="text-sm text-left space-y-1">
                  <li>✓ Standard: $9.99/mo (reg. $19.99)</li>
                  <li>✓ Premium: $14.99/mo (reg. $29.99)</li>
                  <li>✓ Full feature access</li>
                  <li>✓ No commitment required</li>
                </ul>
                <div className="mt-4 text-xs opacity-90">Available for signups 51-100</div>
              </div>
            </div>
            <div className="mt-6 text-sm">
              <strong>Use code:</strong> EARLYACCESS or DISCOUNTED50 at checkout
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className={`font-medium ${billingCycle === 'monthly' ? 'text-champagne-900' : 'text-champagne-600'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-champagne-200 transition-colors focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`font-medium ${billingCycle === 'annual' ? 'text-champagne-900' : 'text-champagne-600'}`}>
            Annual
          </span>
          {billingCycle === 'annual' && (
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
              Save up to $80/year
            </span>
          )}
        </div>
        <p className="text-sm text-champagne-600">
          Get 2 months free with annual billing
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-champagne-600' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-champagne-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className={`${getColorClasses(plan.color, 'bg')} px-8 py-8 text-center`}>
                  <Icon className={`w-12 h-12 ${getColorClasses(plan.color, 'text')} mx-auto mb-4`} />
                  <h3 className="text-2xl font-serif text-champagne-900 mb-2">{plan.name}</h3>
                  <p className="text-champagne-600 text-sm mb-6">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-champagne-900">
                      ${plan.price[billingCycle]}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-champagne-600 text-lg">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>
                  {plan.savings && (
                    <p className="text-green-600 font-semibold text-sm">{plan.savings} savings</p>
                  )}
                </div>

                {/* Features */}
                <div className="px-8 py-8">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className={`w-5 h-5 ${getColorClasses(plan.color, 'text')} flex-shrink-0 mt-0.5`} />
                        <span className="text-champagne-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-champagne-600 hover:bg-champagne-700'
                        : 'bg-gray-800 hover:bg-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingPlan === plan.name ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-serif text-champagne-900 mb-8 text-center">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-champagne-200">
                  <th className="text-left py-4 px-4 text-champagne-900 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-champagne-900 font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-champagne-900 font-semibold">Standard</th>
                  <th className="text-center py-4 px-4 text-champagne-900 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Vendor Directory Access</td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Vendor Contacts/Month</td>
                  <td className="text-center py-3 px-4 text-champagne-600">3</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">Unlimited</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Checklist Tasks</td>
                  <td className="text-center py-3 px-4 text-champagne-600">View Only</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">90+</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">90+</td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Budget Planner</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Timeline Builder</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Décor Planner</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">AI Planning Assistant</td>
                  <td className="text-center py-3 px-4 text-champagne-600">Basic</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">Standard</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">Advanced</td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Guest List Capacity</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">200</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Wedding Website Builder</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">RSVP Management</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Seating Chart Designer</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b border-champagne-100">
                  <td className="py-3 px-4 text-champagne-700">Planning Consultant</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4 text-champagne-400">-</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">1 hr/mo</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-champagne-700">Support Level</td>
                  <td className="text-center py-3 px-4 text-champagne-600">Email</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">Priority Email</td>
                  <td className="text-center py-3 px-4 text-champagne-900 font-semibold">Phone + Email</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-serif text-champagne-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-champagne-900 mb-2">Can I switch plans later?</h3>
            <p className="text-champagne-700 text-sm">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-champagne-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-champagne-700 text-sm">
              We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-champagne-900 mb-2">Is there a refund policy?</h3>
            <p className="text-champagne-700 text-sm">
              Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-champagne-900 mb-2">Do annual plans auto-renew?</h3>
            <p className="text-champagne-700 text-sm">
              Yes, but we'll send you a reminder email 30 days before renewal. You can cancel anytime from your account settings.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-champagne-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-4">Ready to Start Planning?</h2>
          <p className="text-champagne-200 mb-8 text-lg">
            Join thousands of couples who have planned their perfect wedding with Bella Wedding AI
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-8 py-4 bg-white text-champagne-900 rounded-lg font-semibold text-lg hover:bg-champagne-50 transition-colors inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}
