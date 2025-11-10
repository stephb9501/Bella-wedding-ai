'use client';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
          href="/"
          className="text-champagne-600 hover:text-champagne-700 mb-8 inline-flex items-center gap-2"
        >
          ← Back to Home
        </a>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Bella Wedding AI ("we" or "us" or "our") respects the privacy of our users
              ("user" or "you"). This Privacy Policy explains how we collect, use, disclose,
              and otherwise handle your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Email address and account information</li>
              <li>Wedding planning data (guest lists, budgets, timelines)</li>
              <li>Payment information (processed through Stripe)</li>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Information</h2>
            <p>We use collected information for various purposes, including:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Providing and maintaining our service</li>
              <li>Improving and personalizing user experience</li>
              <li>Processing payments</li>
              <li>Sending promotional emails (with consent)</li>
              <li>Responding to your inquiries</li>
              <li>Analyzing usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p>
              We use industry-standard encryption (SSL/TLS) and secure storage to protect your
              data. All data is encrypted at rest and in transit. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p>We may share data with trusted third parties for specific purposes:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Supabase (database and authentication)</li>
              <li>Gmail API (email delivery)</li>
              <li>Stripe (payment processing)</li>
            </ul>
            <p className="mt-2">
              These providers have their own privacy policies and are committed to protecting
              your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access your data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
            <p>
              We use cookies to enhance your user experience. You can disable cookies through
              your browser settings, but some features may not work properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. GDPR Compliance</h2>
            <p>
              If you are in the EU, you have additional rights under GDPR. We process your data
              only with your consent and for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
            <p>
              For privacy inquiries, please contact us at{' '}
              <a href="mailto:bellaweddingai@gmail.com" className="text-champagne-600 hover:underline">
                bellaweddingai@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}