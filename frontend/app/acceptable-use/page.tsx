'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Acceptable Use Policy
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
              This Acceptable Use Policy ("Policy") governs your use of Bella Wedding AI's services, platform,
              and features. By accessing or using our platform, you agree to comply with this Policy. Violation
              of this Policy may result in immediate suspension or termination of your account without notice
              or refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Prohibited Activities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.1 Illegal Activities</h3>
                <p className="text-gray-700">
                  - Using the platform for any unlawful purpose or in violation of any applicable laws
                </p>
                <p className="text-gray-700">
                  - Uploading, posting, or transmitting content that is illegal, harmful, or offensive
                </p>
                <p className="text-gray-700">
                  - Infringing on intellectual property rights of others
                </p>
                <p className="text-gray-700">
                  - Engaging in fraud, identity theft, or misrepresentation
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.2 Harassment and Abuse</h3>
                <p className="text-gray-700">
                  - Harassing, threatening, or intimidating other users or vendors
                </p>
                <p className="text-gray-700">
                  - Posting discriminatory, hateful, or abusive content
                </p>
                <p className="text-gray-700">
                  - Stalking or otherwise violating the privacy of others
                </p>
                <p className="text-gray-700">
                  - Impersonating any person or entity
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.3 Security Violations</h3>
                <p className="text-gray-700">
                  - Attempting to gain unauthorized access to our systems or user accounts
                </p>
                <p className="text-gray-700">
                  - Distributing viruses, malware, or other harmful code
                </p>
                <p className="text-gray-700">
                  - Interfering with or disrupting the platform's functionality
                </p>
                <p className="text-gray-700">
                  - Bypassing or attempting to bypass security measures
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.4 Spam and Misuse</h3>
                <p className="text-gray-700">
                  - Sending unsolicited messages or advertisements (spam)
                </p>
                <p className="text-gray-700">
                  - Creating multiple accounts to abuse features or circumvent restrictions
                </p>
                <p className="text-gray-700">
                  - Using automated tools (bots, scrapers) without permission
                </p>
                <p className="text-gray-700">
                  - Manipulating or gaming our AI systems
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.5 Commercial Misuse</h3>
                <p className="text-gray-700">
                  - Using the platform for unauthorized commercial purposes
                </p>
                <p className="text-gray-700">
                  - Reselling or redistributing our services without permission
                </p>
                <p className="text-gray-700">
                  - Posting false or misleading vendor information
                </p>
                <p className="text-gray-700">
                  - Engaging in unfair competitive practices
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.6 Data Mining and Extraction</h3>
                <p className="text-gray-700">
                  - Scraping, harvesting, or extracting data from the platform
                </p>
                <p className="text-gray-700">
                  - Using data mining tools or automated access methods
                </p>
                <p className="text-gray-700">
                  - Collecting user information without consent
                </p>
                <p className="text-gray-700">
                  - Reverse engineering our AI models or algorithms
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.7 Content Violations</h3>
                <p className="text-gray-700">
                  - Uploading pornographic, violent, or otherwise inappropriate content
                </p>
                <p className="text-gray-700">
                  - Posting content that violates privacy rights or publicity rights
                </p>
                <p className="text-gray-700">
                  - Sharing confidential information without authorization
                </p>
                <p className="text-gray-700">
                  - Publishing false, misleading, or defamatory information
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.8 System Abuse</h3>
                <p className="text-gray-700">
                  - Overloading our servers or causing excessive resource consumption
                </p>
                <p className="text-gray-700">
                  - Attempting to access areas of the platform not intended for users
                </p>
                <p className="text-gray-700">
                  - Interfering with other users' ability to use the platform
                </p>
                <p className="text-gray-700">
                  - Using the platform in a manner that degrades performance for others
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Reporting Violations
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you become aware of any violation of this Policy, please report it immediately to our team.
            </p>

            <div className="bg-champagne-50 border border-champagne-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">How to Report:</h3>
              <p className="text-gray-700 mb-2">
                * Email: support@bellaweddingai.com
              </p>
              <p className="text-gray-700 mb-2">
                * Subject Line: "AUP Violation Report"
              </p>
              <p className="text-gray-700 mb-2">
                * Include: Detailed description, screenshots, user information, date/time
              </p>
              <p className="text-gray-700">
                * Response Time: We will investigate within 48 hours
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Enforcement Actions
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to take the following actions in response to violations:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * Warning: First-time minor violations may receive a warning
              </p>
              <p className="text-gray-700">
                * Temporary Suspension: Account access suspended for a specified period
              </p>
              <p className="text-gray-700">
                * Permanent Termination: Account permanently closed without refund
              </p>
              <p className="text-gray-700">
                * Content Removal: Offending content removed immediately
              </p>
              <p className="text-gray-700">
                * Legal Action: Severe violations may result in legal proceedings
              </p>
              <p className="text-gray-700">
                * Law Enforcement Reporting: Illegal activities reported to authorities
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. User Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As a user of Bella Wedding AI, you are responsible for:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * Maintaining the security of your account credentials
              </p>
              <p className="text-gray-700">
                * All activities that occur under your account
              </p>
              <p className="text-gray-700">
                * Ensuring your use complies with all applicable laws
              </p>
              <p className="text-gray-700">
                * Respecting the rights and privacy of other users
              </p>
              <p className="text-gray-700">
                * Reporting security vulnerabilities or policy violations
              </p>
              <p className="text-gray-700">
                * Keeping your contact information current
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Vendor-Specific Rules
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Vendors listed in our directory must also comply with additional requirements:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * Provide accurate and up-to-date business information
              </p>
              <p className="text-gray-700">
                * Maintain proper licensing and insurance as required by law
              </p>
              <p className="text-gray-700">
                * Respond professionally to user inquiries
              </p>
              <p className="text-gray-700">
                * Honor quoted prices and service descriptions
              </p>
              <p className="text-gray-700">
                * Disclose any conflicts of interest
              </p>
              <p className="text-gray-700">
                * Not solicit reviews or manipulate ratings
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Monitoring and Investigation
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to monitor user activity, investigate suspected violations, and access
              user content when necessary to enforce this Policy or comply with legal obligations. We may
              use automated tools and manual review processes to detect violations. Users consent to such
              monitoring by using our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Policy from time to time. Changes will be effective immediately upon posting
              to our website. Your continued use of the platform after changes are posted constitutes acceptance
              of the updated Policy. We will notify users of material changes via email or platform notification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about this Acceptable Use Policy, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">Email: legal@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: Acceptable Use Policy Inquiry</p>
              <p className="text-gray-700">Response Time: 3-5 business days</p>
            </div>
          </section>

          <section className="bg-rose-50 border border-rose-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 italic">
              WARNING: Violation of this Acceptable Use Policy may result in immediate account termination
              and legal action. By using Bella Wedding AI, you acknowledge that you have read, understood,
              and agree to be bound by this Policy.
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
