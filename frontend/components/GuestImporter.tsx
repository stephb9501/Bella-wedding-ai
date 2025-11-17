'use client';

import { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Guest {
  name: string;
  email?: string;
  phone?: string;
  rsvp_status?: 'pending' | 'attending' | 'declined';
  plus_one?: boolean;
  dietary_restrictions?: string;
  table_number?: number;
  notes?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors?: string[];
}

interface Props {
  userId: string;
  onImportComplete?: () => void;
}

export function GuestImporter({ userId, onImportComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<Guest[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['Please upload a CSV file']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setResult(null);

    // Parse CSV for preview
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setPreview(parsed.slice(0, 5)); // Show first 5 rows
    } catch (err: any) {
      setErrors([`Failed to parse CSV: ${err.message}`]);
    }
  };

  const parseCSV = (text: string): Guest[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const guests: Guest[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const guest: Guest = { name: '' };

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        if (!value) return;

        switch (header) {
          case 'name':
            guest.name = value;
            break;
          case 'email':
            guest.email = value;
            break;
          case 'phone':
            guest.phone = value;
            break;
          case 'rsvp_status':
          case 'rsvp status':
          case 'status':
            guest.rsvp_status = value as any;
            break;
          case 'plus_one':
          case 'plus one':
          case 'plusone':
            guest.plus_one = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
            break;
          case 'dietary_restrictions':
          case 'dietary restrictions':
          case 'dietary':
            guest.dietary_restrictions = value;
            break;
          case 'table_number':
          case 'table number':
          case 'table':
            guest.table_number = parseInt(value) || undefined;
            break;
          case 'notes':
            guest.notes = value;
            break;
        }
      });

      if (guest.name) {
        guests.push(guest);
      }
    }

    return guests;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setErrors([]);

    try {
      const text = await file.text();
      const guests = parseCSV(text);

      if (guests.length === 0) {
        throw new Error('No valid guests found in CSV file');
      }

      const response = await fetch('/api/guests/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, guests }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import guests');
      }

      const data = await response.json();
      setResult({
        success: true,
        imported: data.imported,
      });

      onImportComplete?.();
    } catch (err: any) {
      setResult({
        success: false,
        imported: 0,
        errors: [err.message],
      });
      setErrors([err.message]);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,email,phone,rsvp_status,plus_one,dietary_restrictions,table_number,notes
John Smith,john@example.com,555-1234,pending,true,vegetarian,1,Best man
Jane Doe,jane@example.com,555-5678,attending,false,gluten-free,2,Maid of honor
Bob Johnson,bob@example.com,555-9999,declined,false,,3,College friend`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_list_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">CSV Import Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Download the template below to see the required format</li>
              <li>Required column: <strong>name</strong></li>
              <li>Optional columns: email, phone, rsvp_status, plus_one, dietary_restrictions, table_number, notes</li>
              <li>RSVP status can be: pending, attending, or declined</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Template Download */}
      <button
        onClick={downloadTemplate}
        className="w-full py-3 px-4 bg-white border-2 border-gray-300 hover:border-champagne-500 text-gray-700 hover:text-champagne-700 font-medium rounded-lg transition flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Download CSV Template
      </button>

      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="csv-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 bg-champagne-100 rounded-full flex items-center justify-center">
            {file ? (
              <FileText className="w-8 h-8 text-champagne-600" />
            ) : (
              <Upload className="w-8 h-8 text-champagne-600" />
            )}
          </div>
          {file ? (
            <div>
              <p className="text-gray-900 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">Click to change file</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-900 font-medium">Click to upload CSV</p>
              <p className="text-sm text-gray-500">or drag and drop</p>
            </div>
          )}
        </label>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Preview (first 5 rows):</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Name</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Email</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Phone</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((guest, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-gray-900">{guest.name}</td>
                    <td className="py-2 px-3 text-gray-600">{guest.email || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{guest.phone || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{guest.rsvp_status || 'pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-900">
              <p className="font-medium mb-1">Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && result.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-medium">Successfully imported {result.imported} guests!</p>
            </div>
          </div>
        </div>
      )}

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!file || importing}
        className="w-full py-3 px-4 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-md"
      >
        {importing ? 'Importing...' : 'Import Guests'}
      </button>
    </div>
  );
}
