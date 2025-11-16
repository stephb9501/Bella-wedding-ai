'use client';

import { Heart, Shield, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
            <h1 className="text-4xl font-serif text-champagne-900 mb-2">Privacy Policy</h1>
            <p className="text-champagne-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-champagne max-w-none">
            <h2 className="text-2xl font-serif text-champagne-900 mb-4">1. Information We Collect</h2>
            <p className="text-champagne-700 mb-3 leading-relaxed">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-champagne-700 mb-6">
              <li>Account information (name, email, password)</li>
              <li>Wedding details (date, location, guest count, budget)</li>
              <li>Planning data (checklists, vendors, timelines, décor preferences)</li>
              <li>Communication with vendors through our platform</li>
              <li>User preferences and settings</li>
            </ul>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-champagne-700 mb-3 leading-relaxed">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-champagne-700 mb-6">
              <li>Provide and improve our wedding planning services</li>
              <li>Generate AI-powered suggestions and recommendations</li>
              <li>Send you notifications, reminders, and updates</li>
              <li>Connect you with vendors and service providers</li>
              <li>Analyze usage patterns to enhance the platform</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">3. AI and Data Processing</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6 rounded-r-lg">
              <p className="text-champagne-700 leading-relaxed">
                Your wedding planning data may be processed by artificial intelligence systems to generate personalized suggestions
                and recommendations. We do not sell your personal information to third parties. AI processing occurs within secure systems
                designed to protect your privacy.
              </p>
            </div>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">4. Data Sharing</h2>
            <p className="text-champagne-700 mb-3 leading-relaxed">We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 text-champagne-700 mb-6">
              <li><strong>Vendors:</strong> When you contact or inquire about vendors through our platform</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (hosting, analytics, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              We do not sell your personal information to third parties for marketing purposes.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">5. Data Security</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              We implement reasonable security measures to protect your information. However, no system is completely secure.
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">6. Your Rights</h2>
            <p className="text-champagne-700 mb-3 leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-champagne-700 mb-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">7. Cookies and Tracking</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
              You can control cookie preferences through your browser settings.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">8. Data Retention</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. You may request
              account deletion at any time through the Settings page.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">9. Children's Privacy</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              Our services are not intended for users under 18 years of age. We do not knowingly collect information from children.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">10. Changes to Privacy Policy</h2>
            <p className="text-champagne-700 mb-6 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notice.
              Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-2xl font-serif text-champagne-900 mb-4">11. Contact Us</h2>
            <p className="text-champagne-700 mb-2">
              For privacy-related questions or to exercise your rights, contact us at:
            </p>
            <p className="text-champagne-700">
              Email: privacy@bellaweddingai.com<br />
              Website: www.bellaweddingai.com
            </p>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 pt-8 border-t border-champagne-200">
            <div className="flex items-start gap-3 bg-champagne-50 p-6 rounded-lg">
              <Shield className="w-6 h-6 text-champagne-600 flex-shrink-0 mt-1" />
              <p className="text-sm text-champagne-700 leading-relaxed">
                <strong className="text-champagne-900">Your Privacy Matters:</strong> We take data privacy seriously and are committed to
                protecting your personal information. Your wedding planning data is used solely to provide and improve our services.
                We never sell your personal information to third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
