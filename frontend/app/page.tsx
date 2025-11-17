'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Users, Camera, Gift, Calendar, DollarSign, CheckCircle, Sparkles, Briefcase, TrendingUp, Star, MessageSquare } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    setIsLoggedIn(!!user);
    setLoading(false);
  };

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Bella Wedding AI",
    "description": "AI-powered wedding planning platform with guest management, budget tracking, timeline, photo gallery, and vendor directory",
    "url": "https://bellaweddingai.com",
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Guest List & RSVP Management",
      "Photo Gallery",
      "Registry Aggregator",
      "Budget Tracker",
      "Timeline & Checklist",
      "AI Wedding Assistant",
      "Vendor Directory"
    ],
    "screenshot": "https://bellaweddingai.com/wedding-photos/deltalow-560.jpg"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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
            {!loading && (
              <>
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => router.push('/auth')}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => router.push('/auth')}
                      className="px-6 py-2 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-md transition"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-md transition"
                  >
                    Go to Dashboard
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-champagne-50 to-rose-50 py-8">
        {/* Hero Image Background with Border */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/wedding-photos/deltalow-560.jpg')",
                backgroundPosition: 'center 25%'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70"></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="mb-4 max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
                  Bella Wedding AI
                </h1>
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Your Dream Wedding,
              <br />
              <span className="bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
                Perfectly Planned
              </span>
            </h2>
            <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Everything you need to plan the perfect wedding – guest management, budgeting, timelines, and AI-powered insights. All in one elegant platform.
            </p>
          </div>

          {!loading && (
            <div className="flex gap-4 justify-center mb-6">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => router.push('/auth')}
                    className="px-8 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 border-2 border-champagne-600"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-lg shadow-lg transition border-2 border-gray-300"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 border-2 border-champagne-600"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div>
              <div className="text-xl font-bold text-champagne-600 mb-1">15+ Features</div>
              <div className="text-xs text-gray-600">All-in-One Platform</div>
            </div>
            <div>
              <div className="text-xl font-bold text-rose-600 mb-1">AI-Powered</div>
              <div className="text-xs text-gray-600">Smart Planning</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600 mb-1">Free to Start</div>
              <div className="text-xs text-gray-600">No Credit Card</div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Showcase */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
            <img src="/wedding-photos/deltalow-130.jpg" alt="Wedding" className="w-full h-full object-contain bg-gray-100" />
          </div>
          <div className="relative h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
            <img src="/wedding-photos/deltalow-447.jpg" alt="Wedding" className="w-full h-full object-contain bg-gray-100" />
          </div>
          <div className="relative h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
            <img src="/wedding-photos/deltalow-512.jpg" alt="Wedding" className="w-full h-full object-contain bg-gray-100" />
          </div>
          <div className="relative h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
            <img src="/wedding-photos/deltalow-119.jpg" alt="Wedding" className="w-full h-full object-contain bg-gray-100" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Everything You Need
          </h3>
          <p className="text-base text-gray-600">
            Powerful tools to make wedding planning effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(feature.href)}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition cursor-pointer group flex items-start gap-3"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="text-champagne-600 text-sm font-medium group-hover:translate-x-1 transition">
                  →
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vendor Features Section */}
      <section className="bg-gradient-to-br from-champagne-50 to-rose-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-3">
              For Wedding Vendors
            </h3>
            <p className="text-lg text-gray-600 mb-2">
              Grow your business and connect with couples planning their dream wedding
            </p>
            <p className="text-base text-champagne-700 font-semibold">
              ✨ Create a FREE profile to get discovered • Access all planning tools for your own events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Vendor Dashboard</h4>
              <p className="text-sm text-gray-600">Manage your profile, services, and client inquiries</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Lead Generation</h4>
              <p className="text-sm text-gray-600">Get discovered by couples searching for vendors</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Portfolio Showcase</h4>
              <p className="text-sm text-gray-600">Display your work and attract your ideal clients</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Direct Messaging</h4>
              <p className="text-sm text-gray-600">Communicate directly with potential clients</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/vendor-register')}
              className="px-8 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 border-2 border-champagne-600"
            >
              Join as a Vendor
            </button>
          </div>
        </div>
      </section>

      {/* Testimonial Section with Photo */}
      <section className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/wedding-photos/deltalow-108.jpg')",
            backgroundPosition: 'center 20%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/60"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-lg md:text-xl font-serif text-white mb-3 leading-relaxed">
            "Bella Wedding AI made planning our dream wedding so much easier. Everything we needed in one beautiful place!"
          </blockquote>
          <p className="text-sm text-champagne-200 font-medium">
            <Heart className="w-4 h-4 inline-block mr-1 text-champagne-400" />
            Happy Bride
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-champagne-500 to-rose-500 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-serif font-bold text-white mb-3">
            Ready to Start Planning?
          </h3>
          <p className="text-lg text-white/90 mb-6">
            Start planning your dream wedding with AI-powered tools and expert guidance
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-10 py-3 bg-white hover:bg-gray-100 text-champagne-600 font-bold rounded-lg shadow-xl transition transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
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
                <li><a href="/guests" className="hover:text-champagne-600">Guest List & RSVP</a></li>
                <li><a href="/photos" className="hover:text-champagne-600">Photo Gallery</a></li>
                <li><a href="/registry" className="hover:text-champagne-600">Registry Aggregator</a></li>
                <li><a href="/budget" className="hover:text-champagne-600">Budget Tracker</a></li>
                <li><a href="/checklist" className="hover:text-champagne-600">Timeline & Checklist</a></li>
                <li><a href="/ai" className="hover:text-champagne-600">AI Assistant</a></li>
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
              <h5 className="font-bold text-gray-900 mb-3">For Vendors</h5>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="/vendor-register" className="hover:text-champagne-600">Vendor Sign Up</a></li>
                <li><a href="/vendor-pricing" className="hover:text-champagne-600">Pricing & Plans</a></li>
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
