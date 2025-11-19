'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft, Heart } from 'lucide-react';

export default function CompleteBinderExport() {
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
          <p className="text-gray-600">Loading wedding binder...</p>
        </div>
      </div>
    );
  }

  const weddingDate = userData?.wedding_date ? new Date(userData.wedding_date) : new Date();

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
              Print Complete Binder
            </button>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> This complete binder contains all your wedding information.
              For best results, print in color and use a 3-ring binder to organize.
              Estimated 15-20 pages.
            </p>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Cover Page */}
        <div className="min-h-screen flex flex-col items-center justify-center text-center page-break">
          <div className="mb-8">
            <Heart className="w-24 h-24 text-rose-400 mx-auto mb-6" />
          </div>
          <h1 className="text-6xl font-serif font-bold text-gray-900 mb-6">
            {userData?.full_name || 'Your Wedding'}
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-champagne-400 to-rose-400 mx-auto mb-6"></div>
          <p className="text-3xl text-gray-700 mb-4">
            {weddingDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {userData?.venue_location && (
            <p className="text-xl text-gray-600">{userData.venue_location}</p>
          )}
          <div className="mt-16">
            <p className="text-lg text-gray-500 italic">Complete Wedding Planning Binder</p>
            <p className="text-sm text-gray-400 mt-2">Generated from Bella Wedding AI</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="page-break mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 pb-4 border-b-2 border-gray-300">
            Table of Contents
          </h2>
          <div className="space-y-3">
            {[
              { section: 'Wedding Information', page: '1' },
              { section: 'Wedding Timeline', page: '2' },
              { section: 'Guest List & RSVP Tracker', page: '3' },
              { section: 'Budget Summary', page: '4' },
              { section: 'Vendor Contacts', page: '5' },
              { section: 'Planning Checklist', page: '6' },
              { section: 'Seating Chart', page: '7' },
              { section: 'Custom Notes & Ideas', page: '8' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <span className="text-gray-800 font-medium">{item.section}</span>
                <span className="text-gray-600">Page {item.page}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wedding Information Summary */}
        <div className="page-break mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 pb-4 border-b-2 border-champagne-300">
            Wedding Information
          </h2>

          <div className="bg-gradient-to-br from-champagne-50 to-rose-50 border-2 border-champagne-200 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Couple:</h3>
                <p className="text-gray-800">{userData?.full_name || 'Your Names'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Wedding Date:</h3>
                <p className="text-gray-800">
                  {weddingDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Venue:</h3>
                <p className="text-gray-800">{userData?.venue_location || '_________________'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Guest Count:</h3>
                <p className="text-gray-800">_________________</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Theme/Style:</h3>
                <p className="text-gray-800">_________________</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Color Palette:</h3>
                <p className="text-gray-800">_________________</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Wedding Party:</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-champagne-600 mb-2">Bride's Side:</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <div>Maid of Honor: _________________</div>
                  <div>Bridesmaid: _________________</div>
                  <div>Bridesmaid: _________________</div>
                  <div>Bridesmaid: _________________</div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-champagne-600 mb-2">Groom's Side:</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <div>Best Man: _________________</div>
                  <div>Groomsman: _________________</div>
                  <div>Groomsman: _________________</div>
                  <div>Groomsman: _________________</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 pb-4 border-b-2 border-champagne-300">
            Quick Reference Guide
          </h2>

          <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Emergency Day-of Contacts:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Venue Coordinator:</strong>
                <div className="mt-1 text-gray-700">Name: _________________</div>
                <div className="text-gray-700">Phone: _________________</div>
              </div>
              <div>
                <strong>Wedding Planner:</strong>
                <div className="mt-1 text-gray-700">Name: _________________</div>
                <div className="text-gray-700">Phone: _________________</div>
              </div>
              <div>
                <strong>Maid of Honor:</strong>
                <div className="mt-1 text-gray-700">Name: _________________</div>
                <div className="text-gray-700">Phone: _________________</div>
              </div>
              <div>
                <strong>Best Man:</strong>
                <div className="mt-1 text-gray-700">Name: _________________</div>
                <div className="text-gray-700">Phone: _________________</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Day-of Timeline Highlights:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span>Hair & Makeup:</span>
                <span>_________</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span>Ceremony Start:</span>
                <span>_________</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span>Cocktail Hour:</span>
                <span>_________</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span>Reception Start:</span>
                <span>_________</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span>First Dance:</span>
                <span>_________</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span>Cake Cutting:</span>
                <span>_________</span>
              </div>
              <div className="flex justify-between">
                <span>Send-off:</span>
                <span>_________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Section Dividers */}
        <div className="page-break mb-12">
          <div className="text-center py-16 bg-gradient-to-br from-champagne-50 to-rose-50 rounded-lg border-2 border-champagne-200">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Wedding Timeline</h2>
            <p className="text-gray-600 mt-4">Day-of Schedule & Events</p>
            <p className="text-sm text-gray-500 mt-8 italic">
              See individual Timeline export for detailed schedule
            </p>
          </div>
        </div>

        <div className="page-break mb-12">
          <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Guest List</h2>
            <p className="text-gray-600 mt-4">RSVP Tracking & Contact Information</p>
            <p className="text-sm text-gray-500 mt-8 italic">
              See individual Guest List export for complete details
            </p>
          </div>
        </div>

        <div className="page-break mb-12">
          <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Budget Summary</h2>
            <p className="text-gray-600 mt-4">Expenses & Payment Tracking</p>
            <p className="text-sm text-gray-500 mt-8 italic">
              See individual Budget export for detailed breakdown
            </p>
          </div>
        </div>

        <div className="page-break mb-12">
          <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-200">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Vendor Contacts</h2>
            <p className="text-gray-600 mt-4">All Vendor Information & Contacts</p>
            <p className="text-sm text-gray-500 mt-8 italic">
              See individual Vendor Contacts export for business card details
            </p>
          </div>
        </div>

        <div className="page-break mb-12">
          <div className="text-center py-16 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Planning Checklist</h2>
            <p className="text-gray-600 mt-4">Month-by-Month Tasks</p>
            <p className="text-sm text-gray-500 mt-8 italic">
              See individual Checklist export for complete task list
            </p>
          </div>
        </div>

        <div className="page-break mb-12">
          <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Seating Chart</h2>
            <p className="text-gray-600 mt-4">Table Assignments & Layout</p>
            <p className="text-sm text-gray-500 mt-8 italic">
              See individual Seating Chart export for visual layout
            </p>
          </div>
        </div>

        <div className="page-break mb-12">
          <div className="text-center py-16 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border-2 border-pink-200">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Custom Notes</h2>
            <p className="text-gray-600 mt-4">Ideas, Inspiration & Planning Notes</p>
            <p className="text-sm text-gray-500 mt-8 italic">
              See individual Custom Sections export for planning worksheets
            </p>
          </div>
        </div>

        {/* Final Page */}
        <div className="page-break text-center py-16">
          <Heart className="w-16 h-16 text-rose-400 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Congratulations on Your Wedding!
          </h2>
          <p className="text-gray-600 mb-8">
            We hope this binder helps you plan the wedding of your dreams.
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-champagne-400 to-rose-400 mx-auto mb-8"></div>
          <p className="text-sm text-gray-500">Generated from Bella Wedding AI</p>
          <p className="text-xs text-gray-400 mt-2">bellaweddingai.com</p>
        </div>

        {/* Footer - appears on all pages */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Complete Wedding Binder | {userData?.full_name} | {weddingDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </>
  );
}
