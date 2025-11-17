'use client';

import { useRouter } from 'next/navigation';
import { Heart, FileText } from 'lucide-react';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-white">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding AI</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-10 h-10 text-champagne-600" />
          <h1 className="text-4xl font-serif font-bold text-gray-900">Terms of Service</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 text-gray-700">
          <p className="text-sm text-gray-600"><strong>Last Updated:</strong> January 2025</p>
          
          <p>Welcome to Bella Wedding AI. By using our platform, you agree to these Terms of Service.</p>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Bella Wedding AI, you agree to be bound by these Terms. If you disagree, please do not use our services.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Use of Services</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be 18+ to use our services</li>
              <li>Provide accurate account information</li>
              <li>Keep your password secure</li>
              <li>Do not use the platform for illegal purposes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Subscriptions & Payments</h2>
            <p>Paid plans are billed monthly or annually. Payments are processed securely through Stripe. Refunds are provided according to our refund policy.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Vendor Services</h2>
            <p>Bella Wedding AI connects you with vendors but is not responsible for vendor services, quality, or disputes. Review vendor agreements independently.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Content Ownership</h2>
            <p>You retain ownership of content you upload. By uploading, you grant us a license to display and process your content to provide our services.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>Bella Wedding AI is provided "as is". We are not liable for damages arising from platform use, vendor services, or data loss.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Termination</h2>
            <p>We may suspend or terminate accounts that violate these Terms. You may cancel your account at any time from Settings.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p>We may update these Terms. Continued use after changes constitutes acceptance of new Terms.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p>Questions? Email us at: legal@bellaweddingai.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
