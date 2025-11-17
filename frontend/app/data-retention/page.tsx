'use client';

import Link from 'next/link';
import { Database, ArrowLeft, Trash2, Clock, Shield } from 'lucide-react';

export default function DataRetentionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Data Retention & Deletion Policy
              </h1>
              <p className="text-sm text-gray-600 mt-1">Version 1.0 " Effective Date: January 17, 2025</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed">
              This Data Retention & Deletion Policy explains how long we retain your personal information and how we delete
              it when no longer needed. This policy is part of our{' '}
              <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700 underline">Privacy Policy</Link>{' '}
              and <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
            </p>
          </section>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 mb-2">We Only Keep Data as Long as Necessary</p>
                <p className="text-gray-700">
                  We retain personal information only as long as needed for the purposes described in our Privacy Policy,
                  or as required by law. When data is no longer needed, we securely delete it.
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention Periods</h2>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Active Accounts (While You Use the Platform):</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Account Information:</strong> Retained while your account is active</li>
                  <li><strong>Wedding Plans, Photos, Checklists:</strong> Retained while your account is active</li>
                  <li><strong>Guest Lists & RSVPs:</strong> Retained while your account is active</li>
                  <li><strong>Vendor Messages:</strong> Retained while your account is active</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Inactive Accounts:</h3>
                <p className="text-gray-700 mb-2">
                  If you do NOT log in for <strong>3 years</strong>, your account is considered inactive. We will:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Send you an email warning 30 days before deletion</li>
                  <li>If you do not respond, delete your account and all associated data</li>
                  <li>Exception: Payment records and consent logs are retained for legal compliance (see below)</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Deleted Accounts:</h3>
                <p className="text-gray-700 mb-2">
                  When you delete your account (or we delete it for inactivity):
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>30 Days:</strong> Most data (photos, guest lists, wedding plans) is permanently deleted from
                  production databases within 30 days</li>
                  <li><strong>90 Days:</strong> Backup copies are purged from disaster recovery systems within 90 days</li>
                  <li><strong>CDN Cache:</strong> Cached images on CDNs may persist for up to 30 days</li>
                  <li><strong>Exceptions:</strong> Payment records, consent logs, and legal holds (see below) are retained longer</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Payment Records:</h3>
                <p className="text-gray-700">
                  <strong>Retained for 7 years</strong> after the transaction date (required for tax compliance, accounting,
                  and dispute resolution under IRS and payment processor regulations).
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Includes:</strong> Transaction IDs, amounts, dates, subscription history. Does NOT include full
                  credit card numbers (we do not store themStripe does).
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Consent Logs:</h3>
                <p className="text-gray-700">
                  <strong>Retained indefinitely</strong> (required for GDPR/CCPA compliance to prove you consented to our
                  policies at the time of signup).
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Includes:</strong> Which policies you agreed to, version numbers, timestamps, IP addresses.
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Support Tickets & Communications:</h3>
                <p className="text-gray-700">
                  <strong>Retained for 3 years</strong> after the last message (for customer service quality, dispute
                  resolution, and legal compliance).
                </p>
              </div>

              <div className="bg-pink-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Legal Holds:</h3>
                <p className="text-gray-700">
                  If we receive a valid legal request (subpoena, court order, government request), we may retain your data
                  longer than the standard retention periods until the legal matter is resolved.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              How to Delete Your Data
            </h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Option 1: Delete Your Account (Recommended)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Log in to your Bella Wedding AI account</li>
                <li>Go to <strong>Account Settings ’ Privacy & Data</strong></li>
                <li>Click <strong>"Delete My Account"</strong></li>
                <li>Confirm deletion</li>
              </ol>
              <p className="text-gray-700 mt-3">
                <strong>What gets deleted:</strong> All wedding plans, photos, guest lists, messages, profile information,
                and preferences (within 30-90 days as described above).
              </p>
              <p className="text-gray-700 mt-2">
                <strong>What is NOT deleted:</strong> Payment records (7 years), consent logs (indefinite), legal holds.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mt-4">
              <h3 className="font-bold text-gray-900 mb-3">Option 2: Request Data Deletion (GDPR/CCPA Right)</h3>
              <p className="text-gray-700 mb-2">
                If you are in the EU (GDPR) or California (CCPA), you can request deletion of specific data categories:
              </p>
              <p className="text-gray-700">
                Email: <a href="mailto:privacy@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                privacy@bellaweddingai.com</a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Subject Line:</strong> "Data Deletion Request" (or "GDPR Deletion Request" / "CCPA Deletion Request")
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Include:</strong> Your account email, specific data you want deleted
              </p>
              <p className="text-gray-700 mt-3">
                <strong>Response Time:</strong> We will respond within <strong>30 days</strong> (GDPR) or <strong>45 days</strong>
                {' '}(CCPA) and complete the deletion request within the same timeframe.
              </p>
              <p className="text-gray-700 mt-3 text-sm">
                <strong>Note:</strong> We may retain data required by law (payment records, consent logs, legal holds) even
                after a deletion request.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-champagne-600" />
              Secure Data Deletion Methods
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                When we delete data, we use industry-standard secure deletion methods:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Database Records:</strong> Permanently deleted from production databases (not just marked as deleted)</li>
                <li><strong>File Storage:</strong> Files (photos, documents) are overwritten and removed from storage buckets</li>
                <li><strong>Backups:</strong> Deleted data is purged from backups within 90 days</li>
                <li><strong>CDN Cache:</strong> Cached content is invalidated and expires within 30 days</li>
                <li><strong>Third-Party Services:</strong> We instruct third-party processors (Stripe, OpenAI, etc.) to delete
                your data per their retention policies</li>
              </ul>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Severability</h2>
            <p className="text-gray-700">
              If any provision of this Data Retention Policy is found to be unlawful, void, or unenforceable, that provision
              shall be severed and shall not affect the remaining provisions. This policy is part of our{' '}
              <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700 underline">Privacy Policy</Link>.
            </p>
          </section>

          <div className="text-center pt-8 border-t border-gray-200">
            <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-champagne-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2025 Bella Wedding AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
