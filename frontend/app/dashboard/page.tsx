'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Users, DollarSign, Heart, MapPin, Camera,
  Sparkles, MessageCircle, Settings, LogOut, Menu, X,
  ChevronRight, Clock, CheckCircle, AlertCircle, TrendingUp,
  Zap, Gift, Share2, Music, Home, BarChart3, Smile, ClipboardList
} from 'lucide-react';
import Image from 'next/image';
import { RegistryAggregator } from '@/components/RegistryAggregator';
import { PhotoGallery } from '@/components/PhotoGallery';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

interface DashboardStats {
  totalGuests: number;
  rsvpYes: number;
  rsvpNo: number;
  budget: number;
  spent: number;
  daysUntilWedding: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface CoupleData {
  partnerOne: string;
  partnerTwo: string;
  weddingDate: string;
  weddingLocation: string;
  tier: 'free' | 'standard' | 'premium';
}

interface UpcomingTask {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const DASHBOARD_CARDS = [
  {
    id: 'timeline',
    title: 'Wedding Timeline',
    description: 'Organize tasks by timeframe',
    icon: Calendar,
    color: 'bg-blue-50',
    iconColor: 'text-blue-600',
    href: '/timeline',
    status: 'free',
    tier: 'Free Preview'
  },
  {
    id: 'checklist',
    title: 'Checklist',
    description: '90+ professional tasks',
    icon: CheckCircle,
    color: 'bg-green-50',
    iconColor: 'text-green-600',
    href: '/checklist',
    status: 'free',
    tier: 'Free Preview'
  },
  {
    id: 'guests',
    title: 'Guest List',
    description: 'Manage RSVPs and meals',
    icon: Users,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '/guests',
    status: 'premium',
    tier: 'Premium'
  },
  {
    id: 'budget',
    title: 'Budget Planner',
    description: 'Track spending by category',
    icon: DollarSign,
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    href: '/budget',
    status: 'free',
    tier: 'Free Preview'
  },
  {
    id: 'vendors',
    title: 'Browse Vendors',
    description: 'Find & book vendors',
    icon: MapPin,
    color: 'bg-rose-50',
    iconColor: 'text-rose-600',
    href: '/vendors',
    status: 'free',
    tier: 'Free'
  },
  {
    id: 'vendor-questions',
    title: 'Vendor Questions',
    description: '200+ critical questions',
    icon: ClipboardList,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '/vendor-questions',
    status: 'free',
    tier: 'Free Preview'
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Get expert planning advice',
    icon: Sparkles,
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    href: '/ai',
    status: 'free',
    tier: 'Free'
  },
  {
    id: 'rsvp-invites',
    title: 'Send Invitations',
    description: 'Create & send RSVPs',
    icon: MessageCircle,
    color: 'bg-pink-50',
    iconColor: 'text-pink-600',
    href: '/rsvp',
    status: 'free',
    tier: 'Free'
  },
  {
    id: 'website-builder',
    title: 'Wedding Website',
    description: 'Create your wedding site',
    icon: Home,
    color: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    href: '/website',
    status: 'free',
    tier: 'Free'
  },
  {
    id: 'photo-gallery',
    title: 'Photo Gallery',
    description: 'Share & organize photos',
    icon: Camera,
    color: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    href: '/photos',
    status: 'premium',
    tier: 'Premium'
  },
  {
    id: 'registry',
    title: 'Registry',
    description: 'Aggregate registries',
    icon: Gift,
    color: 'bg-red-50',
    iconColor: 'text-red-600',
    href: '/registry',
    status: 'premium',
    tier: 'Premium'
  },
  {
    id: 'seating',
    title: 'Seating Chart',
    description: 'Plan table layouts',
    icon: Smile,
    color: 'bg-teal-50',
    iconColor: 'text-teal-600',
    href: '/seating',
    status: 'premium',
    tier: 'Premium'
  },
  {
    id: 'honeymoon',
    title: 'Honeymoon Planning',
    description: 'Plan your getaway',
    icon: Heart,
    color: 'bg-violet-50',
    iconColor: 'text-violet-600',
    href: '/honeymoon',
    status: 'future'
  },
  {
    id: 'thank-you',
    title: 'Thank You Cards',
    description: 'Track thank yous (Future)',
    icon: Gift,
    color: 'bg-gray-50',
    iconColor: 'text-gray-400',
    href: '#',
    status: 'future'
  },
  {
    id: 'music',
    title: 'Music & Playlist',
    description: 'Curate wedding playlist (Future)',
    icon: Music,
    color: 'bg-gray-50',
    iconColor: 'text-gray-400',
    href: '#',
    status: 'future'
  },
  {
    id: 'venue-ideas',
    title: 'Venue Ideas',
    description: 'Venue inspiration (Future)',
    icon: MapPin,
    color: 'bg-gray-50',
    iconColor: 'text-gray-400',
    href: '#',
    status: 'future'
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Track all metrics (Future)',
    icon: BarChart3,
    color: 'bg-gray-50',
    iconColor: 'text-gray-400',
    href: '#',
    status: 'future'
  },
];


export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('website');
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalGuests: 0,
    rsvpYes: 0,
    rsvpNo: 0,
    budget: 0,
    spent: 0,
    daysUntilWedding: 0,
    tasksCompleted: 0,
    totalTasks: 0,
  });

  const [coupleData, setCoupleData] = useState<CoupleData>({
    partnerOne: 'Loading...',
    partnerTwo: 'Your Love',
    weddingDate: new Date().toISOString().split('T')[0],
    weddingLocation: 'Dream Venue',
    tier: 'standard',
  });

  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([
    {
      id: '1',
      title: 'Book photographer',
      category: 'Photography',
      dueDate: '2025-01-15',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      title: 'Choose wedding theme',
      category: 'Planning',
      dueDate: '2025-01-20',
      priority: 'high',
      completed: false,
    },
    {
      id: '3',
      title: 'Order invitations',
      category: 'Invitations',
      dueDate: '2025-02-01',
      priority: 'medium',
      completed: false,
    },
  ]);

  useEffect(() => {
    // In a real app, fetch from API
    const weddingDate = new Date('2025-06-15');
    const today = new Date();
    const daysUntil = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setStats({
      totalGuests: 150,
      rsvpYes: 85,
      rsvpNo: 15,
      budget: 30000,
      spent: 8500,
      daysUntilWedding: daysUntil,
      tasksCompleted: 12,
      totalTasks: 42,
    });

    setCoupleData({
      partnerOne: 'Sarah',
      partnerTwo: 'Michael',
      weddingDate: '2025-06-15',
      weddingLocation: 'Riverside Manor',
      tier: 'premium',
    });
  }, []);

  const budgetPercentage = Math.round((stats.spent / stats.budget) * 100);
  const taskPercentage = Math.round((stats.tasksCompleted / stats.totalTasks) * 100);
  const rsvpPercentage = Math.round(((stats.rsvpYes + stats.rsvpNo) / stats.totalGuests) * 100);

  // Auth protection - completely locked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWall featureName="Dashboard" fullLock={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding</h1>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-champagne-200 p-4">
          <button className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded flex items-center gap-2">
            <Settings className="w-5 h-5" /> Settings
          </button>
          <button className="w-full text-left py-2 px-3 hover:bg-gray-100 rounded flex items-center gap-2">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner with Photo */}
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/wedding-photos/deltalow-560.jpg')",
              backgroundPosition: 'center 40%'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
          </div>

          <div className="relative px-8 py-12 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
              {coupleData.partnerOne} & {coupleData.partnerTwo}
            </h2>
            <p className="text-xl text-white/90 mb-4">
              {coupleData.weddingLocation} • {new Date(coupleData.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="flex items-center justify-center gap-2 text-champagne-200">
              <Calendar className="w-5 h-5" />
              <span className="text-lg font-medium">
                {stats.daysUntilWedding} days until your special day
              </span>
            </div>
          </div>
        </div>

        {/* Countdown + Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Countdown */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-champagne-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Days Until Wedding</h3>
              <Calendar className="w-5 h-5 text-champagne-600" />
            </div>
            <div className="text-4xl font-bold text-champagne-600">
              {stats.daysUntilWedding}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(coupleData.weddingDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Guests */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Guest Responses</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {stats.rsvpYes + stats.rsvpNo}/{stats.totalGuests}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${rsvpPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{rsvpPercentage}% responded</p>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Budget Status</h3>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-4xl font-bold text-emerald-600">
              ${stats.spent.toLocaleString()}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetPercentage > 100 ? 'bg-red-600' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              of ${stats.budget.toLocaleString()} ({budgetPercentage}%)
            </p>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Planning Progress</h3>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {stats.tasksCompleted}/{stats.totalTasks}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${taskPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">tasks completed</p>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-champagne-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif font-bold text-gray-900">Upcoming Tasks</h3>
            <button
              onClick={() => router.push('/checklist')}
              className="text-champagne-600 hover:text-champagne-700 flex items-center gap-1 text-sm font-medium"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-champagne-600 focus:ring-champagne-500 cursor-pointer"
                  readOnly
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{task.category}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
{/* BUILD 1 Features */}
        <div className="mt-12">
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button onClick={() => setActiveTab('website')} className={`px-4 py-2 font-medium ${activeTab === 'website' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>🎨 Website</button>
            <button onClick={() => setActiveTab('registry')} className={`px-4 py-2 font-medium ${activeTab === 'registry' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>🎁 Registry</button>
            <button onClick={() => setActiveTab('gallery')} className={`px-4 py-2 font-medium ${activeTab === 'gallery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>📸 Gallery</button>
          </div>

          {activeTab === 'website' && (
            <div className="p-6 bg-white rounded-lg mt-4">
              <h3 className="text-xl font-bold">🎨 Wedding Website Builder</h3>
              <p className="text-gray-600 mt-2">Coming soon!</p>
            </div>
          )}
          {activeTab === 'registry' && (
            <div className="mt-4">
              <RegistryAggregator weddingId="demo-wedding-123" />
            </div>
          )}
          {activeTab === 'gallery' && (
            <div className="mt-4">
              <PhotoGallery weddingId="demo-wedding-123" />
            </div>
          )}
        </div>

        {/* Action Cards Grid */}
        <div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Your Tools</h3>

          {/* Free Features */}
          <div className="mb-12">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Free Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DASHBOARD_CARDS.filter((card) => card.status === 'free').map((card) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => router.push(card.href)}
                    className={`${card.color} border border-gray-200 rounded-xl p-6 hover:shadow-md transition text-left group relative`}
                  >
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">
                        {card.tier}
                      </span>
                    </div>
                    <IconComponent className={`${card.iconColor} w-8 h-8 mb-3 group-hover:scale-110 transition`} />
                    <h4 className="font-semibold text-gray-900 mb-1">{card.title}</h4>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Premium Features */}
          <div className="mb-12">
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Premium Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DASHBOARD_CARDS.filter((card) => card.status === 'premium').map((card) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => router.push(card.href)}
                    className={`${card.color} border-2 border-champagne-300 rounded-xl p-6 hover:shadow-md transition text-left group relative`}
                  >
                    <div className="absolute top-3 right-3">
                      <span className="bg-gradient-to-r from-champagne-500 to-rose-500 text-white text-xs px-2 py-1 rounded font-medium">
                        {card.tier}
                      </span>
                    </div>
                    <IconComponent className={`${card.iconColor} w-8 h-8 mb-3 group-hover:scale-110 transition`} />
                    <h4 className="font-semibold text-gray-900 mb-1">{card.title}</h4>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Future Features */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Coming Soon
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-60">
              {DASHBOARD_CARDS.filter((card) => card.status === 'future').map((card) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={card.id}
                    className={`${card.color} border border-gray-200 rounded-xl p-6 text-left`}
                  >
                    <div className="relative">
                      <IconComponent className={`${card.iconColor} w-8 h-8 mb-3`} />
                      <span className="absolute top-0 right-0 bg-gray-400 text-white text-xs px-2 py-1 rounded">
                        Soon
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{card.title}</h4>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-champagne-200 mt-12 py-8 text-center text-gray-600 text-sm">
        <p>Made with 💕 for your special day</p>
        <p className="mt-2">
          {coupleData.tier === 'premium' && '🌟 Premium Member'}
          {coupleData.tier === 'standard' && '💎 Standard Member'}
          {coupleData.tier === 'free' && '📌 Free Tier'}
        </p>
      </footer>
    </div>
  );
}