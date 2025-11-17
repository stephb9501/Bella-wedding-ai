'use client';

import Link from 'next/link';
import { Brain, ArrowLeft } from 'lucide-react';

export default function AIDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                AI Disclaimer
              </h1>
              <p className="text-sm text-gray-600 mt-1">Version 1.0 - Effective Date: January 17, 2025</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">

          <section className="bg-amber-50 border-l-4 border-amber-500 p-6">
            <h2 className="text-xl font-bold text-amber-900 mb-3">
              IMPORTANT: AI-Generated Content Notice
            </h2>
            <p className="text-amber-800 leading-relaxed">
              Bella Wedding AI uses artificial intelligence technology to provide wedding planning assistance,
              recommendations, and content generation. This disclaimer explains the limitations and risks
              associated with AI-generated content and how you should use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. Nature of AI Technology
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our platform utilizes large language models (LLMs) and machine learning algorithms to:
            </p>

            <div className="space-y-2 mb-4">
              <p className="text-gray-700">
                * Generate wedding planning suggestions and recommendations
              </p>
              <p className="text-gray-700">
                * Create timeline and checklist content
              </p>
              <p className="text-gray-700">
                * Provide vendor matching and search functionality
              </p>
              <p className="text-gray-700">
                * Offer budget planning assistance
              </p>
              <p className="text-gray-700">
                * Generate guest list management recommendations
              </p>
              <p className="text-gray-700">
                * Create customized wedding content and ideas
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              While we strive for accuracy and usefulness, AI technology has inherent limitations that
              users must understand and acknowledge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. AI Hallucinations and Inaccuracies
            </h2>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">What Are AI Hallucinations?</h3>
              <p className="text-gray-700 leading-relaxed">
                AI "hallucinations" occur when the system generates information that appears confident and
                plausible but is actually incorrect, fabricated, or not based on real data. This is a known
                limitation of current AI technology.
              </p>
            </div>

            <h3 className="font-semibold text-gray-900 mb-3">Common Types of Errors:</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h4 className="font-semibold text-gray-900">Factual Inaccuracies</h4>
                <p className="text-gray-700">
                  The AI may provide incorrect dates, prices, vendor information, or wedding planning facts.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h4 className="font-semibold text-gray-900">Fabricated Details</h4>
                <p className="text-gray-700">
                  The AI may generate vendor names, reviews, or recommendations that do not exist or are not verified.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h4 className="font-semibold text-gray-900">Outdated Information</h4>
                <p className="text-gray-700">
                  AI training data may not include recent changes in wedding trends, vendor availability, or industry standards.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h4 className="font-semibold text-gray-900">Inconsistent Responses</h4>
                <p className="text-gray-700">
                  The same question asked multiple times may produce different answers with varying accuracy.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h4 className="font-semibold text-gray-900">Context Misunderstanding</h4>
                <p className="text-gray-700">
                  The AI may misinterpret your specific situation, cultural context, or preferences.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Limitations of AI Recommendations
            </h2>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] No Guarantee of Accuracy</h3>
                <p className="text-gray-700">
                  AI-generated content is provided "as-is" without warranty of any kind. We do not guarantee
                  the accuracy, completeness, or reliability of any AI-generated recommendations.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Not Professional Advice</h3>
                <p className="text-gray-700">
                  AI recommendations are general suggestions only and do not constitute professional wedding
                  planning, legal, financial, or other expert advice.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Limited Personalization</h3>
                <p className="text-gray-700">
                  While AI attempts to personalize recommendations, it cannot fully understand your unique
                  circumstances, preferences, cultural requirements, or relationship dynamics.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] No Vendor Verification</h3>
                <p className="text-gray-700">
                  AI-suggested vendors are not vetted, verified, or endorsed by Bella Wedding AI. Always
                  conduct your own due diligence before hiring any vendor.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">[!] Budget Estimates May Vary</h3>
                <p className="text-gray-700">
                  AI-generated budget recommendations are estimates only. Actual costs may vary significantly
                  based on location, season, vendor pricing, and market conditions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Not Professional Advice
            </h2>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
              <h3 className="font-semibold text-amber-900 mb-3">DISCLAIMER:</h3>
              <p className="text-amber-800 leading-relaxed mb-4">
                Bella Wedding AI and its AI-generated content do NOT provide:
              </p>

              <div className="space-y-2">
                <p className="text-amber-800">
                  [X] Professional wedding planning services
                </p>
                <p className="text-amber-800">
                  [X] Legal advice regarding contracts, liability, or compliance
                </p>
                <p className="text-amber-800">
                  [X] Financial or investment advice
                </p>
                <p className="text-amber-800">
                  [X] Medical or mental health counseling
                </p>
                <p className="text-amber-800">
                  [X] Relationship or family therapy
                </p>
                <p className="text-amber-800">
                  [X] Tax or accounting guidance
                </p>
                <p className="text-amber-800">
                  [X] Insurance recommendations
                </p>
                <p className="text-amber-800">
                  [X] Licensed professional services of any kind
                </p>
              </div>

              <p className="text-amber-800 leading-relaxed mt-4">
                For professional advice in any of these areas, please consult qualified licensed professionals.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. User Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When using AI-generated content on Bella Wedding AI, you are responsible for:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">1.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Verification</h3>
                  <p className="text-gray-700">
                    Independently verify all AI-generated information before making decisions or taking action.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">2.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Due Diligence</h3>
                  <p className="text-gray-700">
                    Conduct thorough research on vendors, venues, and services before making commitments.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">3.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Professional Consultation</h3>
                  <p className="text-gray-700">
                    Seek professional advice for legal, financial, or other specialized matters.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">4.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Contract Review</h3>
                  <p className="text-gray-700">
                    Have all vendor contracts reviewed by a legal professional before signing.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">5.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Personal Judgment</h3>
                  <p className="text-gray-700">
                    Use your own judgment and common sense when evaluating AI recommendations.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-champagne-600 font-bold">6.</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Error Reporting</h3>
                  <p className="text-gray-700">
                    Report any inaccurate, inappropriate, or concerning AI-generated content to our support team.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Liability Limitations
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the maximum extent permitted by law:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * We are NOT liable for any decisions made based on AI-generated content
              </p>
              <p className="text-gray-700">
                * We are NOT responsible for inaccuracies or errors in AI recommendations
              </p>
              <p className="text-gray-700">
                * We are NOT liable for losses resulting from reliance on AI suggestions
              </p>
              <p className="text-gray-700">
                * We are NOT responsible for vendor performance, quality, or conduct
              </p>
              <p className="text-gray-700">
                * We do NOT guarantee any particular outcome or result from using AI features
              </p>
              <p className="text-gray-700">
                * We are NOT liable for damages arising from AI hallucinations or errors
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Content Moderation
            </h2>
            <p className="text-gray-700 leading-relaxed">
              While we implement safeguards and content filters, AI may occasionally generate inappropriate,
              offensive, or unsuitable content. We employ automated moderation and manual review processes,
              but cannot guarantee that all problematic content will be prevented. Users should report any
              concerning AI-generated content immediately to: support@bellaweddingai.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Continuous Improvement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to improving our AI technology through:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * Regular model updates and refinements
              </p>
              <p className="text-gray-700">
                * User feedback integration
              </p>
              <p className="text-gray-700">
                * Quality assurance testing
              </p>
              <p className="text-gray-700">
                * Content accuracy reviews
              </p>
              <p className="text-gray-700">
                * Safety and moderation enhancements
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              However, improvement is ongoing, and current limitations will persist in the technology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Reporting Issues
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you encounter AI-generated content that is:
            </p>

            <div className="space-y-2 mb-4">
              <p className="text-gray-700">* Factually incorrect or misleading</p>
              <p className="text-gray-700">* Inappropriate or offensive</p>
              <p className="text-gray-700">* Potentially harmful or dangerous</p>
              <p className="text-gray-700">* Violating privacy or rights</p>
              <p className="text-gray-700">* Otherwise concerning</p>
            </div>

            <div className="bg-champagne-50 border border-champagne-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Please report it to:</h3>
              <p className="text-gray-700 mb-2">Email: ai-safety@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: AI Content Issue Report</p>
              <p className="text-gray-700">Include: Screenshots, description, context, timestamp</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              10. Acknowledgment and Acceptance
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By using Bella Wedding AI's AI-powered features, you acknowledge that you have read, understood,
              and accept this AI Disclaimer. You agree to use AI-generated content at your own risk and
              understand the limitations and potential inaccuracies inherent in AI technology. You will not
              hold Bella Wedding AI liable for any decisions made or actions taken based on AI recommendations.
            </p>
          </section>

          <section className="bg-rose-50 border-l-4 border-rose-500 p-6">
            <p className="text-sm text-gray-700 font-semibold">
              FINAL WARNING: AI is a tool to assist your wedding planning, not a replacement for human
              judgment, professional advice, or careful decision-making. Always verify important information
              and consult professionals when needed.
            </p>
          </section>

        </div>
      </main>

      <footer className="bg-white border-t border-champagne-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>2025 Bella Wedding AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
