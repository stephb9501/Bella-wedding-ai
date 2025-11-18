'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Check, Crown, Sparkles, Users, Camera, Gift, MessageCircle } from 'lucide-react';

const BRIDE_TIERS = [
  {
    id: 'standard',
    name: 'Standard',
    price: '$19.99',
    period: '/month',
    description: 'Perfect for small weddings and DIY planning',
    icon: Heart,
    color: 'from-blue-400 to-blue-600',
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
    price: '$29.99',
    period: '/month',
    description: 'Ideal for full planning with advanced AI tools',
    icon: Crown,
    color: 'from-purple-400 to-rose-600',
    popular: true,
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
  const [selectedTier, setSelectedTier] = useState('premium');
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

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="mb-12">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start planning your dream wedding with the tools and features that fit your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {BRIDE_TIERS.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative bg-white rounded-3xl p-8 cursor-pointer transition-all transform hover:scale-105 ${
                  selectedTier === tier.id
                    ? 'ring-4 ring-champagne-500 shadow-2xl'
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-champagne-400 to-rose-400 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-2xl mx-auto mb-4 flex items-center justify-center transform transition-transform group-hover:rotate-12`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tier.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-600 text-lg">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
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
          className="px-12 py-4 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105"
        >
          {loading ? 'Processing...' : `Start with ${BRIDE_TIERS.find(t => t.id === selectedTier)?.name}`}
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Cancel anytime • No hidden fees • 14-day money-back guarantee
        </p>
      </section>

      {/* Feature Comparison */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-serif font-bold text-gray-900 text-center mb-12">
            What's Included
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

      {/* FAQ or Trust Badges */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold text-champagne-600 mb-2">1000+</div>
            <div className="text-gray-600">Happy Brides</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-rose-600 mb-2">500+</div>
            <div className="text-gray-600">Trusted Vendors</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">4.9★</div>
            <div className="text-gray-600">Average Rating</div>
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
