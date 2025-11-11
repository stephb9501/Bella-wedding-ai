'use client';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <a href="/" className="text-champagne-600 hover:text-champagne-700 mb-8 inline-flex items-center gap-2">
          ← Back to Home
        </a>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Bella Wedding AI, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials on Bella Wedding AI for personal, non-commercial viewing only.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
            <p>Bella Wedding AI is provided on an 'as is' basis. We make no warranties, expressed or implied.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h2>
            <p>In no event shall Bella Wedding AI be liable for any damages arising out of the use or inability to use materials on our website.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact</h2>
            <p>For inquiries, please contact us at bellaweddingai@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}