'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Printer, ArrowLeft, Phone, Mail, MapPin, DollarSign } from 'lucide-react';

export default function VendorContactsExport() {
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
          <p className="text-gray-600">Loading vendor contacts...</p>
        </div>
      </div>
    );
  }

  // Sample vendor data - in production this would come from database
  const vendors = [
    {
      category: 'Venue',
      name: 'The Grand Ballroom',
      contact: 'Sarah Mitchell',
      phone: '(555) 123-4567',
      email: 'events@grandballroom.com',
      address: '123 Celebration Ave, Wedding City, WC 12345',
      website: 'www.grandballroom.com',
      price: '$8,000',
      notes: 'Includes tables, chairs, and linens. Setup from 2pm.'
    },
    {
      category: 'Photography',
      name: 'Picture Perfect Studios',
      contact: 'John Anderson',
      phone: '(555) 234-5678',
      email: 'john@pictureperfect.com',
      address: '456 Camera Lane, Photo City, PC 23456',
      website: 'www.pictureperfect.com',
      price: '$3,500',
      notes: '8 hours coverage, 2 photographers, engagement session included.'
    },
    {
      category: 'Catering',
      name: 'Delicious Affairs Catering',
      contact: 'Maria Rodriguez',
      phone: '(555) 345-6789',
      email: 'maria@deliciousaffairs.com',
      address: '789 Gourmet Street, Food Town, FT 34567',
      website: 'www.deliciousaffairs.com',
      price: '$12,000',
      notes: 'Buffet style, 150 guests. Final count due 2 weeks before.'
    },
    {
      category: 'Florist',
      name: 'Bloom & Blossom',
      contact: 'Emily Chen',
      phone: '(555) 456-7890',
      email: 'emily@bloomblossom.com',
      address: '321 Petal Place, Garden City, GC 45678',
      website: 'www.bloomblossom.com',
      price: '$2,000',
      notes: 'Bridal bouquet, 6 bridesmaids bouquets, centerpieces for 15 tables.'
    },
    {
      category: 'DJ/Entertainment',
      name: 'Sound Wave DJ Services',
      contact: 'Mike Thompson',
      phone: '(555) 567-8901',
      email: 'mike@soundwavedjcom',
      address: '654 Music Boulevard, Rhythm City, RC 56789',
      website: 'www.soundwavedj.com',
      price: '$1,500',
      notes: '5 hours, includes ceremony sound system and uplighting.'
    },
    {
      category: 'Videography',
      name: 'Cinematic Weddings',
      contact: 'David Lee',
      phone: '(555) 678-9012',
      email: 'david@cinematicweddings.com',
      address: '987 Film Avenue, Movie Town, MT 67890',
      website: 'www.cinematicweddings.com',
      price: '$2,500',
      notes: '8 hours, highlights video + full ceremony/reception footage.'
    },
    {
      category: 'Hair & Makeup',
      name: 'Beauty Bliss Studio',
      contact: 'Jessica Brown',
      phone: '(555) 789-0123',
      email: 'jessica@beautybliss.com',
      address: '147 Glamour Lane, Beauty City, BC 78901',
      website: 'www.beautybliss.com',
      price: '$1,000',
      notes: 'Bride + 6 bridesmaids. Trial session included.'
    },
    {
      category: 'Wedding Cake',
      name: 'Sweet Celebrations Bakery',
      contact: 'Anna Martinez',
      phone: '(555) 890-1234',
      email: 'anna@sweetcelebrations.com',
      address: '258 Sugar Street, Bakery Town, BT 89012',
      website: 'www.sweetcelebrations.com',
      price: '$800',
      notes: '3-tier vanilla and chocolate cake, serves 150. Delivery included.'
    },
    {
      category: 'Transportation',
      name: 'Luxury Limo Service',
      contact: 'Robert Wilson',
      phone: '(555) 901-2345',
      email: 'robert@luxurylimo.com',
      address: '369 Drive Way, Transport City, TC 90123',
      website: 'www.luxurylimo.com',
      price: '$800',
      notes: 'Stretch limo for bridal party, 6 hours including pick-up and drop-off.'
    },
    {
      category: 'Officiant',
      name: 'Reverend Patricia Davis',
      contact: 'Patricia Davis',
      phone: '(555) 012-3456',
      email: 'patricia@weddingofficiant.com',
      address: 'Wedding City, WC 12345',
      website: 'www.weddingofficiant.com',
      price: '$400',
      notes: 'Includes ceremony planning meeting and rehearsal attendance.'
    }
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
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="no-print bg-gradient-to-br from-champagne-50 to-rose-50 p-4">
        <div className="max-w-6xl mx-auto">
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
              Print Vendor Contacts
            </button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-6xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Vendor Contacts
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

        {/* Vendor Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {vendors.map((vendor, index) => (
            <div
              key={index}
              className={`border-2 border-gray-300 rounded-lg p-5 ${
                index === 6 ? 'page-break' : ''
              }`}
            >
              {/* Header */}
              <div className="border-b-2 border-champagne-200 pb-3 mb-3">
                <div className="text-xs font-semibold text-champagne-600 uppercase mb-1">
                  {vendor.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                <p className="text-sm text-gray-600">{vendor.contact}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{vendor.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-800 break-all">{vendor.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{vendor.address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-semibold text-emerald-700">{vendor.price}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 border border-gray-200">
                <strong className="text-gray-900">Notes:</strong> {vendor.notes}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contacts Section */}
        <div className="mt-8 p-6 bg-rose-50 border-2 border-rose-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Day-of Emergency Contacts:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-gray-900">Maid of Honor:</strong>
              <div className="text-gray-700">___________________</div>
              <div className="text-gray-700">___________________</div>
            </div>
            <div>
              <strong className="text-gray-900">Best Man:</strong>
              <div className="text-gray-700">___________________</div>
              <div className="text-gray-700">___________________</div>
            </div>
            <div>
              <strong className="text-gray-900">Venue Coordinator:</strong>
              <div className="text-gray-700">___________________</div>
              <div className="text-gray-700">___________________</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Generated from Bella Wedding AI | bellaweddingai.com
          </p>
          <p className="text-xs text-gray-400 text-center mt-2">
            Share this with your day-of coordinator and wedding party. Keep a copy in your wedding day emergency kit!
          </p>
        </div>
      </div>
    </>
  );
}
