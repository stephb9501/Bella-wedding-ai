'use client';

import { GuestList } from '@/components/GuestList';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

export default function Guests() {
  const router = useRouter();

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Guest List & RSVP
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your guest list, track RSVPs, and collect addresses for save-the-dates
          </p>
        </div>

        <GuestList weddingId={weddingId} />
      </div>
    </div>
  );
}
