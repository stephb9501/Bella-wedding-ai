'use client';

import { useRouter } from 'next/navigation';
import { MessagingInbox } from '@/components/MessagingInbox';
import { MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();

  // TODO: Get from auth session
  const userId = 'demo-bride-123';
  const userType = 'bride';

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Messages</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Messages</h2>
          <p className="text-gray-600">
            Chat with your vendors in real-time. Get instant responses and stay organized.
          </p>
        </div>

        <MessagingInbox userId={userId} userType={userType as 'bride' | 'vendor'} />

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Pro Tip:</strong> Premium plan members get 50 messages per month instead of 5.
            Upgrade to communicate with more vendors!
          </p>
        </div>
      </div>
    </div>
  );
}
