'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, Heart, MapPin, Star, Phone, Globe, CheckCircle } from 'lucide-react';

interface DiscoveredVendor {
  business_name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  latitude?: number;
  longitude?: number;
  category: string;
  zip_code?: string;
  city?: string;
  state?: string;
}

const CATEGORIES = [
  'photographer', 'videographer', 'florist', 'venue', 'caterer',
  'dj', 'hair salon', 'makeup artist', 'baker', 'wedding planner'
];

export default function VendorDiscovery() {
  const router = useRouter();
  const [category, setCategory] = useState('photographer');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('40000'); // 25 miles in meters
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<DiscoveredVendor[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const searchVendors = async () => {
    if (!zipCode) {
      alert('Please enter a ZIP code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/vendor-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, zipCode, radius: parseInt(radius) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setVendors(data.vendors || []);
      setSelected(new Set());
    } catch (error: any) {
      console.error('Search error:', error);
      alert(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleVendor = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const toggleAll = () => {
    if (selected.size === vendors.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(vendors.map((_, i) => i)));
    }
  };

  const importSelected = async () => {
    if (selected.size === 0) {
      alert('Please select vendors to import');
      return;
    }

    const selectedVendors = Array.from(selected).map(i => vendors[i]);

    setImporting(true);
    try {
      // Import vendors to database
      const promises = selectedVendors.map(vendor =>
        fetch('/api/vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: vendor.business_name,
            email: `${vendor.business_name.toLowerCase().replace(/\s+/g, '')}@placeholder.com`, // Placeholder
            password: 'temppassword123', // They'll need to claim and reset
            phone: vendor.phone || '',
            category: vendor.category,
            city: vendor.city || '',
            state: vendor.state || '',
            zipCode: vendor.zip_code,
            description: `Discovered vendor - ${vendor.rating ? `${vendor.rating} stars` : 'Unclaimed listing'}`,
            tier: 'free',
          }),
        })
      );

      await Promise.all(promises);

      alert(`Successfully imported ${selected.size} vendors!`);
      setVendors([]);
      setSelected(new Set());
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-champagne-600 hover:text-champagne-700 mb-4"
          >
            ← Back to Admin
          </button>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Vendor Discovery Tool
          </h1>
          <p className="text-gray-600">
            Search Google Places to find and import wedding vendors
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                ZIP Code
              </label>
              <input
                type="text"
                placeholder="Enter ZIP"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
              >
                <option value="16000">10 miles</option>
                <option value="40000">25 miles</option>
                <option value="80000">50 miles</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={searchVendors}
                disabled={loading || !zipCode}
                className="w-full px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {vendors.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Found {vendors.length} Vendors
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={toggleAll}
                  className="px-4 py-2 border-2 border-champagne-500 text-champagne-600 font-medium rounded-lg hover:bg-champagne-50 transition"
                >
                  {selected.size === vendors.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={importSelected}
                  disabled={selected.size === 0 || importing}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Import ({selected.size})
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {vendors.map((vendor, index) => (
                <div
                  key={index}
                  onClick={() => toggleVendor(index)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                    selected.has(index)
                      ? 'border-champagne-500 bg-champagne-50'
                      : 'border-gray-200 hover:border-champagne-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selected.has(index)
                        ? 'border-champagne-500 bg-champagne-500'
                        : 'border-gray-300'
                    }`}>
                      {selected.has(index) && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {vendor.business_name}
                          </h3>
                          <p className="text-sm text-gray-600">{vendor.category}</p>
                        </div>
                        {vendor.rating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="font-bold">{vendor.rating}</span>
                            {vendor.review_count && (
                              <span className="text-gray-500 text-sm ml-1">
                                ({vendor.review_count})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        {vendor.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {vendor.address}
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {vendor.phone}
                          </div>
                        )}
                        {vendor.website && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Globe className="w-4 h-4" />
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {vendor.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vendors.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Enter a ZIP code and category to discover vendors
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
