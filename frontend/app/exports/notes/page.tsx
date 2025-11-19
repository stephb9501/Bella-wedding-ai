'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft, Heart, Lightbulb, Star, MessageSquare } from 'lucide-react';

export default function CustomSectionsExport() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      // Security check
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      setAuthorized(true);

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserData(data);
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading custom sections...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5in;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print bg-gradient-to-br from-champagne-50 to-rose-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/exports')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Exports
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-semibold rounded-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Custom Sections
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Wedding Planning Notes
          </h1>
          <h2 className="text-2xl text-gray-700 mb-2">{userData?.full_name || 'Your Wedding'}</h2>
          {userData?.wedding_date && (
            <p className="text-lg text-gray-600">
              {new Date(userData.wedding_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Our Story Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-rose-500" />
            <h2 className="text-2xl font-bold text-gray-900">Our Love Story</h2>
          </div>
          <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              <em>Write your love story here - how you met, your first date, the proposal...</em>
            </p>
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Vision & Inspiration Section */}
        <div className="mb-10 page-break">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Vision & Inspiration</h2>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Wedding Theme & Style:</h3>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Color Palette:</h3>
            <div className="grid grid-cols-5 gap-4 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-2 border-gray-300 h-20 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Inspiration Images & Ideas:</h3>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-2 border-gray-300 h-32 rounded flex items-center justify-center text-gray-400 text-sm">
                  Paste photo or sketch here
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important Ideas Section */}
        <div className="mb-10 page-break">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Important Ideas & Reminders</h2>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="space-y-4">
              {[
                'Must-Have Elements',
                'Special Traditions to Include',
                'DIY Projects',
                'Last-Minute Reminders',
                'Day-of Emergency Kit Items'
              ].map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-gray-900 mb-2">{section}:</h3>
                  <div className="space-y-2 ml-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="border-b border-gray-300 h-6"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vows & Speeches Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900">Vows & Speeches</h2>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Your Vows:</h3>
            <div className="space-y-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Welcome Speech Notes:</h3>
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Music & Entertainment Section */}
        <div className="mb-10 page-break">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">Music & Entertainment</h2>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Must-Play Songs:</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2 font-semibold">
                <div>Song Title</div>
                <div>Artist / Moment</div>
              </div>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <div className="border-b border-gray-300 h-6"></div>
                  <div className="border-b border-gray-300 h-6"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Do NOT Play List:</h3>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Free Notes Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Notes</h2>
          <div className="border-2 border-gray-300 rounded-lg p-6">
            <div className="space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border-b border-gray-300 h-6"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Generated from Bella Wedding AI | bellaweddingai.com
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Use these pages to capture your thoughts, ideas, and inspiration throughout your planning journey!
          </p>
        </div>
      </div>
    </>
  );
}
