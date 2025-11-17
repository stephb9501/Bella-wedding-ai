'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Check, Crown, Sparkles, Users, Camera, Gift, MessageCircle, Star, Zap } from 'lucide-react';

const BRIDE_TIERS = [
  {
    id: 'early-tester',
    name: 'Early Tester',
    price: 'FREE',
    period: '',
    originalPrice: '',
    description: 'For actively planning brides - Wedding within 4-24 months',
    icon: Star,
    color: 'from-amber-400 to-orange-600',
    limited: true,
    features: [
      { text: '3 months completely FREE - no credit card required', included: true },
      { text: 'All Premium features (up to 30 photos)', included: true },
      { text: 'Must be actively planning wedding (4-24 months out)', included: true },
      { text: 'Commit to using app 2x per week', included: true },
      { text: 'Provide 1 feedback survey per month', included: true },
      { text: 'Share 1 testimonial at end of 3 months', included: true },
      { text: 'Help test & shape new features', included: true },
      { text: 'Priority support from our team', included: true },
      { text: 'After 3 months: choose Standard or Premium', included: true },
      { text: 'Only 30 spots available - first come, first served', included: true },
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$13.99',
    period: '/month',
    originalPrice: '$19.99',
    description: 'Perfect for small weddings and DIY planning',
    icon: Heart,
    color: 'from-blue-400 to-blue-600',
    blackFriday: true,
    features: [
      { text: 'Up to 75 guests', included: true },
      { text: 'Up to 30 photos', included: true },
      { text: 'No video (Coming Soon)', included: false },
      { text: '3 website sections', included: true },
      { text: 'Save up to 5 vendors', included: true },
      { text: '5 vendor messages per month', included: true },
      { text: 'Basic AI (timeline, checklist, budget)', included: true },
      { text: '1 binder export', included: true },
      { text: 'Basic vendor search', included: true },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$20.99',
    period: '/month',
    originalPrice: '$29.99',
    description: 'Ideal for full planning with advanced AI tools',
    icon: Crown,
    color: 'from-purple-400 to-rose-600',
    popular: true,
    blackFriday: true,
    features: [
      { text: 'Unlimited guests', included: true },
      { text: 'Up to 150 photos', included: true },
      { text: 'Video support (Phase 2)', included: true },
      { text: '8 website sections', included: true },
      { text: 'Save up to 50 vendors', included: true },
      { text: '30-50 vendor messages/month', included: true },
      { text: 'Full AI suite (floor plans, décor, vendor matching)', included: true },
      { text: 'Unlimited binder exports', included: true },
      { text: 'AI vendor matching', included: true },
      { text: 'Priority support', included: true },
    ]
  }
];

export default function BrideSubscription() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState('early-tester');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      // TODO: Integrate Stripe payment
      // For now, just update user tier and redirect
      const response = await fetch('/api/bride-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          // TODO: Add user_id from session
        }),
      });

      if (!response.ok) throw new Error('Subscription failed');

      router.push('/dashboard');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-champagne-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
              Bella Wedding AI
            </h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Black Friday Banner */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            <h3 className="text-2xl font-bold">Black Friday Special</h3>
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-lg">
            <span className="font-bold text-yellow-400">30% OFF</span> for your first 3 months • Plus limited <span className="font-bold text-green-400">FREE</span> early tester spots!
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start planning your dream wedding with tools designed to make every moment unforgettable
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
          {BRIDE_TIERS.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative bg-white rounded-3xl p-6 cursor-pointer transition-all transform hover:scale-105 ${
                  selectedTier === tier.id
                    ? 'ring-4 ring-champagne-500 shadow-2xl'
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-champagne-500 to-rose-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {tier.limited && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                      <Star className="w-4 h-4" />
                      LIMITED SPOTS
                    </span>
                  </div>
                )}

                {tier.blackFriday && (
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-gradient-to-br from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      30% OFF
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-2xl mx-auto mb-4 flex items-center justify-center transform transition-transform group-hover:rotate-12`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{tier.description}</p>

                  <div className="mb-6">
                    {tier.originalPrice && (
                      <div className="text-gray-400 text-lg line-through mb-1">
                        {tier.originalPrice}{tier.period}
                      </div>
                    )}
                    <div>
                      <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                      <span className="text-gray-600 text-lg">{tier.period}</span>
                    </div>
                    {tier.blackFriday && (
                      <div className="text-red-600 text-sm font-semibold mt-1">
                        First 3 months • Then regular price
                      </div>
                    )}
                    {tier.limited && (
                      <div className="text-amber-600 text-sm font-semibold mt-1">
                        3 months free • Then choose a plan
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8 text-left">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {selectedTier === tier.id && (
                  <div className="absolute top-6 right-6">
                    <div className="w-8 h-8 bg-champagne-600 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-12 py-4 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-400 text-champagne-900 font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 border-2 border-champagne-700"
        >
          {loading ? 'Processing...' : `Start with ${BRIDE_TIERS.find(t => t.id === selectedTier)?.name}`}
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Cancel anytime • No hidden fees • 14-day money-back guarantee
        </p>
      </section>

      {/* Feature Comparison */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-serif font-bold text-gray-900 text-center mb-10">
            Everything You Need to Plan Your Perfect Day
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FeatureCard
              icon={Users}
              title="Guest Management"
              description="Track RSVPs, collect addresses, and manage your guest list"
              color="from-purple-400 to-purple-600"
            />
            <FeatureCard
              icon={Camera}
              title="Photo Galleries"
              description="Create unlimited galleries and share memories"
              color="from-blue-400 to-blue-600"
            />
            <FeatureCard
              icon={Gift}
              title="Registry Hub"
              description="Aggregate all your registries in one place"
              color="from-rose-400 to-rose-600"
            />
            <FeatureCard
              icon={MessageCircle}
              title="Vendor Messaging"
              description="Connect and collaborate with your vendors"
              color="from-amber-400 to-amber-600"
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-gradient-to-r from-champagne-50 to-rose-50 rounded-2xl p-8">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Why Choose Bella Wedding AI?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-champagne-600 mb-2">AI-Powered</div>
              <div className="text-gray-600 text-sm">Smart planning tools that learn your style</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-rose-600 mb-2">All-in-One</div>
              <div className="text-gray-600 text-sm">Everything you need in one platform</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">Easy to Use</div>
              <div className="text-gray-600 text-sm">Intuitive design, no learning curve</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl mx-auto mb-4 flex items-center justify-center`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
