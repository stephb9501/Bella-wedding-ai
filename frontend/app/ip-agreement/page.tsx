'use client';

import Link from 'next/link';
import { FileSignature, ArrowLeft, AlertTriangle, Camera } from 'lucide-react';

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
            <FileSignature className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Media Upload & IP Agreement
              </h1>
              <p className="text-sm text-gray-600 mt-1">Version 1.0 " Effective Date: January 17, 2025</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed">
              By uploading photos, videos, or other content to Bella Wedding AI, you agree to the terms below regarding
              ownership, licensing, and use of your content. This agreement is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
            </p>
          </section>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <Camera className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 mb-2">You Retain Ownership of Your Content</p>
                <p className="text-gray-700">
                  You own all photos, videos, and content you upload. We do NOT claim ownership of your content.
                  However, you grant us a license to use it as described below.
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Ownership & Rights</h2>
            <div className="bg-green-50 rounded-lg p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">Your Content Remains Yours</h3>
              <p className="text-gray-700">
                You retain full ownership of all photos, videos, documents, and other content ("User Content") you upload to
                Bella Wedding AI. We do NOT acquire ownership rights to your content.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">You Must Own or Have Permission</h3>
              <p className="text-gray-700">
                By uploading content, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>You own the content OR have obtained all necessary rights, licenses, and permissions</li>
                <li>The content does NOT infringe on any third-party copyrights, trademarks, or other IP rights</li>
                <li>If the content includes photos of people, you have their consent to upload and share them</li>
                <li>If you hired a photographer, you have obtained rights from them to upload their work</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. License You Grant to Us</h2>
            <p className="text-gray-700 mb-4">
              By uploading content, you grant Bella Wedding AI a <strong>non-exclusive, worldwide, royalty-free license</strong>
              {' '}to use, display, reproduce, and distribute your content for the following purposes:
            </p>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">What We Can Do With Your Content:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Display on Platform:</strong> Show your photos in your account, galleries, and timelines</li>
                <li><strong>Share with Vendors:</strong> If you share content with vendors, we can display it to them</li>
                <li><strong>Backup & Storage:</strong> Store and back up your content on our servers</li>
                <li><strong>Technical Processing:</strong> Resize, compress, or format images for optimal display</li>
                <li><strong>Platform Promotion (Optional):</strong> With your explicit permission, use your photos in
                marketing materials, social media, or blog posts to showcase our platform</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mt-4">
              <h3 className="font-bold text-gray-900 mb-2">What We WILL NOT Do:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>L Sell your photos to third parties</li>
                <li>L Use your photos in ads for other products/services</li>
                <li>L Use your photos for marketing <strong>without your explicit opt-in permission</strong></li>
                <li>L Claim ownership or copyright over your content</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Photographer Rights & Attribution</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">
                <AlertTriangle className="w-5 h-5 inline-block mr-2 text-yellow-600" />
                Important: Check Your Photography Contract
              </h3>
              <p className="text-gray-700 mb-3">
                If you hired a professional photographer, <strong>check your contract</strong> to ensure you have the rights
                to upload their photos to third-party platforms. Some photographers retain exclusive rights to their work.
              </p>
              <p className="text-gray-700">
                <strong>You are responsible</strong> for obtaining necessary permissions from photographers before uploading
                their work. We are NOT liable for copyright infringement if you upload content without proper rights.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Privacy & Sharing Settings</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">You Control Who Sees Your Content</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Private by Default:</strong> Your photos are private unless you choose to share them</li>
                <li><strong>Guest Sharing:</strong> You can share galleries with guests via unique links</li>
                <li><strong>Vendor Sharing:</strong> You can share specific photos with vendors when requesting services</li>
                <li><strong>Public Galleries (Optional):</strong> If we add public gallery features in the future, you can
                opt in to make your gallery public</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>Note:</strong> Once you share a photo with someone (guest, vendor), we cannot control what they do
                with it. Be mindful of what you share.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content Removal & Deletion</h2>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">You Can Delete Your Content Anytime</h3>
              <p className="text-gray-700 mb-3">
                You can delete any photos or content from your account at any time. When you delete content:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>It will be removed from our platform within 30 days</li>
                <li>Backup copies may persist for up to 90 days (for disaster recovery)</li>
                <li>Content shared with vendors or guests may still be in their possession (we cannot delete it from their devices)</li>
                <li>Cached copies on CDNs may take up to 30 days to fully clear</li>
              </ul>
              <p className="text-gray-700 mt-3">
                See our{' '}
                <Link href="/data-retention" className="text-champagne-600 hover:text-champagne-700 underline">
                  Data Retention Policy
                </Link>{' '}
                for details.
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Severability</h2>
            <p className="text-gray-700">
              If any provision of this IP Agreement is found to be unlawful, void, or unenforceable, that provision shall
              be severed and shall not affect the remaining provisions. This agreement is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
            </p>
          </section>

          <div className="text-center pt-8 border-t border-gray-200">
            <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-champagne-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© 2025 Bella Wedding AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
