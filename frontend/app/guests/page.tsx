'use client';

import { GuestList } from '@/components/GuestList';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

export default function Guests() {
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

  // Preview content - show sample guests
  const sampleGuests = [
    { name: 'Emily & James Anderson', email: 'emily.anderson@email.com', rsvp: 'Yes', count: 2 },
    { name: 'Sarah Martinez', email: 'sarah.m@email.com', rsvp: 'Yes', count: 1 },
    { name: 'Michael & Rachel Chen', email: 'mchen@email.com', rsvp: 'Pending', count: 2 },
    { name: 'David Thompson', email: 'dthompson@email.com', rsvp: 'Yes', count: 1 },
    { name: 'Jessica & Tom Wilson', email: 'jwilson@email.com', rsvp: 'No', count: 2 },
  ];

  const previewContent = (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Guest List Preview</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">Total Guests: <span className="font-bold text-champagne-600">8</span></span>
            <span className="text-gray-600">Confirmed: <span className="font-bold text-green-600">6</span></span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">RSVP</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sampleGuests.map((guest, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{guest.name}</td>
                <td className="px-6 py-4 text-gray-600">{guest.email}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    guest.rsvp === 'Yes' ? 'bg-green-100 text-green-800' :
                    guest.rsvp === 'No' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {guest.rsvp}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-900">{guest.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-center py-6 text-gray-500 italic">
        + Manage unlimited guests, send RSVP links, track responses...
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <AuthWall featureName="Guest List Manager" previewContent={previewContent} fullLock={false} />;
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
