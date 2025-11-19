'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft } from 'lucide-react';

export default function SeatingChartExport() {
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
          <p className="text-gray-600">Loading seating chart...</p>
        </div>
      </div>
    );
  }

  // Sample seating data - in production this would come from database
  const tables = [
    {
      number: 1,
      name: 'Bridal Party Table',
      seats: 10,
      guests: ['Bride & Groom', 'Maid of Honor', 'Best Man', 'Bridesmaid 1', 'Bridesmaid 2', 'Groomsman 1', 'Groomsman 2', 'Bridesmaid 3', 'Groomsman 3']
    },
    {
      number: 2,
      name: 'Family Table',
      seats: 8,
      guests: ['Mother of Bride', 'Father of Bride', 'Grandmother', 'Grandfather', 'Aunt Mary', 'Uncle John', 'Cousin Sarah', 'Cousin Mike']
    },
    {
      number: 3,
      name: 'Family Table',
      seats: 8,
      guests: ['Mother of Groom', 'Father of Groom', 'Grandmother', 'Grandfather', 'Aunt Susan', 'Uncle Bob', 'Cousin Emily', 'Cousin Tom']
    },
    {
      number: 4,
      name: 'College Friends',
      seats: 8,
      guests: ['Jessica & Mark', 'Amanda & Steve', 'Lauren', 'Rachel', 'Chris', 'Matt']
    },
    {
      number: 5,
      name: 'Work Colleagues',
      seats: 8,
      guests: ['Jennifer & David', 'Michael', 'Sarah', 'Robert', 'Linda', 'James', 'Patricia']
    },
    {
      number: 6,
      name: 'High School Friends',
      seats: 8,
      guests: ['Kelly & Brian', 'Nicole & Jason', 'Megan', 'Ashley', 'Ryan', 'Tyler']
    },
    {
      number: 7,
      name: 'Neighbors',
      seats: 8,
      guests: ['The Johnsons (4)', 'The Smiths (4)']
    },
    {
      number: 8,
      name: 'Extended Family',
      seats: 8,
      guests: ['Aunt Lisa & Uncle Mark', 'Cousin Jennifer & Family (4)', 'Cousin David']
    },
    {
      number: 9,
      name: 'Friends from City',
      seats: 8,
      guests: ['Samantha & Eric', 'Brittany', 'Danielle', 'Andrew', 'Kevin', 'Jordan', 'Taylor']
    },
    {
      number: 10,
      name: 'Sports Team',
      seats: 8,
      guests: ['Alex & Jamie', 'Morgan', 'Casey', 'Drew', 'Riley', 'Blake', 'Cameron']
    },
    {
      number: 11,
      name: 'Childhood Friends',
      seats: 8,
      guests: ['Emma & Noah', 'Olivia & Liam', 'Ava', 'Sophia', 'Mason', 'Lucas']
    },
    {
      number: 12,
      name: 'Extended Family',
      seats: 8,
      guests: ['Uncle Jim & Aunt Carol', 'Cousin Rachel & Family (4)', 'Cousin Paul']
    }
  ];

  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const totalGuests = tables.reduce((sum, table) => sum + table.guests.length, 0);

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
            size: landscape;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print bg-gradient-to-br from-champagne-50 to-rose-50 p-4">
        <div className="max-w-7xl mx-auto">
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
              Print Seating Chart
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-7xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Seating Chart
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

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Total Tables</div>
            <div className="text-2xl font-bold text-blue-900">{tables.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-1">Total Seats</div>
            <div className="text-2xl font-bold text-green-900">{totalSeats}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center border-2 border-purple-200">
            <div className="text-sm text-gray-600 mb-1">Guests Seated</div>
            <div className="text-2xl font-bold text-purple-900">{totalGuests}</div>
          </div>
        </div>

        {/* Seating Chart Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div
              key={table.number}
              className="border-2 border-gray-300 rounded-lg p-4 bg-white hover:shadow-lg transition"
            >
              {/* Table Header */}
              <div className="text-center mb-3 pb-3 border-b-2 border-champagne-200">
                <div className="text-2xl font-bold text-gray-900">Table {table.number}</div>
                <div className="text-xs text-champagne-600 font-semibold uppercase mt-1">
                  {table.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {table.seats} seats
                </div>
              </div>

              {/* Guest List */}
              <div className="space-y-1.5">
                {table.guests.map((guest, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-800 py-1 px-2 bg-gray-50 rounded border border-gray-200"
                  >
                    {guest}
                  </div>
                ))}
                {/* Empty seats */}
                {Array.from({ length: table.seats - table.guests.length }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="text-sm text-gray-400 py-1 px-2 bg-white rounded border border-dashed border-gray-300"
                  >
                    (empty)
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Visual Layout Section */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 text-center text-xl">Reception Layout</h3>
          <div className="bg-white p-8 rounded-lg border border-gray-300">
            {/* Head Table */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-champagne-100 to-rose-100 border-2 border-champagne-300 rounded-lg p-4 w-64">
                <div className="font-bold text-gray-900">HEAD TABLE</div>
                <div className="text-sm text-gray-600">Bridal Party (Table 1)</div>
              </div>
            </div>

            {/* Dance Floor */}
            <div className="text-center mb-8">
              <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-lg p-6 w-48">
                <div className="font-semibold text-gray-700">DANCE FLOOR</div>
              </div>
            </div>

            {/* Guest Tables */}
            <div className="grid grid-cols-6 gap-4 mb-6">
              {tables.slice(1).map((table) => (
                <div
                  key={table.number}
                  className="bg-white border-2 border-gray-300 rounded-full w-16 h-16 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{table.number}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* DJ/Band */}
            <div className="text-center">
              <div className="inline-block bg-purple-50 border-2 border-purple-200 rounded-lg p-3 w-32">
                <div className="text-sm font-semibold text-gray-700">DJ</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            This is a sample layout. Adjust table positions based on your venue floor plan.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Generated from Bella Wedding AI | bellaweddingai.com
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Share with venue coordinator and caterer. Print table number cards to display at each table.
          </p>
        </div>
      </div>
    </>
  );
}
