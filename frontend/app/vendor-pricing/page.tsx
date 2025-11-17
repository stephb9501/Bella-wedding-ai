'use client';

import { useRouter } from 'next/navigation';
import { Heart, Check, Star, Zap, Crown } from 'lucide-react';

export default function VendorPricing() {
  const router = useRouter();

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Basic listing to get started',
      icon: Heart,
      color: 'from-gray-400 to-gray-600',
      features: [
        '1 photo',
        'Basic profile',
        'Listed at bottom of search',
        '5 replies per month',
        '10% commission on booked jobs',
        'No analytics',
        'Not eligible for AI matching',
      ],
      cta: 'Get Started Free',
      tier: 'free'
    },
    {
      name: 'Premium',
      price: '$34.99',
      period: 'per month',
      description: 'Perfect for small solo vendors',
      icon: Star,
      color: 'from-blue-400 to-blue-600',
      features: [
        'Up to 25 photos',
        'Full profile with website & social links',
        'Medium search visibility',
        'Unlimited inbound messages',
        'Unlimited outbound replies',
        'Basic analytics',
        '5% commission per booked job',
        '1 region • 1 category',
        '1 staff login',
      ],
      cta: 'Start Premium',
      tier: 'premium',
      popular: false
    },
    {
      name: 'Featured',
      price: '$49.99',
      period: 'per month',
      description: 'Best value for most professionals',
      icon: Zap,
      color: 'from-purple-400 to-purple-600',
      features: [
        'Everything in Premium',
        'Up to 50 photos',
        'Featured badge on profile',
        'Priority search placement',
        'Homepage rotation',
        'Full analytics (views, clicks, saves, CTR)',
        'AI profile optimizer',
        '2% commission per booked job',
        '2 categories • 2 regions',
        '2 staff accounts',
      ],
      cta: 'Go Featured',
      tier: 'featured',
      popular: true
    },
    {
      name: 'Elite',
      price: '$79.99',
      period: 'per month',
      description: 'For large vendors & multi-location businesses',
      icon: Crown,
      color: 'from-amber-400 to-amber-600',
      features: [
        'Everything in Featured',
        'Unlimited photos',
        'Top search placement',
        '"Recommended Vendor" section',
        'Multi-city visibility (up to 3 cities)',
        'Up to 3 categories',
        'Up to 5 staff accounts',
        'AI automation tools',
        'Custom support',
        '0% commission - no booking fees ever',
      ],
      cta: 'Go Elite',
      tier: 'elite'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-champagne-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Bella Wedding AI
            </h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Vendor Pricing
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Choose the perfect plan to grow your wedding business and connect with more couples
        </p>
        <p className="text-sm text-gray-500">
          All plans include a 14-day free trial • Cancel anytime • No credit card required
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  tier.popular ? 'ring-4 ring-purple-400 relative' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className={`bg-gradient-to-r ${tier.color} p-6 text-white`}>
                  <Icon className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    <span className="text-sm opacity-90">/{tier.period}</span>
                  </div>
                  <p className="text-sm opacity-90">{tier.description}</p>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => router.push(`/vendor-register?tier=${tier.tier}`)}
                    className={`w-full py-3 rounded-lg font-bold transition transform hover:scale-105 shadow-md ${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Frequently Asked Questions
        </h3>

        <div className="space-y-6 bg-white rounded-2xl shadow-sm p-8">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Can I change plans later?</h4>
            <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time from your vendor dashboard.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h4>
            <p className="text-gray-600">We accept all major credit cards, debit cards, and ACH bank transfers through Stripe.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Is there a setup fee?</h4>
            <p className="text-gray-600">No! There are no setup fees, cancellation fees, or hidden charges. Only the monthly subscription.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">How does the commission work?</h4>
            <p className="text-gray-600">Commission varies by plan: Free (10%), Premium (5%), Featured (2%), Elite (0%). Commission only applies when you successfully book a job through our platform.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Can I try before I buy?</h4>
            <p className="text-gray-600">Absolutely! All paid plans include a 14-day free trial. No credit card required to start.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Grow Your Business?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of wedding vendors already thriving on our platform
          </p>
          <button
            onClick={() => router.push('/vendor-register')}
            className="px-10 py-4 bg-white hover:bg-gray-50 text-pink-600 font-extrabold rounded-lg shadow-xl transition transform hover:scale-105 text-xl"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
