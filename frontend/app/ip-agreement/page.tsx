'use client';

import Link from 'next/link';
import { Upload, ArrowLeft } from 'lucide-react';

export default function IPAgreementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Upload className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Media Upload & IP Agreement
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
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This Media Upload and Intellectual Property Agreement governs the content you upload to Bella
              Wedding AI, including photos, videos, documents, and other media. By uploading content, you
              represent that you own or have the necessary rights to the content and grant us certain licenses
              to use that content as described below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Your Ownership of Content
            </h2>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-4">
              <h3 className="font-semibold text-green-900 mb-3">YOU OWN YOUR CONTENT</h3>
              <p className="text-green-800 leading-relaxed">
                You retain all ownership rights to the content you upload to Bella Wedding AI. We do not claim
                ownership of your photos, videos, documents, or other materials. Your content remains yours.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.1 What You Own</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * All photos, videos, and images you upload
                  </p>
                  <p className="text-gray-700">
                    * Documents, contracts, and written materials you create
                  </p>
                  <p className="text-gray-700">
                    * Guest lists, timelines, and planning data you enter
                  </p>
                  <p className="text-gray-700">
                    * Notes, ideas, and custom content you generate
                  </p>
                  <p className="text-gray-700">
                    * Any creative works you upload or create on our platform
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">2.2 What We Own</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * The Bella Wedding AI platform, software, and technology
                  </p>
                  <p className="text-gray-700">
                    * Our AI models, algorithms, and proprietary systems
                  </p>
                  <p className="text-gray-700">
                    * Platform design, user interface, and branding
                  </p>
                  <p className="text-gray-700">
                    * Pre-loaded templates, checklists, and sample content
                  </p>
                  <p className="text-gray-700">
                    * Vendor directory data and platform features
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. License Grant to Bella Wedding AI
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">Why We Need a License</h3>
              <p className="text-blue-800 leading-relaxed">
                To provide our services, we need permission to store, process, display, and transmit your
                content. The license you grant us is limited to what is necessary to operate the platform
                and provide you with wedding planning services.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.1 License Scope</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  By uploading content to Bella Wedding AI, you grant us a worldwide, non-exclusive,
                  royalty-free, sublicensable, and transferable license to:
                </p>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Store and Host</h4>
                    <p className="text-gray-700">
                      Store your content on our servers and backup systems to ensure availability and
                      prevent data loss.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Display and Transmit</h4>
                    <p className="text-gray-700">
                      Display your content back to you on any device you use to access Bella Wedding AI
                      (computer, phone, tablet).
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Process and Modify</h4>
                    <p className="text-gray-700">
                      Process your content as necessary to provide features like image resizing, format
                      conversion, thumbnail generation, and AI analysis.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Reproduce and Distribute</h4>
                    <p className="text-gray-700">
                      Create copies for backup, caching, and content delivery network (CDN) distribution
                      to improve performance.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Analyze (Aggregated)</h4>
                    <p className="text-gray-700">
                      Analyze content in aggregate and anonymized form to improve AI features, detect
                      trends, and enhance platform functionality.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.2 License Limitations</h3>

                <div className="bg-amber-50 border border-amber-300 rounded-lg p-6">
                  <h4 className="font-semibold text-amber-900 mb-3">What We Will NOT Do:</h4>
                  <div className="space-y-2">
                    <p className="text-amber-800">
                      [X] We will NOT use your personal wedding photos for advertising without permission
                    </p>
                    <p className="text-amber-800">
                      [X] We will NOT sell your images to third parties
                    </p>
                    <p className="text-amber-800">
                      [X] We will NOT publicly display your content without your consent
                    </p>
                    <p className="text-amber-800">
                      [X] We will NOT license your content to other companies
                    </p>
                    <p className="text-amber-800">
                      [X] We will NOT use your content in ways unrelated to providing our services
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.3 License Duration</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The license you grant us:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Begins when you upload content
                  </p>
                  <p className="text-gray-700">
                    * Continues while your account is active
                  </p>
                  <p className="text-gray-700">
                    * Ends 30 days after you delete content or close your account
                  </p>
                  <p className="text-gray-700">
                    * May continue for backup copies until backups expire (max 90 days)
                  </p>
                  <p className="text-gray-700">
                    * Continues indefinitely for anonymized, aggregated analytics data
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Your Representations and Warranties
            </h2>

            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-4">
              <h3 className="font-semibold text-rose-900 mb-3">IMPORTANT: You Are Responsible for Your Uploads</h3>
              <p className="text-rose-800 leading-relaxed">
                By uploading content, you legally promise and guarantee that you have the right to upload
                that content. Violations may result in legal liability.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed mb-3">
                When you upload content to Bella Wedding AI, you represent and warrant that:
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="text-champagne-600 font-bold">1.</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">You Own or Have Rights</h3>
                    <p className="text-gray-700">
                      You are either the copyright owner or have obtained all necessary licenses, permissions,
                      and rights to upload and use the content.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-champagne-600 font-bold">2.</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">No Third-Party Rights Violation</h3>
                    <p className="text-gray-700">
                      Your content does not infringe or violate any copyright, trademark, patent, privacy
                      right, publicity right, or other intellectual property or legal right of any third party.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-champagne-600 font-bold">3.</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Consent from People Depicted</h3>
                    <p className="text-gray-700">
                      You have obtained consent from all individuals who appear in photos or videos to upload
                      and share their likeness on Bella Wedding AI.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-champagne-600 font-bold">4.</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Photographer/Videographer Rights</h3>
                    <p className="text-gray-700">
                      If content was created by a professional photographer or videographer, you have obtained
                      permission to upload and use the content on digital platforms.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-champagne-600 font-bold">5.</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lawful Content</h3>
                    <p className="text-gray-700">
                      Your content does not violate any law, regulation, or our Terms of Service, and is not
                      illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-champagne-600 font-bold">6.</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">No Malicious Code</h3>
                    <p className="text-gray-700">
                      Your content does not contain viruses, malware, or other harmful code that could damage
                      or disrupt our platform or other users' devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Professional Photography Considerations
            </h2>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-amber-900 mb-3">WARNING: Check Your Photography Contract</h3>
              <p className="text-amber-800 leading-relaxed">
                Many wedding photographers retain copyright to their photos and restrict digital use. Before
                uploading professional photos, review your photography contract or contact your photographer
                for permission.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.1 Common Photography Restrictions</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Photographers often own copyright even if you paid for the photos
                  </p>
                  <p className="text-gray-700">
                    * Contracts may prohibit uploading to third-party platforms
                  </p>
                  <p className="text-gray-700">
                    * Some photographers require attribution or watermark preservation
                  </p>
                  <p className="text-gray-700">
                    * Commercial use may require additional licensing fees
                  </p>
                  <p className="text-gray-700">
                    * Editing or modifying photos may be prohibited
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.2 Best Practices</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Review your photography contract before uploading
                  </p>
                  <p className="text-gray-700">
                    * Contact your photographer to request digital use permission
                  </p>
                  <p className="text-gray-700">
                    * Preserve watermarks and copyright notices if required
                  </p>
                  <p className="text-gray-700">
                    * Only upload photos you have explicit permission to share
                  </p>
                  <p className="text-gray-700">
                    * When in doubt, use your own smartphone photos instead
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Privacy Rights and Consent
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">6.1 People in Your Photos/Videos</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  If your content includes recognizable people, you must:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Obtain consent before uploading photos or videos of others
                  </p>
                  <p className="text-gray-700">
                    * Respect privacy rights and publicity rights of individuals
                  </p>
                  <p className="text-gray-700">
                    * Be especially careful with photos of minors (children)
                  </p>
                  <p className="text-gray-700">
                    * Remove photos if someone requests their image be taken down
                  </p>
                  <p className="text-gray-700">
                    * Not upload photos that invade privacy or cause embarrassment
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">6.2 Minors (Children)</h3>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <p className="text-rose-800 font-semibold mb-2">Special Protection for Children:</p>
                  <p className="text-rose-800">
                    If your content includes images of minors (anyone under 18), you must have explicit
                    permission from their parent or legal guardian before uploading. We may remove content
                    featuring minors without consent.
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">6.3 Removal Requests</h3>
                <p className="text-gray-700 leading-relaxed">
                  If someone appears in your uploaded content and requests removal, you must delete the
                  content promptly or we may remove it for you. Privacy rights take precedence over your
                  convenience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Content Restrictions
            </h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed mb-3">
                You may NOT upload content that:
              </p>

              <div className="space-y-2">
                <p className="text-gray-700">
                  * Infringes copyright, trademark, or other intellectual property rights
                </p>
                <p className="text-gray-700">
                  * Contains pornography, nudity, or sexually explicit material
                </p>
                <p className="text-gray-700">
                  * Is violent, hateful, discriminatory, or promotes illegal activity
                </p>
                <p className="text-gray-700">
                  * Violates privacy or publicity rights of others
                </p>
                <p className="text-gray-700">
                  * Contains personal information of others without consent
                </p>
                <p className="text-gray-700">
                  * Is defamatory, harassing, threatening, or abusive
                </p>
                <p className="text-gray-700">
                  * Contains malware, viruses, or harmful code
                </p>
                <p className="text-gray-700">
                  * Was obtained illegally or through unauthorized access
                </p>
                <p className="text-gray-700">
                  * Violates any applicable law or regulation
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Content Removal and Takedowns
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">8.1 Our Right to Remove Content</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We reserve the right to remove any content that:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Violates this agreement or our Terms of Service</p>
                  <p className="text-gray-700">* Infringes intellectual property rights</p>
                  <p className="text-gray-700">* Is subject to a valid DMCA takedown notice</p>
                  <p className="text-gray-700">* Violates privacy or publicity rights</p>
                  <p className="text-gray-700">* Is inappropriate, offensive, or harmful</p>
                  <p className="text-gray-700">* Poses security or legal risks to us or other users</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">8.2 How to Report Infringing Content</h3>
                <div className="bg-champagne-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">Email: dmca@bellaweddingai.com</p>
                  <p className="text-gray-700 mb-2">Subject: Copyright Infringement Report</p>
                  <p className="text-gray-700">See our DMCA Policy for detailed procedures</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Indemnification
            </h2>

            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to indemnify, defend, and hold harmless Bella Wedding AI, our officers, directors,
                employees, and agents from any claims, damages, losses, liabilities, and expenses (including
                attorney fees) arising from:
              </p>

              <div className="space-y-2">
                <p className="text-gray-700">* Your uploaded content</p>
                <p className="text-gray-700">* Your violation of this agreement</p>
                <p className="text-gray-700">* Your infringement of third-party rights</p>
                <p className="text-gray-700">* Your violation of applicable laws</p>
                <p className="text-gray-700">* Claims by third parties regarding your content</p>
              </div>

              <p className="text-gray-700 leading-relaxed mt-4">
                In simple terms: If someone sues us because of content you uploaded, you are responsible for
                the legal consequences and costs.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              10. Data Portability and Deletion
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">10.1 Download Your Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You can download your uploaded content at any time through Settings -> Privacy -> Download
                  My Data. We provide your content in portable formats (ZIP archive).
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">10.2 Delete Your Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You can delete individual files or your entire account at any time. Deleted content is
                  removed from active systems within 48 hours and from backups within 90 days. See our Data
                  Retention Policy for details.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              11. Changes to This Agreement
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Media Upload and IP Agreement from time to time. Changes will be posted on
              this page with a revised "Effective Date." Material changes will be communicated via email.
              Continued uploading of content after changes constitutes acceptance of the updated agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              12. Contact Information
            </h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">For questions about content rights or to report issues:</p>
              <p className="text-gray-700 mb-2">Email: legal@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: Media Upload and IP Inquiry</p>
              <p className="text-gray-700">Response Time: 3-5 business days</p>
            </div>
          </section>

          <section className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <p className="text-sm text-gray-700 font-semibold mb-3">
              ACKNOWLEDGMENT:
            </p>
            <p className="text-sm text-gray-700">
              By uploading content to Bella Wedding AI, you acknowledge that you have read, understood, and
              agree to this Media Upload and Intellectual Property Agreement. You confirm that you have the
              necessary rights to upload your content and grant us the licenses described herein.
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
