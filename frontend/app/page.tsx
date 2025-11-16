'use client';

import { useRouter } from 'next/navigation';
import { Heart, Users, Camera, Gift, Calendar, DollarSign, CheckCircle, Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: Users,
      title: 'Guest List & RSVP',
      description: 'Track RSVPs, collect addresses, and share unique links',
      href: '/guests',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: Camera,
      title: 'Photo Gallery',
      description: 'Create galleries, upload photos, and share memories',
      href: '/photos',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: Gift,
      title: 'Registry Aggregator',
      description: 'Combine all your registries in one beautiful place',
      href: '/registry',
      color: 'from-rose-400 to-rose-600'
    },
    {
      icon: DollarSign,
      title: 'Budget Tracker',
      description: 'Track expenses across 13 categories',
      href: '/budget',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: CheckCircle,
      title: 'Timeline & Checklist',
      description: '42 pre-loaded tasks organized by timeline',
      href: '/checklist',
      color: 'from-amber-400 to-amber-600'
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Get personalized planning advice powered by AI',
      href: '/ai',
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

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

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/auth')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-md transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Hero Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/wedding-photos/deltalow-560.jpg')",
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/75"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="mb-8 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
              Your Dream Wedding,
              <br />
              <span className="bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
                Perfectly Planned
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Everything you need to plan the perfect wedding – guest management, budgeting, timelines, and AI-powered insights. All in one elegant platform.
            </p>
          </div>

          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => router.push('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-lg shadow-lg transition border-2 border-gray-200"
            >
              View Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-champagne-600 mb-2">12+</div>
              <div className="text-gray-600">Features</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-rose-600 mb-2">1000+</div>
              <div className="text-gray-600">Brides</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Vendors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Everything You Need
          </h3>
          <p className="text-xl text-gray-600">
            Powerful tools to make wedding planning effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(feature.href)}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition cursor-pointer group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-4 text-champagne-600 font-medium group-hover:translate-x-2 transition inline-block">
                  Explore →
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-champagne-500 to-rose-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-serif font-bold text-white mb-4">
            Ready to Start Planning?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of brides who are planning their dream wedding with Bella
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-10 py-4 bg-white hover:bg-gray-100 text-champagne-600 font-bold rounded-lg shadow-xl transition transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif font-bold text-lg">Bella Wedding AI</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your AI-powered wedding planning platform
              </p>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3">Features</h5>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/guests" className="hover:text-champagne-600">Guest List</a></li>
                <li><a href="/photos" className="hover:text-champagne-600">Photo Gallery</a></li>
                <li><a href="/registry" className="hover:text-champagne-600">Registry</a></li>
                <li><a href="/budget" className="hover:text-champagne-600">Budget</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3">Company</h5>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/contact" className="hover:text-champagne-600">Contact</a></li>
                <li><a href="/privacy" className="hover:text-champagne-600">Privacy</a></li>
                <li><a href="/terms" className="hover:text-champagne-600">Terms</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3">Get Started</h5>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/auth" className="hover:text-champagne-600">Sign Up</a></li>
                <li><a href="/dashboard" className="hover:text-champagne-600">Dashboard</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p>© 2025 Bella Wedding AI. Made with 💕 for your special day.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
