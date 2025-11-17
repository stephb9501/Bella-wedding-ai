'use client';

import Link from 'next/link';
import { Beaker, ArrowLeft } from 'lucide-react';

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
            <Beaker className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Beta Tester Agreement
              </h1>
              <p className="text-sm text-gray-600 mt-1">Version 1.0 - Effective Date: January 17, 2025</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">

          <section className="bg-purple-50 border-l-4 border-purple-500 p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-3">
              Welcome to the Bella Wedding AI Beta Program
            </h2>
            <p className="text-purple-800 leading-relaxed">
              Thank you for participating in the beta testing of Bella Wedding AI. As a beta tester, you will
              have early access to new features and functionality. This agreement explains the terms, risks,
              and expectations for beta participation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. Beta Program Overview
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">1.1 Purpose</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Beta Program allows selected users to test pre-release versions of Bella Wedding AI
                  features, provide feedback, and help identify bugs before public launch. Your participation
                  helps us improve the platform for all users.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">1.2 Beta Status</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Beta features are provided free of charge during the testing period. Beta participation does
                  not guarantee:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Continued access to beta features after testing concludes
                  </p>
                  <p className="text-gray-700">
                    * That beta features will be released to the public
                  </p>
                  <p className="text-gray-700">
                    * Free access to features after they leave beta
                  </p>
                  <p className="text-gray-700">
                    * Any specific timeline for feature releases
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">1.3 Voluntary Participation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Beta participation is completely voluntary. You may withdraw from the Beta Program at any
                  time by contacting beta@bellaweddingai.com. We may also remove participants at our discretion.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Beta Risks and Limitations
            </h2>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-amber-900 mb-3">WARNING: BETA SOFTWARE RISKS</h3>
              <p className="text-amber-800 leading-relaxed">
                Beta features are experimental, untested, and may contain serious bugs, errors, or defects.
                Use beta features at your own risk.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Incomplete Functionality</h3>
                <p className="text-gray-700">
                  Beta features may be incomplete, partially functional, or subject to significant changes
                  before release. Features may be modified or removed without notice.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Bugs and Errors</h3>
                <p className="text-gray-700">
                  Beta software may contain bugs that cause crashes, data loss, incorrect results, or
                  unexpected behavior. We cannot guarantee stability or reliability.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Data Loss Risk</h3>
                <p className="text-gray-700">
                  Beta features may result in data corruption, loss, or deletion. Always maintain backups
                  of important wedding planning information outside of beta features.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Performance Issues</h3>
                <p className="text-gray-700">
                  Beta features may run slowly, consume excessive resources, or cause platform instability.
                  Response times and availability are not guaranteed.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Security Vulnerabilities</h3>
                <p className="text-gray-700">
                  Beta features may have undiscovered security vulnerabilities. Do not use beta features
                  for sensitive information until they are publicly released.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] No Warranty</h3>
                <p className="text-gray-700">
                  Beta features are provided "AS-IS" without warranty of any kind. We make no guarantees
                  about functionality, accuracy, or fitness for any purpose.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Data Backup Requirements
            </h2>

            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-4">
              <h3 className="font-semibold text-rose-900 mb-3">CRITICAL: BACKUP YOUR DATA</h3>
              <p className="text-rose-800 leading-relaxed font-semibold">
                Before using ANY beta features, you MUST create complete backups of all your wedding planning
                data, including guest lists, timelines, budgets, vendor information, and uploaded media.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Required Backups</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You are solely responsible for maintaining backups of:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Guest lists and contact information</p>
                  <p className="text-gray-700">* Wedding timelines and checklists</p>
                  <p className="text-gray-700">* Budget spreadsheets and financial data</p>
                  <p className="text-gray-700">* Vendor contracts and contact details</p>
                  <p className="text-gray-700">* Photos, videos, and uploaded media</p>
                  <p className="text-gray-700">* Seating charts and floor plans</p>
                  <p className="text-gray-700">* Notes, ideas, and custom content</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Export Recommendations</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Before using beta features, export your data in multiple formats:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Download all files and media to your computer</p>
                  <p className="text-gray-700">* Export data to CSV or Excel format when available</p>
                  <p className="text-gray-700">* Take screenshots of important information</p>
                  <p className="text-gray-700">* Save copies in cloud storage (Google Drive, Dropbox, etc.)</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">3.3 No Recovery Guarantee</h3>
                <p className="text-gray-700 leading-relaxed">
                  If beta features cause data loss or corruption, we may not be able to recover your data.
                  Regular backups during beta testing are essential and entirely your responsibility.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Beta Tester Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As a beta tester, you agree to:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">1.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Provide Feedback</h3>
                  <p className="text-gray-700">
                    Report bugs, errors, and usability issues through our feedback system or email
                    (beta@bellaweddingai.com). Include detailed descriptions and screenshots when possible.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">2.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Test Responsibly</h3>
                  <p className="text-gray-700">
                    Use beta features in a controlled manner. Do not rely solely on beta features for
                    critical wedding planning tasks without backups.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">3.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Maintain Confidentiality</h3>
                  <p className="text-gray-700">
                    Do not publicly disclose, discuss, or share beta features without permission. See
                    Section 6 for detailed confidentiality requirements.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">4.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Follow Guidelines</h3>
                  <p className="text-gray-700">
                    Comply with all testing guidelines, instructions, and policies provided by Bella Wedding AI.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">5.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Report Security Issues</h3>
                  <p className="text-gray-700">
                    Immediately report any security vulnerabilities or privacy concerns to
                    security@bellaweddingai.com.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">6.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Use Legally</h3>
                  <p className="text-gray-700">
                    Do not attempt to reverse engineer, hack, or exploit beta features. All standard Terms
                    of Service apply to beta participation.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Free Beta Access
            </h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">Beta Testing is Free</h3>
              <p className="text-green-800 leading-relaxed mb-4">
                Beta features are provided at no charge during the testing period. However:
              </p>

              <div className="space-y-2 mb-4">
                <p className="text-green-800">
                  * Free access is limited to the beta testing period only
                </p>
                <p className="text-green-800">
                  * Features may require paid subscriptions after public release
                </p>
                <p className="text-green-800">
                  * Beta testers receive no discount guarantee for future pricing
                </p>
                <p className="text-green-800">
                  * We may offer beta testers early-bird pricing (not guaranteed)
                </p>
              </div>

              <div className="bg-white rounded p-4">
                <p className="text-gray-700 font-semibold mb-2">No Payment Required:</p>
                <p className="text-gray-700">
                  We will NEVER charge you for beta access. If any beta feature requests payment, do not
                  proceed and contact support@bellaweddingai.com immediately.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Confidentiality and Non-Disclosure
            </h2>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-amber-900 mb-3">Confidential Information</h3>
              <p className="text-amber-800 leading-relaxed">
                All beta features, functionality, designs, performance data, and related information are
                confidential and proprietary to Bella Wedding AI.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">6.1 What You Cannot Share</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">* Screenshots or videos of beta features</p>
                  <p className="text-gray-700">* Descriptions of beta functionality</p>
                  <p className="text-gray-700">* Performance metrics or benchmarks</p>
                  <p className="text-gray-700">* Beta roadmaps or release timelines</p>
                  <p className="text-gray-700">* Bug reports or technical issues</p>
                  <p className="text-gray-700">* Any information marked as confidential</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">6.2 Permitted Disclosures</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You may only disclose beta information:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* With explicit written permission from Bella Wedding AI</p>
                  <p className="text-gray-700">* As required by law or court order (after notifying us)</p>
                  <p className="text-gray-700">* Through official feedback channels provided by us</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">6.3 Duration</h3>
                <p className="text-gray-700 leading-relaxed">
                  Confidentiality obligations continue until features are publicly released or we provide
                  written notice that information is no longer confidential.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All beta features and related intellectual property remain the exclusive property of Bella
              Wedding AI:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * You receive no ownership rights in beta features
              </p>
              <p className="text-gray-700">
                * Feedback you provide becomes our property and may be used without compensation
              </p>
              <p className="text-gray-700">
                * You grant us a royalty-free license to use your suggestions and ideas
              </p>
              <p className="text-gray-700">
                * We may incorporate your feedback into products without attribution
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Termination of Beta Access
            </h2>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">8.1 Termination by You</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may withdraw from the Beta Program at any time by emailing beta@bellaweddingai.com.
                  Your confidentiality obligations continue after withdrawal.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">8.2 Termination by Us</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We may terminate your beta access at any time for any reason, including:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Violation of this agreement or Terms of Service</p>
                  <p className="text-gray-700">* Breach of confidentiality</p>
                  <p className="text-gray-700">* Conclusion of the beta testing period</p>
                  <p className="text-gray-700">* Abandonment of the beta feature</p>
                  <p className="text-gray-700">* Lack of participation or feedback</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">8.3 Effect of Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Upon termination, you must immediately cease using beta features. Data created using beta
                  features may be deleted or migrated to standard features at our discretion.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Limitation of Liability
            </h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>

              <div className="space-y-2">
                <p className="text-gray-700">
                  * Beta features are provided "AS-IS" without warranties of any kind
                </p>
                <p className="text-gray-700">
                  * We are NOT liable for data loss, corruption, or deletion caused by beta features
                </p>
                <p className="text-gray-700">
                  * We are NOT responsible for missed deadlines or wedding planning issues
                </p>
                <p className="text-gray-700">
                  * We are NOT liable for any damages resulting from beta participation
                </p>
                <p className="text-gray-700">
                  * Your sole remedy for issues is to stop using beta features
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              10. Contact Information
            </h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">For beta-related questions or to report issues:</p>
              <p className="text-gray-700 mb-2">Email: beta@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: Beta Program - [Your Issue]</p>
              <p className="text-gray-700">Include your account email and detailed description</p>
            </div>
          </section>

          <section className="bg-purple-50 border-l-4 border-purple-500 p-6">
            <p className="text-sm text-gray-700 font-semibold mb-3">
              ACKNOWLEDGMENT:
            </p>
            <p className="text-sm text-gray-700">
              By participating in the Beta Program, you acknowledge that you have read, understood, and agree
              to this Beta Tester Agreement. You understand the risks of using beta software and accept full
              responsibility for backing up your data and using beta features at your own risk.
            </p>
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
