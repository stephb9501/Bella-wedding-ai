'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft } from 'lucide-react';

export default function GuestListExport() {
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
          <p className="text-gray-600">Loading guest list...</p>
        </div>
      </div>
    );
  }

  // Sample guest data - in production this would come from database
  const guests = [
    { name: 'John & Jane Smith', email: 'john.smith@email.com', phone: '555-0101', rsvp: 'Yes', guests: 2, dietary: 'Vegan', table: 1 },
    { name: 'Michael Johnson', email: 'mjohnson@email.com', phone: '555-0102', rsvp: 'Yes', guests: 1, dietary: 'None', table: 1 },
    { name: 'Sarah Williams', email: 'sarah.w@email.com', phone: '555-0103', rsvp: 'Yes', guests: 1, dietary: 'Gluten-free', table: 2 },
    { name: 'Robert & Mary Davis', email: 'davis.family@email.com', phone: '555-0104', rsvp: 'Yes', guests: 2, dietary: 'None', table: 2 },
    { name: 'James Brown', email: 'jbrown@email.com', phone: '555-0105', rsvp: 'No', guests: 0, dietary: '', table: null },
    { name: 'Patricia Martinez', email: 'patricia.m@email.com', phone: '555-0106', rsvp: 'Pending', guests: 1, dietary: '', table: null },
    { name: 'David & Linda Garcia', email: 'garcia@email.com', phone: '555-0107', rsvp: 'Yes', guests: 2, dietary: 'None', table: 3 },
    { name: 'Richard Wilson', email: 'rwilson@email.com', phone: '555-0108', rsvp: 'Yes', guests: 1, dietary: 'Vegetarian', table: 3 },
  ];

  const totalGuests = guests.reduce((sum, g) => sum + g.guests, 0);
  const confirmedYes = guests.filter(g => g.rsvp === 'Yes').length;
  const confirmedNo = guests.filter(g => g.rsvp === 'No').length;
  const pending = guests.filter(g => g.rsvp === 'Pending').length;

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
              Print Guest List
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-7xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Guest List
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Total Invited</div>
            <div className="text-2xl font-bold text-blue-900">{guests.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-1">Confirmed Yes</div>
            <div className="text-2xl font-bold text-green-900">{confirmedYes}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center border-2 border-red-200">
            <div className="text-sm text-gray-600 mb-1">Confirmed No</div>
            <div className="text-2xl font-bold text-red-900">{confirmedNo}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center border-2 border-yellow-200">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">{pending}</div>
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="inline-block bg-purple-50 px-6 py-3 rounded-lg border-2 border-purple-200">
            <span className="text-sm text-gray-600 mr-2">Total Guests Attending:</span>
            <span className="text-2xl font-bold text-purple-900">{totalGuests}</span>
          </div>
        </div>

        {/* Guest Table */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left p-2 font-bold text-gray-900">Name</th>
              <th className="text-left p-2 font-bold text-gray-900">Email</th>
              <th className="text-left p-2 font-bold text-gray-900">Phone</th>
              <th className="text-center p-2 font-bold text-gray-900">RSVP</th>
              <th className="text-center p-2 font-bold text-gray-900"># Guests</th>
              <th className="text-left p-2 font-bold text-gray-900">Dietary</th>
              <th className="text-center p-2 font-bold text-gray-900">Table</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-2 text-gray-900">{guest.name}</td>
                <td className="p-2 text-gray-700 text-xs">{guest.email}</td>
                <td className="p-2 text-gray-700">{guest.phone}</td>
                <td className="p-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    guest.rsvp === 'Yes' ? 'bg-green-200 text-green-900' :
                    guest.rsvp === 'No' ? 'bg-red-200 text-red-900' :
                    'bg-yellow-200 text-yellow-900'
                  }`}>
                    {guest.rsvp}
                  </span>
                </td>
                <td className="p-2 text-center text-gray-900 font-semibold">{guest.guests}</td>
                <td className="p-2 text-gray-700 text-xs">{guest.dietary}</td>
                <td className="p-2 text-center text-gray-900">
                  {guest.table ? `Table ${guest.table}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Dietary Restrictions Summary */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-4">Dietary Restrictions Summary:</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">Vegan:</span> {guests.filter(g => g.dietary === 'Vegan').length}
            </div>
            <div>
              <span className="font-semibold">Vegetarian:</span> {guests.filter(g => g.dietary === 'Vegetarian').length}
            </div>
            <div>
              <span className="font-semibold">Gluten-free:</span> {guests.filter(g => g.dietary === 'Gluten-free').length}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Generated from Bella Wedding AI | bellaweddingai.com
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Share with caterer and venue coordinator. Update as RSVPs come in.
          </p>
        </div>
      </div>
    </>
  );
}
