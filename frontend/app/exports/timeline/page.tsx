'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft } from 'lucide-react';

export default function TimelineExport() {
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
      // Security check - verify user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      setAuthorized(true);

      // Load user data
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
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  // Sample timeline data - in production this would come from database
  const weddingDate = userData?.wedding_date ? new Date(userData.wedding_date) : new Date();
  const timelineEvents = [
    { time: '2:00 PM', event: 'Vendors arrive and begin setup', responsible: 'Venue Coordinator' },
    { time: '3:00 PM', event: 'Bride and bridesmaids arrive for hair & makeup', responsible: 'Hair & Makeup Artist' },
    { time: '4:30 PM', event: 'Photographer arrives for getting-ready photos', responsible: 'Photographer' },
    { time: '5:00 PM', event: 'Groom and groomsmen arrive', responsible: 'Best Man' },
    { time: '5:30 PM', event: 'First look (optional)', responsible: 'Photographer' },
    { time: '6:00 PM', event: 'Guests begin arriving', responsible: 'Ushers' },
    { time: '6:30 PM', event: 'Ceremony begins', responsible: 'Officiant' },
    { time: '7:00 PM', event: 'Ceremony ends / Cocktail hour begins', responsible: 'Venue Coordinator' },
    { time: '7:15 PM', event: 'Family photos', responsible: 'Photographer' },
    { time: '8:00 PM', event: 'Reception doors open', responsible: 'Venue Staff' },
    { time: '8:15 PM', event: 'Grand entrance', responsible: 'DJ/MC' },
    { time: '8:20 PM', event: 'First dance', responsible: 'DJ' },
    { time: '8:25 PM', event: 'Welcome speech', responsible: 'Father of Bride' },
    { time: '8:30 PM', event: 'Dinner service begins', responsible: 'Caterer' },
    { time: '9:15 PM', event: 'Toasts', responsible: 'Maid of Honor / Best Man' },
    { time: '9:30 PM', event: 'Cake cutting', responsible: 'Couple' },
    { time: '9:45 PM', event: 'Parent dances', responsible: 'DJ' },
    { time: '10:00 PM', event: 'Dance floor opens', responsible: 'DJ' },
    { time: '11:30 PM', event: 'Last song / Send-off', responsible: 'DJ' },
    { time: '12:00 AM', event: 'Event ends / Clean up begins', responsible: 'Venue Coordinator' },
  ];

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
              Print Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Wedding Day Timeline
          </h1>
          <h2 className="text-2xl text-gray-700 mb-2">{userData?.full_name || 'Your Wedding'}</h2>
          <p className="text-lg text-gray-600">
            {weddingDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {userData?.venue_location && (
            <p className="text-gray-600 mt-2">{userData.venue_location}</p>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-1">
          {timelineEvents.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 py-3 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="col-span-2 font-bold text-gray-900 text-right pr-4">
                {item.time}
              </div>
              <div className="col-span-6 text-gray-800">
                {item.event}
              </div>
              <div className="col-span-4 text-gray-600 text-sm italic">
                {item.responsible}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Generated from Bella Wedding AI | bellaweddingai.com
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            This is a sample timeline. Customize times and events based on your vendors and preferences.
          </p>
        </div>

        {/* Notes Section */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-4">Important Notes:</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Share this timeline with all vendors at least 2 weeks before the wedding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Include vendor contact numbers on day-of coordinator's copy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Build in 15-minute buffers between major events for flexibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">•</span>
              <span>Confirm all times with venue coordinator 1 week before</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
