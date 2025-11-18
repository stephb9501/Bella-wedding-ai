'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, Printer, CheckSquare, Calendar, DollarSign, Users, FileText, Download } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/lib/useAuth';

export default function ExportsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const supabase = createClientComponentClient();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, authLoading]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserData(data);
    } catch (err) {
      console.error('Load user data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportOptions = [
    {
      id: 'complete-binder',
      title: 'Complete Wedding Binder',
      description: 'All your wedding information in one printable document',
      icon: FileText,
      color: 'bg-rose-50',
      iconColor: 'text-rose-600',
      action: () => printCompleteBinder(),
      pages: '15-20 pages'
    },
    {
      id: 'timeline',
      title: 'Wedding Timeline',
      description: 'Day-of timeline with all events and vendor contacts',
      icon: Calendar,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      action: () => printTimeline(),
      pages: '2-3 pages'
    },
    {
      id: 'checklist',
      title: 'Planning Checklist',
      description: 'Month-by-month tasks with checkboxes',
      icon: CheckSquare,
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      action: () => printChecklist(),
      pages: '4-5 pages'
    },
    {
      id: 'budget',
      title: 'Budget Summary',
      description: 'Expense breakdown by category',
      icon: DollarSign,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      action: () => printBudget(),
      pages: '2-3 pages'
    },
    {
      id: 'guest-list',
      title: 'Guest List',
      description: 'Complete guest list with RSVP status and contact info',
      icon: Users,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      action: () => printGuestList(),
      pages: '3-5 pages'
    }
  ];

  const printCompleteBinder = () => {
    router.push('/exports/binder');
  };

  const printTimeline = () => {
    router.push('/exports/timeline');
  };

  const printChecklist = () => {
    router.push('/exports/checklist');
  };

  const printBudget = () => {
    router.push('/exports/budget');
  };

  const printGuestList = () => {
    router.push('/exports/guests');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📄 Export & Print</h1>
          <p className="text-gray-600">Download and print your wedding planning documents</p>
        </div>

        {/* User Info */}
        {userData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{userData.full_name}</h2>
                {userData.wedding_date && (
                  <p className="text-gray-600">
                    Wedding Date: {new Date(userData.wedding_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Plan: {userData.subscription_tier || 'Standard'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div className={`${option.color} p-6 flex items-center justify-between border-b`}>
                  <Icon className={`w-12 h-12 ${option.iconColor}`} />
                  <span className="text-xs text-gray-600 font-medium">{option.pages}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                  <button
                    onClick={option.action}
                    className="w-full px-4 py-2 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print / Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileDown className="w-5 h-5" />
            How to Export
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Click any export option above to open the print preview</li>
            <li>Your browser's print dialog will open automatically</li>
            <li>Choose "Save as PDF" to download, or "Print" to send to printer</li>
            <li>For best results, use landscape orientation for timelines</li>
            <li>All exports are formatted for 8.5" x 11" paper</li>
          </ol>
        </div>

        {/* Premium Feature Notice */}
        {userData && userData.subscription_tier === 'standard' && (
          <div className="mt-8 bg-gradient-to-r from-champagne-50 to-rose-50 border-2 border-champagne-200 p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Unlock Unlimited Exports</h3>
                <p className="text-gray-700 text-sm mb-4">
                  Standard plan: 1 export per month. Premium plan: Unlimited exports + AI-powered binder formatting.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-2 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-semibold rounded-lg transition"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
