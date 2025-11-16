'use client';

import { useRouter } from 'next/navigation';
import { Lock, Sparkles } from 'lucide-react';

interface AuthWallProps {
  featureName: string;
  previewContent?: React.ReactNode;
  fullLock?: boolean;
}

export default function AuthWall({ featureName, previewContent, fullLock = false }: AuthWallProps) {
  const router = useRouter();

  if (fullLock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-2 border-champagne-200">
          <div className="w-20 h-20 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            {featureName} is Premium
          </h2>

          <p className="text-gray-600 mb-6 text-lg">
            Sign up for free to unlock this feature and start planning your dream wedding!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth')}
              className="w-full px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Sign Up Free
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-200 transition"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-purple-600 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>100% Free to Start</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Preview Content with Blur */}
      <div className="pointer-events-none select-none opacity-50 blur-sm">
        {previewContent}
      </div>

      {/* Overlay Lock */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-2 border-champagne-200 m-4">
          <div className="w-16 h-16 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
            Unlock {featureName}
          </h3>

          <p className="text-gray-600 mb-6">
            Create a free account to access all features and start planning your perfect wedding!
          </p>

          <button
            onClick={() => router.push('/auth')}
            className="w-full px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105"
          >
            Sign Up Free
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth')}
              className="text-champagne-600 hover:text-champagne-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
