'use client';

import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { SeatingChart } from '@/components/SeatingChart';
import { useAuth } from '@/lib/useAuth';

export default function SeatingPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-champagne-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Seating Chart</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {user && isAuthenticated ? (
          <SeatingChart weddingId={user.id} userRole="bride" />
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-6">Please sign in to access the seating chart</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-6 py-3 bg-champagne-600 hover:bg-champagne-700 text-white rounded-lg font-medium"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
