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

  const brideFeatures = [
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

  const vendorFeatures = [
    {
      icon: Briefcase,
      title: 'Vendor Dashboard',
      description: 'Manage your profile, services, and client inquiries',
      href: '/vendor-dashboard',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Lead Generation',
      description: 'Get discovered by couples searching for vendors',
      href: '/vendors',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Star,
      title: 'Portfolio Showcase',
      description: 'Display your work and attract your ideal clients',
      href: '/vendor-dashboard',
      color: 'from-amber-400 to-amber-600'
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description: 'Communicate directly with potential clients',
      href: '/vendor-dashboard',
      color: 'from-purple-400 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-champagne-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Bella Wedding AI
            </h1>
          </div>

          <div className="flex gap-3">
            {!loading && (
              <>
                {!isLoggedIn ? (
                  <>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => router.push('/auth/register')}
                      className="px-6 py-2.5 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2.5 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Dashboard
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/IMG_3941.JPG')",
            backgroundPosition: 'center 40%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/95 to-white"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-10 max-w-4xl mx-auto">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Dream Wedding,
              <br />
              <span className="bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
                Perfectly Planned
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-10">
              Everything you need to plan the perfect wedding – guest management, budgeting, timelines, vendor marketplace, and AI-powered insights. All in one elegant platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push('/auth/register')}
              className="px-10 py-4 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/vendors')}
              className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200"
            >
              Browse Vendors
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md">
              <div className="text-4xl font-bold text-champagne-600 mb-2">20+</div>
              <div className="text-gray-600 font-medium">Features</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md">
              <div className="text-4xl font-bold text-rose-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Free to Start</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['/images/IMG_3941.JPG', '/images/IMG_3942.JPG', '/images/IMG_3943 (1).JPG', '/images/IMG_3941.JPG'].map((img, i) => (
            <div key={i} className="relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <img src={img} alt="Wedding" className="w-full h-full object-cover object-center" />
            </div>
          ))}
        </div>
      </section>

      {/* For Brides Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            For Brides
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools to make wedding planning effortless and enjoyable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brideFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={() => router.push(feature.href)}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-5 text-champagne-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                  Explore →
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* For Vendors Section */}
      <section className="bg-gradient-to-br from-gray-50 to-champagne-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h3 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              For Vendors
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Grow your wedding business and connect with couples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {vendorFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onClick={() => router.push(feature.href)}
                  className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/vendor-register')}
              className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Join as a Vendor
            </button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="relative overflow-hidden py-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/IMG_3942.JPG')",
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-8">
            <Heart className="w-14 h-14 text-champagne-400 mx-auto mb-4" />
          </div>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl text-white mb-8 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
            "Plan your dream wedding with powerful tools, vendor marketplace, and AI assistance – all in one elegant platform."
          </blockquote>
          <p className="text-xl text-champagne-200 font-semibold">
            — Join Early Access Today
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-champagne-500 via-rose-500 to-champagne-500 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Start Planning?
          </h3>
          <p className="text-xl sm:text-2xl text-white/95 mb-10 max-w-2xl mx-auto">
            Start planning your dream wedding today – completely free to get started
          </p>
          <button
            onClick={() => router.push('/auth/register')}
            className="px-12 py-4 bg-white hover:bg-gray-50 text-champagne-600 font-bold text-lg rounded-xl shadow-2xl transition-all transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Bella Wedding AI</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your AI-powered wedding planning platform
              </p>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4">Features</h5>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li><a href="/guests" className="hover:text-champagne-600 transition-colors">Guest List</a></li>
                <li><a href="/photos" className="hover:text-champagne-600 transition-colors">Photo Gallery</a></li>
                <li><a href="/registry" className="hover:text-champagne-600 transition-colors">Registry</a></li>
                <li><a href="/budget" className="hover:text-champagne-600 transition-colors">Budget</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4">Company</h5>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li><a href="/contact" className="hover:text-champagne-600 transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-champagne-600 transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-champagne-600 transition-colors">Terms</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4">Get Started</h5>
              <ul className="space-y-2.5 text-gray-600 text-sm">
                <li><a href="/auth/register" className="hover:text-champagne-600 transition-colors">Sign Up</a></li>
                <li><a href="/auth/login" className="hover:text-champagne-600 transition-colors">Sign In</a></li>
                <li><a href="/vendor-register" className="hover:text-champagne-600 transition-colors">Vendor Sign Up</a></li>
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
