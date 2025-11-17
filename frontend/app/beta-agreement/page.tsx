'use client';

import Link from 'next/link';
import { TestTube, ArrowLeft, AlertTriangle, Bug } from 'lucide-react';

export default function BetaAgreementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Beta Tester Agreement
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
              Thank you for participating as a beta tester ("Early Tester") for Bella Wedding AI! This Beta Tester Agreement
              explains the terms of your participation. This agreement is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
            </p>
          </section>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 mb-2">IMPORTANT: Beta Software Disclaimer</p>
                <p className="text-gray-700">
                  Bella Wedding AI is currently in <strong>beta (early testing)</strong>. The platform may contain bugs,
                  errors, or incomplete features. <strong>Use at your own risk.</strong>
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What is Beta Testing?</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                Beta testing means you are using a <strong>pre-release version</strong> of Bella Wedding AI to help us
                identify bugs, gather feedback, and improve the platform before the official public launch.
              </p>
              <p className="text-gray-700">
                <strong>As a beta tester, you get:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Free access to Bella Wedding AI during the beta period</li>
                <li>Early access to new features</li>
                <li>Opportunity to influence product development with your feedback</li>
                <li>Special "Early Tester" status and potential discounts when we launch publicly</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bug className="w-6 h-6 text-red-600" />
              2. Beta Software Risks & Limitations
            </h2>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">  The Platform May Have Bugs & Errors</h3>
                <p className="text-gray-700">
                  Beta software is <strong>NOT fully tested</strong> and may contain serious bugs, glitches, or data loss issues.
                  You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Features may break or not work as expected</li>
                  <li>Data (wedding plans, photos, guest lists) may be lost or corrupted</li>
                  <li>The platform may crash, become unavailable, or be slow</li>
                  <li>Changes may be made without notice</li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">  Backup Your Important Data</h3>
                <p className="text-gray-700">
                  <strong>CRITICAL:</strong> Do NOT rely solely on Bella Wedding AI for storing important wedding information
                  during beta. Always maintain backups of:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Guest lists (export to Excel or keep a separate copy)</li>
                  <li>Wedding photos (upload to Google Photos, iCloud, or external hard drive)</li>
                  <li>Vendor contact information</li>
                  <li>Checklists and timelines</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2">  No Guarantee of Service Continuity</h3>
                <p className="text-gray-700">
                  We may shut down, restart, or significantly change the platform at any time during beta without notice.
                  We do NOT guarantee:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Uptime or availability</li>
                  <li>Data persistence (we may wipe data during major updates)</li>
                  <li>Feature stability (features may be added, changed, or removed)</li>
                  <li>Migration to the final product (though we will try to migrate data)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Your Responsibilities as a Beta Tester</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
              <p className="font-bold text-gray-900 mb-3">As a beta tester, you agree to:</p>
              <ul className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Provide Feedback:</strong> Report bugs, suggest improvements, and share your honest feedback via
                our feedback form or email (<a href="mailto:beta@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                beta@bellaweddingai.com</a>)</li>

                <li><strong>Be Patient:</strong> Understand that bugs and issues are expected in beta software and will be
                fixed over time</li>

                <li><strong>Communicate Issues:</strong> If you encounter a bug or data loss, report it immediately so we
                can fix it</li>

                <li><strong>Use Responsibly:</strong> Do NOT abuse the platform, spam, or intentionally break things</li>

                <li><strong>Keep Backups:</strong> Maintain your own backups of important data</li>

                <li><strong>Follow Terms:</strong> Abide by our{' '}
                  <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/acceptable-use" className="text-champagne-600 hover:text-champagne-700 underline">
                    Acceptable Use Policy
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Confidentiality (NDA)</h2>
            <div className="bg-purple-50 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                <strong>Relaxed Confidentiality:</strong> We do NOT require strict confidentiality during beta. You are
                <strong> welcome to share</strong> Bella Wedding AI with friends, post about it on social media, and tell
                others about the platform.
              </p>
              <p className="text-gray-700">
                <strong>However, please do NOT:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Share screenshots or details of serious security vulnerabilities publicly (report them privately to us first)</li>
                <li>Reverse engineer, decompile, or attempt to access source code</li>
                <li>Share proprietary business information if we explicitly mark it as confidential</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Pricing & Transition to Paid Service</h2>
            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">Beta is Free</h3>
              <p className="text-gray-700">
                During the beta period, Bella Wedding AI is <strong>100% free</strong> for all beta testers. You will NOT be
                charged for using the platform during beta.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">When We Launch Publicly:</h3>
              <p className="text-gray-700 mb-2">
                When we transition from beta to a paid product, you will receive:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>30 days' notice</strong> before we start charging</li>
                <li><strong>Special early tester discount</strong> (lifetime or first-year discount)</li>
                <li><strong>Option to cancel</strong> if you don't want to pay (with 30 days to export your data)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>You will NOT be charged automatically.</strong> We will email you first and give you the option to
                opt in to a paid plan or export your data and leave.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimer of Warranties & Liability</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-4">
              <p className="font-bold text-gray-900 mb-2 uppercase">Beta Software is Provided "AS IS"</p>
              <p className="text-gray-700">
                Bella Wedding AI beta is provided <strong>"AS IS"</strong> without warranties of any kind. We make NO
                guarantees about reliability, accuracy, uptime, data preservation, or fitness for any particular purpose.
              </p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
              <p className="font-bold text-gray-900 mb-2 uppercase">Limitation of Liability</p>
              <p className="text-gray-700">
                <strong>We are NOT liable</strong> for any damages arising from beta testing, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Data loss or corruption</li>
                <li>Bugs, errors, or platform outages</li>
                <li>Missed deadlines or wedding planning errors due to platform issues</li>
                <li>Any other damages, losses, or harm</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>Beta testing is voluntary and at your own risk.</strong> See our{' '}
                <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>
                {' '}for full disclaimer.
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Severability</h2>
            <p className="text-gray-700">
              If any provision of this Beta Tester Agreement is found to be unlawful, void, or unenforceable, that provision
              shall be severed and shall not affect the remaining provisions. This agreement is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
            </p>
          </section>

          <section className="bg-champagne-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Thank You for Beta Testing!</h2>
            <p className="text-gray-700">
              We appreciate your participation and feedback. If you have questions or encounter issues, please contact us at{' '}
              <a href="mailto:beta@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                beta@bellaweddingai.com
              </a>.
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
