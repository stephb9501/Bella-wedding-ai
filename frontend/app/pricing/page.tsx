'use client';

import { useRouter } from 'next/navigation';
import { Heart, Check, Star, Zap, Gift } from 'lucide-react';

export default function BridePricing() {
  const router = useRouter();

  const pricingTiers = [
    {
      name: 'Standard',
      price: '$19.99',
      period: 'per month',
      description: 'Perfect for small weddings and DIY planning',
      icon: Heart,
      color: 'from-pink-400 to-pink-600',
      features: [
        '1 active wedding + 1 archive',
        'Up to 75 guests',
        'Up to 30 photos',
        'No video (Coming Soon)',
        '3 website sections',
        'Save up to 5 vendors',
        '5 vendor messages per month',
        'Basic AI: timeline, checklist, budget',
        '1 binder export',
        'Basic vendor search',
      ],
      cta: 'Start Standard',
      tier: 'standard',
      popular: false
    },
    {
      name: 'Premium',
      price: '$29.99',
      period: 'per month',
      description: 'Ideal for full planning with advanced AI tools',
      icon: Star,
      color: 'from-purple-400 to-purple-600',
      features: [
        '1 active wedding + 1 archive',
        'Unlimited guests',
        'Up to 150 photos',
        'Video support coming in Phase 2',
        '8 website sections',
        'Save up to 50 vendors',
        'Vendor Messaging: 30/mo (first 3 months), then 50/mo',
        'Full AI suite: floor plans, décor mockups, vendor matching',
        'AI writing assistant + AI binder',
        'Unlimited binder exports',
      ],
      cta: 'Start Premium',
      tier: 'premium',
      popular: true
    }
  ];

  const earlyAccess = [
    {
      name: 'Early Beta Testers',
      badge: '12 SPOTS LEFT',
      price: 'FREE',
      period: 'for 3 months',
      originalPrice: null,
      description: 'Help shape the future of wedding planning',
      icon: Gift,
      color: 'from-green-400 to-green-600',
      features: [
        '✨ All Premium features (except photo/video caps)',
        '📸 Up to 30 photos',
        '🤖 Full AI suite access',
        '👥 Unlimited guests + 8 website sections',
        '💼 50 saved vendors',
        '📝 Beta Requirements: Provide feedback via surveys',
        '💬 Join our community chat for feature discussions',
        '🎯 Help test new features before public release',
        'After 3 months: choose Standard or Premium',
      ],
      cta: 'Apply as Beta Tester',
      tier: 'early-access',
      highlight: true
    },
    {
      name: 'Special Launch Discount',
      badge: '18 SPOTS LEFT',
      price: '30% OFF',
      period: 'for 3 months',
      originalPrice: '$19.99 or $29.99',
      description: 'Limited-time founding member discount',
      icon: Zap,
      color: 'from-amber-400 to-amber-600',
      features: [
        'Standard: $13.99/mo (30% off $19.99)',
        'Premium: $20.99/mo (30% off $29.99)',
        'All Standard or Premium features',
        'No video during first 3 months',
        'After 3 months: regular pricing applies',
        'Lock in your founding member rate',
      ],
      cta: 'Claim Your Discount',
      tier: 'discount-access',
      highlight: true
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
          Couple Pricing
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Everything you need to plan your perfect wedding, powered by AI
        </p>
        <p className="text-sm text-gray-500">
          All plans include 14-day free trial • Cancel anytime • No credit card required
        </p>
      </section>

      {/* Early Access Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <Gift className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            🎉 Limited Spots: Early Access Program
          </h3>
          <p className="text-xl opacity-90 mb-4">
            Beta Testers: 3 months FREE • Founding Members: 30% off for 3 months
          </p>
          <p className="text-sm opacity-80">
            Only 30 total spots available • Join now and help shape the future of wedding planning
          </p>
        </div>
      </section>

      {/* Early Access Tiers */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Early Access Programs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {earlyAccess.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  tier.highlight ? 'ring-4 ring-green-400' : ''
                }`}
              >
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1 text-xs font-bold rounded-full">
                  {tier.badge}
                </div>

                <div className={`bg-gradient-to-r ${tier.color} p-8 text-white`}>
                  <Icon className="w-12 h-12 mb-3" />
                  <h4 className="text-2xl font-bold mb-2">{tier.name}</h4>
                  <div className="mb-2">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    <span className="text-sm opacity-90 ml-2">{tier.period}</span>
                  </div>
                  {tier.originalPrice && (
                    <p className="text-sm opacity-90">Regular: {tier.originalPrice}</p>
                  )}
                  <p className="text-sm opacity-90 mt-2">{tier.description}</p>
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
                    onClick={() => router.push(`/auth?plan=${tier.tier}`)}
                    className="w-full py-3 rounded-lg font-bold transition transform hover:scale-105 shadow-md bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Standard Pricing Tiers */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Standard Plans
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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

                <div className={`bg-gradient-to-r ${tier.color} p-8 text-white`}>
                  <Icon className="w-12 h-12 mb-3" />
                  <h4 className="text-2xl font-bold mb-2">{tier.name}</h4>
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
                    onClick={() => router.push(`/auth?plan=${tier.tier}`)}
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
            <p className="text-gray-600">Yes! You can upgrade or downgrade your plan at any time from your dashboard.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">What are the beta tester requirements?</h4>
            <p className="text-gray-600">Beta testers agree to: (1) Complete monthly feedback surveys, (2) Participate in our community chat, (3) Test new features and report bugs, (4) Provide honest reviews about your experience. In exchange, you get 3 months of Premium features completely free!</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">What happens after the early access period?</h4>
            <p className="text-gray-600">After 3 months, you'll choose to continue with either Standard ($19.99/mo) or Premium ($29.99/mo). You'll keep all your data and wedding details.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Can I archive my wedding after the big day?</h4>
            <p className="text-gray-600">Absolutely! All plans include 1 archived wedding, so you can preserve your memories forever while starting to plan anniversary celebrations or helping friends.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">What's included in the Full AI Suite?</h4>
            <p className="text-gray-600">Premium plans include AI vendor matching, décor mockups, floor plan design, color palette builder, writing assistant for vows/speeches, and intelligent binder creation.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Is there a setup fee?</h4>
            <p className="text-gray-600">No! There are no setup fees, cancellation fees, or hidden charges. Only the monthly subscription.</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-2">Can I try before I buy?</h4>
            <p className="text-gray-600">Yes! All plans include a 14-day free trial. No credit card required to start.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500 to-rose-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Plan Your Dream Wedding?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of couples already planning with Bella Wedding AI
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-10 py-4 bg-white hover:bg-gray-50 text-pink-600 font-extrabold rounded-lg shadow-xl transition transform hover:scale-105 text-xl"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
