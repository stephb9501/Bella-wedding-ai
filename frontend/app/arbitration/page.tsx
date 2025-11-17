'use client';

import Link from 'next/link';
import { Scale, ArrowLeft, AlertTriangle, Users, FileX, Clock, FileText } from 'lucide-react';

export default function ArbitrationPage() {
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
            <Scale className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Arbitration & Dispute Resolution
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
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 text-lg mb-2">
                  IMPORTANT: Binding Arbitration Agreement
                </p>
                <p className="text-gray-700">
                  By using Bella Wedding AI, you agree to resolve disputes through <strong>binding individual arbitration</strong>
                  {' '}rather than court. You also <strong>waive your right to a jury trial</strong> and <strong>waive your
                  right to participate in class action lawsuits</strong>. Please read this carefully, as it significantly
                  affects your legal rights.
                </p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              This Arbitration & Dispute Resolution policy explains how disputes between you and Bella Wedding AI must be
              resolved. This policy is part of our{' '}
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
              <li><a href="#section-1" className="hover:underline">Agreement to Arbitrate</a></li>
              <li><a href="#section-2" className="hover:underline">Arbitration Rules & Procedures</a></li>
              <li><a href="#section-3" className="hover:underline">Class Action Waiver</a></li>
              <li><a href="#section-4" className="hover:underline">Exceptions to Arbitration</a></li>
              <li><a href="#section-5" className="hover:underline">30-Day Opt-Out Right</a></li>
              <li><a href="#section-6" className="hover:underline">Governing Law & Venue</a></li>
              <li><a href="#section-7" className="hover:underline">Severability</a></li>
            </ol>
          </section>

          {/* Section 1: Agreement to Arbitrate */}
          <section id="section-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-champagne-600" />
              1. Agreement to Arbitrate
            </h2>
            <p className="text-gray-700 mb-4">
              You and Bella Wedding AI agree that any dispute, claim, or controversy arising out of or relating to your use
              of the platform or these Terms shall be resolved through <strong>binding individual arbitration</strong>
              {' '}rather than in court, except as provided in Section 4 below.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">What This Means:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Disputes will be resolved by a <strong>neutral arbitrator</strong>, not a judge or jury</li>
                <li>Arbitration is typically <strong>faster and less expensive</strong> than court litigation</li>
                <li>The arbitrator's decision is <strong>binding and final</strong> (limited appeal rights)</li>
                <li>You <strong>give up your right to a jury trial</strong></li>
                <li>You <strong>give up your right to participate in a class action lawsuit</strong></li>
              </ul>
            </div>
          </section>

          {/* Section 2: Arbitration Rules & Procedures */}
          <section id="section-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Arbitration Rules & Procedures
            </h2>
            <p className="text-gray-700 mb-4">
              Arbitration will be conducted according to the following rules:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Arbitration Provider</h3>
                <p className="text-gray-700">
                  Arbitration will be administered by the <strong>American Arbitration Association (AAA)</strong> under
                  its <strong>Consumer Arbitration Rules</strong>, or by <strong>JAMS</strong> if AAA is unavailable.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li><strong>AAA Rules:</strong>{' '}
                    <a href="https://www.adr.org/consumer" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      www.adr.org/consumer
                    </a>
                  </li>
                  <li><strong>JAMS Rules:</strong>{' '}
                    <a href="https://www.jamsadr.com" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      www.jamsadr.com
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Arbitration Format</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Individual Arbitration Only:</strong> Each party files their own claim. No class arbitrations.</li>
                  <li><strong>Location:</strong> Arbitration will be conducted in the county where you reside (if in the U.S.)
                  or via video conference</li>
                  <li><strong>Written or In-Person:</strong> For claims under $10,000, arbitration may be conducted by
                  written submission, phone, or video conference at your option</li>
                  <li><strong>In-Person Hearing:</strong> For claims over $10,000, either party may request an in-person hearing</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Arbitration Costs</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Filing Fees:</strong> We will pay all AAA/JAMS filing fees for claims under $75,000</li>
                  <li><strong>Arbitrator Fees:</strong> Each party pays their own attorney fees, unless the arbitrator awards
                  fees to the prevailing party or as required by law</li>
                  <li><strong>Small Claims:</strong> If your claim is under $10,000 and you follow the procedures, we will
                  reimburse your filing fees</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Arbitrator's Powers</h3>
                <p className="text-gray-700 mb-2">
                  The arbitrator has the authority to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Award the same damages and relief as a court (including injunctive relief)</li>
                  <li>Award attorney's fees and costs as allowed by law or agreement</li>
                  <li>Issue a written decision explaining the factual and legal basis for the award</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  The arbitrator <strong>may NOT</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-1">
                  <li>Award relief that exceeds what an individual could obtain in court</li>
                  <li>Award relief that affects other users who are not parties to the arbitration</li>
                  <li>Consolidate multiple claims or conduct class arbitration</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Class Action Waiver */}
          <section id="section-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileX className="w-6 h-6 text-red-600" />
              3. Class Action Waiver
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
              <p className="font-bold text-gray-900 mb-2 uppercase">
                You Waive Your Right to Participate in Class Actions
              </p>
              <p className="text-gray-700 mb-3">
                You and Bella Wedding AI agree that all disputes must be brought on an <strong>individual basis only</strong>.
                You <strong>waive your right</strong> to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Participate in class action lawsuits</strong> (in court or arbitration)</li>
                <li><strong>Act as a class representative or class member</strong> in any class proceeding</li>
                <li><strong>Join multiple claims</strong> with other users in a single arbitration (consolidation)</li>
                <li><strong>Participate in representative actions</strong> (e.g., on behalf of the general public or other users)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>Example:</strong> If 100 users have the same complaint, they must each file their own individual
                arbitration. They cannot join together in a single class action lawsuit or class arbitration.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded mt-4">
              <p className="font-bold text-gray-900 mb-2">
                Severability of Class Action Waiver
              </p>
              <p className="text-gray-700">
                If a court or arbitrator determines that the class action waiver is unenforceable for a particular claim
                or cause of action, then <strong>that claim must be severed</strong> from the arbitration and brought in
                court, while all other claims remain in arbitration.
              </p>
            </div>
          </section>

          {/* Section 4: Exceptions to Arbitration */}
          <section id="section-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Exceptions to Arbitration
            </h2>
            <p className="text-gray-700 mb-4">
              Notwithstanding the arbitration agreement above, either party may bring the following claims in court without
              arbitration:
            </p>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">You May Sue in Court For:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Small Claims Court:</strong> Claims that qualify for small claims court (typically under $10,000,
                depending on your state) may be brought in small claims court instead of arbitration</li>

                <li><strong>Intellectual Property Claims:</strong> Claims related to intellectual property infringement
                (copyright, trademark, patent, trade secret violations)</li>

                <li><strong>Injunctive Relief:</strong> Either party may seek injunctive or other equitable relief in court
                to prevent actual or threatened infringement or misappropriation of intellectual property rights</li>

                <li><strong>State-Specific Exemptions:</strong> If you live in a state that prohibits mandatory arbitration
                for certain claims (e.g., New Jersey, California for certain employment-related claims), those exemptions apply</li>
              </ul>
            </div>
          </section>

          {/* Section 5: 30-Day Opt-Out Right */}
          <section id="section-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-green-600" />
              5. Your Right to Opt Out (30 Days)
            </h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
              <p className="font-bold text-gray-900 mb-2">
                You Have 30 Days to Opt Out of Arbitration
              </p>
              <p className="text-gray-700 mb-3">
                If you do NOT want to be bound by the arbitration agreement, you may <strong>opt out within 30 days</strong>
                {' '}of creating your account by sending a written notice to:
              </p>
              <div className="bg-white rounded p-4 ml-4 mb-3">
                <p className="font-bold text-gray-900">Bella Wedding AI</p>
                <p className="text-gray-700">Attn: Arbitration Opt-Out</p>
                <p className="text-gray-700">[Your Business Address]</p>
                <p className="text-gray-700">[City, State, ZIP]</p>
                <p className="text-gray-700 mt-2">
                  <strong>Or email:</strong>{' '}
                  <a href="mailto:legal@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                    legal@bellaweddingai.com
                  </a>
                </p>
              </div>
              <p className="text-gray-700 mb-2">
                Your opt-out notice must include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Your full name</li>
                <li>Email address associated with your account</li>
                <li>Statement: "I opt out of the arbitration agreement"</li>
                <li>Date of opt-out notice</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>Important:</strong> If you opt out, you can still use Bella Wedding AI, but disputes will be
                resolved in court (not arbitration). All other terms of the Terms of Service still apply.
              </p>
            </div>
          </section>

          {/* Section 6: Governing Law & Venue */}
          <section id="section-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Governing Law & Legal Venue
            </h2>
            <p className="text-gray-700 mb-4">
              If a dispute is NOT subject to arbitration (either because you opted out, the claim is exempt, or arbitration
              is unenforceable), the following applies:
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Governing Law</h3>
              <p className="text-gray-700">
                These Terms and any disputes will be governed by the laws of the <strong>State of [Your State]</strong>
                {' '}(without regard to conflict of law principles). Federal law applies where applicable (e.g., copyright,
                trademark).
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Exclusive Venue (Where Lawsuits Are Filed)</h3>
              <p className="text-gray-700">
                Any lawsuit that is NOT arbitrated must be filed in the <strong>state or federal courts located in
                [Your County], [Your State]</strong>. You consent to the exclusive jurisdiction and venue of these courts.
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Exception:</strong> If you live in a state that does not allow mandatory venue clauses (e.g.,
                Montana, Idaho for consumer contracts), you may file suit in your home state.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">State-Specific Provisions</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>California Residents:</strong> You may have additional rights under the California Consumer
                Privacy Act (CCPA) and California Civil Code § 1789.3. See our{' '}
                  <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700 underline">
                    Privacy Policy
                  </Link>.</li>

                <li><strong>New York Residents:</strong> New York law applies to residents of New York for consumer
                protection matters.</li>

                <li><strong>New Jersey Residents:</strong> New Jersey may not enforce arbitration clauses for certain
                consumer claims. If prohibited, arbitration does not apply.</li>

                <li><strong>Montana Residents:</strong> Montana law prohibits mandatory venue outside Montana for
                consumer contracts. Lawsuits may be filed in Montana state or federal court.</li>
              </ul>
            </div>
          </section>

          {/* Section 7: Severability */}
          <section id="section-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Severability of Arbitration Provisions
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700">
                If any part of this arbitration agreement is found to be unenforceable, the remaining provisions will
                continue to apply. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                <li>If the <strong>class action waiver</strong> is unenforceable, then any class claims must be litigated
                in court (not arbitration), while individual claims remain in arbitration</li>

                <li>If the <strong>entire arbitration agreement</strong> is unenforceable, then all disputes will be
                resolved in court under Section 6 (Governing Law & Venue)</li>

                <li>If a particular provision is unenforceable, it will be <strong>modified to the minimum extent
                necessary</strong> to make it enforceable, or severed entirely if modification is not possible</li>
              </ul>
            </div>
          </section>

          {/* Severability Clause */}
          <section className="bg-gray-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Severability
            </h2>
            <p className="text-gray-700">
              If any provision of this Arbitration & Dispute Resolution policy is found to be unlawful, void, or
              unenforceable, that provision shall be severed from this policy and shall not affect the validity and
              enforceability of the remaining provisions. This policy is part of and incorporated into our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-champagne-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Questions About Arbitration?
            </h2>
            <p className="text-gray-700">
              If you have questions about arbitration or want to opt out, please contact us at{' '}
              <a href="mailto:legal@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                legal@bellaweddingai.com
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
            <Link href="/arbitration" className="text-champagne-600 hover:text-champagne-700">Arbitration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
