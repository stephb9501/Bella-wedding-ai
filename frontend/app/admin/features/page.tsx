'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  Users,
  Crown,
  Sparkles,
  Calendar,
  DollarSign,
  MessageSquare,
  Camera,
  Gift,
  MapPin,
  Shield,
  Zap,
  Mail,
  Bell,
  ChevronRight,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Palette,
  Globe,
  Lock,
  Star,
  BarChart3,
  Workflow,
  Home,
  Cloud
} from 'lucide-react';

interface Feature {
  name: string;
  description: string;
  icon: any;
  status: 'live' | 'beta' | 'coming-soon';
}

interface FeatureSection {
  title: string;
  description: string;
  icon: any;
  color: string;
  features: Feature[];
}

export default function AdminFeaturesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const featureSections: FeatureSection[] = [
    {
      title: 'Bride Features',
      description: 'Complete wedding planning dashboard for brides',
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      features: [
        { name: 'AI Wedding Planner', description: 'Intelligent AI assistant that helps plan every detail of the wedding', icon: Sparkles, status: 'live' },
        { name: 'Guest Management', description: 'Track RSVPs, dietary restrictions, meal preferences, and plus-ones', icon: Users, status: 'live' },
        { name: 'Seating Chart Builder', description: 'Drag-and-drop interface for creating perfect table arrangements', icon: MapPin, status: 'live' },
        { name: 'Budget Tracker', description: 'Track expenses, set budgets by category, and stay on top of finances', icon: DollarSign, status: 'live' },
        { name: 'Wedding Timeline', description: 'Plan your day-of timeline down to the minute', icon: Clock, status: 'live' },
        { name: 'Wedding Checklist', description: 'Smart checklist that adapts to your wedding date and style', icon: CheckCircle2, status: 'live' },
        { name: 'Vendor Discovery', description: 'Browse and connect with verified wedding vendors', icon: Crown, status: 'live' },
        { name: 'Vendor Messaging', description: 'Direct communication with vendors through the platform', icon: MessageSquare, status: 'live' },
        { name: 'Wedding Website Builder', description: 'Create beautiful, customizable wedding websites', icon: Globe, status: 'live' },
        { name: 'Digital Invitations', description: 'Send elegant digital invitations with RSVP tracking', icon: Mail, status: 'live' },
        { name: 'Registry Management', description: 'Integrate and manage gift registries from multiple stores', icon: Gift, status: 'live' },
        { name: 'Photo Gallery', description: 'Share engagement photos and wedding memories', icon: Camera, status: 'live' },
        { name: 'Bridal Party Management', description: 'Coordinate with bridesmaids, groomsmen, and other wedding party members', icon: Users, status: 'live' },
        { name: 'Honeymoon Planner', description: 'Plan and book your dream honeymoon', icon: MapPin, status: 'live' },
        { name: 'Vow Writer', description: 'AI-powered tool to help craft perfect wedding vows', icon: FileText, status: 'live' },
        { name: 'Notifications & Reminders', description: 'Smart reminders for important tasks and deadlines', icon: Bell, status: 'live' },
        { name: 'Mobile App', description: 'Access all features on iOS and Android', icon: Zap, status: 'coming-soon' },
        { name: 'Video Conferencing', description: 'Virtual meetings with vendors and planners', icon: MessageSquare, status: 'coming-soon' }
      ]
    },
    {
      title: 'Vendor Features',
      description: 'Professional tools for wedding vendors',
      icon: Crown,
      color: 'from-purple-500 to-indigo-500',
      features: [
        { name: 'Vendor Dashboard', description: 'Comprehensive dashboard to manage your wedding business', icon: BarChart3, status: 'live' },
        { name: 'Lead Management', description: 'Track inquiries, quotes, and bookings in one place', icon: TrendingUp, status: 'live' },
        { name: 'Portfolio Showcase', description: 'Display your best work with beautiful photo galleries', icon: Camera, status: 'live' },
        { name: 'Pricing & Packages', description: 'Create customizable pricing tiers and service packages', icon: DollarSign, status: 'live' },
        { name: 'Calendar & Availability', description: 'Manage bookings and show real-time availability', icon: Calendar, status: 'live' },
        { name: 'Client Messaging', description: 'Communicate with potential and confirmed clients', icon: MessageSquare, status: 'live' },
        { name: 'Reviews & Ratings', description: 'Build credibility with verified client reviews', icon: Star, status: 'live' },
        { name: 'Analytics Dashboard', description: 'Track views, inquiries, and conversion rates', icon: BarChart3, status: 'live' },
        { name: 'Contract Management', description: 'Send, sign, and store contracts digitally', icon: FileText, status: 'beta' },
        { name: 'Payment Processing', description: 'Accept deposits and payments through the platform', icon: DollarSign, status: 'beta' },
        { name: 'Booking Engine', description: 'Let clients book your services directly online', icon: CheckCircle2, status: 'live' },
        { name: 'Vendor Network', description: 'Connect and collaborate with other vendors', icon: Users, status: 'live' },
        { name: 'Marketing Tools', description: 'Promoted listings and featured placement options', icon: Sparkles, status: 'live' },
        { name: 'Mobile Vendor App', description: 'Manage your business on the go', icon: Zap, status: 'coming-soon' }
      ]
    },
    {
      title: 'Admin Features',
      description: 'Platform management and administration',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      features: [
        { name: 'Admin Dashboard', description: 'Comprehensive platform analytics and metrics', icon: BarChart3, status: 'live' },
        { name: 'User Management', description: 'View and manage all bride and vendor accounts', icon: Users, status: 'live' },
        { name: 'Vendor Approval', description: 'Review and approve vendor registrations', icon: CheckCircle2, status: 'live' },
        { name: 'Content Management', description: 'Manage site photos, colors, and branding', icon: Palette, status: 'live' },
        { name: 'Bulk Vendor Import', description: 'Import hundreds of vendors from CSV files', icon: Users, status: 'live' },
        { name: 'Incomplete Vendor Finder', description: 'Identify and fix vendors with missing data', icon: Search, status: 'live' },
        { name: 'Analytics & Reporting', description: 'Revenue, growth, and engagement metrics', icon: TrendingUp, status: 'live' },
        { name: 'Promotional Spots', description: 'Manage free spots and discount campaigns', icon: Gift, status: 'live' },
        { name: 'Feature Documentation', description: 'Comprehensive platform capability overview', icon: FileText, status: 'live' },
        { name: 'Security Management', description: 'Monitor security and manage access controls', icon: Lock, status: 'live' },
        { name: 'Email Management', description: 'Send platform-wide announcements and newsletters', icon: Mail, status: 'beta' },
        { name: 'Support Ticketing', description: 'Manage customer support requests', icon: MessageSquare, status: 'coming-soon' }
      ]
    },
    {
      title: 'Technical Capabilities',
      description: 'Platform technology and infrastructure',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      features: [
        { name: 'AI-Powered Assistance', description: 'Claude AI integration for intelligent wedding planning', icon: Sparkles, status: 'live' },
        { name: 'Real-time Updates', description: 'Live data synchronization across all devices', icon: Zap, status: 'live' },
        { name: 'Secure Authentication', description: 'Supabase-powered authentication with 2FA support', icon: Lock, status: 'live' },
        { name: 'Cloud Storage', description: 'Unlimited photo and document storage', icon: Camera, status: 'live' },
        { name: 'Email Notifications', description: 'Automated email notifications for important events', icon: Mail, status: 'live' },
        { name: 'SMS Reminders', description: 'Text message reminders for critical deadlines', icon: Bell, status: 'beta' },
        { name: 'Data Export', description: 'Export all your data in standard formats', icon: FileText, status: 'live' },
        { name: 'GDPR Compliance', description: 'Full data privacy and compliance tools', icon: Shield, status: 'live' },
        { name: 'API Access', description: 'Developer API for custom integrations', icon: Workflow, status: 'beta' },
        { name: 'Webhook Support', description: 'Real-time webhooks for external integrations', icon: Zap, status: 'beta' },
        { name: 'Multi-language Support', description: 'Platform available in multiple languages', icon: Globe, status: 'coming-soon' },
        { name: 'White Label Options', description: 'Custom branding for enterprise clients', icon: Palette, status: 'coming-soon' }
      ]
    },
    {
      title: 'Upcoming Features',
      description: 'Coming soon to Bella Wedding AI',
      icon: Sparkles,
      color: 'from-green-500 to-emerald-500',
      features: [
        { name: 'Virtual Reality Venue Tours', description: 'Explore venues in immersive VR', icon: MapPin, status: 'coming-soon' },
        { name: 'AI Dress Finder', description: 'Find your perfect dress using AI image recognition', icon: Sparkles, status: 'coming-soon' },
        { name: 'Music Playlist Builder', description: 'Curate your wedding playlist with Spotify integration', icon: Zap, status: 'coming-soon' },
        { name: 'Weather Predictions', description: 'Long-range weather forecasts for your wedding date', icon: Cloud, status: 'coming-soon' },
        { name: 'Guest Accommodation Booking', description: 'Book hotel blocks for out-of-town guests', icon: Home, status: 'coming-soon' },
        { name: 'Transportation Coordination', description: 'Arrange shuttles and transportation for guests', icon: MapPin, status: 'coming-soon' },
        { name: 'Live Streaming', description: 'Stream your wedding to remote guests', icon: Camera, status: 'coming-soon' },
        { name: 'Wedding Insurance', description: 'Purchase wedding insurance through the platform', icon: Shield, status: 'coming-soon' },
        { name: 'Gift Tracking', description: 'Track who gave what gift and send thank-you notes', icon: Gift, status: 'coming-soon' },
        { name: 'Vendor Marketplace', description: 'Book services like catering and rentals directly', icon: Crown, status: 'coming-soon' }
      ]
    }
  ];

  const allFeatures = featureSections.flatMap(section =>
    section.features.map(feature => ({
      ...feature,
      category: section.title,
      categoryColor: section.color
    }))
  );

  const filteredSections = featureSections
    .map(section => ({
      ...section,
      features: section.features.filter(feature =>
        (selectedCategory === 'all' || section.title === selectedCategory) &&
        (searchQuery === '' ||
          feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }))
    .filter(section => section.features.length > 0);

  const categories = ['all', ...featureSections.map(s => s.title)];

  const stats = {
    totalFeatures: allFeatures.length,
    liveFeatures: allFeatures.filter(f => f.status === 'live').length,
    betaFeatures: allFeatures.filter(f => f.status === 'beta').length,
    comingSoon: allFeatures.filter(f => f.status === 'coming-soon').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Admin Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-blue-600" />
                Bella Wedding AI - Platform Features
              </h1>
              <p className="text-gray-600 text-lg">
                Comprehensive documentation of all platform capabilities
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 font-medium mb-1">Total Features</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalFeatures}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 font-medium mb-1">Live Features</div>
            <div className="text-3xl font-bold text-green-600">{stats.liveFeatures}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
            <div className="text-sm text-gray-600 font-medium mb-1">Beta Features</div>
            <div className="text-3xl font-bold text-amber-600">{stats.betaFeatures}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 font-medium mb-1">Coming Soon</div>
            <div className="text-3xl font-bold text-purple-600">{stats.comingSoon}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="space-y-8">
          {filteredSections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Section Header */}
              <div className={`bg-gradient-to-r ${section.color} p-6 text-white`}>
                <div className="flex items-center gap-3 mb-2">
                  <section.icon className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <p className="text-white/90">{section.description}</p>
                <div className="mt-3 text-sm font-medium">
                  {section.features.length} features
                </div>
              </div>

              {/* Features Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.features.map((feature, featureIdx) => (
                    <div
                      key={featureIdx}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} bg-opacity-10 group-hover:bg-opacity-20 transition`}>
                          <feature.icon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              feature.status === 'live'
                                ? 'bg-green-100 text-green-700'
                                : feature.status === 'beta'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {feature.status === 'live' ? 'LIVE' : feature.status === 'beta' ? 'BETA' : 'SOON'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No features found</h3>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">For Investors & Partners</h3>
              <p className="text-blue-800">
                This comprehensive feature list demonstrates Bella Wedding AI's complete wedding planning platform.
                We offer more features than any competitor, with AI-powered intelligence, vendor tools, and bride-focused
                capabilities that make wedding planning effortless. Share this page to showcase our platform's full potential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
