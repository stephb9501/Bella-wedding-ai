'use client';

import Link from 'next/link';
import { Database, ArrowLeft } from 'lucide-react';

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
                Data Retention Policy
              </h1>
              <p className="text-sm text-gray-600 mt-1">Version 1.0 - Effective Date: January 17, 2025</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This Data Retention Policy explains how long Bella Wedding AI retains your personal data, what
              happens to your data when you delete your account, and how to request data deletion. We retain
              data only as long as necessary to provide services, comply with legal obligations, resolve
              disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Data Retention Periods
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain different types of data for varying periods based on legal requirements, business needs,
              and the nature of the information:
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.1 Active Account Data</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  While your account is active, we retain all data necessary to provide our services:
                </p>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Account Information</p>
                      <p className="text-gray-700 text-sm">Retention: Duration of active account</p>
                      <p className="text-gray-700 text-sm">
                        Includes: Email, name, password hash, profile settings, preferences
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Wedding Planning Data</p>
                      <p className="text-gray-700 text-sm">Retention: Duration of active account</p>
                      <p className="text-gray-700 text-sm">
                        Includes: Guest lists, timelines, budgets, checklists, notes, vendor contacts
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Uploaded Media</p>
                      <p className="text-gray-700 text-sm">Retention: Duration of active account</p>
                      <p className="text-gray-700 text-sm">
                        Includes: Photos, videos, documents, inspiration images
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">AI Conversation History</p>
                      <p className="text-gray-700 text-sm">Retention: Duration of active account</p>
                      <p className="text-gray-700 text-sm">
                        Includes: Chat logs, AI recommendations, conversation context
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.2 Subscription and Payment Data</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Payment Records</p>
                      <p className="text-gray-700 text-sm">Retention: 7 years after last transaction</p>
                      <p className="text-gray-700 text-sm">Reason: Tax and accounting compliance, fraud prevention</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Billing Information</p>
                      <p className="text-gray-700 text-sm">Retention: Until account deletion + 90 days</p>
                      <p className="text-gray-700 text-sm">Reason: Process refunds, resolve billing disputes</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Invoices and Receipts</p>
                      <p className="text-gray-700 text-sm">Retention: 7 years</p>
                      <p className="text-gray-700 text-sm">Reason: Legal and tax requirements</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">Subscription History</p>
                      <p className="text-gray-700 text-sm">Retention: 3 years after account deletion</p>
                      <p className="text-gray-700 text-sm">Reason: Business analytics, dispute resolution</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.3 Usage and Analytics Data</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Activity Logs</p>
                      <p className="text-gray-700 text-sm">Retention: 90 days</p>
                      <p className="text-gray-700 text-sm">Includes: Login times, feature usage, page views</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Analytics Data (Aggregated)</p>
                      <p className="text-gray-700 text-sm">Retention: Indefinitely (anonymized)</p>
                      <p className="text-gray-700 text-sm">Reason: Product improvement, trend analysis</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">Error and Crash Reports</p>
                      <p className="text-gray-700 text-sm">Retention: 1 year</p>
                      <p className="text-gray-700 text-sm">Reason: Bug fixing, platform stability</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.4 Communications and Support</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Support Tickets</p>
                      <p className="text-gray-700 text-sm">Retention: 3 years after resolution</p>
                      <p className="text-gray-700 text-sm">Reason: Quality assurance, trend analysis</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Email Communications</p>
                      <p className="text-gray-700 text-sm">Retention: 2 years</p>
                      <p className="text-gray-700 text-sm">Reason: Reference, dispute resolution</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">Feedback and Surveys</p>
                      <p className="text-gray-700 text-sm">Retention: 5 years (may be anonymized)</p>
                      <p className="text-gray-700 text-sm">Reason: Product development, service improvement</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.5 Legal and Compliance Data</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Legal Hold Data</p>
                      <p className="text-gray-700 text-sm">Retention: Duration of legal matter + 1 year</p>
                      <p className="text-gray-700 text-sm">Reason: Litigation, investigations, subpoenas</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Compliance Records</p>
                      <p className="text-gray-700 text-sm">Retention: As required by applicable law</p>
                      <p className="text-gray-700 text-sm">Reason: Regulatory compliance (GDPR, CCPA, etc.)</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">Terms Acceptance Records</p>
                      <p className="text-gray-700 text-sm">Retention: 7 years after account deletion</p>
                      <p className="text-gray-700 text-sm">Reason: Proof of agreement, dispute resolution</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.6 Marketing and Advertising Data</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Email Marketing Lists</p>
                      <p className="text-gray-700 text-sm">Retention: Until unsubscribe + 30 days</p>
                      <p className="text-gray-700 text-sm">Reason: Honor unsubscribe requests, prevent re-addition</p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Advertising Conversion Data</p>
                      <p className="text-gray-700 text-sm">Retention: 2 years</p>
                      <p className="text-gray-700 text-sm">Reason: Campaign effectiveness, ROI analysis</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">Cookie Data</p>
                      <p className="text-gray-700 text-sm">Retention: As specified in Cookie Policy</p>
                      <p className="text-gray-700 text-sm">Reason: See Cookie Policy for details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Account Deletion Procedures
            </h2>

            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-4">
              <h3 className="font-semibold text-rose-900 mb-3">Important: Account Deletion is Permanent</h3>
              <p className="text-rose-800 leading-relaxed">
                When you delete your account, most of your data is permanently deleted and cannot be recovered.
                Please export any important data before deletion.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.1 How to Delete Your Account</h3>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="font-semibold text-gray-900 mb-2">Option 1: Self-Service Deletion</p>
                  <div className="space-y-2">
                    <p className="text-gray-700">1. Log into your account</p>
                    <p className="text-gray-700">2. Go to Settings -> Account -> Delete Account</p>
                    <p className="text-gray-700">3. Confirm deletion by entering your password</p>
                    <p className="text-gray-700">4. Click "Permanently Delete Account"</p>
                    <p className="text-gray-700">5. You will receive a confirmation email</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Option 2: Email Request</p>
                  <div className="space-y-2">
                    <p className="text-gray-700">Email: privacy@bellaweddingai.com</p>
                    <p className="text-gray-700">Subject: Account Deletion Request</p>
                    <p className="text-gray-700">Include: Your account email and reason for deletion (optional)</p>
                    <p className="text-gray-700">Processing Time: 5-10 business days</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.2 What Gets Deleted Immediately</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Upon account deletion, the following data is deleted within 48 hours:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Your account profile and login credentials</p>
                  <p className="text-gray-700">* Wedding planning data (guest lists, timelines, budgets)</p>
                  <p className="text-gray-700">* Uploaded photos, videos, and documents</p>
                  <p className="text-gray-700">* AI conversation history</p>
                  <p className="text-gray-700">* Saved vendor favorites and notes</p>
                  <p className="text-gray-700">* Personal preferences and settings</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.3 What is Retained After Deletion</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Some data is retained for legal, security, or business purposes:
                </p>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-amber-900">Financial Records (7 years)</p>
                      <p className="text-amber-800 text-sm">
                        Payment history, invoices, tax records - required by law
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-amber-900">Support Communications (3 years)</p>
                      <p className="text-amber-800 text-sm">
                        Ticket history, email correspondence - for quality assurance
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-amber-900">Legal Hold Data (Duration of matter)</p>
                      <p className="text-amber-800 text-sm">
                        Data subject to legal proceedings, investigations, or disputes
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-amber-900">Aggregated Analytics (Indefinite)</p>
                      <p className="text-amber-800 text-sm">
                        Anonymized, non-identifiable usage statistics
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-amber-900">Security Logs (90 days)</p>
                      <p className="text-amber-800 text-sm">
                        Login attempts, security events - for fraud prevention
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.4 Grace Period (30 Days)</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  After you request account deletion, we provide a 30-day grace period:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Your account is deactivated but data is not yet deleted
                  </p>
                  <p className="text-gray-700">
                    * You cannot log in or access your account during this period
                  </p>
                  <p className="text-gray-700">
                    * You can cancel deletion by contacting support within 30 days
                  </p>
                  <p className="text-gray-700">
                    * After 30 days, deletion is permanent and cannot be reversed
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Data Export Before Deletion
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">RECOMMENDED: Export Your Data First</h3>
              <p className="text-blue-800 leading-relaxed">
                Before deleting your account, we strongly recommend exporting your wedding planning data.
                Once deletion is complete, we cannot recover your information.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">How to Export Your Data:</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">1. Log into your account</p>
                  <p className="text-gray-700">2. Go to Settings -> Privacy -> Download My Data</p>
                  <p className="text-gray-700">3. Select data categories to export</p>
                  <p className="text-gray-700">4. Choose format: CSV, JSON, or ZIP archive</p>
                  <p className="text-gray-700">5. Click "Request Data Export"</p>
                  <p className="text-gray-700">6. Receive download link via email (within 48 hours)</p>
                  <p className="text-gray-700">7. Download expires after 7 days</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">What You Can Export:</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">* Guest lists and contact information (CSV)</p>
                  <p className="text-gray-700">* Timeline and checklist data (CSV, PDF)</p>
                  <p className="text-gray-700">* Budget spreadsheets (CSV, Excel)</p>
                  <p className="text-gray-700">* Vendor information and notes (CSV)</p>
                  <p className="text-gray-700">* Uploaded photos and videos (ZIP)</p>
                  <p className="text-gray-700">* Account information and settings (JSON)</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Inactive Account Policy
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.1 Account Inactivity Definition</h3>
                <p className="text-gray-700 leading-relaxed">
                  An account is considered inactive if there has been no login activity for 24 consecutive months.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.2 Inactive Account Process</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">* After 18 months of inactivity: Warning email sent</p>
                  <p className="text-gray-700">* After 22 months of inactivity: Final warning email sent</p>
                  <p className="text-gray-700">* After 24 months of inactivity: Account scheduled for deletion</p>
                  <p className="text-gray-700">* 30-day notice period before final deletion</p>
                  <p className="text-gray-700">* Log in at any time to prevent deletion</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.3 Paid Subscription Exception</h3>
                <p className="text-gray-700 leading-relaxed">
                  Accounts with active paid subscriptions will not be deleted for inactivity, regardless of
                  login frequency. However, we recommend logging in periodically to ensure account security.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Backup and Disaster Recovery
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We maintain backup copies of your data for disaster recovery purposes:
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Backup Retention</h3>
                <p className="text-gray-700">
                  Backups are retained for 30 days and then permanently deleted. Deleted account data in backups
                  is purged within 30 days of account deletion.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Backup Security</h3>
                <p className="text-gray-700">
                  Backups are encrypted, access-controlled, and stored in secure facilities separate from
                  production systems.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Your Data Rights
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your data:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">* Right to Access: Request a copy of your personal data</p>
              <p className="text-gray-700">* Right to Rectification: Correct inaccurate or incomplete data</p>
              <p className="text-gray-700">* Right to Deletion: Request deletion of your data</p>
              <p className="text-gray-700">* Right to Restriction: Limit how we process your data</p>
              <p className="text-gray-700">* Right to Portability: Receive your data in a portable format</p>
              <p className="text-gray-700">* Right to Object: Object to certain types of processing</p>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, contact: privacy@bellaweddingai.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Data Retention Policy to reflect changes in our practices or legal requirements.
              Updates will be posted on this page with a revised "Effective Date." Material changes will be
              communicated via email. Continued use of our services after changes constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Contact Information
            </h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                For questions about data retention or to request data deletion:
              </p>
              <p className="text-gray-700 mb-2">Email: privacy@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: Data Retention Inquiry</p>
              <p className="text-gray-700">Response Time: 3-5 business days</p>
            </div>
          </section>

        </div>
      </main>

      <footer className="bg-white border-t border-champagne-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>2025 Bella Wedding AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
