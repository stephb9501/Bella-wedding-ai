'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Trash2, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function GDPRPage() {
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleExportData = async () => {
    setExportStatus('loading');

    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bella-wedding-data-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 5000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      return;
    }

    setDeleteStatus('loading');

    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setDeleteStatus('success');

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteStatus('error');
      setTimeout(() => setDeleteStatus('idle'), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">GDPR Data Rights</h1>
          </div>
          <p className="text-gray-700">
            Exercise your data protection rights under the General Data Protection Regulation (GDPR) and other
            privacy laws.
          </p>
        </div>

        {/* Your Rights Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Data Rights</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Right to Access</h3>
                <p className="text-gray-700">
                  You have the right to access and receive a copy of your personal data.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Right to Rectification</h3>
                <p className="text-gray-700">
                  You can update or correct your personal information through your account settings.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Right to Erasure</h3>
                <p className="text-gray-700">
                  You have the right to request deletion of your personal data.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Right to Data Portability</h3>
                <p className="text-gray-700">
                  You can export your data in a structured, machine-readable format.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export Data Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Export Your Data</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Download a complete copy of your personal data stored in our system. This includes your profile
            information, wedding details, guest lists, vendor information, and all associated data.
          </p>

          {exportStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">Your data has been exported successfully!</p>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">Failed to export data. Please try again or contact support.</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">What's included in the export:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Profile information (name, email, contact details)</li>
                  <li>Wedding event details</li>
                  <li>Guest lists and RSVP responses</li>
                  <li>Vendor information and contracts</li>
                  <li>Budget and expense data</li>
                  <li>Timeline and checklist items</li>
                  <li>Photos and media metadata</li>
                  <li>Account activity logs</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportData}
            disabled={exportStatus === 'loading'}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {exportStatus === 'loading' ? 'Exporting...' : 'Export My Data'}
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Delete My Account</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {deleteStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">
                Your account deletion request has been processed. Redirecting...
              </p>
            </div>
          )}

          {deleteStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">
                Failed to delete account. Please try again or contact support.
              </p>
            </div>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Warning: This will permanently delete:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your profile and account credentials</li>
                  <li>All wedding event information</li>
                  <li>Guest lists and RSVP data</li>
                  <li>Vendor contracts and communications</li>
                  <li>Budget and financial records</li>
                  <li>All uploaded photos and media</li>
                  <li>Timeline, checklist, and planning data</li>
                </ul>
                <p className="mt-2 font-semibold">This action cannot be reversed!</p>
              </div>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Type "DELETE MY ACCOUNT" to confirm:
                </label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE MY ACCOUNT"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE MY ACCOUNT' || deleteStatus === 'loading'}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteStatus === 'loading' ? 'Deleting...' : 'Confirm Deletion'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about your data rights or need assistance, please contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Email:</strong> privacy@bellawedding.ai
            </p>
            <p>
              <strong>Data Protection Officer:</strong> dpo@bellawedding.ai
            </p>
          </div>
          <div className="mt-6 flex gap-4">
            <Link
              href="/privacy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-blue-600 hover:underline"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
