'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Database, Lock, Eye, UserCheck, Globe, Cookie, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Privacy Policy
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Version 1.0 • Effective Date: January 17, 2025
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">

          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Bella Wedding AI ("we," "us," "our"). We are committed to protecting your personal information and your right to privacy.
              This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using our platform, you agree to the collection and use of information in accordance with this Privacy Policy.
              This policy should be read together with our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Table of Contents */}
          <section className="bg-champagne-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-champagne-600" />
              Table of Contents
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-champagne-700">
              <li><a href="#section-1" className="hover:underline">Information We Collect</a></li>
              <li><a href="#section-2" className="hover:underline">How We Use Your Information</a></li>
              <li><a href="#section-3" className="hover:underline">How We Share Your Information</a></li>
              <li><a href="#section-4" className="hover:underline">Your Privacy Rights</a></li>
              <li><a href="#section-5" className="hover:underline">Data Retention</a></li>
              <li><a href="#section-6" className="hover:underline">Data Security</a></li>
              <li><a href="#section-7" className="hover:underline">Cookies & Tracking Technologies</a></li>
              <li><a href="#section-8" className="hover:underline">Children's Privacy</a></li>
              <li><a href="#section-9" className="hover:underline">International Data Transfers</a></li>
              <li><a href="#section-10" className="hover:underline">Changes to This Policy</a></li>
              <li><a href="#section-11" className="hover:underline">Contact Us</a></li>
            </ol>
          </section>

          {/* Section 1: Information We Collect */}
          <section id="section-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-champagne-600" />
              1. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Information You Provide to Us</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Account Information:</strong> Name, email address, password, wedding date, partner information</li>
              <li><strong>Profile Information:</strong> Wedding details, venue location, budget, style preferences, photos</li>
              <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through Stripe)</li>
              <li><strong>Communication Data:</strong> Messages to vendors, chat history with AI assistant, support requests</li>
              <li><strong>User-Generated Content:</strong> Photos, videos, documents, notes, checklists, seating charts</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns, search queries</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address (not precise GPS)</li>
              <li><strong>Cookies & Tracking:</strong> See our <Link href="/cookies" className="text-champagne-600 hover:text-champagne-700 underline">Cookie Policy</Link></li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Information from Third Parties</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Vendors:</strong> Information shared by vendors you connect with (availability, pricing, responses)</li>
              <li><strong>Payment Processors:</strong> Transaction confirmation from Stripe (we don't store full card numbers)</li>
              <li><strong>Analytics Providers:</strong> Aggregated usage statistics from Google Analytics, Mixpanel</li>
            </ul>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section id="section-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-champagne-600" />
              2. How We Use Your Information
            </h2>

            <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>

            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">To Provide Our Services</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Create and manage your wedding planning account</li>
                  <li>Generate AI-powered recommendations and suggestions</li>
                  <li>Connect you with vendors in our directory</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Provide customer support</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">To Improve Our Platform</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Analyze usage patterns to enhance features</li>
                  <li>Train and improve our AI models (using anonymized data)</li>
                  <li>Fix bugs and technical issues</li>
                  <li>Conduct research and development</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">To Communicate with You</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Send transactional emails (account confirmations, password resets, payment receipts)</li>
                  <li>Notify you of vendor responses and booking updates</li>
                  <li>Send marketing emails (only if you opted in, you can unsubscribe anytime)</li>
                  <li>Respond to your inquiries and support requests</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">For Legal and Security Purposes</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Comply with legal obligations and law enforcement requests</li>
                  <li>Enforce our Terms of Service and other policies</li>
                  <li>Detect and prevent fraud, abuse, and security incidents</li>
                  <li>Protect the rights and safety of our users and the public</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: How We Share Your Information */}
          <section id="section-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-champagne-600" />
              3. How We Share Your Information
            </h2>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded">
              <p className="font-bold text-gray-900 text-lg mb-2">
                WE DO NOT SELL YOUR PERSONAL DATA
              </p>
              <p className="text-gray-700">
                We have never sold user data and we never will. Your privacy is not for sale.
              </p>
            </div>

            <p className="text-gray-700 mb-4">We may share your information in the following limited circumstances:</p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">With Vendors You Contact</h3>
                <p className="text-gray-700">
                  When you send an inquiry to a vendor, we share your name, contact information, wedding date,
                  venue location, and your message with that specific vendor. This is necessary to facilitate
                  the connection you requested.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">With Service Providers</h3>
                <p className="text-gray-700">
                  We use trusted third-party service providers to help us operate our platform:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                  <li><strong>OpenAI:</strong> AI assistant functionality (data sent for processing, not training)</li>
                  <li><strong>Resend:</strong> Transactional email delivery</li>
                  <li><strong>Google Analytics / Mixpanel:</strong> Anonymized usage analytics</li>
                  <li><strong>Cloudflare / AWS:</strong> Hosting and content delivery</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  These providers are contractually obligated to protect your data and only use it for the
                  services they provide to us.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">For Legal Reasons</h3>
                <p className="text-gray-700">
                  We may disclose your information if required by law, court order, or government request,
                  or if we believe disclosure is necessary to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>Comply with legal obligations</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Prevent fraud or security threats</li>
                  <li>Enforce our Terms of Service</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Business Transfers</h3>
                <p className="text-gray-700">
                  If we are acquired, merge with another company, or sell our assets, your information may be
                  transferred to the new owner. We will notify you via email or prominent notice on our platform
                  before your information is transferred and becomes subject to a different privacy policy.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Aggregated / Anonymized Data</h3>
                <p className="text-gray-700">
                  We may share aggregated, anonymized data that cannot identify you personally (e.g., "80% of
                  users prefer outdoor venues") for research, marketing, or partnership purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Your Privacy Rights */}
          <section id="section-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-champagne-600" />
              4. Your Privacy Rights
            </h2>

            <p className="text-gray-700 mb-4">
              Depending on your location, you have various rights regarding your personal information:
            </p>

            {/* California Rights */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                California Residents (CCPA/CPRA Rights)
              </h3>
              <p className="text-gray-700 mb-3">
                If you are a California resident, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Know:</strong> Request a copy of the personal information we collected about you in the past 12 months</li>
                <li><strong>Delete:</strong> Request deletion of your personal information (subject to legal exceptions)</li>
                <li><strong>Correct:</strong> Request correction of inaccurate personal information</li>
                <li><strong>Opt-Out:</strong> Opt out of the sale/sharing of personal data (we don't sell data, but you have this right)</li>
                <li><strong>Limit:</strong> Limit the use of your sensitive personal information</li>
                <li><strong>Non-Discrimination:</strong> You will not receive discriminatory treatment for exercising your rights</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, email us at <a href="mailto:privacy@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">privacy@bellaweddingai.com</a>
                {' '}with subject line "CCPA Request". We will respond within 45 days.
              </p>
            </div>

            {/* EU/GDPR Rights */}
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                EU Residents (GDPR Rights)
              </h3>
              <p className="text-gray-700 mb-3">
                If you are in the European Union, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure ("Right to be Forgotten"):</strong> Request deletion of your data</li>
                <li><strong>Restriction:</strong> Request limitation of processing in certain circumstances</li>
                <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Object:</strong> Object to processing based on legitimate interests or for direct marketing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time (where processing is based on consent)</li>
                <li><strong>Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, email us at <a href="mailto:privacy@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">privacy@bellaweddingai.com</a>
                {' '}with subject line "GDPR Request". We will respond within 30 days.
              </p>
            </div>

            {/* General Rights */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                All Users
              </h3>
              <p className="text-gray-700 mb-3">
                Regardless of location, you can always:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Update Account Information:</strong> Edit your profile, wedding details, and preferences in your account settings</li>
                <li><strong>Delete Your Account:</strong> Permanently delete your account and associated data (some records may be retained for legal compliance)</li>
                <li><strong>Unsubscribe from Marketing:</strong> Click "Unsubscribe" in any marketing email or adjust email preferences in settings</li>
                <li><strong>Manage Cookie Preferences:</strong> Adjust cookie settings in your browser (see our <Link href="/cookies" className="text-champagne-600 hover:text-champagne-700 underline">Cookie Policy</Link>)</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Data Retention */}
          <section id="section-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Data Retention
            </h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information only as long as necessary for the purposes described in this Privacy Policy,
              unless a longer retention period is required by law. See our{' '}
              <Link href="/data-retention" className="text-champagne-600 hover:text-champagne-700 underline">
                Data Retention & Deletion Policy
              </Link>{' '}
              for detailed timelines.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">General Retention Periods:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Active Accounts:</strong> Retained while account is active and for 3 years after last login</li>
                <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days; some retained for legal compliance</li>
                <li><strong>Payment Records:</strong> Retained for 7 years (tax and accounting requirements)</li>
                <li><strong>Consent Logs:</strong> Retained indefinitely (legal compliance proof)</li>
                <li><strong>Support Tickets:</strong> Retained for 3 years</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Data Security */}
          <section id="section-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-champagne-600" />
              6. Data Security
            </h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Technical Safeguards</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>SSL/TLS encryption for data in transit</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>Secure password hashing (bcrypt)</li>
                  <li>Regular security audits and penetration testing</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Organizational Safeguards</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Access controls and role-based permissions</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response and breach notification procedures</li>
                  <li>Vendor security assessments</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
              <p className="text-gray-700">
                <strong>Note:</strong> No security system is perfect. While we strive to protect your information,
                we cannot guarantee absolute security. Please use a strong, unique password and enable two-factor
                authentication (when available) to enhance your account security.
              </p>
            </div>
          </section>

          {/* Section 7: Cookies & Tracking */}
          <section id="section-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-champagne-600" />
              7. Cookies & Tracking Technologies
            </h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to improve your experience on our platform.
              For detailed information about what cookies we use and how to manage them, please see our{' '}
              <Link href="/cookies" className="text-champagne-600 hover:text-champagne-700 underline">
                Cookie Policy
              </Link>.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Types of Cookies We Use:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Essential Cookies:</strong> Required for login, security, and core functionality (cannot be disabled)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform (Google Analytics, Mixpanel)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Advertising Cookies:</strong> (If applicable) Track ad performance and retargeting</li>
              </ul>
            </div>
          </section>

          {/* Section 8: Children's Privacy */}
          <section id="section-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Children's Privacy
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
              <p className="font-bold text-gray-900 mb-2">
                Our Service is NOT Intended for Children Under 18
              </p>
              <p className="text-gray-700 mb-2">
                Bella Wedding AI is designed for adults planning weddings. We do not knowingly collect personal
                information from anyone under 18 years of age. By using our platform, you represent that you are
                at least 18 years old.
              </p>
              <p className="text-gray-700">
                If we learn that we have collected personal information from a child under 18, we will delete that
                information immediately. If you believe we may have information from a child under 18, please contact
                us at <a href="mailto:privacy@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">privacy@bellaweddingai.com</a>.
              </p>
            </div>
          </section>

          {/* Section 9: International Data Transfers */}
          <section id="section-9">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-gray-700 mb-4">
              Bella Wedding AI is based in the United States. If you are accessing our platform from outside the U.S.,
              your information will be transferred to, stored, and processed in the United States.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">For EU Users:</h3>
              <p className="text-gray-700">
                The U.S. may not have the same data protection laws as your country. However, we take steps to ensure
                your data is protected through:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Data Processing Agreements with all service providers</li>
                <li>Compliance with GDPR requirements for international transfers</li>
              </ul>
            </div>
            <p className="text-gray-700">
              By using our platform, you consent to the transfer of your information to the United States and other
              countries where our service providers operate.
            </p>
          </section>

          {/* Section 10: Changes to This Policy */}
          <section id="section-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
              legal requirements, or other factors.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="font-bold text-gray-900 mb-2">How We Notify You of Changes:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Material Changes:</strong> We will email you at least 30 days before changes take effect
                and may require you to re-consent to the updated policy</li>
                <li><strong>Minor Changes:</strong> We will update the "Effective Date" at the top of this page and
                post a notice on our platform</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Your continued use of the platform after changes take effect means you accept the updated Privacy Policy.
                If you do not agree, you must stop using the platform and delete your account.
              </p>
            </div>
          </section>

          {/* Section 11: Contact Us */}
          <section id="section-11">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
              please contact us:
            </p>
            <div className="bg-champagne-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Bella Wedding AI - Privacy Team</h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                    privacy@bellaweddingai.com
                  </a>
                </p>
                <p>
                  <strong>Support Email:</strong>{' '}
                  <a href="mailto:support@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                    support@bellaweddingai.com
                  </a>
                </p>
                <p>
                  <strong>Mailing Address:</strong><br />
                  Bella Wedding AI<br />
                  Attn: Privacy Officer<br />
                  [Your Business Address]<br />
                  [City, State, ZIP]
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-champagne-200">
                <p className="text-sm text-gray-600">
                  <strong>Response Time:</strong> We will respond to privacy requests within 30 days (45 days for California residents).
                  For urgent security concerns, please include "URGENT" in your subject line.
                </p>
              </div>
            </div>
          </section>

          {/* Severability Clause */}
          <section className="bg-gray-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Severability
            </h2>
            <p className="text-gray-700">
              If any provision of this Privacy Policy is found to be unlawful, void, or unenforceable, that provision
              shall be severed from this policy and shall not affect the validity and enforceability of the remaining
              provisions. This Privacy Policy is part of and incorporated into our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Back to Home Link */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-champagne-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2025 Bella Wedding AI. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            <Link href="/terms" className="text-champagne-600 hover:text-champagne-700">Terms of Service</Link>
            <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700">Privacy Policy</Link>
            <Link href="/cookies" className="text-champagne-600 hover:text-champagne-700">Cookie Policy</Link>
            <Link href="/ai-disclaimer" className="text-champagne-600 hover:text-champagne-700">AI Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
