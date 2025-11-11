'use client';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <a href="/" className="text-champagne-600 hover:text-champagne-700 mb-8 inline-flex items-center gap-2">
          ← Back to Home
        </a>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>Bella Wedding AI respects the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p>We collect email address, wedding planning data, payment information, usage data and analytics, and device information.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Information</h2>
            <p>We use collected information to provide our service, improve user experience, process payments, send communications, and analyze usage patterns.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p>We use industry-standard encryption (SSL/TLS) and secure storage to protect your data. All data is encrypted at rest and in transit.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact</h2>
            <p>For privacy inquiries, please contact us at bellaweddingai@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}