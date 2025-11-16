'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Heart, Sparkles, ArrowRight } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-4 border-green-200 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-serif text-champagne-900 mb-4">
            Welcome to Bella Wedding AI! 🎉
          </h1>
          <p className="text-xl text-champagne-700 mb-8">
            Your subscription is now active
          </p>

          {/* Features Unlocked */}
          <div className="bg-champagne-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-serif text-champagne-900 mb-6 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              What's Unlocked
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Full checklist with 90+ tasks</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Complete budget planner</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Unlimited vendor contacts</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">AI planning assistant</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Décor zone planner</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Guest list management</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="font-semibold text-champagne-900 mb-4">Next Steps:</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="text-champagne-700">Complete your wedding profile in Settings</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="text-champagne-700">Start your checklist and set your wedding date</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="text-champagne-700">Browse vendors and start messaging them</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="px-8 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg font-medium hover:border-champagne-400 transition-colors"
            >
              Complete Profile
            </button>
          </div>

          {/* Auto Redirect */}
          <p className="mt-8 text-sm text-champagne-600">
            Redirecting to dashboard in {countdown} seconds...
          </p>

          {/* Session ID for reference */}
          {sessionId && (
            <p className="mt-4 text-xs text-champagne-500">
              Session ID: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-champagne-700 mb-2">
            <Heart className="w-4 h-4 inline text-rose-500" /> Need help getting started?
          </p>
          <button
            onClick={() => router.push('/ai-assistant')}
            className="text-champagne-600 hover:text-champagne-800 font-medium underline"
          >
            Ask our AI Planning Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
