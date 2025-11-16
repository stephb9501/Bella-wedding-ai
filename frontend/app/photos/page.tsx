'use client';

import { PhotoGallery } from '@/components/PhotoGallery';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

export default function Photos() {
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

  // Preview content - show sample photo gallery
  const samplePhotos = [
    '/wedding-photos/deltalow-130.jpg',
    '/wedding-photos/deltalow-447.jpg',
    '/wedding-photos/deltalow-512.jpg',
    '/wedding-photos/deltalow-119.jpg',
    '/wedding-photos/deltalow-445.jpg',
    '/wedding-photos/deltalow-108.jpg',
  ];

  const previewContent = (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Photo Gallery Preview</h3>
        <p className="text-gray-600">Create albums, upload unlimited photos, and share with guests</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {samplePhotos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-lg group">
            <img
              src={photo}
              alt={`Wedding photo ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
      </div>

      <div className="text-center py-6 text-gray-500 italic">
        + Create unlimited albums, organize by event, share with guests...
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <AuthWall featureName="Photo Gallery" previewContent={previewContent} fullLock={false} />;
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
            Photo Gallery
          </h1>
          <p className="text-gray-600 text-lg">
            Create galleries, organize photos, and share memories with your loved ones
          </p>
        </div>

        <PhotoGallery weddingId={weddingId} />
      </div>
    </div>
  );
}
