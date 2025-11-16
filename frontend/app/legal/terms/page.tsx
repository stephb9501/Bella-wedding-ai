'use client';

import { Heart, Shield, Info } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
            <h1 className="text-4xl font-serif text-champagne-900 mb-2">Terms of Service</h1>
            <p className="text-champagne-600">Last updated: January 2025</p>
          </div>

          {/* AI Disclaimer */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">AI-Powered Suggestions</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Bella Wedding AI uses artificial intelligence to provide wedding planning suggestions, recommendations, and automated features.
                  All AI-generated content is provided for informational and suggestive purposes only. Users should verify all information
                  independently and consult with professional wedding planners, vendors, and other qualified experts before making decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-champagne max-w-none">
            <h2 className="text-2xl font-serif text-champagne-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              By accessing and using Bella Wedding AI, you accept and agree to be bound by the terms and provisions of this agreement.
              If you do not agree to these Terms of Service, please do not use our platform.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">2. Description of Service</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              Bella Wedding AI is a wedding planning platform that provides tools, resources, and AI-powered suggestions to help users
              plan their weddings. Our services include but are not limited to: checklists, budget planning, vendor discovery, décor planning,
              timeline management, and AI-assisted recommendations.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">3. AI-Generated Content Disclaimer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-champagne-700 mb-3 leading-relaxed">
                <strong className="text-champagne-900">Important:</strong> Bella Wedding AI utilizes artificial intelligence and machine learning technologies
                to generate suggestions, recommendations, and content. Users acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-champagne-700">
                <li>AI-generated suggestions are automated and may not be accurate, complete, or suitable for your specific situation</li>
                <li>All recommendations should be independently verified before implementation</li>
                <li>AI suggestions do not constitute professional advice (legal, financial, or otherwise)</li>
                <li>The platform does not guarantee the accuracy, reliability, or completeness of AI-generated content</li>
                <li>Users are solely responsible for decisions made based on AI suggestions</li>
              </ul>
            </div>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">4. Limitation of Liability</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-champagne-700 mb-3 leading-relaxed">
                <strong className="text-champagne-900">No Liability for Suggestions:</strong> Bella Wedding AI and its operators SHALL NOT be held liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-champagne-700">
                <li>Any decisions made based on platform suggestions or recommendations</li>
                <li>Vendor quality, reliability, or performance</li>
                <li>Budget estimates or financial planning accuracy</li>
                <li>Timeline suggestions or scheduling conflicts</li>
                <li>Décor recommendations or aesthetic outcomes</li>
                <li>Any damages, losses, or expenses arising from use of the platform</li>
                <li>Errors, inaccuracies, or omissions in AI-generated content</li>
              </ul>
            </div>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">5. User Responsibilities</h2>
            <p className="text-champagne-700 mb-3 leading-relaxed">Users agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-champagne-700 mb-6">
              <li>Verify all information and recommendations independently</li>
              <li>Consult with qualified professionals (wedding planners, financial advisors, legal counsel) as needed</li>
              <li>Exercise independent judgment when making wedding-related decisions</li>
              <li>Not rely solely on AI-generated suggestions for important decisions</li>
              <li>Conduct due diligence when engaging with vendors listed on the platform</li>
              <li>Understand that final decisions and their consequences are the user's sole responsibility</li>
            </ul>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">6. Vendor Listings</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              Vendor listings on Bella Wedding AI are provided for informational purposes. We do not endorse, guarantee, or warrant the quality,
              reliability, or suitability of any vendor. Users should independently research, verify credentials, check references, and make
              their own informed decisions when selecting vendors. Bella Wedding AI is not responsible for vendor performance, disputes,
              or any issues arising from vendor relationships.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">7. Budget and Financial Information</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              Budget planning tools and cost estimates are suggestive only. Actual costs may vary significantly. Bella Wedding AI does not
              provide financial advice. Users should consult with financial professionals for budget planning and should independently verify
              all pricing information with vendors.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">8. Privacy and Data</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              Your use of Bella Wedding AI is also governed by our Privacy Policy. By using the platform, you consent to the collection and
              use of your information as described in the Privacy Policy.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">9. Modifications to Service</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              Bella Wedding AI reserves the right to modify, suspend, or discontinue any aspect of the service at any time without notice.
              We may also update these Terms of Service periodically. Continued use of the platform after changes constitutes acceptance
              of the modified terms.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">10. No Professional Advice</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              The platform does not provide professional advice (legal, financial, medical, or otherwise). Information provided through
              Bella Wedding AI should not be construed as professional advice. Users should seek appropriate professional counsel for
              specific situations.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">11. Indemnification</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              Users agree to indemnify and hold harmless Bella Wedding AI, its operators, employees, and affiliates from any claims,
              damages, losses, or expenses arising from their use of the platform or reliance on platform suggestions.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">12. Disclaimer of Warranties</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              The platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. Bella Wedding AI
              makes no warranty that the service will be uninterrupted, timely, secure, or error-free.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">13. Contact Information</h2>
            <p className="text-champagne-700 mb-2">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-champagne-700">
              Email: legal@bellaweddingai.com<br />
              Website: www.bellaweddingai.com
            </p>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 pt-8 border-t border-champagne-200">
            <div className="flex items-start gap-3 bg-champagne-50 p-6 rounded-lg">
              <Shield className="w-6 h-6 text-champagne-600 flex-shrink-0 mt-1" />
              <p className="text-sm text-champagne-700 leading-relaxed">
                <strong className="text-champagne-900">Summary:</strong> Bella Wedding AI is a planning tool that provides AI-powered suggestions
                for informational purposes only. We are not liable for decisions made based on our recommendations. Always verify information
                independently and consult with qualified professionals. Use of this platform is at your own risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
