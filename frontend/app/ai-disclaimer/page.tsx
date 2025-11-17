'use client';

import Link from 'next/link';
import { Bot, ArrowLeft, AlertTriangle, Sparkles, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function AIDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                AI Disclaimer & Limitations
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Version 1.0 " Effective Date: January 17, 2025
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">

          {/* Critical Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 text-lg mb-2">
                  IMPORTANT: AI-Generated Content Disclaimer
                </p>
                <p className="text-gray-700">
                  Bella Wedding AI uses artificial intelligence (AI) to assist with wedding planning. While AI can be a powerful
                  tool, it is <strong>NOT perfect</strong> and <strong>should NOT replace professional human judgment</strong>.
                  By using our AI features, you acknowledge and accept the limitations described below.
                </p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              This AI Disclaimer explains how we use artificial intelligence in Bella Wedding AI, what you can expect from
              AI-generated content, and the important limitations you need to understand. This disclaimer is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Table of Contents */}
          <section className="bg-champagne-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-champagne-600" />
              Table of Contents
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-champagne-700">
              <li><a href="#section-1" className="hover:underline">How We Use AI</a></li>
              <li><a href="#section-2" className="hover:underline">AI Limitations & Risks</a></li>
              <li><a href="#section-3" className="hover:underline">What AI Can and Cannot Do</a></li>
              <li><a href="#section-4" className="hover:underline">Your Responsibilities</a></li>
              <li><a href="#section-5" className="hover:underline">No Professional Advice</a></li>
              <li><a href="#section-6" className="hover:underline">Accuracy & Reliability</a></li>
              <li><a href="#section-7" className="hover:underline">Data Usage & Training</a></li>
              <li><a href="#section-8" className="hover:underline">Disclaimers & Liability</a></li>
            </ol>
          </section>

          {/* Section 1: How We Use AI */}
          <section id="section-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-champagne-600" />
              1. How We Use AI
            </h2>
            <p className="text-gray-700 mb-4">
              Bella Wedding AI uses artificial intelligence (powered by large language models like OpenAI's GPT) to provide
              the following features:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Wedding Planning Assistance:</strong> Generate ideas, checklists, timelines, and suggestions</li>
              <li><strong>Vendor Recommendations:</strong> Suggest vendors based on your preferences and location</li>
              <li><strong>Budget Optimization:</strong> Help estimate costs and allocate your wedding budget</li>
              <li><strong>Seating Chart Suggestions:</strong> Recommend seating arrangements based on guest relationships</li>
              <li><strong>Content Generation:</strong> Draft vows, speeches, invitations, and other wedding-related text</li>
              <li><strong>Style & Theme Advice:</strong> Suggest color schemes, décor, and design ideas</li>
              <li><strong>Q&A Chat Assistant:</strong> Answer questions about wedding planning, etiquette, and traditions</li>
            </ul>
          </section>

          {/* Section 2: AI Limitations & Risks */}
          <section id="section-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              2. AI Limitations & Risks
            </h2>
            <p className="text-gray-700 mb-4">
              AI systems, including ours, have significant limitations. You MUST understand these risks before relying on
              AI-generated content:
            </p>

            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">L AI Can Make Mistakes ("Hallucinations")</h3>
                <p className="text-gray-700">
                  AI can generate <strong>false, inaccurate, or misleading information</strong> with confidence. This is
                  called "hallucination." AI may invent facts, dates, prices, vendor details, or advice that sounds
                  plausible but is completely wrong. <strong>Always verify AI-generated information independently.</strong>
                </p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">  AI Lacks Real-World Knowledge</h3>
                <p className="text-gray-700">
                  AI does not have access to real-time information unless explicitly provided. It does not know current
                  vendor availability, pricing, or local regulations. AI's training data has a cutoff date and may be
                  outdated.
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">  AI Cannot Replace Professional Judgment</h3>
                <p className="text-gray-700">
                  AI is a tool, not a professional wedding planner, lawyer, accountant, or licensed expert. It cannot
                  provide professional advice tailored to your specific circumstances. <strong>Do not rely on AI for
                  legal, financial, health, or safety-critical decisions.</strong>
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">9 AI May Reflect Biases</h3>
                <p className="text-gray-700">
                  AI models are trained on large datasets from the internet, which may contain biases, stereotypes, or
                  culturally insensitive content. We strive to minimize this, but AI-generated content may sometimes reflect
                  these biases. We do not endorse any biased or offensive content generated by AI.
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-bold text-gray-900 mb-2">= AI Responses Are Not Deterministic</h3>
                <p className="text-gray-700">
                  The same question asked to AI multiple times may produce different answers. AI is probabilistic, not
                  deterministic, meaning responses can vary even with identical inputs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: What AI Can and Cannot Do */}
          <section id="section-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. What AI Can and Cannot Do
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Can Do */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  AI CAN:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li> Suggest creative ideas and inspiration</li>
                  <li> Generate draft text (vows, speeches, etc.)</li>
                  <li> Create checklists and timelines</li>
                  <li> Provide general wedding planning tips</li>
                  <li> Help brainstorm themes and color schemes</li>
                  <li> Offer organizational assistance</li>
                  <li> Answer common wedding etiquette questions</li>
                </ul>
              </div>

              {/* Cannot Do */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  AI CANNOT:
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>L Guarantee accuracy of information</li>
                  <li>L Provide professional legal/financial advice</li>
                  <li>L Know real-time vendor availability/pricing</li>
                  <li>L Replace human wedding planners</li>
                  <li>L Understand complex personal situations fully</li>
                  <li>L Make binding contracts or commitments</li>
                  <li>L Predict future events or outcomes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Your Responsibilities */}
          <section id="section-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Your Responsibilities When Using AI
            </h2>
            <p className="text-gray-700 mb-4">
              By using AI features on Bella Wedding AI, you agree to the following responsibilities:
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded space-y-3">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">1. Verify All AI-Generated Information</h3>
                <p className="text-gray-700">
                  <strong>You are responsible for verifying the accuracy</strong> of any AI-generated content before
                  acting on it. Do not assume AI is correctalways fact-check important details like dates, prices,
                  vendor information, and legal requirements.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">2. Use AI as a Starting Point, Not Final Authority</h3>
                <p className="text-gray-700">
                  Treat AI suggestions as <strong>inspiration and guidance</strong>, not definitive answers. Review,
                  edit, and customize AI-generated content to fit your needs.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">3. Consult Professionals for Important Decisions</h3>
                <p className="text-gray-700">
                  For legal, financial, health, or safety matters, <strong>always consult licensed professionals</strong>.
                  AI cannot replace qualified experts like attorneys, accountants, or wedding planners.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">4. Do Not Share Sensitive Personal Information with AI</h3>
                <p className="text-gray-700">
                  Avoid entering highly sensitive data (Social Security numbers, full credit card numbers, private
                  medical information) into AI chat features. See our{' '}
                  <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700 underline">
                    Privacy Policy
                  </Link>{' '}
                  for details on data handling.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">5. Review and Edit AI-Generated Content</h3>
                <p className="text-gray-700">
                  If you use AI to draft vows, speeches, or invitations, <strong>carefully review and personalize</strong>
                  {' '}the text. AI-generated content may be generic, impersonal, or contain errors.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: No Professional Advice */}
          <section id="section-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. No Professional Advice
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
              <p className="font-bold text-gray-900 mb-2">
                AI Does Not Provide Professional Advice
              </p>
              <p className="text-gray-700 mb-3">
                AI-generated content on Bella Wedding AI is <strong>NOT professional advice</strong> and should not be
                treated as such. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>NOT Legal Advice:</strong> AI cannot advise on contracts, prenuptial agreements, marriage
                licenses, or legal matters. Consult a licensed attorney.</li>
                <li><strong>NOT Financial Advice:</strong> AI cannot provide personalized financial planning, tax advice,
                or investment guidance. Consult a certified financial planner or accountant.</li>
                <li><strong>NOT Health Advice:</strong> AI cannot diagnose conditions, recommend treatments, or provide
                medical guidance. Consult a licensed healthcare provider.</li>
                <li><strong>NOT Professional Wedding Planning:</strong> AI is not a substitute for hiring a certified
                wedding planner who understands your local market, venues, and vendors.</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>You assume all risk</strong> when relying on AI-generated content without consulting appropriate
                professionals.
              </p>
            </div>
          </section>

          {/* Section 6: Accuracy & Reliability */}
          <section id="section-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Accuracy & Reliability of AI Content
            </h2>
            <p className="text-gray-700 mb-4">
              We do our best to provide helpful AI features, but we make <strong>NO GUARANTEES</strong> about the
              accuracy, completeness, or reliability of AI-generated content.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Specific Disclaimers:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Vendor Information:</strong> AI may suggest vendors, but we do not verify their availability,
                pricing, quality, or reputation. <strong>Always contact vendors directly</strong> to confirm details.</li>

                <li><strong>Pricing Estimates:</strong> AI-generated budget estimates are <strong>approximate and may be
                inaccurate</strong>. Wedding costs vary widely by location, season, and vendor. Get written quotes from
                vendors for accurate pricing.</li>

                <li><strong>Dates & Timelines:</strong> AI-generated timelines are <strong>general guidelines</strong>.
                Your specific timeline may differ based on your wedding date, venue requirements, and personal preferences.</li>

                <li><strong>Legal & Regulatory Info:</strong> AI may provide general information about marriage licenses,
                permits, or regulations, but this information <strong>may be outdated or incorrect</strong>. Verify with
                local government offices.</li>

                <li><strong>Cultural & Religious Traditions:</strong> AI provides general information about wedding
                traditions but may not accurately represent your specific cultural, religious, or familial customs.
                Consult community leaders or family members for guidance.</li>
              </ul>
            </div>
          </section>

          {/* Section 7: Data Usage & Training */}
          <section id="section-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. How Your Data is Used with AI
            </h2>
            <p className="text-gray-700 mb-4">
              When you use AI features, your inputs (prompts, questions, wedding details) are sent to our AI service
              provider (OpenAI) for processing. Here's what you need to know:
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Your Data is Sent to OpenAI</h3>
                <p className="text-gray-700">
                  To generate AI responses, your inputs are transmitted to OpenAI's servers. We use OpenAI's API with
                  enterprise settings that <strong>opt out of training</strong>meaning your data is NOT used to train
                  OpenAI's models. However, OpenAI may temporarily retain your data for abuse monitoring (typically 30 days).
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">We Do Not Train AI on Your Personal Data</h3>
                <p className="text-gray-700">
                  Bella Wedding AI does <strong>NOT use your personal conversations, wedding plans, or uploaded photos</strong>
                  {' '}to train AI models (unless you explicitly opt in to a beta program). We may use aggregated,
                  anonymized data for platform improvements.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Avoid Sharing Sensitive Data with AI</h3>
                <p className="text-gray-700">
                  Do not enter highly sensitive information (full Social Security numbers, credit card numbers, passwords,
                  private health records) into AI chat features. While we encrypt data in transit and at rest, AI systems
                  are not designed for processing highly sensitive personal data.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mt-4">
              For more details, see our{' '}
              <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700 underline">
                Privacy Policy
              </Link>.
            </p>
          </section>

          {/* Section 8: Disclaimers & Liability */}
          <section id="section-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Disclaimers & Limitation of Liability
            </h2>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-4">
              <p className="font-bold text-gray-900 mb-2 uppercase">
                Disclaimer of Warranties
              </p>
              <p className="text-gray-700">
                AI features are provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without warranties
                of any kind, express or implied. We do not warrant that AI-generated content will be accurate, complete,
                reliable, current, or error-free.
              </p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded mb-4">
              <p className="font-bold text-gray-900 mb-2 uppercase">
                Limitation of Liability
              </p>
              <p className="text-gray-700">
                <strong>We are NOT liable</strong> for any damages, losses, or harm arising from your use of or reliance
                on AI-generated content. This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Inaccurate vendor recommendations or pricing</li>
                <li>Errors in AI-generated timelines, budgets, or seating charts</li>
                <li>Offensive, biased, or inappropriate AI-generated content</li>
                <li>Financial losses from relying on AI budget estimates</li>
                <li>Missed deadlines or planning errors due to AI suggestions</li>
                <li>Vendor disputes or no-shows</li>
                <li>Legal issues arising from AI-generated contract language or advice</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Our maximum liability is limited to the amount you paid for your subscription, up to $100, as stated in
                our{' '}
                <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                  Terms of Service
                </Link>.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <p className="font-bold text-gray-900 mb-2">Your Use is at Your Own Risk</p>
              <p className="text-gray-700">
                By using AI features, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>You understand the limitations and risks of AI-generated content</li>
                <li>You will verify all AI-generated information independently</li>
                <li>You will not rely solely on AI for important decisions</li>
                <li>You assume all responsibility for decisions made based on AI content</li>
                <li>We are not liable for AI errors, inaccuracies, or omissions</li>
              </ul>
            </div>
          </section>

          {/* Severability Clause */}
          <section className="bg-gray-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Severability
            </h2>
            <p className="text-gray-700">
              If any provision of this AI Disclaimer is found to be unlawful, void, or unenforceable, that provision
              shall be severed from this disclaimer and shall not affect the validity and enforceability of the remaining
              provisions. This AI Disclaimer is part of and incorporated into our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-champagne-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Questions About AI Features?
            </h2>
            <p className="text-gray-700">
              If you have questions or concerns about our AI features, please contact us at{' '}
              <a href="mailto:support@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                support@bellaweddingai.com
              </a>.
            </p>
          </section>

          {/* Back to Home Link */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-champagne-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2025 Bella Wedding AI. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            <Link href="/terms" className="text-champagne-600 hover:text-champagne-700">Terms of Service</Link>
            <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700">Privacy Policy</Link>
            <Link href="/ai-disclaimer" className="text-champagne-600 hover:text-champagne-700">AI Disclaimer</Link>
            <Link href="/vendor-disclaimer" className="text-champagne-600 hover:text-champagne-700">Vendor Disclaimer</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
