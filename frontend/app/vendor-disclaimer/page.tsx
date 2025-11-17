'use client';

import Link from 'next/link';
import { Store, ArrowLeft } from 'lucide-react';

export default function VendorDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Vendor Directory Disclaimer
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
              IMPORTANT: Read Before Using Vendor Directory
            </h2>
            <p className="text-amber-800 leading-relaxed">
              Bella Wedding AI provides a vendor directory as a convenience to help you find wedding service
              providers. However, we do NOT vet, endorse, guarantee, or assume responsibility for any vendors
              listed. You must conduct your own due diligence before hiring any vendor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. Nature of Vendor Directory
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">1.1 Information Source Only</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our vendor directory is an informational resource that aggregates publicly available
                  information about wedding service providers. Vendors may be listed through:
                </p>
                <div className="space-y-2 mt-3">
                  <p className="text-gray-700">* Self-registration by vendors</p>
                  <p className="text-gray-700">* Data aggregation from public sources</p>
                  <p className="text-gray-700">* AI-powered search and categorization</p>
                  <p className="text-gray-700">* User submissions and recommendations</p>
                  <p className="text-gray-700">* Third-party directory integrations</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">1.2 No Vetting or Verification</h3>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
                  <p className="text-rose-800 font-semibold mb-3">
                    WE DO NOT VET OR VERIFY VENDORS
                  </p>
                  <p className="text-rose-800 leading-relaxed">
                    Bella Wedding AI does NOT conduct background checks, verify credentials, check licenses,
                    review portfolios, or otherwise vet vendors before listing them in our directory. Inclusion
                    in our directory is NOT an endorsement or recommendation.
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">1.3 Independent Contractors</h3>
                <p className="text-gray-700 leading-relaxed">
                  All vendors listed in our directory are independent businesses and contractors. They are NOT
                  employees, agents, or partners of Bella Wedding AI. We have no control over their business
                  practices, service quality, or conduct.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. No Endorsement or Recommendation
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">What Listing Does NOT Mean:</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    [X] Listing does NOT mean we recommend or endorse the vendor
                  </p>
                  <p className="text-gray-700">
                    [X] Listing does NOT mean we have verified the vendor's qualifications
                  </p>
                  <p className="text-gray-700">
                    [X] Listing does NOT mean we guarantee the vendor's services or quality
                  </p>
                  <p className="text-gray-700">
                    [X] Listing does NOT mean we have a business relationship with the vendor
                  </p>
                  <p className="text-gray-700">
                    [X] Listing does NOT mean the vendor has paid us for placement (unless marked as "Sponsored")
                  </p>
                  <p className="text-gray-700">
                    [X] Listing does NOT mean we have received positive reviews about the vendor
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.1 AI-Generated Recommendations</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Our AI may suggest vendors based on your preferences and requirements. However:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * AI suggestions are algorithmic matches, not quality endorsements
                  </p>
                  <p className="text-gray-700">
                    * AI cannot assess vendor reliability, professionalism, or service quality
                  </p>
                  <p className="text-gray-700">
                    * AI recommendations may be based on incomplete or outdated information
                  </p>
                  <p className="text-gray-700">
                    * Always verify AI suggestions through your own research
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.2 Sponsored Listings</h3>
                <p className="text-gray-700 leading-relaxed">
                  Some vendors may pay for enhanced visibility or "Sponsored" placement in search results.
                  Sponsored listings are clearly marked and do not indicate higher quality or our endorsement.
                  Sponsorship is a paid advertising arrangement only.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Your Due Diligence Responsibilities
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">YOU MUST VERIFY VENDORS YOURSELF</h3>
              <p className="text-blue-800 leading-relaxed">
                Before hiring any vendor from our directory, you are solely responsible for conducting thorough
                due diligence, verification, and background research. Do not rely solely on our directory
                information or AI recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.1 Essential Verification Steps</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Before hiring any vendor, you should:
                </p>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">1. Verify Credentials and Licensing</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Check business licenses and permits</p>
                      <p>* Verify professional certifications</p>
                      <p>* Confirm membership in industry associations</p>
                      <p>* Verify the business is registered and legitimate</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">2. Check Insurance Coverage</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Request proof of liability insurance</p>
                      <p>* Verify insurance is current and adequate</p>
                      <p>* Confirm coverage amounts match your needs</p>
                      <p>* For high-risk services, consider additional coverage</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">3. Research Reviews and References</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Read reviews on multiple independent platforms</p>
                      <p>* Contact previous clients for references</p>
                      <p>* Check Better Business Bureau ratings</p>
                      <p>* Search for complaints or legal issues</p>
                      <p>* Be wary of vendors with no reviews or all perfect reviews</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">4. Review Portfolio and Samples</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Request recent work samples or portfolio</p>
                      <p>* Attend tastings, view venues in person, etc.</p>
                      <p>* Verify photos are their actual work, not stock images</p>
                      <p>* Ask for references from recent events similar to yours</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">5. Conduct Interviews and Meetings</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Meet vendors in person or via video call</p>
                      <p>* Ask detailed questions about their process and experience</p>
                      <p>* Assess professionalism and communication style</p>
                      <p>* Trust your instincts - if something feels wrong, walk away</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">6. Obtain and Review Contracts</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Get all agreements in writing before signing</p>
                      <p>* Have a lawyer review contracts for major vendors</p>
                      <p>* Understand cancellation policies and deposit terms</p>
                      <p>* Clarify what happens if vendor fails to perform</p>
                      <p>* Never pay in full upfront without strong protections</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">7. Verify Pricing and Payment Terms</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Get detailed written quotes</p>
                      <p>* Compare pricing with multiple vendors</p>
                      <p>* Understand all fees, charges, and potential overages</p>
                      <p>* Use secure payment methods with buyer protection</p>
                      <p>* Be suspicious of prices that seem too good to be true</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">8. Check for Red Flags</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>* Pressure tactics or urgent deadlines</p>
                      <p>* Requests for cash-only payments</p>
                      <p>* Unwillingness to provide contracts or references</p>
                      <p>* Poor communication or unprofessional behavior</p>
                      <p>* Negative reviews or complaints about similar issues</p>
                      <p>* Refusal to meet in person or show work samples</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Accuracy of Vendor Information
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.1 Information May Be Inaccurate</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Vendor directory information may be:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Outdated or no longer current</p>
                  <p className="text-gray-700">* Incomplete or missing important details</p>
                  <p className="text-gray-700">* Provided by vendors without verification</p>
                  <p className="text-gray-700">* Inaccurate due to vendor error or misrepresentation</p>
                  <p className="text-gray-700">* Changed since the vendor's last update</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.2 No Guarantee of Availability</h3>
                <p className="text-gray-700 leading-relaxed">
                  Listings do not guarantee that a vendor is currently accepting clients, has availability
                  for your date, or is still in business. Always contact vendors directly to confirm
                  availability and current offerings.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.3 Pricing Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any pricing information displayed is approximate, may be outdated, and should not be relied
                  upon. Always obtain current written quotes directly from vendors. Actual prices may vary
                  significantly based on your specific requirements, date, and location.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Limitation of Liability
            </h2>

            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-4">
              <h3 className="font-semibold text-rose-900 mb-3">WE ARE NOT LIABLE FOR VENDOR ISSUES</h3>
              <p className="text-rose-800 leading-relaxed">
                To the maximum extent permitted by law, Bella Wedding AI is NOT responsible or liable for any
                issues, disputes, damages, or losses arising from your interactions with or use of vendors
                listed in our directory.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.1 What We Are NOT Liable For</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We are NOT responsible for:
                </p>

                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Vendor quality, performance, or professionalism
                  </p>
                  <p className="text-gray-700">
                    * Vendors who fail to show up, cancel, or don't perform as promised
                  </p>
                  <p className="text-gray-700">
                    * Disputes between you and vendors
                  </p>
                  <p className="text-gray-700">
                    * Poor service quality or results below your expectations
                  </p>
                  <p className="text-gray-700">
                    * Vendor fraud, theft, or criminal activity
                  </p>
                  <p className="text-gray-700">
                    * Breach of contract by vendors
                  </p>
                  <p className="text-gray-700">
                    * Damages to property or injury caused by vendors
                  </p>
                  <p className="text-gray-700">
                    * Financial losses from vendor failures or cancellations
                  </p>
                  <p className="text-gray-700">
                    * Inaccurate vendor information or misrepresentation
                  </p>
                  <p className="text-gray-700">
                    * Vendor pricing disputes or unexpected charges
                  </p>
                  <p className="text-gray-700">
                    * Vendor bankruptcy or business closure
                  </p>
                  <p className="text-gray-700">
                    * Any other issues arising from vendor relationships
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.2 Your Sole Recourse</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you have issues with a vendor, your dispute is with the vendor directly, not with Bella
                  Wedding AI. You must resolve disputes, seek refunds, or pursue legal action against the
                  vendor, not us. We are not a party to your vendor contracts.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.3 No Mediation or Dispute Resolution</h3>
                <p className="text-gray-700 leading-relaxed">
                  We do not mediate disputes between users and vendors, nor do we provide dispute resolution
                  services. Contact the vendor directly, or seek legal counsel if needed.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. User Reviews and Ratings
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">6.1 User-Generated Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  Reviews and ratings in our vendor directory are user-generated content. We do not verify
                  the accuracy of reviews, and reviews may be biased, fake, or manipulated. Do not rely
                  solely on our platform's reviews when evaluating vendors.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">6.2 Review Multiple Sources</h3>
                <p className="text-gray-700 leading-relaxed">
                  Always check vendor reviews across multiple independent platforms (Google, Yelp, WeddingWire,
                  The Knot, etc.) to get a comprehensive view of vendor reputation.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">6.3 Fake Reviews</h3>
                <p className="text-gray-700 leading-relaxed">
                  While we attempt to prevent fake reviews, vendors may post fake positive reviews or
                  competitors may post fake negative reviews. Use critical thinking when evaluating reviews.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Reporting Vendor Issues
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">7.1 How to Report Problems</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  If you experience serious issues with a vendor from our directory, please report it:
                </p>

                <div className="bg-champagne-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">Email: vendors@bellaweddingai.com</p>
                  <p className="text-gray-700 mb-2">Subject: Vendor Issue Report</p>
                  <p className="text-gray-700 mb-4">Include:</p>
                  <div className="space-y-1 ml-4">
                    <p className="text-gray-700">* Vendor name and contact information</p>
                    <p className="text-gray-700">* Detailed description of the issue</p>
                    <p className="text-gray-700">* Supporting documentation (contracts, emails, etc.)</p>
                    <p className="text-gray-700">* Date of incident</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">7.2 What We May Do</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Investigate serious complaints about vendors
                  </p>
                  <p className="text-gray-700">
                    * Remove vendors with multiple serious complaints
                  </p>
                  <p className="text-gray-700">
                    * Add warning labels to vendor profiles
                  </p>
                  <p className="text-gray-700">
                    * Ban vendors who engage in fraud or illegal activity
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed mt-3">
                  However, removal of a vendor from our directory does not constitute compensation, does not
                  resolve your dispute, and does not make us liable for vendor issues.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Vendor Responsibilities
            </h2>

            <div className="space-y-3">
              <p className="text-gray-700 leading-relaxed mb-3">
                Vendors listed in our directory are solely responsible for:
              </p>

              <div className="space-y-2">
                <p className="text-gray-700">* Accuracy of their profile information</p>
                <p className="text-gray-700">* Compliance with all applicable laws and regulations</p>
                <p className="text-gray-700">* Maintaining proper licenses, permits, and insurance</p>
                <p className="text-gray-700">* Honoring contracts and commitments to clients</p>
                <p className="text-gray-700">* Providing services as advertised</p>
                <p className="text-gray-700">* Professional and ethical business conduct</p>
                <p className="text-gray-700">* Resolving client disputes and complaints</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Changes to This Disclaimer
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Vendor Directory Disclaimer at any time. Changes will be posted on this page
              with a revised "Effective Date." Your continued use of the vendor directory after changes
              constitutes acceptance of the updated disclaimer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              10. Contact Information
            </h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">For vendor directory questions or to report issues:</p>
              <p className="text-gray-700 mb-2">Email: vendors@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: Vendor Directory Inquiry</p>
              <p className="text-gray-700">Response Time: 3-5 business days</p>
            </div>
          </section>

          <section className="bg-amber-50 border-l-4 border-amber-500 p-6">
            <p className="text-sm text-gray-700 font-semibold mb-3">
              FINAL WARNING:
            </p>
            <p className="text-sm text-gray-700">
              By using the Bella Wedding AI vendor directory, you acknowledge that you have read, understood,
              and agree to this Vendor Directory Disclaimer. You understand that vendor listings are provided
              "as-is" without warranty, that we do not vet or endorse vendors, and that you are solely
              responsible for conducting due diligence before hiring any vendor. You agree to hold Bella
              Wedding AI harmless from any disputes, damages, or losses arising from vendor relationships.
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
