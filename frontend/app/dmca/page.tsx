'use client';

import Link from 'next/link';
import { FileWarning, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <FileWarning className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                DMCA & Copyright Policy
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
              Bella Wedding AI respects intellectual property rights and complies with the Digital Millennium Copyright
              Act (DMCA). This policy explains our procedures for reporting and responding to copyright infringement claims.
            </p>
          </section>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 mb-2">No Tolerance for Copyright Infringement</p>
                <p className="text-gray-700">
                  We take copyright infringement seriously. Repeat infringers will have their accounts terminated.
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Copyright Infringement Notification</h2>
            <p className="text-gray-700 mb-4">
              If you believe your copyrighted work has been infringed on Bella Wedding AI, send a DMCA takedown notice
              to our designated Copyright Agent:
            </p>
            <div className="bg-champagne-50 rounded-lg p-6 mb-4">
              <p className="font-bold text-gray-900">Bella Wedding AI - Copyright Agent</p>
              <p className="text-gray-700">Email: <a href="mailto:dmca@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">dmca@bellaweddingai.com</a></p>
              <p className="text-gray-700">Mailing Address: [Your Business Address], [City, State, ZIP]</p>
            </div>

            <p className="text-gray-700 mb-3 font-bold">Your notice must include:</p>
            <ul className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Identification of the copyrighted work claimed to be infringed</li>
              <li>Identification of the infringing material and its location on our platform (URL)</li>
              <li>Your contact information (name, address, phone, email)</li>
              <li>Statement of good faith belief that use is not authorized by copyright owner</li>
              <li>Statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
              <li>Your physical or electronic signature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Counter-Notification</h2>
            <p className="text-gray-700 mb-4">
              If your content was removed due to a DMCA notice and you believe it was removed in error, you may file a
              counter-notification with the same contact information above.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-gray-700">
                <strong>Counter-notification must include:</strong> (1) Your contact information, (2) Identification of
                removed material, (3) Statement of good faith belief material was removed by mistake, (4) Consent to
                jurisdiction of federal court, (5) Your signature.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-champagne-600" />
              Repeat Infringer Policy
            </h2>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-gray-700">
                We will terminate accounts of users who are repeat copyright infringers. Repeat infringers are users who
                have been notified of infringing activity more than twice or who have had infringing content removed more
                than twice.
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Severability</h2>
            <p className="text-gray-700">
              If any provision of this DMCA Policy is found to be unlawful, void, or unenforceable, that provision shall
              be severed and shall not affect the remaining provisions. This policy is part of our{' '}
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
