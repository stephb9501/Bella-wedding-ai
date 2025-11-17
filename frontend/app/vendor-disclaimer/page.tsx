'use client';

import Link from 'next/link';
import { Store, ArrowLeft, AlertTriangle, ShieldAlert, UserX, DollarSign, FileText } from 'lucide-react';

export default function VendorDisclaimerPage() {
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
            <Store className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Vendor Directory Disclaimer
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
              <ShieldAlert className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 text-lg mb-2">
                  IMPORTANT: Third-Party Vendor Directory
                </p>
                <p className="text-gray-700">
                  Bella Wedding AI provides a vendor directory as a convenience to help you find wedding professionals.
                  <strong> We are NOT responsible for the quality, reliability, or actions of third-party vendors.</strong>
                  {' '}By using our vendor directory, you acknowledge and accept the risks and disclaimers described below.
                </p>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              This Vendor Directory Disclaimer explains the relationship between Bella Wedding AI, the vendors listed in
              our directory, and you (the user). This disclaimer is part of our{' '}
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
              <li><a href="#section-1" className="hover:underline">Vendor Directory Explained</a></li>
              <li><a href="#section-2" className="hover:underline">We Are NOT a Vendor Marketplace</a></li>
              <li><a href="#section-3" className="hover:underline">No Vetting, Endorsement, or Guarantee</a></li>
              <li><a href="#section-4" className="hover:underline">Your Responsibilities</a></li>
              <li><a href="#section-5" className="hover:underline">Vendor Listings & Accuracy</a></li>
              <li><a href="#section-6" className="hover:underline">Pricing, Availability & Bookings</a></li>
              <li><a href="#section-7" className="hover:underline">Disputes with Vendors</a></li>
              <li><a href="#section-8" className="hover:underline">Limitation of Liability</a></li>
            </ol>
          </section>

          {/* Section 1: Vendor Directory Explained */}
          <section id="section-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Vendor Directory Explained
            </h2>
            <p className="text-gray-700 mb-4">
              Bella Wedding AI provides a vendor directory where wedding professionals (photographers, venues, caterers, DJs,
              florists, etc.) can create profiles and connect with couples planning weddings.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">What the Vendor Directory Does:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Allows vendors to create free or paid profiles showcasing their services</li>
                <li>Lets couples search for vendors by category, location, and style</li>
                <li>Facilitates initial contact between couples and vendors through our platform</li>
                <li>Provides a centralized place to browse vendor portfolios and reviews (if available)</li>
              </ul>
            </div>
          </section>

          {/* Section 2: We Are NOT a Vendor Marketplace */}
          <section id="section-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserX className="w-6 h-6 text-red-600" />
              2. We Are NOT a Vendor Marketplace
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-4">
              <p className="font-bold text-gray-900 mb-2">
                Bella Wedding AI is NOT a Marketplace or Booking Platform
              </p>
              <p className="text-gray-700">
                We <strong>do NOT</strong> facilitate payments, handle bookings, or act as an intermediary in transactions
                between you and vendors. We simply provide a directory for discovery and initial contact. All contracts,
                payments, and agreements are <strong>directly between you and the vendor</strong>.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">We Do NOT:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Process payments for vendor services (you pay vendors directly)</li>
                <li>Create or enforce contracts between you and vendors</li>
                <li>Hold escrow or act as a payment processor</li>
                <li>Mediate disputes or provide arbitration services</li>
                <li>Guarantee vendor performance, quality, or availability</li>
                <li>Provide insurance or bonding for vendor services</li>
              </ul>
            </div>
          </section>

          {/* Section 3: No Vetting, Endorsement, or Guarantee */}
          <section id="section-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              3. No Vetting, Endorsement, or Guarantee
            </h2>

            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-2">We Do NOT Vet or Background Check Vendors</h3>
                <p className="text-gray-700">
                  Vendors in our directory are <strong>self-registered</strong>. We do NOT perform background checks,
                  verify credentials, check references, or validate vendor claims. Vendors provide their own information,
                  and we do NOT verify its accuracy.
                </p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-2">Listing Does NOT Equal Endorsement</h3>
                <p className="text-gray-700">
                  The presence of a vendor in our directory does <strong>NOT constitute an endorsement, recommendation,
                  or guarantee</strong> by Bella Wedding AI. We do NOT vouch for the quality, reliability, professionalism,
                  or legitimacy of any vendor.
                </p>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-2">No Guarantee of Quality or Performance</h3>
                <p className="text-gray-700">
                  We make <strong>NO GUARANTEES</strong> about:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>The quality of vendor services</li>
                  <li>Whether vendors will fulfill their obligations</li>
                  <li>Vendor professionalism, reliability, or reputation</li>
                  <li>Whether vendors are properly licensed, insured, or bonded</li>
                  <li>Vendor pricing, availability, or contract terms</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Your Responsibilities */}
          <section id="section-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Your Responsibilities When Hiring Vendors
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>You are solely responsible</strong> for vetting, selecting, and contracting with vendors. By using
              our vendor directory, you agree to take the following precautions:
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded space-y-3">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">1. Conduct Your Own Due Diligence</h3>
                <p className="text-gray-700">
                  <strong>Research vendors thoroughly</strong> before hiring them. Check online reviews, ask for references,
                  verify credentials, and confirm they are licensed/insured if required by local law.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">2. Verify Vendor Information</h3>
                <p className="text-gray-700">
                  Do NOT assume vendor profile information is accurate. <strong>Verify all details</strong> (pricing,
                  availability, services, experience) directly with the vendor before making decisions.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">3. Read and Understand Contracts</h3>
                <p className="text-gray-700">
                  <strong>Always get a written contract</strong> from vendors. Read it carefully, understand cancellation
                  policies, and consider having an attorney review it for expensive services.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">4. Confirm Insurance and Licensing</h3>
                <p className="text-gray-700">
                  Ask vendors for proof of liability insurance and any required licenses or certifications. This is especially
                  important for venues, caterers, and transportation providers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">5. Use Secure Payment Methods</h3>
                <p className="text-gray-700">
                  Pay vendors using secure, traceable methods (credit card, check, PayPal). <strong>Avoid cash or wire
                  transfers</strong> to vendors you haven't thoroughly vetted. Never pay the full amount upfront.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">6. Meet Vendors in Person or Video Call</h3>
                <p className="text-gray-700">
                  Whenever possible, meet vendors in person or via video call before signing contracts. This helps verify
                  their legitimacy and professionalism.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Vendor Listings & Accuracy */}
          <section id="section-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Vendor Listings & Accuracy of Information
            </h2>
            <p className="text-gray-700 mb-4">
              Vendor profiles and listings are created and managed by the vendors themselves. We do NOT verify the accuracy
              of vendor-provided information.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Vendor Information May Be Inaccurate or Outdated:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Portfolio Photos:</strong> Vendors upload their own photos, which we do NOT verify as authentic
                or owned by them</li>
                <li><strong>Pricing:</strong> Displayed prices may be outdated, estimates, or not include all fees.
                Always get written quotes directly from vendors</li>
                <li><strong>Availability:</strong> Vendor availability shown on profiles may not be real-time. Confirm
                availability directly with the vendor</li>
                <li><strong>Reviews:</strong> Reviews may be biased, fake, or manipulated. Use independent review platforms
                (Google, Yelp, The Knot) for additional perspectives</li>
                <li><strong>Credentials:</strong> Vendors may claim certifications, licenses, or experience that we have
                NOT verified. Verify credentials independently</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Pricing, Availability & Bookings */}
          <section id="section-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              6. Pricing, Availability & Bookings
            </h2>

            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Pricing is NOT Guaranteed</h3>
                <p className="text-gray-700">
                  Prices displayed in vendor profiles are <strong>estimates only</strong> and NOT binding quotes. Actual
                  prices may vary based on your specific needs, date, location, and other factors. <strong>Always get a
                  written quote</strong> from the vendor before committing.
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Availability is NOT Real-Time</h3>
                <p className="text-gray-700">
                  Vendor calendars and availability shown on our platform may <strong>NOT be updated in real-time</strong>.
                  A vendor showing as "available" may have already been booked. <strong>Always confirm availability
                  directly</strong> with the vendor.
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">We Do NOT Process Bookings or Payments</h3>
                <p className="text-gray-700">
                  All bookings, contracts, deposits, and payments are handled <strong>directly between you and the vendor</strong>.
                  We are NOT involved in the transaction. If you pay a vendor and they fail to deliver, <strong>we are NOT
                  liable</strong> for refunds or damages.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Disputes with Vendors */}
          <section id="section-7">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Disputes with Vendors
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-4">
              <p className="font-bold text-gray-900 mb-2">
                We Are NOT Responsible for Vendor Disputes
              </p>
              <p className="text-gray-700">
                If you have a dispute with a vendor (poor service, no-show, contract violation, fraud, etc.), <strong>you
                must resolve it directly with the vendor</strong>. Bella Wedding AI is NOT a party to your agreement with
                vendors and does NOT mediate, arbitrate, or resolve disputes.
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">What to Do If You Have a Problem with a Vendor:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Contact the vendor directly to resolve the issue</li>
                <li>Review your contract for dispute resolution procedures</li>
                <li>If unresolved, consult an attorney or small claims court</li>
                <li>File a complaint with your local Better Business Bureau (BBB) or consumer protection agency</li>
                <li>Dispute credit card charges if applicable (if you paid by credit card)</li>
                <li>Report suspected fraud to local law enforcement</li>
              </ol>
              <p className="text-gray-700 mt-4">
                <strong>Note:</strong> You may report problematic vendors to us at{' '}
                <a href="mailto:support@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                  support@bellaweddingai.com
                </a>, and we may investigate and remove vendors who violate our{' '}
                <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                  Terms of Service
                </Link>. However, we do NOT provide refunds or compensation for vendor disputes.
              </p>
            </div>
          </section>

          {/* Section 8: Limitation of Liability */}
          <section id="section-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Limitation of Liability
            </h2>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mb-4">
              <p className="font-bold text-gray-900 mb-2 uppercase">
                Disclaimer of Warranties
              </p>
              <p className="text-gray-700">
                The vendor directory is provided <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> without
                warranties of any kind. We do NOT warrant that vendor information is accurate, complete, or up-to-date.
              </p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded mb-4">
              <p className="font-bold text-gray-900 mb-2 uppercase">
                Limitation of Liability
              </p>
              <p className="text-gray-700 mb-3">
                <strong>We are NOT liable</strong> for any damages, losses, or harm arising from your use of or reliance
                on our vendor directory or your interactions with vendors. This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Vendor fraud, scams, or misrepresentation</li>
                <li>Poor quality vendor services or no-shows</li>
                <li>Vendor contract violations or breaches</li>
                <li>Lost deposits, payments, or financial losses</li>
                <li>Emotional distress, ruined weddings, or missed events</li>
                <li>Injuries, property damage, or other harm caused by vendors</li>
                <li>Inaccurate vendor information (pricing, availability, credentials)</li>
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
                By using the vendor directory, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>You understand vendors are third parties NOT controlled by Bella Wedding AI</li>
                <li>You will conduct your own due diligence before hiring vendors</li>
                <li>You assume all risks when contracting with vendors</li>
                <li>Bella Wedding AI is NOT liable for vendor actions, performance, or disputes</li>
                <li>You will NOT hold us responsible for vendor-related issues</li>
              </ul>
            </div>
          </section>

          {/* Severability Clause */}
          <section className="bg-gray-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Severability
            </h2>
            <p className="text-gray-700">
              If any provision of this Vendor Directory Disclaimer is found to be unlawful, void, or unenforceable, that
              provision shall be severed from this disclaimer and shall not affect the validity and enforceability of the
              remaining provisions. This disclaimer is part of and incorporated into our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-champagne-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Questions About Vendors?
            </h2>
            <p className="text-gray-700">
              If you have questions about our vendor directory or need to report a problematic vendor, please contact us at{' '}
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
