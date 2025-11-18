'use client';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50">
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet" />

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <a href="/" className="text-rose-600 hover:text-rose-700 mb-6 inline-flex items-center gap-2 font-semibold">
          ← Back to Home
        </a>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 mt-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-2"><strong>Version 1.0</strong></p>
          <p className="text-gray-600 mb-8"><strong>Last Updated:</strong> January 17, 2025</p>

          {/* Table of Contents */}
          <div className="bg-champagne-50 border-l-4 border-rose-500 p-6 mb-8 rounded">
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Table of Contents
            </h2>
            <ol className="space-y-2 text-sm text-gray-700">
              <li><a href="#section-1" className="text-rose-600 hover:text-rose-700 hover:underline">1. Acceptance of Terms</a></li>
              <li><a href="#section-2" className="text-rose-600 hover:text-rose-700 hover:underline">2. Incorporation of Policies</a></li>
              <li><a href="#section-3" className="text-rose-600 hover:text-rose-700 hover:underline">3. Eligibility & Age Requirement</a></li>
              <li><a href="#section-4" className="text-rose-600 hover:text-rose-700 hover:underline">4. Service Description</a></li>
              <li><a href="#section-5" className="text-rose-600 hover:text-rose-700 hover:underline">5. Modification of Terms</a></li>
              <li><a href="#section-6" className="text-rose-600 hover:text-rose-700 hover:underline">6. User Accounts & Responsibilities</a></li>
              <li><a href="#section-7" className="text-rose-600 hover:text-rose-700 hover:underline">7. Subscription & Payment Terms</a></li>
              <li><a href="#section-8" className="text-rose-600 hover:text-rose-700 hover:underline">8. Warranty Disclaimers</a></li>
              <li><a href="#section-9" className="text-rose-600 hover:text-rose-700 hover:underline">9. Limitation of Liability</a></li>
              <li><a href="#section-10" className="text-rose-600 hover:text-rose-700 hover:underline">10. Indemnification</a></li>
              <li><a href="#section-11" className="text-rose-600 hover:text-rose-700 hover:underline">11. Intellectual Property</a></li>
              <li><a href="#section-12" className="text-rose-600 hover:text-rose-700 hover:underline">12. DMCA & Copyright Policy</a></li>
              <li><a href="#section-13" className="text-rose-600 hover:text-rose-700 hover:underline">13. Arbitration & Dispute Resolution</a></li>
              <li><a href="#section-14" className="text-rose-600 hover:text-rose-700 hover:underline">14. Export Compliance</a></li>
              <li><a href="#section-15" className="text-rose-600 hover:text-rose-700 hover:underline">15. Entire Agreement & Severability</a></li>
              <li><a href="#section-16" className="text-rose-600 hover:text-rose-700 hover:underline">16. Contact Information</a></li>
            </ol>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            {/* Section 1 */}
            <section id="section-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                1. ACCEPTANCE OF TERMS
              </h2>
              <p className="mb-4">
                By accessing, browsing, or using the Bella Wedding AI platform (the "Service"), whether through our website at bellaweddingai.com, mobile applications, or any related services (collectively, the "Platform"), you ("User," "you," or "your") acknowledge that you have read, understood, and agree to be bound by these Terms of Service (these "Terms"), including all policies incorporated herein by reference.
              </p>
              <p className="mb-4 font-bold text-gray-900">
                IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS SERVICE.
              </p>
              <p>
                Your use of the Service constitutes your legally binding acceptance of these Terms. If you are using the Service on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
              </p>
            </section>

            {/* Section 2 */}
            <section id="section-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                2. INCORPORATION OF POLICIES
              </h2>
              <p className="mb-4">
                These Terms incorporate the following policies by reference, all of which are binding and enforceable as if fully set forth herein:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><a href="/privacy" className="text-rose-600 hover:underline">Privacy Policy</a> - How we collect, use, and protect your data</li>
                <li><a href="/cookies" className="text-rose-600 hover:underline">Cookie & Tracking Policy</a> - Our use of cookies and tracking technologies</li>
                <li><a href="/acceptable-use" className="text-rose-600 hover:underline">Acceptable Use Policy</a> - Prohibited activities and conduct</li>
                <li><a href="/ai-disclaimer" className="text-rose-600 hover:underline">AI Disclaimer</a> - Limitations and accuracy of AI-generated content</li>
                <li><a href="/ip-agreement" className="text-rose-600 hover:underline">Media Upload & Intellectual Property Agreement</a> - Rights to uploaded content</li>
                <li><a href="/beta-agreement" className="text-rose-600 hover:underline">Beta Tester Agreement</a> - Terms for beta/early tester participants</li>
                <li><a href="/vendor-disclaimer" className="text-rose-600 hover:underline">Vendor Directory Disclaimer</a> - Limitations on vendor relationships</li>
                <li><a href="/refund-policy" className="text-rose-600 hover:underline">Refund & Cancellation Policy</a> - Payment and refund terms</li>
                <li><a href="/data-retention" className="text-rose-600 hover:underline">Data Retention & Deletion Policy</a> - How long we keep your data</li>
                <li><a href="/arbitration" className="text-rose-600 hover:underline">Arbitration & Legal Venue</a> - Dispute resolution procedures</li>
                <li><a href="/dmca" className="text-rose-600 hover:underline">DMCA/Copyright Policy</a> - Copyright infringement procedures</li>
              </ul>
              <p>
                All incorporated policies are available on our Platform and are subject to the same modification procedures as these Terms.
              </p>
            </section>

            {/* Section 3 */}
            <section id="section-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                3. ELIGIBILITY & AGE REQUIREMENT
              </h2>
              <p className="mb-4 font-bold text-gray-900">
                You must be at least 18 years old (or the age of majority in your jurisdiction, whichever is older) to use this Service.
              </p>
              <p className="mb-4">By using the Service, you represent and warrant that:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You are 18 years of age or older</li>
                <li>You have the legal capacity to enter into a binding agreement</li>
                <li>You are not prohibited by law from using the Service</li>
                <li>All information you provide is accurate and current</li>
              </ul>
              <p className="mb-4">
                We reserve the right to request proof of age and to suspend or terminate accounts that violate this requirement.
              </p>
              <p className="font-bold text-gray-900">
                We do not knowingly collect information from minors. If we discover that a minor has created an account, we will promptly delete it.
              </p>
            </section>

            {/* Section 8 - Warranty Disclaimers */}
            <section id="section-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                8. WARRANTY DISCLAIMERS
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-4 rounded">
                <p className="font-bold text-gray-900 mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS," "AS AVAILABLE," AND "WITH ALL FAULTS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </p>
                <p className="font-bold text-gray-900">
                  WE EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Warranties of merchantability</strong> - No guarantee the Service is suitable for commerce</li>
                <li><strong>Warranties of fitness for a particular purpose</strong> - No guarantee the Service meets your specific wedding planning needs</li>
                <li><strong>Warranties of non-infringement</strong> - No guarantee that use of the Service will not violate third-party rights</li>
                <li><strong>Warranties of accuracy, completeness, or reliability</strong> - AI suggestions, vendor information, and all content may contain errors</li>
                <li><strong>Warranties of availability or uptime</strong> - The Service may be interrupted, delayed, or unavailable</li>
                <li><strong>Warranties regarding AI output</strong> - AI-generated content may be inaccurate, biased, incomplete, or unsuitable</li>
                <li><strong>Warranties regarding third parties</strong> - We do not warrant the quality, reliability, or performance of any vendor or third-party service</li>
                <li><strong>Warranties of data security</strong> - While we implement security measures, no system is 100% secure</li>
              </ul>
              <p className="font-bold text-gray-900 mb-2">
                YOU ASSUME ALL RISK associated with your use of the Service.
              </p>
              <p className="text-sm italic">
                Some jurisdictions do not allow the exclusion of implied warranties. In such jurisdictions, the above exclusions may not apply to you, and our liability will be limited to the maximum extent permitted by law.
              </p>
            </section>

            {/* Section 9 - Limitation of Liability */}
            <section id="section-9">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                9. LIMITATION OF LIABILITY
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-4 rounded">
                <p className="font-bold text-gray-900 mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                </p>
                <p className="mb-3">
                  OUR TOTAL LIABILITY TO YOU FOR ANY AND ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE SERVICE IS LIMITED TO THE GREATER OF:
                </p>
                <p className="font-bold">
                  (A) The total amount you paid to us in the 12 months preceding the claim, OR<br/>
                  (B) $100 USD if you are on a free tier or have paid $0
                </p>
              </div>
              <p className="mb-4 font-bold text-gray-900">
                WE SHALL NOT BE LIABLE FOR ANY:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Lost profits, revenue, business opportunities, or data</li>
                <li>Loss of use, savings, or goodwill</li>
                <li>Emotional distress, reputational harm, or personal injury</li>
                <li>Costs of procurement of substitute services</li>
                <li>Damages arising from errors in AI-generated content</li>
                <li>Vendor performance, quality, disputes, or non-performance</li>
                <li>Third-party services, integrations, or external websites</li>
                <li>Wedding planning outcomes or event quality</li>
              </ul>
              <p className="text-sm italic">
                These limitations apply even if any limited remedy fails of its essential purpose. Some jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, so the above limitations may not apply to you.
              </p>
            </section>

            {/* Section 13 - Arbitration */}
            <section id="section-13">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                13. ARBITRATION & DISPUTE RESOLUTION
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-4 rounded">
                <p className="font-bold text-gray-900 mb-2">
                  IMPORTANT: This section contains a binding arbitration agreement and class action waiver. It affects your legal rights. Please read it carefully.
                </p>
              </div>
              <p className="mb-4">
                You and Bella Wedding AI agree that any dispute, claim, or controversy arising out of or relating to these Terms or your use of the Service (including threshold questions of arbitrability) <strong>shall be resolved exclusively through binding individual arbitration</strong> rather than in court, except as provided below.
              </p>
              <p className="mb-4">
                Arbitration shall be conducted by the <strong>American Arbitration Association (AAA)</strong> under its Consumer Arbitration Rules then in effect. The arbitration will be held in <strong>Arkansas</strong> or remotely via video conference.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Class Action Waiver</h3>
              <p className="mb-4 font-bold text-gray-900">
                YOU AND BELLA WEDDING AI AGREE THAT EACH PARTY MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.
              </p>
              <p className="mb-4">You waive the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Participate in a class action lawsuit</li>
                <li>Participate in a class-wide arbitration</li>
                <li>Bring consolidated or representative claims</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Jury Trial Waiver</h3>
              <p className="mb-4 font-bold text-gray-900">
                YOU AND BELLA WEDDING AI WAIVE THE RIGHT TO A TRIAL BY JURY.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">30-Day Opt-Out Right</h3>
              <p className="mb-4">
                You have <strong>30 days from your first acceptance of these Terms</strong> to opt out of this arbitration agreement by sending written notice to:
              </p>
              <div className="bg-gray-100 p-4 rounded mb-4">
                <p className="mb-1">Bella Wedding AI, LLC</p>
                <p className="mb-1">Arbitration Opt-Out</p>
                <p className="mb-1">Email: legal@bellaweddingai.com</p>
              </div>
              <p className="mb-4">
                Include your name, email, and a clear statement that you wish to opt out of the arbitration agreement. If you opt out, all other Terms still apply.
              </p>

              <p className="text-sm">
                <strong>Full details:</strong> See our <a href="/arbitration" className="text-rose-600 hover:underline">Arbitration & Legal Venue Policy</a>
              </p>
            </section>

            {/* Section 15 - Severability */}
            <section id="section-15">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                15. ENTIRE AGREEMENT & SEVERABILITY
              </h2>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Entire Agreement</h3>
              <p className="mb-4">
                These Terms, together with all incorporated policies, constitute the entire agreement between you and Bella Wedding AI regarding the Service and supersede all prior or contemporaneous communications, whether oral or written.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3">Severability</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4 rounded">
                <p className="font-bold text-gray-900 mb-2">
                  IMPORTANT FOR ENFORCEABILITY:
                </p>
                <p>
                  If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be <strong>severed</strong> from these Terms and shall not affect the validity and enforceability of the remaining provisions.
                </p>
              </div>
              <p className="mb-4">
                The unenforceable provision shall be replaced with an enforceable provision that most closely reflects the original intent.
              </p>
              <p>
                This means: <strong>If a court throws out one part (e.g., arbitration clause), all other parts (liability limits, disclaimers, etc.) still apply.</strong>
              </p>
            </section>

            {/* Section 16 - Contact */}
            <section id="section-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                16. CONTACT INFORMATION
              </h2>
              <p className="mb-4">
                For questions, concerns, or notices regarding these Terms:
              </p>
              <div className="bg-gray-100 p-6 rounded">
                <p className="mb-2"><strong>Bella Wedding AI, LLC</strong></p>
                <p className="mb-2">Email: support@bellaweddingai.com</p>
                <p className="mb-2">Legal Notices: legal@bellaweddingai.com</p>
                <p>Website: https://bellaweddingai.com</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <div className="bg-rose-50 border-2 border-rose-500 p-6 rounded-lg mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                ACKNOWLEDGMENT
              </h2>
              <p className="mb-3 font-bold text-gray-900">
                BY CLICKING "I AGREE," CREATING AN ACCOUNT, OR USING THE SERVICE, YOU ACKNOWLEDGE THAT:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>You have read and understood these Terms in their entirety</li>
                <li>You agree to be legally bound by these Terms and all incorporated policies</li>
                <li>You are 18 years of age or older</li>
                <li>You understand and accept the warranty disclaimers and liability limitations</li>
                <li>You agree to binding arbitration and waive your right to a jury trial and class actions</li>
                <li>You consent to the processing of your data as described in our Privacy Policy</li>
              </ol>
              <p className="mt-4 font-bold text-gray-900">
                IF YOU DO NOT AGREE, DO NOT USE THIS SERVICE.
              </p>
            </div>

          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2025 Bella Wedding AI, LLC • All Rights Reserved</p>
            <p className="mt-2">
              <a href="/" className="text-rose-600 hover:underline">Back to Home</a> •
              <a href="/privacy" className="text-rose-600 hover:underline ml-2">Privacy Policy</a> •
              <a href="/contact" className="text-rose-600 hover:underline ml-2">Contact Us</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
