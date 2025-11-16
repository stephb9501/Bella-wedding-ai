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
      description: '90+ pre-loaded tasks organized by timeline',
      href: '/checklist',
      color: 'from-amber-400 to-amber-600'
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Get personalized planning advice powered by AI',
      href: '/ai-assistant',
      color: 'from-indigo-400 to-indigo-600'
    },
    {
      icon: Calendar,
      title: 'Vendor Directory',
      description: 'Find and book trusted wedding vendors',
      href: '/vendor-search',
      color: 'from-pink-400 to-pink-600'
    },
    {
      icon: Heart,
      title: 'Décor & Setup',
      description: 'Plan your event zones with style suggestions',
      href: '/decor-setup',
      color: 'from-orange-400 to-orange-600'
    },
    {
      icon: Gift,
      title: 'Invitations',
      description: 'Design beautiful invitations with templates',
      href: '/invitations',
      color: 'from-teal-400 to-teal-600'
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

      {/* Hero Section - REDUCED HEIGHT */}
      <section className="relative overflow-hidden flex items-center" style={{ minHeight: '75vh' }}>
        {/* Hero Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/wedding-photos/deltalow-560.jpg')",
            backgroundPosition: 'center 35%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/75"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center w-full">
          <div className="mb-8 max-w-4xl mx-auto">
            {/* Decorative Top Element */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-champagne-400"></div>
              <Heart className="w-5 h-5 text-champagne-500" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-champagne-400"></div>
            </div>

            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Your Dream Wedding,
              <br />
              <span className="bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
                Perfectly Planned
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light mb-3">
              Everything you need to plan the perfect wedding – guest management, budgeting, timelines, and AI-powered insights.
            </p>
            <p className="text-base text-gray-600 font-light italic mb-8">
              All in one elegant platform.
            </p>

            {/* MOVED GET STARTED BUTTON UP */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <button
                onClick={() => router.push('/auth')}
                className="px-12 py-4 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white text-xl font-bold rounded-xl shadow-2xl transition transform hover:scale-105 hover:shadow-champagne-500/50 animate-pulse"
              >
                Get Started Free →
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 text-lg font-semibold rounded-xl shadow-lg transition border-2 border-gray-300 hover:border-champagne-400"
              >
                See Pricing
              </button>
            </div>
          </div>

          {/* Stats - SMALLER */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-champagne-600 mb-2 group-hover:scale-110 transition">15+</div>
              <div className="text-gray-700 font-medium text-sm">Features</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-rose-600 mb-2 group-hover:scale-110 transition">1000+</div>
              <div className="text-gray-700 font-medium text-sm">Brides</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition">500+</div>
              <div className="text-gray-700 font-medium text-sm">Vendors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Showcase Gallery - REDUCED SIZE */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {/* Section Header - SMALLER */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-400"></div>
            <Camera className="w-6 h-6 text-rose-500" />
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-rose-400"></div>
          </div>
          <h3 className="text-3xl font-serif font-bold text-gray-900 mb-3">
            Real Love Stories
          </h3>
          <p className="text-base text-gray-600 font-light">
            Celebrating beautiful moments from couples who planned with Bella
          </p>
        </div>

        {/* Photo Grid - REDUCED HEIGHT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Large Featured Photo */}
          <div className="md:col-span-2 md:row-span-2 relative h-72 md:h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
            <img src="/wedding-photos/deltalow-130.jpg" alt="Wedding Couple" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Top Right Photos */}
          <div className="relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
            <img src="/wedding-photos/deltalow-447.jpg" alt="Wedding Details" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
            <img src="/wedding-photos/deltalow-512.jpg" alt="Wedding Ceremony" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>

        {/* Bottom Row - REDUCED HEIGHT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative h-40 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
            <img src="/wedding-photos/deltalow-119.jpg" alt="Wedding" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative h-40 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
            <img src="/wedding-photos/deltalow-445.jpg" alt="Wedding" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative h-40 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
            <img src="/wedding-photos/deltalow-108.jpg" alt="Wedding" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
          </div>
          {/* FIXED: Bathtub image - adjusted positioning to avoid heart over face */}
          <div className="relative h-40 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
            <img src="/wedding-photos/deltalow-560.jpg" alt="Wedding" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" style={{ objectPosition: 'center 20%' }} />
          </div>
        </div>
      </section>

      {/* Features Grid - REDUCED SIZE */}
      <section className="bg-gradient-to-br from-champagne-50/50 via-white to-rose-50/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            {/* Decorative Element */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-champagne-400"></div>
              <Sparkles className="w-6 h-6 text-champagne-500" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-champagne-400"></div>
            </div>

            <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Everything You Need
            </h3>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Powerful tools to make wedding planning effortless and elegant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onClick={() => router.push(feature.href)}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-champagne-200"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{feature.description}</p>
                  <div className="mt-3 text-champagne-600 font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
                    Explore
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Section with Photo - REDUCED SIZE */}
      <section className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/wedding-photos/deltalow-108.jpg')",
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/80"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-champagne-500/20 backdrop-blur-sm rounded-full mb-4">
              <Heart className="w-7 h-7 text-champagne-300" />
            </div>
          </div>
          <blockquote className="text-2xl md:text-3xl font-serif text-white mb-6 leading-relaxed font-light italic">
            "Bella Wedding AI made planning our dream wedding so much easier. Everything we needed in one beautiful place!"
          </blockquote>
          <div className="h-px w-20 bg-champagne-400 mx-auto mb-4"></div>
          <p className="text-lg text-champagne-200 font-medium tracking-wide">
            — Sarah & Michael
          </p>
          <p className="text-champagne-300 mt-1 text-sm">Married June 2024</p>
        </div>
      </section>

      {/* Additional Photo Section - Split Layout - REDUCED SIZE */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left - Photo Collage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
                <img src="/wedding-photos/deltalow-445.jpg" alt="Wedding Details" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative h-36 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
                <img src="/wedding-photos/deltalow-512.jpg" alt="Wedding Flowers" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <div className="space-y-3 mt-6">
              <div className="relative h-36 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
                <img src="/wedding-photos/deltalow-119.jpg" alt="Wedding Venue" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
                <img src="/wedding-photos/deltalow-447.jpg" alt="Wedding Couple" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-5 px-4 md:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-400"></div>
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight">
              Plan Every Detail with Confidence
            </h3>
            <p className="text-base text-gray-600 leading-relaxed font-light">
              From your guest list to your budget, from vendor coordination to timeline management – Bella keeps everything organized and beautiful.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-champagne-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-champagne-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">Smart Organization</h4>
                  <p className="text-gray-600 text-sm">All your wedding details in one elegant dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">AI-Powered Assistance</h4>
                  <p className="text-gray-600 text-sm">Get personalized advice and recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">Collaboration Made Easy</h4>
                  <p className="text-gray-600 text-sm">Share plans with your partner, family, and vendors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - REDUCED SIZE */}
      <section className="relative bg-gradient-to-br from-champagne-500 via-rose-500 to-champagne-600 py-20 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          {/* Decorative Top */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-white/40"></div>
            <Heart className="w-6 h-6 text-white" />
            <div className="h-px w-12 bg-white/40"></div>
          </div>

          <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
            Ready to Start Planning?
          </h3>
          <p className="text-lg text-white/95 mb-8 font-light max-w-2xl mx-auto">
            Join thousands of brides who are planning their dream wedding with Bella
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="px-10 py-4 bg-white hover:bg-gray-50 text-champagne-600 text-lg font-bold rounded-xl shadow-2xl transition transform hover:scale-105 hover:-translate-y-1"
          >
            Get Started Free
          </button>
          <p className="text-white/80 mt-4 text-sm">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer - REDUCED SIZE */}
      <footer className="bg-gradient-to-br from-gray-50 via-white to-champagne-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="font-serif font-bold text-xl bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
                  Bella Wedding AI
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your AI-powered wedding planning platform designed to make your special day perfect.
              </p>
              <div className="h-px w-16 bg-gradient-to-r from-champagne-400 to-rose-400"></div>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4 text-lg">Features</h5>
              <ul className="space-y-3 text-gray-600">
                <li><a href="/guests" className="hover:text-champagne-600 transition">Guest List</a></li>
                <li><a href="/photos" className="hover:text-champagne-600 transition">Photo Gallery</a></li>
                <li><a href="/registry" className="hover:text-champagne-600 transition">Registry</a></li>
                <li><a href="/budget" className="hover:text-champagne-600 transition">Budget</a></li>
                <li><a href="/timeline" className="hover:text-champagne-600 transition">Timeline</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4 text-lg">Company</h5>
              <ul className="space-y-3 text-gray-600">
                <li><a href="/contact" className="hover:text-champagne-600 transition">Contact</a></li>
                <li><a href="/privacy" className="hover:text-champagne-600 transition">Privacy</a></li>
                <li><a href="/terms" className="hover:text-champagne-600 transition">Terms</a></li>
                <li><a href="/about" className="hover:text-champagne-600 transition">About Us</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-4 text-lg">Get Started</h5>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li><a href="/auth" className="hover:text-champagne-600 transition">Sign Up</a></li>
                <li><a href="/dashboard" className="hover:text-champagne-600 transition">Dashboard</a></li>
                <li><a href="/pricing" className="hover:text-champagne-600 transition">Pricing</a></li>
              </ul>
              <button
                onClick={() => router.push('/auth')}
                className="px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md transition transform hover:scale-105 text-sm"
              >
                Start Planning
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
              <p className="text-gray-600 text-center md:text-left">
                © 2025 Bella Wedding AI. Made with <Heart className="w-4 h-4 text-rose-500 inline" /> for your special day.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Trusted by 1000+ couples</span>
                <span>•</span>
                <span>5-star rated</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 italic">
              Wedding photography by <a href="https://www.facebook.com/thedeltalow/about" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">Deltalow Photography</a> • Eglin AFB, Ft. Walton Beach, Florida
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
