'use client';

import Link from 'next/link';
import { Copyright, ArrowLeft } from 'lucide-react';

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Copyright className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                DMCA Copyright Policy
              </h1>
              <p className="text-sm text-gray-600 mt-1">Version 1.0 - Effective Date: January 17, 2025</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. Overview
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bella Wedding AI respects the intellectual property rights of others and expects our users to do
              the same. This Digital Millennium Copyright Act (DMCA) Copyright Policy explains our procedures
              for responding to claims of copyright infringement and our policy regarding repeat infringers.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
              <h3 className="font-semibold text-blue-900 mb-2">What is the DMCA?</h3>
              <p className="text-blue-800 leading-relaxed">
                The Digital Millennium Copyright Act (DMCA) is a United States copyright law that provides a
                process for copyright owners to request removal of infringing content from online platforms.
                We comply with the DMCA and respond to valid takedown notices.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Copyright Infringement Notification (Takedown Request)
            </h2>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-amber-900 mb-3">Before Filing a DMCA Notice</h3>
              <p className="text-amber-800 leading-relaxed">
                Please consider whether the use of copyrighted material may be protected by fair use, fair
                dealing, or similar exceptions under copyright law. False or fraudulent DMCA claims may result
                in legal liability.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.1 Required Information</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To file a valid DMCA takedown notice, you must provide the following information in writing:
                </p>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">1. Identification of Copyrighted Work</p>
                      <p className="text-gray-700 text-sm">
                        Describe the copyrighted work you claim has been infringed. If multiple works are
                        covered by a single notification, provide a representative list.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">2. Identification of Infringing Material</p>
                      <p className="text-gray-700 text-sm">
                        Provide the specific URL(s) or location(s) of the allegedly infringing material on
                        Bella Wedding AI. Be as specific as possible.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">3. Contact Information</p>
                      <p className="text-gray-700 text-sm">
                        Your full name, mailing address, telephone number, and email address.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">4. Good Faith Statement</p>
                      <p className="text-gray-700 text-sm">
                        A statement that you have a good faith belief that the disputed use is not authorized
                        by the copyright owner, its agent, or the law.
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">5. Accuracy Statement</p>
                      <p className="text-gray-700 text-sm">
                        A statement, under penalty of perjury, that the information in your notice is accurate
                        and that you are the copyright owner or authorized to act on their behalf.
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">6. Physical or Electronic Signature</p>
                      <p className="text-gray-700 text-sm">
                        Your physical or electronic signature (typing your full name is acceptable).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.2 How to Submit a DMCA Notice</h3>

                <div className="bg-champagne-50 border border-champagne-200 rounded-lg p-6">
                  <p className="font-semibold text-gray-900 mb-3">Send your DMCA notice to our designated agent:</p>

                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Copyright Agent:</span> DMCA Compliance Officer
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Email:</span> dmca@bellaweddingai.com
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Subject Line:</span> DMCA Takedown Request
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Response Time:</span> We review notices within 2-5 business days
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.3 Sample DMCA Notice Template</h3>

                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                  <p className="text-gray-700 mb-2">To: dmca@bellaweddingai.com</p>
                  <p className="text-gray-700 mb-2">Subject: DMCA Takedown Request</p>
                  <p className="text-gray-700 mb-4">---</p>
                  <p className="text-gray-700 mb-2">1. Copyrighted work: [Description of your copyrighted work]</p>
                  <p className="text-gray-700 mb-2">2. Infringing material located at: [URL(s)]</p>
                  <p className="text-gray-700 mb-2">3. Contact information:</p>
                  <p className="text-gray-700 ml-4 mb-2">Name: [Your name]</p>
                  <p className="text-gray-700 ml-4 mb-2">Address: [Your address]</p>
                  <p className="text-gray-700 ml-4 mb-2">Phone: [Your phone]</p>
                  <p className="text-gray-700 ml-4 mb-2">Email: [Your email]</p>
                  <p className="text-gray-700 mb-2">4. Good faith statement: I have a good faith belief that the use of the material is not authorized.</p>
                  <p className="text-gray-700 mb-2">5. Accuracy statement: Under penalty of perjury, the information in this notice is accurate and I am authorized to act.</p>
                  <p className="text-gray-700">6. Signature: [Your signature/typed name]</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Our Response to DMCA Notices
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.1 Review Process</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Upon receiving a valid DMCA notice, we will:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Review the notice for completeness within 2 business days</p>
                  <p className="text-gray-700">* Verify that all required elements are present</p>
                  <p className="text-gray-700">* Contact you if additional information is needed</p>
                  <p className="text-gray-700">* Take action on valid notices within 5 business days</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.2 Actions We May Take</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Remove or disable access to the allegedly infringing content
                  </p>
                  <p className="text-gray-700">
                    * Notify the user who posted the content about the takedown
                  </p>
                  <p className="text-gray-700">
                    * Provide the user with a copy of your DMCA notice (may include your contact information)
                  </p>
                  <p className="text-gray-700">
                    * Document the infringement for repeat infringer policy purposes
                  </p>
                  <p className="text-gray-700">
                    * Suspend or terminate accounts of repeat infringers
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.3 Invalid or Incomplete Notices</h3>
                <p className="text-gray-700 leading-relaxed">
                  Notices that do not include all required information will not be processed. We will notify
                  you of deficiencies and provide an opportunity to resubmit a complete notice.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Counter-Notification (Dispute a Takedown)
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">If Your Content Was Removed</h3>
              <p className="text-blue-800 leading-relaxed">
                If you believe content you posted was wrongly removed due to a DMCA notice, you may file a
                counter-notification. However, filing a counter-notification has legal consequences and may
                result in legal proceedings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.1 Required Information for Counter-Notice</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">1. Your Contact Information</p>
                      <p className="text-gray-700 text-sm">
                        Your name, address, phone number, and email address
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">2. Identification of Material</p>
                      <p className="text-gray-700 text-sm">
                        Describe the material that was removed and where it appeared before removal
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">3. Good Faith Statement</p>
                      <p className="text-gray-700 text-sm">
                        A statement under penalty of perjury that you have a good faith belief the material
                        was removed due to mistake or misidentification
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">4. Consent to Jurisdiction</p>
                      <p className="text-gray-700 text-sm">
                        A statement consenting to the jurisdiction of the federal court in your district (or
                        where Bella Wedding AI is located if outside the US)
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">5. Acceptance of Service</p>
                      <p className="text-gray-700 text-sm">
                        A statement that you will accept service of process from the person who filed the
                        original DMCA notice
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">6. Physical or Electronic Signature</p>
                      <p className="text-gray-700 text-sm">
                        Your physical or electronic signature
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.2 How to Submit a Counter-Notice</h3>

                <div className="bg-champagne-50 border border-champagne-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-3">Send your counter-notification to:</p>
                  <p className="text-gray-700 mb-2">Email: dmca@bellaweddingai.com</p>
                  <p className="text-gray-700 mb-2">Subject Line: DMCA Counter-Notification</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.3 Counter-Notice Process</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * We forward your counter-notice to the original complainant
                  </p>
                  <p className="text-gray-700">
                    * The complainant has 10 business days to file a legal action
                  </p>
                  <p className="text-gray-700">
                    * If no legal action is filed, we may restore the content after 10-14 business days
                  </p>
                  <p className="text-gray-700">
                    * If legal action is filed, the matter proceeds in court
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mt-4">
              <p className="text-rose-800 font-semibold mb-2">WARNING:</p>
              <p className="text-rose-800">
                Filing a false counter-notification may result in legal liability for damages, attorney fees,
                and costs. Only file a counter-notice if you have a good faith belief that the content was
                removed by mistake or misidentification.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Repeat Infringer Policy
            </h2>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-amber-900 mb-3">Zero Tolerance for Repeat Infringers</h3>
              <p className="text-amber-800 leading-relaxed">
                Bella Wedding AI maintains a policy of terminating accounts of users who are repeat copyright
                infringers. We take copyright infringement seriously and will permanently ban users who
                repeatedly violate intellectual property rights.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.1 What Constitutes a Repeat Infringer</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  A repeat infringer is a user who:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Has received two or more valid DMCA takedown notices
                  </p>
                  <p className="text-gray-700">
                    * Has had content removed for copyright infringement on multiple occasions
                  </p>
                  <p className="text-gray-700">
                    * Continues to upload infringing content after warnings
                  </p>
                  <p className="text-gray-700">
                    * Demonstrates a pattern of disregard for intellectual property rights
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.2 Progressive Enforcement</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">First Infringement:</p>
                      <p className="text-gray-700 text-sm">
                        Content removed, user notified, warning issued
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Second Infringement:</p>
                      <p className="text-gray-700 text-sm">
                        Content removed, final warning issued, upload privileges suspended for 30 days
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">Third Infringement:</p>
                      <p className="text-gray-700 text-sm">
                        Account permanently terminated, all content removed, no refunds issued
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.3 Appeals</h3>
                <p className="text-gray-700 leading-relaxed">
                  Users who believe they were wrongly designated as repeat infringers may appeal by emailing
                  appeals@bellaweddingai.com with evidence supporting their claim. Appeals are reviewed within
                  10 business days.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. User Responsibilities
            </h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed">
                All users of Bella Wedding AI must:
              </p>

              <div className="space-y-2">
                <p className="text-gray-700">
                  * Only upload content you own or have permission to use
                </p>
                <p className="text-gray-700">
                  * Respect copyright, trademark, and other intellectual property rights
                </p>
                <p className="text-gray-700">
                  * Obtain proper licenses for commercial images, music, or videos
                </p>
                <p className="text-gray-700">
                  * Give credit to creators when using content under Creative Commons or similar licenses
                </p>
                <p className="text-gray-700">
                  * Remove content immediately if you receive a valid takedown notice
                </p>
                <p className="text-gray-700">
                  * Understand that uploading copyrighted material without permission may have legal consequences
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Limitations and Disclaimers
            </h2>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">7.1 No Duty to Monitor</h3>
                <p className="text-gray-700 leading-relaxed">
                  Bella Wedding AI has no obligation to monitor user-uploaded content for copyright
                  infringement. We respond to valid DMCA notices but do not proactively screen content.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">7.2 No Legal Advice</h3>
                <p className="text-gray-700 leading-relaxed">
                  This policy provides information but does not constitute legal advice. Consult an attorney
                  for legal guidance regarding copyright matters.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">7.3 Not Responsible for User Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  We are not responsible for copyright infringement by our users. Users are solely responsible
                  for ensuring their uploads comply with copyright law.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. False Claims and Misrepresentation
            </h2>

            <div className="bg-rose-50 border-l-4 border-rose-500 p-6">
              <h3 className="font-semibold text-rose-900 mb-3">Legal Consequences of False Claims</h3>
              <p className="text-rose-800 leading-relaxed mb-3">
                Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents:
              </p>
              <div className="space-y-2">
                <p className="text-rose-800">
                  * That material is infringing, or
                </p>
                <p className="text-rose-800">
                  * That material was removed or disabled by mistake
                </p>
              </div>
              <p className="text-rose-800 leading-relaxed mt-3">
                May be liable for damages, including costs and attorney fees. Do not file false or fraudulent
                DMCA notices or counter-notices.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Contact Information
            </h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4 font-semibold">
                DMCA Designated Agent:
              </p>
              <p className="text-gray-700 mb-2">Name: DMCA Compliance Officer</p>
              <p className="text-gray-700 mb-2">Email: dmca@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: DMCA Takedown Request or DMCA Counter-Notification</p>
              <p className="text-gray-700">Response Time: 2-5 business days</p>
            </div>
          </section>

          <section className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <p className="text-sm text-gray-700">
              This DMCA Copyright Policy is part of our Terms of Service. By using Bella Wedding AI, you agree
              to comply with this policy and respect the intellectual property rights of others.
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
