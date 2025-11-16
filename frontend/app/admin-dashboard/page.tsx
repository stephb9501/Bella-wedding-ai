'use client';

import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Tag,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  CreditCard,
  Zap,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';

interface AdminFeature {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  status: 'active' | 'coming';
}

export default function AdminDashboard() {
  const router = useRouter();

  const features: AdminFeature[] = [
    {
      title: 'Launch Discounts',
      description: 'Create promo codes (LAUNCH50, EARLYACCESS). Set discounts for early adopters.',
      icon: Tag,
      href: '/admin/launch-discounts',
      color: 'purple',
      status: 'active',
    },
    {
      title: 'Photo Manager',
      description: 'Upload and manage site photos. Drag & drop images, organize media library.',
      icon: ImageIcon,
      href: '/admin',
      color: 'pink',
      status: 'active',
    },
    {
      title: 'Manage Users',
      description: 'View all brides and vendors. See subscriptions, activity, manage accounts.',
      icon: Users,
      href: '/admin/users',
      color: 'blue',
      status: 'active',
    },
    {
      title: 'Bookings & Commission',
      description: 'Track vendor bookings, commission earnings (0-10%), escrow releases.',
      icon: DollarSign,
      href: '/admin/bookings',
      color: 'green',
      status: 'active',
    },
    {
      title: 'Analytics & Reports',
      description: 'Revenue, user growth, conversions. Monthly recurring revenue tracking.',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'indigo',
      status: 'active',
    },
    {
      title: 'Tax Reports',
      description: 'Income tracking, tax documentation, export to CSV. Perfect for IRS filing.',
      icon: FileText,
      href: '/admin/tax-reports',
      color: 'yellow',
      status: 'active',
    },
    {
      title: 'Team Access',
      description: 'Give family & team members role-based access. Marketing, support, admin roles.',
      icon: Shield,
      href: '/admin/team-access',
      color: 'red',
      status: 'active',
    },
    {
      title: 'Platform Updates',
      description: 'Check for updates, install with one click. Auto-update security patches.',
      icon: Settings,
      href: '/admin/updates',
      color: 'gray',
      status: 'active',
    },
    {
      title: '1-on-1 Sessions',
      description: '$199/hr planning sessions. Set availability (6-9pm Central). Limit 10/month.',
      icon: Calendar,
      href: '/admin/planning-sessions',
      color: 'orange',
      status: 'coming',
    },
    {
      title: 'Subscription Manager',
      description: 'View all subscriptions. Upgrade/downgrade users, handle cancellations.',
      icon: CreditCard,
      href: '/admin/subscriptions',
      color: 'teal',
      status: 'coming',
    },
    {
      title: 'Content Editor',
      description: 'Change layout, add columns, edit site content without coding.',
      icon: FileText,
      href: '/admin/content-editor',
      color: 'yellow',
      status: 'coming',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-400', hover: 'hover:shadow-purple-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-400', hover: 'hover:shadow-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-400', hover: 'hover:shadow-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-400', hover: 'hover:shadow-orange-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-400', hover: 'hover:shadow-indigo-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-400', hover: 'hover:shadow-pink-200' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-400', hover: 'hover:shadow-teal-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-400', hover: 'hover:shadow-yellow-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-400', hover: 'hover:shadow-red-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-400', hover: 'hover:shadow-gray-200' },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <LayoutDashboard className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-serif text-champagne-900 font-bold">Admin Control Center</h1>
                <p className="text-champagne-600 mt-1">Bella Wedding AI Dashboard</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-champagne-600 mb-1">Platform Status</div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-700">All Systems Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Contact Info */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Admin Email</div>
              <div className="text-xl font-bold">bellaweddingai@gmail.com</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">Quick Access</div>
              <div className="text-lg font-semibold">8 Active Tools</div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <h2 className="text-3xl font-serif text-champagne-900 mb-6 font-bold">Your Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const colors = getColorClasses(feature.color);
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                onClick={() => {
                  if (feature.status === 'active') {
                    router.push(feature.href);
                  }
                }}
                className={`relative bg-white rounded-2xl shadow-lg p-6 transition-all border-2 ${
                  feature.status === 'active'
                    ? `cursor-pointer hover:scale-105 hover:shadow-2xl ${colors.hover} border-transparent hover:border-${feature.color}-300`
                    : 'opacity-50 cursor-not-allowed border-gray-200'
                }`}
              >
                {feature.status === 'coming' && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                    COMING SOON
                  </div>
                )}

                <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>

                <h3 className="text-xl font-bold text-champagne-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-champagne-600 leading-relaxed mb-4">{feature.description}</p>

                {feature.status === 'active' && (
                  <div className={`mt-auto text-sm font-bold ${colors.text} flex items-center gap-2`}>
                    Open Tool <span className="text-xl">→</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <h3 className="text-2xl font-serif text-champagne-900 mt-12 mb-6 font-bold">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-3">
              <div className="text-champagne-600 font-medium">Total Users</div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-champagne-900">1,247</div>
            <div className="text-sm text-green-600 mt-2 font-semibold">↑ 23% this month</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-3">
              <div className="text-champagne-600 font-medium">Revenue (MRR)</div>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-champagne-900">$8,450</div>
            <div className="text-sm text-green-600 mt-2 font-semibold">↑ 15% this month</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-3">
              <div className="text-champagne-600 font-medium">Active Subs</div>
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-4xl font-bold text-champagne-900">342</div>
            <div className="text-sm text-green-600 mt-2 font-semibold">↑ 8% this month</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between mb-3">
              <div className="text-champagne-600 font-medium">Bookings</div>
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-4xl font-bold text-champagne-900">89</div>
            <div className="text-sm text-green-600 mt-2 font-semibold">↑ 12% this month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
