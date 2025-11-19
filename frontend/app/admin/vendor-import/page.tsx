'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, AlertCircle, CheckCircle, XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

export default function VendorImportPage() {
  const router = useRouter();
  const [vendorData, setVendorData] = useState('');
  const [sendInvites, setSendInvites] = useState(true);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const exampleData = [
    {
      business_name: "Elegant Events Photography",
      category: "Photography",
      city: "Los Angeles",
      state: "CA",
      zip_code: "90210",
      email: "contact@elegantevents.com",
      phone: "555-1234",
      website: "https://elegantevents.com",
      description: "Professional wedding photography"
    },
    {
      business_name: "Sweet Dreams Bakery",
      category: "Cake",
      city: "Miami",
      state: "FL",
      zip_code: "33101"
    }
  ];

  const handleImport = async () => {
    try {
      setImporting(true);
      setResults(null);

      const vendors = JSON.parse(vendorData);

      const response = await fetch('/api/admin/vendor-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendors, send_invites: sendInvites }),
      });

      if (!response.ok) throw new Error('Import failed');

      const data = await response.json();
      setResults(data.results);
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Invalid JSON format'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Bulk Vendor Import</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {showInstructions && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">How to Bulk Import Vendors</h3>
                  
                  <div className="space-y-4 text-sm text-blue-800">
                    <div>
                      <p className="font-semibold mb-2">STEP 1: Find Vendors</p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Google: "wedding photographers in [city]"</li>
                        <li>Copy business names, emails, websites, phone numbers</li>
                        <li>Check Yelp, Google Business, Yellow Pages</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">STEP 2: Format as JSON</p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Required: business_name, category</li>
                        <li>Optional: email, phone, city, state, zip_code, website, description</li>
                        <li>Click "Load Example" below to see format</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">STEP 3: Import</p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Paste your JSON in the box below</li>
                        <li>Check "Send Invites" to auto-email vendors</li>
                        <li>Click "Import Vendors"</li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <p className="font-semibold mb-2">Categories:</p>
                      <p className="text-xs">Venue, Catering, Photography, Videography, Florist, DJ/Music, Hair & Makeup, Wedding Planner, Cake, Transportation, Officiant, Invitations, Dress & Attire, Rentals, Other</p>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowInstructions(false)} className="text-blue-400 hover:text-blue-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Vendor Data (JSON)</h2>
              <button
                onClick={() => setVendorData(JSON.stringify(exampleData, null, 2))}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
              >
                Load Example
              </button>
            </div>

            <textarea
              value={vendorData}
              onChange={(e) => setVendorData(e.target.value)}
              placeholder="Paste vendor JSON here..."
              className="w-full h-96 p-4 border-2 border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:border-purple-500"
            />

            <div className="mt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendInvites}
                  onChange={(e) => setSendInvites(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Send invitation emails to vendors with email addresses
                </span>
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={importing || !vendorData}
              className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg flex items-center justify-center gap-2"
            >
              {importing ? (
                'Importing...'
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Import Vendors
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Import Results</h2>

            {!results && (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Results will appear here after import</p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{results.total}</div>
                    <div className="text-sm text-blue-700 mt-1">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{results.imported}</div>
                    <div className="text-sm text-green-700 mt-1">Imported</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{results.invites_sent}</div>
                    <div className="text-sm text-purple-700 mt-1">Invites Sent</div>
                  </div>
                </div>

                {results.errors && results.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Errors ({results.errors.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {results.errors.map((err: any, i: number) => (
                        <div key={i} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                          <p className="font-medium text-red-900">{err.business_name}</p>
                          <p className="text-red-700">{err.error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.imported > 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold">Success!</p>
                      <p>{results.imported} vendors imported successfully</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
