'use client';

import { RegistryAggregator } from '@/components/RegistryAggregator';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

export default function Registry() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Auth protection - completely locked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWall featureName="Registry" fullLock={true} />;
  }

  // TODO: Get actual wedding ID from user session
  // For now using a demo wedding ID
  const weddingId = 'demo-wedding-123';

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

          <button
            onClick={() => router.push('/dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Wedding Registry
          </h1>
          <p className="text-gray-600 text-lg">
            Aggregate all your registries in one place for your guests to easily find
          </p>
        </div>

        <RegistryAggregator weddingId={weddingId} />
      </div>
    </div>
  );
}
