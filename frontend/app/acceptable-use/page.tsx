'use client';

import Link from 'next/link';
import { ShieldX, ArrowLeft, AlertTriangle, XCircle } from 'lucide-react';

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
            <ShieldX className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Acceptable Use Policy
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
              This Acceptable Use Policy outlines prohibited conduct on Bella Wedding AI. Violations may result in account
              suspension or termination. This policy is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
            </p>
          </section>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 mb-2">Zero Tolerance Policy</p>
                <p className="text-gray-700">
                  We have zero tolerance for illegal activity, harassment, spam, or abuse. Violators will be banned immediately.
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              Prohibited Activities
            </h2>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">1. Illegal Activity</h3>
                <p className="text-gray-700">
                  Do NOT use Bella Wedding AI for any illegal purpose or to violate laws in your jurisdiction. This includes
                  but is not limited to: fraud, money laundering, trafficking, piracy, distributing illegal content, or
                  facilitating illegal transactions.
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">2. Harassment & Hate Speech</h3>
                <p className="text-gray-700">
                  Do NOT harass, threaten, bully, or intimidate other users. Do NOT post hate speech, discriminatory content,
                  or content that incites violence based on race, religion, gender, sexual orientation, disability, or any
                  protected class.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">3. Spam & Unsolicited Marketing</h3>
                <p className="text-gray-700">
                  Do NOT send spam, unsolicited commercial messages, or bulk messages to other users. Do NOT use the platform
                  for phishing, scams, or deceptive marketing practices.
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">4. Intellectual Property Violation</h3>
                <p className="text-gray-700">
                  Do NOT upload, post, or share content that infringes on others' copyrights, trademarks, patents, or trade
                  secrets. Only upload content you own or have permission to use. See our{' '}
                  <Link href="/dmca" className="text-champagne-600 hover:text-champagne-700 underline">DMCA Policy</Link>.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">5. Malicious Software & Hacking</h3>
                <p className="text-gray-700">
                  Do NOT upload viruses, malware, or any code designed to harm, disrupt, or gain unauthorized access to
                  systems. Do NOT attempt to hack, exploit, or bypass security measures on our platform.
                </p>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">6. Sexually Explicit or Inappropriate Content</h3>
                <p className="text-gray-700">
                  Bella Wedding AI is a wedding planning platform. Do NOT post sexually explicit, pornographic, or obscene
                  content. Keep all content appropriate for all ages.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">7. Impersonation & Fraud</h3>
                <p className="text-gray-700">
                  Do NOT impersonate other users, vendors, or Bella Wedding AI staff. Do NOT create fake accounts or provide
                  false information to deceive others.
                </p>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">8. Abuse of Platform Features</h3>
                <p className="text-gray-700">
                  Do NOT abuse platform features, such as: creating multiple accounts to bypass limits, using bots/automation
                  without permission, scraping data, overloading servers (DDoS), or circumventing payment systems.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Consequences of Violations</h2>
            <div className="bg-red-50 rounded-lg p-6">
              <p className="font-bold text-gray-900 mb-3">We reserve the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Issue warnings</strong> for first-time minor violations</li>
                <li><strong>Suspend accounts</strong> temporarily for repeated violations</li>
                <li><strong>Terminate accounts permanently</strong> for serious or repeated violations</li>
                <li><strong>Remove content</strong> that violates this policy</li>
                <li><strong>Report illegal activity</strong> to law enforcement</li>
                <li><strong>Pursue legal action</strong> for damages caused by violations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporting Violations</h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                If you see content or behavior that violates this policy, please report it to us:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:abuse@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                  abuse@bellaweddingai.com
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                Include: (1) Your account email, (2) URL of violating content/user, (3) Description of violation,
                (4) Any relevant screenshots
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Severability</h2>
            <p className="text-gray-700">
              If any provision of this Acceptable Use Policy is found to be unlawful, void, or unenforceable, that provision
              shall be severed and shall not affect the remaining provisions. This policy is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
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
