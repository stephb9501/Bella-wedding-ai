'use client';

import Link from 'next/link';
import { Cookie, ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Cookie className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Cookie Policy
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
            <p className="text-gray-700 leading-relaxed mb-4">
              Bella Wedding AI uses cookies and similar tracking technologies to provide, improve, and protect
              our services. This Cookie Policy explains what cookies are, how we use them, what types of cookies
              we use, and how you can manage your cookie preferences.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
              <h3 className="font-semibold text-blue-900 mb-2">What Are Cookies?</h3>
              <p className="text-blue-800 leading-relaxed">
                Cookies are small text files that are placed on your device (computer, smartphone, tablet) when
                you visit a website. Cookies help websites remember your preferences, understand how you use the
                site, and provide personalized experiences.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Types of Cookies We Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bella Wedding AI uses four main categories of cookies:
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">2.1 Strictly Necessary Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies are essential for the website to function properly. Without these cookies, our
                  services cannot be provided.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Purpose:</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">* Authentication and login sessions</p>
                    <p className="text-gray-700">* Security and fraud prevention</p>
                    <p className="text-gray-700">* Load balancing and site performance</p>
                    <p className="text-gray-700">* Shopping cart and checkout functionality</p>
                    <p className="text-gray-700">* Form submission and validation</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <div className="space-y-2">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-gray-900 font-medium">session_id</p>
                      <p className="text-gray-600 text-sm">Duration: Session (deleted when browser closes)</p>
                      <p className="text-gray-600 text-sm">Purpose: Maintains your login state</p>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-gray-900 font-medium">csrf_token</p>
                      <p className="text-gray-600 text-sm">Duration: Session</p>
                      <p className="text-gray-600 text-sm">Purpose: Protects against cross-site request forgery</p>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">load_balancer</p>
                      <p className="text-gray-600 text-sm">Duration: Session</p>
                      <p className="text-gray-600 text-sm">Purpose: Routes requests to appropriate server</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mt-3 italic">
                  Note: These cookies cannot be disabled as they are necessary for the platform to work.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">2.2 Functional Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies enable enhanced functionality and personalization. They may be set by us or by
                  third-party providers whose services we use.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Purpose:</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">* Remember your preferences and settings</p>
                    <p className="text-gray-700">* Language and region selection</p>
                    <p className="text-gray-700">* Theme preferences (light/dark mode)</p>
                    <p className="text-gray-700">* Previously entered form data</p>
                    <p className="text-gray-700">* Video player settings</p>
                    <p className="text-gray-700">* Chat widget functionality</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <div className="space-y-2">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-gray-900 font-medium">user_preferences</p>
                      <p className="text-gray-600 text-sm">Duration: 1 year</p>
                      <p className="text-gray-600 text-sm">Purpose: Stores your display and feature preferences</p>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-gray-900 font-medium">language_preference</p>
                      <p className="text-gray-600 text-sm">Duration: 1 year</p>
                      <p className="text-gray-600 text-sm">Purpose: Remembers your language choice</p>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">cookie_consent</p>
                      <p className="text-gray-600 text-sm">Duration: 1 year</p>
                      <p className="text-gray-600 text-sm">Purpose: Records your cookie preferences</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">2.3 Analytics and Performance Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies collect information about how visitors use our website. All information is
                  aggregated and anonymous.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Purpose:</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">* Understand which pages are most popular</p>
                    <p className="text-gray-700">* Identify errors and technical issues</p>
                    <p className="text-gray-700">* Measure site performance and load times</p>
                    <p className="text-gray-700">* Analyze user behavior and navigation patterns</p>
                    <p className="text-gray-700">* A/B testing and feature optimization</p>
                    <p className="text-gray-700">* Improve user experience</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Third-Party Analytics:</h4>
                  <div className="space-y-2">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-gray-900 font-medium">Google Analytics</p>
                      <p className="text-gray-600 text-sm">Cookies: _ga, _gid, _gat</p>
                      <p className="text-gray-600 text-sm">Duration: 2 years (_ga), 24 hours (_gid)</p>
                      <p className="text-gray-600 text-sm">Purpose: Track usage statistics and visitor behavior</p>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Hotjar (if applicable)</p>
                      <p className="text-gray-600 text-sm">Cookies: _hjid, _hjSessionUser</p>
                      <p className="text-gray-600 text-sm">Duration: 1 year</p>
                      <p className="text-gray-600 text-sm">Purpose: Heatmaps and user session recordings</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">2.4 Advertising and Marketing Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  These cookies track your browsing habits to deliver relevant advertisements and measure
                  advertising campaign effectiveness.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Purpose:</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">* Display relevant ads based on your interests</p>
                    <p className="text-gray-700">* Limit the number of times you see an ad</p>
                    <p className="text-gray-700">* Measure advertising campaign effectiveness</p>
                    <p className="text-gray-700">* Retargeting and remarketing</p>
                    <p className="text-gray-700">* Social media integration and sharing</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Third-Party Advertising:</h4>
                  <div className="space-y-2">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-gray-900 font-medium">Google Ads</p>
                      <p className="text-gray-600 text-sm">Cookies: _gcl_au, IDE</p>
                      <p className="text-gray-600 text-sm">Duration: 90 days</p>
                      <p className="text-gray-600 text-sm">Purpose: Conversion tracking and ad personalization</p>
                    </div>
                    <div className="border-b border-gray-200 pb-2">
                      <p className="text-gray-900 font-medium">Facebook Pixel</p>
                      <p className="text-gray-600 text-sm">Cookies: _fbp, fr</p>
                      <p className="text-gray-600 text-sm">Duration: 90 days</p>
                      <p className="text-gray-600 text-sm">Purpose: Track conversions and build custom audiences</p>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Pinterest Tag (if applicable)</p>
                      <p className="text-gray-600 text-sm">Cookies: _pinterest_ct</p>
                      <p className="text-gray-600 text-sm">Duration: 1 year</p>
                      <p className="text-gray-600 text-sm">Purpose: Pinterest advertising and analytics</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Other Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In addition to cookies, we may use other tracking technologies:
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Local Storage</h3>
                <p className="text-gray-700">
                  HTML5 local storage allows websites to store data locally in your browser. We use local storage
                  for caching, offline functionality, and storing non-sensitive user preferences.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Web Beacons (Pixels)</h3>
                <p className="text-gray-700">
                  Small transparent images embedded in web pages or emails that track whether content has been
                  viewed. Used for email open rates and campaign effectiveness.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Session Storage</h3>
                <p className="text-gray-700">
                  Similar to local storage but deleted when the browser session ends. Used for temporary data
                  during your visit.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">ETags and Cache Headers</h3>
                <p className="text-gray-700">
                  HTTP headers that help browsers cache resources efficiently, improving site performance.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Managing Your Cookie Preferences
            </h2>

            <div className="bg-champagne-50 border-l-4 border-champagne-500 p-6 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">You Have Control Over Cookies</h3>
              <p className="text-gray-700 leading-relaxed">
                You can manage your cookie preferences through browser settings, our cookie consent tool,
                or third-party opt-out mechanisms.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.1 Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Most web browsers allow you to control cookies through settings:
                </p>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-gray-900">Chrome:</p>
                    <p className="text-gray-700 text-sm">
                      Settings -> Privacy and security -> Cookies and other site data
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-gray-900">Firefox:</p>
                    <p className="text-gray-700 text-sm">
                      Options -> Privacy & Security -> Cookies and Site Data
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-gray-900">Safari:</p>
                    <p className="text-gray-700 text-sm">
                      Preferences -> Privacy -> Manage Website Data
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <p className="font-semibold text-gray-900">Edge:</p>
                    <p className="text-gray-700 text-sm">
                      Settings -> Cookies and site permissions -> Manage and delete cookies
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.2 Our Cookie Consent Tool</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  When you first visit Bella Wedding AI, you'll see a cookie consent banner. You can:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Accept all cookies</p>
                  <p className="text-gray-700">* Reject non-essential cookies</p>
                  <p className="text-gray-700">* Customize your preferences by category</p>
                  <p className="text-gray-700">* Access cookie settings anytime from the footer link</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.3 Third-Party Opt-Out</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Opt out of third-party advertising cookies:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Google Ads: Visit Google Ads Settings (adssettings.google.com)
                  </p>
                  <p className="text-gray-700">
                    * Facebook: Visit Facebook Ad Preferences
                  </p>
                  <p className="text-gray-700">
                    * Network Advertising Initiative: www.networkadvertising.org/choices
                  </p>
                  <p className="text-gray-700">
                    * Digital Advertising Alliance: www.aboutads.info/choices
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.4 Do Not Track</h3>
                <p className="text-gray-700 leading-relaxed">
                  Some browsers have a "Do Not Track" (DNT) feature. Currently, there is no industry standard
                  for DNT signals. We do not currently respond to DNT signals, but you can use other methods
                  to control tracking.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mt-4">
              <h3 className="font-semibold text-amber-900 mb-2">Important Note:</h3>
              <p className="text-amber-800">
                Blocking or deleting cookies may impact your experience on Bella Wedding AI. Some features
                may not work properly if you disable functional cookies. Strictly necessary cookies cannot
                be disabled.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Cookie Retention and Deletion
            </h2>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Lifespans</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">* Session cookies: Deleted when you close your browser</p>
                  <p className="text-gray-700">* Persistent cookies: Remain until expiration or manual deletion</p>
                  <p className="text-gray-700">* Typical duration: 24 hours to 2 years depending on purpose</p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">How to Delete Cookies</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">* Use your browser's clear browsing data feature</p>
                  <p className="text-gray-700">* Delete cookies from specific websites only</p>
                  <p className="text-gray-700">* Use private/incognito browsing mode (cookies deleted after session)</p>
                  <p className="text-gray-700">* Set browser to automatically delete cookies on exit</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Updates to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy periodically to reflect changes in our practices or legal
              requirements. Updates will be posted on this page with a revised "Effective Date." Material
              changes will be communicated through email or prominent notice on our platform. Your continued
              use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about our use of cookies or to exercise your privacy rights:
            </p>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">Email: privacy@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: Cookie Policy Inquiry</p>
              <p className="text-gray-700">Response Time: 3-5 business days</p>
            </div>
          </section>

          <section className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <p className="text-sm text-gray-700">
              By using Bella Wedding AI, you consent to the use of cookies as described in this Cookie Policy.
              You can manage your cookie preferences at any time through browser settings or our cookie
              consent tool.
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
