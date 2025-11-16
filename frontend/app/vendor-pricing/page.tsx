'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Heart, Star, Crown, Zap, TrendingUp, Users, MessageCircle, BarChart3 } from 'lucide-react';

export default function VendorPricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Basic',
      tier: 'basic',
      price: { monthly: 0, annual: 0 },
      description: 'Start your presence on Bella Wedding AI',
      icon: Heart,
      color: 'gray',
      leads: '10 leads/month',
      features: [
        'Basic vendor profile',
        'Up to 10 leads per month',
        'Business name & contact info',
        'Service category listing',
        'Location & service area',
        'Basic search visibility',
        'Email notifications',
        'Standard support'
      ],
      limitations: [
        'No photos/videos',
        'No reviews display',
        'Limited search ranking',
        'No featured placement',
        'No analytics'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Silver',
      tier: 'silver',
      price: { monthly: 49, annual: 490 },
      description: 'Stand out with enhanced visibility',
      icon: Star,
      color: 'blue',
      leads: '50 leads/month',
      features: [
        'Everything in Basic, plus:',
        'Up to 50 leads per month',
        'Premium profile badge',
        'Photo gallery (20 photos)',
        'Business description (500 words)',
        'Pricing & packages display',
        'Client reviews & ratings',
        'Boosted search ranking',
        'Business hours display',
        'Social media links',
        'Basic analytics dashboard',
        'Priority email support'
      ],
      limitations: [],
      cta: 'Upgrade to Silver',
      popular: false,
      savings: billingCycle === 'annual' ? '$98/year' : null
    },
    {
      name: 'Gold',
      tier: 'gold',
      price: { monthly: 99, annual: 990 },
      description: 'Maximum exposure and leads',
      icon: Crown,
      color: 'yellow',
      leads: '150 leads/month',
      features: [
        'Everything in Silver, plus:',
        'Up to 150 leads per month',
        'Featured listing badge',
        'Unlimited photo gallery',
        'Profile video showcase',
        'Extended description (1500 words)',
        'Featured in category searches',
        'Priority placement in results',
        'Verified business badge',
        'Awards & certifications section',
        'Advanced analytics & insights',
        'Lead conversion tracking',
        'Competitor analysis',
        'Priority phone support',
        'Dedicated account manager'
      ],
      limitations: [],
      cta: 'Go Gold',
      popular: true,
      savings: billingCycle === 'annual' ? '$198/year' : null
    },
    {
      name: 'Platinum',
      tier: 'platinum',
      price: { monthly: 199, annual: 1990 },
      description: 'Ultimate visibility and premium placement',
      icon: Zap,
      color: 'purple',
      leads: 'Unlimited leads',
      features: [
        'Everything in Gold, plus:',
        'Unlimited monthly leads',
        'Top featured placement (guaranteed)',
        'Homepage featured vendor',
        'Category page top banner',
        'Social media promotion',
        'Exclusive email campaigns to brides',
        'Advanced SEO optimization',
        'Custom branded landing page',
        'Priority messaging badge',
        'Instant notification alerts',
        'White-glove onboarding',
        'Monthly strategy consultation',
        'Promotional materials & templates',
        '24/7 priority support',
        'Quarterly business review'
      ],
      limitations: [],
      cta: 'Go Platinum',
      popular: false,
      savings: billingCycle === 'annual' ? '$398/year' : null
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      gray: { bg: 'bg-gray-50', text: 'text-gray-600', accent: 'bg-gray-800' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-600' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', accent: 'bg-yellow-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-600' }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <TrendingUp className="w-8 h-8 text-champagne-600" />
          <h1 className="text-5xl md:text-6xl font-serif text-champagne-900">
            Grow Your Wedding Business
          </h1>
        </div>
        <p className="text-xl text-champagne-700 mb-8 max-w-3xl mx-auto">
          Connect with couples planning their dream wedding. Choose the plan that fits your business goals.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className={`font-medium ${billingCycle === 'monthly' ? 'text-champagne-900' : 'text-champagne-600'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-champagne-200 transition-colors"
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
              Save up to $398/year
            </span>
          )}
        </div>
        <p className="text-sm text-champagne-600">Get 2 months free with annual billing</p>
      </div>

      {/* ROI Stats */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-serif text-center text-champagne-900 mb-8">
            Why Vendors Love Bella Wedding AI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-champagne-900 mb-1">50K+</div>
              <div className="text-sm text-champagne-600">Active Couples</div>
            </div>
            <div className="text-center">
              <MessageCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-champagne-900 mb-1">73%</div>
              <div className="text-sm text-champagne-600">Average Response Rate</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-champagne-900 mb-1">2.8x</div>
              <div className="text-sm text-champagne-600">Avg. Lead Increase</div>
            </div>
            <div className="text-center">
              <BarChart3 className="w-10 h-10 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-champagne-900 mb-1">$4.2K</div>
              <div className="text-sm text-champagne-600">Avg. Monthly ROI (Gold+)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const colors = getColorClasses(plan.color);
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-yellow-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className={`${colors.bg} px-6 py-6 text-center`}>
                  <Icon className={`w-10 h-10 ${colors.text} mx-auto mb-3`} />
                  <h3 className="text-xl font-serif text-champagne-900 mb-1">{plan.name}</h3>
                  <p className="text-champagne-600 text-xs mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-champagne-900">
                      ${plan.price[billingCycle]}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-champagne-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    )}
                  </div>
                  {plan.savings && (
                    <p className="text-green-600 font-semibold text-xs">{plan.savings}</p>
                  )}
                  <div className="mt-3 px-3 py-2 bg-white rounded-lg">
                    <div className="text-sm font-semibold text-champagne-900">{plan.leads}</div>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                        <span className="text-champagne-700 text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => router.push('/auth')}
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-white text-sm transition-colors ${colors.accent} hover:opacity-90`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-serif text-champagne-900 mb-8 text-center">What Vendors Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-champagne-700 text-sm mb-4">
              "Since upgrading to Gold, our lead volume increased 3x. Best investment for our photography business!"
            </p>
            <div className="font-semibold text-champagne-900 text-sm">Sarah M.</div>
            <div className="text-champagne-600 text-xs">Wedding Photographer, Los Angeles</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-champagne-700 text-sm mb-4">
              "Platinum plan gave us top visibility. Booked 12 weddings in first 2 months. ROI is incredible!"
            </p>
            <div className="font-semibold text-champagne-900 text-sm">James & Maria T.</div>
            <div className="text-champagne-600 text-xs">Wedding Planners, Miami</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-champagne-700 text-sm mb-4">
              "The analytics help us understand our market better. Silver plan paid for itself in the first month."
            </p>
            <div className="font-semibold text-champagne-900 text-sm">David K.</div>
            <div className="text-champagne-600 text-xs">Caterer, Seattle</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-champagne-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif mb-4">Ready to Grow Your Business?</h2>
          <p className="text-champagne-200 mb-8 text-lg">
            Join hundreds of wedding vendors who are growing their business with Bella Wedding AI
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-8 py-4 bg-white text-champagne-900 rounded-lg font-semibold text-lg hover:bg-champagne-50 transition-colors"
          >
            Start Your Free Trial
          </button>
          <p className="text-champagne-300 text-sm mt-4">No credit card required • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
