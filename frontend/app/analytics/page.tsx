'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WeddingAnalyticsDashboard from '@/components/WeddingAnalyticsDashboard';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (!res.ok) {
        router.push('/login');
        return;
      }

      const session = await res.json();

      // Get user's wedding
      const weddingRes = await fetch(`/api/weddings?user_id=${session.user.id}`);
      if (weddingRes.ok) {
        const weddings = await weddingRes.json();
        if (weddings && weddings.length > 0) {
          setWedding(weddings[0]);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Wedding First
          </h1>
          <p className="text-gray-600 mb-8">
            Before viewing analytics, please create your wedding profile.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Wedding Analytics & Insights
              </h1>
              <p className="text-gray-600 mt-1">
                Track your progress for {wedding.bride_name} & {wedding.groom_name}'s wedding
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WeddingAnalyticsDashboard weddingId={wedding.id} />
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Your Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Task Completion</h3>
              <p className="text-sm text-gray-600">
                Track your wedding planning progress and identify overdue items that need attention.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Budget Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor spending across categories and stay within your budget with real-time updates.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Guest Management</h3>
              <p className="text-sm text-gray-600">
                Keep track of RSVPs and follow up with guests who haven't responded yet.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Vendor Progress</h3>
              <p className="text-sm text-gray-600">
                See how many vendors you've contacted and booked to ensure all positions are filled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
