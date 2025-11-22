'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Home,
  Calendar,
  CheckCircle,
  DollarSign,
  Users,
  MapPin,
  Camera,
  Gift,
  Heart,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  MessageCircle,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  tier?: 'free' | 'standard' | 'premium';
}

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/vendors', label: 'Browse Vendors', icon: MapPin, tier: 'free' },
  { href: '/checklist', label: 'Checklist', icon: CheckCircle, tier: 'standard' },
  { href: '/timeline', label: 'Timeline', icon: Calendar, tier: 'standard' },
  { href: '/budget', label: 'Budget', icon: DollarSign, tier: 'standard' },
  { href: '/website', label: 'Wedding Website', icon: Home, tier: 'standard' },
  { href: '/vendor-questions', label: 'Vendor Questions', icon: ClipboardList, tier: 'standard' },
  { href: '/rsvp', label: 'Send Invitations', icon: MessageCircle, tier: 'standard' },
  { href: '/ai', label: 'AI Assistant', icon: Sparkles, tier: 'standard' },
  { href: '/guests', label: 'Guest List', icon: Users, tier: 'premium' },
  { href: '/registry', label: 'Registry', icon: Gift, tier: 'premium' },
  { href: '/photos', label: 'Photo Gallery', icon: Camera, tier: 'premium' },
  { href: '/seating', label: 'Seating Chart', icon: BarChart3, tier: 'premium' },
];

interface MobileNavProps {
  /** Override the user object if needed */
  user?: any;
}

export default function MobileNav({ user: propUser }: MobileNavProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const user = propUser || authUser;

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [router]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    router.push('/');
    setIsOpen(false);
  };

  const getTierBadge = (tier?: 'free' | 'standard' | 'premium') => {
    if (!tier) return null;

    const badges = {
      free: { label: 'Free', className: 'bg-green-100 text-green-700' },
      standard: { label: 'Standard', className: 'bg-blue-100 text-blue-700' },
      premium: { label: 'Premium', className: 'bg-purple-100 text-purple-700' },
    };

    const badge = badges[tier];
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-champagne-400 to-rose-400 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Bella Wedding</h2>
              {isAuthenticated && user && (
                <p className="text-champagne-50 text-xs">
                  {user.user_metadata?.full_name || user.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close navigation menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="overflow-y-auto h-[calc(100%-80px)] px-4 py-6">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition group min-h-[44px]"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-champagne-600 transition" />
                    <span className="text-gray-900 font-medium group-hover:text-champagne-600 transition">
                      {link.label}
                    </span>
                  </div>
                  {getTierBadge(link.tier)}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200" />

          {/* Settings & Logout */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('/settings')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition group min-h-[44px]"
            >
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-champagne-600 transition" />
              <span className="text-gray-900 font-medium group-hover:text-champagne-600 transition">
                Settings
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition group min-h-[44px]"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition" />
              <span className="text-gray-900 font-medium group-hover:text-red-600 transition">
                Logout
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
