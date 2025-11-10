'use client';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
          href="/"
          className="text-champagne-600 hover:text-champagne-700 mb-8 inline-flex items-center gap-2"
        >
          ← Back to Home
        </a>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Bella Wedding AI, you accept and agree to be bound by the
              terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials on Bella
              Wedding AI for personal, non-commercial viewing only. You may not modify, copy,
              distribute, or use any content for commercial purposes without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
            <p>
              Bella Wedding AI is provided on an 'as is' basis. We make no warranties, expressed
              or implied. We disclaim all warranties including fitness for a particular purpose
              or non-infringement of intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h2>
            <p>
              In no event shall Bella Wedding AI be liable for any damages arising out of the
              use or inability to use materials on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
            <p>
              We do not warrant that materials on our website are accurate, complete, or error-free.
              We reserve the right to make changes without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Links</h2>
            <p>
              We have not reviewed all sites linked to our website and are not responsible for
              the contents of any such linked site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
            <p>
              We may revise these terms of service at any time without notice. By using this
              website you are agreeing to be bound by the then current version of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws
              of the United States, and you irrevocably submit to the exclusive jurisdiction of
              the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
            <p>
              If you have any questions about these terms, please contact us at{' '}
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