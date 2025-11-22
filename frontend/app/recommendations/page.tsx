'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WeddingPreferencesForm from '@/components/WeddingPreferencesForm';
import VendorRecommendations from '@/components/VendorRecommendations';

const VENDOR_CATEGORIES = [
  'All Categories',
  'Venues',
  'Photographers',
  'Videographers',
  'Caterers',
  'Florists',
  'Bakers/Cakes',
  'DJs/Bands',
  'Hair & Makeup',
  'Transportation',
  'Planners',
  'Officiants',
  'Rentals',
];

export default function RecommendationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showPreferences, setShowPreferences] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
      setUserEmail(session.user.email);

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
          <div className="text-6xl mb-4">💍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Wedding First
          </h1>
          <p className="text-gray-600 mb-8">
            Before we can recommend vendors, please create your wedding profile.
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
                AI-Powered Vendor Recommendations
              </h1>
              <p className="text-gray-600 mt-1">
                Personalized matches for {wedding.bride_name} & {wedding.groom_name}'s wedding
              </p>
            </div>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              {showPreferences ? '📋 View Recommendations' : '⚙️ Edit Preferences'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPreferences ? (
          /* Preferences Form */
          <WeddingPreferencesForm
            weddingId={wedding.id}
            onSave={() => {
              setShowPreferences(false);
            }}
          />
        ) : (
          /* Recommendations View */
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {VENDOR_CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <VendorRecommendations
              weddingId={wedding.id}
              category={selectedCategory === 'All Categories' ? undefined : selectedCategory}
              limit={20}
              onNeedPreferences={() => setShowPreferences(true)}
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How Our AI Recommendations Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-sm text-gray-600">
                Our AI analyzes your preferences, budget, and wedding style to find vendors that perfectly match your vision.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Data-Driven</h3>
              <p className="text-sm text-gray-600">
                Recommendations consider ratings, reviews, location, availability, and response times for the best matches.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-2">Always Improving</h3>
              <p className="text-sm text-gray-600">
                As you interact with vendors, our recommendations get smarter and more personalized to your preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
