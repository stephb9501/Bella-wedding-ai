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

  // Preview content - show sample registries
  const sampleRegistries = [
    { name: 'Amazon', url: 'amazon.com/registry', icon: '🛍️', color: 'bg-orange-50 border-orange-200' },
    { name: 'Target', url: 'target.com/registry', icon: '🎯', color: 'bg-red-50 border-red-200' },
    { name: 'Zola', url: 'zola.com/registry', icon: '💍', color: 'bg-purple-50 border-purple-200' },
  ];

  const previewContent = (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Registry Aggregator Preview</h3>
        <p className="text-gray-600">Combine all your wedding registries in one beautiful place</p>
      </div>

      <div className="space-y-4">
        {sampleRegistries.map((registry, index) => (
          <div key={index} className={`bg-white rounded-xl p-6 border-2 ${registry.color} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{registry.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{registry.name}</h4>
                  <p className="text-gray-600 text-sm">{registry.url}</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-champagne-500 to-rose-500 text-white font-semibold rounded-lg shadow-md hover:from-champagne-600 hover:to-rose-600 transition">
                View Registry
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-6 text-gray-500 italic">
        + Add unlimited registries, customize display, share single link with guests...
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <AuthWall featureName="Registry Aggregator" previewContent={previewContent} fullLock={false} />;
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
