'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, AlertCircle, CheckCircle, XCircle, ArrowLeft, HelpCircle, FileText, FileJson } from 'lucide-react';

export default function VendorImportPage() {
  const router = useRouter();
  const [importMethod, setImportMethod] = useState<'csv' | 'json'>('csv');
  const [vendorData, setVendorData] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
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

  // Download CSV template
  const downloadCSVTemplate = () => {
    const csvContent = `business_name,category,city,state,zip_code,email,phone,website,description
Elegant Events Photography,Photography,Los Angeles,CA,90210,contact@elegantevents.com,555-1234,https://elegantevents.com,Professional wedding photography
Sweet Dreams Bakery,Cake,Miami,FL,33101,,,https://sweetdreams.com,Amazing wedding cakes`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor-import-template.csv';
    a.click();
  };

  // Parse CSV file
  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());

          const vendors = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const vendor: any = {};
            headers.forEach((header, index) => {
              if (values[index]) {
                vendor[header] = values[index];
              }
            });
            return vendor;
          });

          resolve(vendors);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Handle CSV file drop
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setCsvFile(file);
    } else {
      alert('Please drop a CSV file');
    }
  };

  // Handle CSV file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  // Import vendors
  const handleImport = async () => {
    try {
      setImporting(true);
      setResults(null);

      let vendors;

      if (importMethod === 'csv' && csvFile) {
        vendors = await parseCSV(csvFile);
      } else if (importMethod === 'json') {
        vendors = JSON.parse(vendorData);
      } else {
        throw new Error('No data to import');
      }

      const response = await fetch('/api/admin/vendor-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendors, send_invites: sendInvites }),
      });

      if (!response.ok) throw new Error('Import failed');

      const data = await response.json();
      setResults(data.results);
      setCsvFile(null);
      setVendorData('');
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Import failed'));
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
        {/* Import Method Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 flex">
          <button
            onClick={() => setImportMethod('csv')}
            className={`flex-1 py-4 px-6 font-semibold transition flex items-center justify-center gap-2 ${
              importMethod === 'csv'
                ? 'bg-purple-50 border-b-4 border-purple-600 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            CSV Upload (Easiest)
          </button>
          <button
            onClick={() => setImportMethod('json')}
            className={`flex-1 py-4 px-6 font-semibold transition flex items-center justify-center gap-2 ${
              importMethod === 'json'
                ? 'bg-purple-50 border-b-4 border-purple-600 text-purple-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileJson className="w-5 h-5" />
            JSON Paste
          </button>
        </div>

        {showInstructions && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">
                    {importMethod === 'csv' ? 'CSV Upload Instructions (Super Easy!)' : 'JSON Paste Instructions'}
                  </h3>

                  {importMethod === 'csv' ? (
                    <div className="space-y-4 text-sm text-blue-800">
                      <div>
                        <p className="font-semibold mb-2">STEP 1: Download Template</p>
                        <p>Click "Download CSV Template" below to get started with an example</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">STEP 2: Fill in Your Vendors</p>
                        <ul className="list-disc ml-5 space-y-1">
                          <li>Open the template in Excel or Google Sheets</li>
                          <li>Fill in vendor information (one per row)</li>
                          <li>Required: business_name, category</li>
                          <li>Optional: city, state, zip_code, email, phone, website, description</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">STEP 3: Upload</p>
                        <p>Drag & drop your CSV file OR click to browse and select it</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm text-blue-800">
                      <div>
                        <p className="font-semibold mb-2">STEP 1: Format as JSON Array</p>
                        <p>Click "Load Example" to see the correct format</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">STEP 2: Paste Your Data</p>
                        <p>Paste your JSON array in the text box below</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg p-3 border border-blue-200 mt-4">
                    <p className="font-semibold mb-2">Categories:</p>
                    <p className="text-xs">Venue, Catering, Photography, Videography, Florist, DJ/Music, Hair & Makeup, Wedding Planner, Cake, Transportation, Officiant, Invitations, Dress & Attire, Rentals, Other</p>
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
          {/* CSV Upload */}
          {importMethod === 'csv' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upload CSV File</h2>
                <button
                  onClick={downloadCSVTemplate}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition cursor-pointer"
                onClick={() => document.getElementById('csv-file-input')?.click()}
              >
                {csvFile ? (
                  <div>
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                    <p className="text-lg font-bold text-gray-900">{csvFile.name}</p>
                    <p className="text-sm text-gray-600 mt-2">Ready to import</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCsvFile(null);
                      }}
                      className="mt-4 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop your CSV file here
                    </p>
                    <p className="text-sm text-gray-600 mb-4">or click to browse</p>
                    <p className="text-xs text-gray-500">
                      CSV files only • Max 1000 vendors per file
                    </p>
                  </div>
                )}
              </div>

              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
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
                    Send invitation emails to vendors
                  </span>
                </label>
              </div>

              <button
                onClick={handleImport}
                disabled={importing || !csvFile}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg flex items-center justify-center gap-2"
              >
                {importing ? 'Importing...' : <><Upload className="w-5 h-5" /> Import from CSV</>}
              </button>
            </div>
          )}

          {/* JSON Paste */}
          {importMethod === 'json' && (
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
                    Send invitation emails to vendors
                  </span>
                </label>
              </div>

              <button
                onClick={handleImport}
                disabled={importing || !vendorData}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg flex items-center justify-center gap-2"
              >
                {importing ? 'Importing...' : <><Upload className="w-5 h-5" /> Import from JSON</>}
              </button>
            </div>
          )}

          {/* Results Panel */}
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
