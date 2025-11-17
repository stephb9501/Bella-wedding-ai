'use client';

import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';

export default function ArbitrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Arbitration & Dispute Resolution
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
              IMPORTANT: Binding Arbitration Agreement
            </h2>
            <p className="text-amber-800 leading-relaxed">
              This Arbitration Agreement contains important provisions that affect your legal rights. By using
              Bella Wedding AI, you agree to resolve disputes through binding individual arbitration instead of
              court proceedings. You have the right to opt out within 30 days of account creation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. Agreement to Arbitrate
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You and Bella Wedding AI agree that any dispute, claim, or controversy arising out of or relating
              to these Terms, your use of the platform, or the breach, termination, enforcement, interpretation,
              or validity thereof (collectively, "Disputes") will be resolved through binding arbitration, except
              as specified in Section 5 below.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">This Agreement Covers:</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  * All claims arising from or relating to your use of Bella Wedding AI
                </p>
                <p className="text-gray-700">
                  * Claims regarding billing, payments, refunds, or subscriptions
                </p>
                <p className="text-gray-700">
                  * Claims related to data privacy, security, or breaches
                </p>
                <p className="text-gray-700">
                  * Claims involving AI-generated content or recommendations
                </p>
                <p className="text-gray-700">
                  * Claims regarding vendor interactions or directory listings
                </p>
                <p className="text-gray-700">
                  * Contract disputes and interpretation disagreements
                </p>
                <p className="text-gray-700">
                  * Claims based in contract, tort, statute, fraud, misrepresentation, or other legal theory
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Arbitration Rules and Forum
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.1 Arbitration Provider</h3>
                <p className="text-gray-700 leading-relaxed">
                  Arbitration will be administered by the American Arbitration Association (AAA) under its
                  Consumer Arbitration Rules (the "AAA Rules") then in effect, as modified by this Arbitration
                  Agreement. The AAA Rules are available at www.adr.org or by calling 1-800-778-7879.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.2 Arbitration Procedure</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The arbitration will be conducted by a single neutral arbitrator appointed in accordance with
                  the AAA Rules. The arbitrator will have exclusive authority to:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Resolve any dispute regarding the interpretation or application of this Agreement
                  </p>
                  <p className="text-gray-700">
                    * Determine the arbitrability of any claim
                  </p>
                  <p className="text-gray-700">
                    * Award damages and other relief
                  </p>
                  <p className="text-gray-700">
                    * Issue orders, including for injunctive relief
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.3 Location and Format</h3>
                <p className="text-gray-700 leading-relaxed">
                  Unless you and Bella Wedding AI agree otherwise, arbitration hearings will take place in
                  the county (or parish) where you reside. For claims under $10,000, the arbitration may be
                  conducted through written submissions only, by telephone, or by videoconference at your option.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.4 Arbitration Fees</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Payment of all filing, administration, and arbitrator fees will be governed by the AAA Rules:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * For claims under $75,000: Bella Wedding AI will pay all AAA filing, administration, and
                    arbitrator fees
                  </p>
                  <p className="text-gray-700">
                    * For claims over $75,000: Fees will be allocated according to AAA Rules
                  </p>
                  <p className="text-gray-700">
                    * If arbitrator finds claim frivolous: You may be required to reimburse fees
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.5 Attorney Fees</h3>
                <p className="text-gray-700 leading-relaxed">
                  Each party will be responsible for their own attorney fees unless the arbitrator awards
                  attorney fees to the prevailing party as permitted by applicable law or the AAA Rules.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Class Action Waiver
            </h2>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-rose-900 mb-3">NO CLASS ACTIONS OR REPRESENTATIVE PROCEEDINGS</h3>
              <p className="text-rose-800 leading-relaxed">
                YOU AND BELLA WEDDING AI AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR
                ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS,
                CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">
              Unless both you and Bella Wedding AI agree otherwise in writing, the arbitrator may not:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * Consolidate more than one person's claims
              </p>
              <p className="text-gray-700">
                * Preside over any form of class or representative proceeding
              </p>
              <p className="text-gray-700">
                * Award relief to anyone other than the individual parties
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">
              If a court decides that applicable law precludes enforcement of any of this paragraph's limitations
              as to a particular claim or request for relief, then that claim or request must be severed from the
              arbitration and brought in court, while any remaining claims will proceed in arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Pre-Arbitration Dispute Resolution
            </h2>

            <div className="bg-champagne-50 border border-champagne-300 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Mandatory Informal Resolution Process</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Before initiating arbitration, you must first give us an opportunity to resolve the dispute
                informally by sending a written notice of your claim to:
              </p>

              <div className="bg-white rounded p-4 mb-4">
                <p className="text-gray-700">Bella Wedding AI</p>
                <p className="text-gray-700">Legal Department - Dispute Resolution</p>
                <p className="text-gray-700">Email: disputes@bellaweddingai.com</p>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">Notice Requirements:</h3>
              <div className="space-y-2 mb-4">
                <p className="text-gray-700">* Your name and contact information</p>
                <p className="text-gray-700">* Account email address</p>
                <p className="text-gray-700">* Detailed description of the dispute</p>
                <p className="text-gray-700">* Specific relief sought</p>
                <p className="text-gray-700">* Amount of damages claimed (if applicable)</p>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">Resolution Timeline:</h3>
              <div className="space-y-2">
                <p className="text-gray-700">* We will respond within 30 days of receiving your notice</p>
                <p className="text-gray-700">* Both parties will negotiate in good faith for 60 days</p>
                <p className="text-gray-700">* If unresolved after 60 days, either party may initiate arbitration</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Exceptions to Arbitration
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Notwithstanding the foregoing, the following disputes are NOT subject to arbitration:
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.1 Small Claims Court</h3>
                <p className="text-gray-700">
                  Either party may bring an individual action in small claims court if the claim qualifies
                  and remains in small claims court.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.2 Intellectual Property Claims</h3>
                <p className="text-gray-700">
                  Claims involving intellectual property rights (patents, copyrights, trademarks, trade secrets)
                  may be brought in court.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.3 Injunctive Relief</h3>
                <p className="text-gray-700">
                  Either party may seek injunctive or other equitable relief in court to prevent actual or
                  threatened infringement or misappropriation of intellectual property rights.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.4 Government Actions</h3>
                <p className="text-gray-700">
                  Actions brought by government entities or regulators are not subject to arbitration.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Opt-Out Right (30-Day Window)
            </h2>

            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <h3 className="font-semibold text-green-900 mb-3">YOU HAVE THE RIGHT TO OPT OUT</h3>
              <p className="text-green-800 leading-relaxed mb-4">
                You may opt out of this Arbitration Agreement within 30 days of creating your account by
                sending a written opt-out notice to the address below.
              </p>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">How to Opt Out:</h4>
                <p className="text-gray-700 mb-2">Send email to: optout@bellaweddingai.com</p>
                <p className="text-gray-700 mb-2">Subject Line: "Arbitration Opt-Out"</p>
                <p className="text-gray-700 mb-4">Include:</p>
                <div className="space-y-1 ml-4">
                  <p className="text-gray-700">* Your full name</p>
                  <p className="text-gray-700">* Account email address</p>
                  <p className="text-gray-700">* Account creation date</p>
                  <p className="text-gray-700">* Statement: "I opt out of the Arbitration Agreement"</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded p-4">
                <p className="text-amber-800 font-semibold mb-2">IMPORTANT DEADLINES:</p>
                <p className="text-amber-800">
                  * Opt-out must be received within 30 days of account creation
                </p>
                <p className="text-amber-800">
                  * Late opt-out requests will NOT be honored
                </p>
                <p className="text-amber-800">
                  * Opt-out is permanent and cannot be reversed
                </p>
              </div>

              <p className="text-green-800 leading-relaxed mt-4">
                If you opt out, you retain the right to pursue claims in court. Your opt-out will not affect
                any other terms of our agreement with you.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Governing Law and Venue
            </h2>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">7.1 Governing Law</h3>
                <p className="text-gray-700">
                  This Arbitration Agreement and any arbitration proceeding will be governed by the Federal
                  Arbitration Act (FAA), 9 U.S.C. Section 1, et seq., and federal arbitration law, not state
                  arbitration law.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">7.2 Judicial Review</h3>
                <p className="text-gray-700">
                  Any court proceeding to enforce this Arbitration Agreement or to confirm, modify, or vacate
                  an arbitration award may be brought in any court of competent jurisdiction.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">7.3 Severability</h3>
                <p className="text-gray-700">
                  If any portion of this Arbitration Agreement is found to be unenforceable or unlawful, the
                  remainder of this Agreement will remain in full force and effect.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Arbitration Award and Enforcement
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The arbitrator's decision will be final and binding, except for limited review rights under the FAA:
            </p>

            <div className="space-y-2">
              <p className="text-gray-700">
                * The arbitrator may award the same damages and relief as a court
              </p>
              <p className="text-gray-700">
                * The arbitrator must follow applicable law and these Terms
              </p>
              <p className="text-gray-700">
                * The arbitrator must issue a written decision with findings of fact and law
              </p>
              <p className="text-gray-700">
                * The arbitration award may be entered as a judgment in any court of competent jurisdiction
              </p>
              <p className="text-gray-700">
                * Limited grounds for appeal exist under the FAA (fraud, corruption, misconduct)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Confidentiality
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All aspects of the arbitration proceeding, including the hearing and any documents filed, will
              be confidential. Neither party may disclose the existence, content, or results of any arbitration
              without the prior written consent of both parties, except as required by law or to enforce the
              arbitration award.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              10. Changes to This Agreement
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify this Arbitration Agreement at any time. Changes will be effective 30 days after
              posting on our website. Your continued use of Bella Wedding AI after the effective date constitutes
              acceptance of the modified agreement. Material changes will be communicated via email. You may
              opt out of material changes by following the opt-out process in Section 6 within 30 days of
              notification.
            </p>
          </section>

          <section className="bg-rose-50 border-l-4 border-rose-500 p-6">
            <p className="text-sm text-gray-700 font-semibold mb-3">
              ACKNOWLEDGMENT:
            </p>
            <p className="text-sm text-gray-700">
              BY USING BELLA WEDDING AI, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS ARBITRATION
              AGREEMENT AND AGREE TO BE BOUND BY ITS TERMS. YOU UNDERSTAND THAT YOU ARE GIVING UP YOUR RIGHT
              TO GO TO COURT AND HAVE A JURY TRIAL. YOU MAY OPT OUT WITHIN 30 DAYS AS DESCRIBED IN SECTION 6.
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
