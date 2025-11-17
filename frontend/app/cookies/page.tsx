'use client';

import Link from 'next/link';
import { Cookie, ArrowLeft, Settings, Eye, TrendingUp, FileText } from 'lucide-react';

export default function CookiePolicyPage() {
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
            <Cookie className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Cookie & Tracking Policy
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

          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              Bella Wedding AI uses cookies and similar tracking technologies to improve your experience on our platform,
              analyze usage, and personalize content. This Cookie Policy explains what cookies are, how we use them, and
              how you can control them. This policy should be read together with our{' '}
              <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700 underline">
                Privacy Policy
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
              <li><a href="#section-1" className="hover:underline">What Are Cookies?</a></li>
              <li><a href="#section-2" className="hover:underline">Types of Cookies We Use</a></li>
              <li><a href="#section-3" className="hover:underline">Third-Party Cookies</a></li>
              <li><a href="#section-4" className="hover:underline">How to Manage Cookies</a></li>
              <li><a href="#section-5" className="hover:underline">Other Tracking Technologies</a></li>
              <li><a href="#section-6" className="hover:underline">Do Not Track Signals</a></li>
            </ol>
          </section>

          {/* Section 1: What Are Cookies? */}
          <section id="section-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-champagne-600" />
              1. What Are Cookies?
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>Cookies</strong> are small text files that are placed on your device (computer, smartphone, tablet)
              when you visit a website. Cookies help websites remember your preferences, login status, and other information
              to improve your experience.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Types of Cookies by Duration:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser. These are
                used for essential functions like keeping you logged in during a session.</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period (or until you
                delete them). These remember your preferences across multiple visits.</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Types of Cookies We Use */}
          <section id="section-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Types of Cookies We Use
            </h2>
            <p className="text-gray-700 mb-4">
              We use the following categories of cookies on Bella Wedding AI:
            </p>

            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-red-600" />
                  Essential Cookies (Required)
                </h3>
                <p className="text-gray-700 mb-2">
                  These cookies are <strong>necessary</strong> for the platform to function properly. They enable core
                  features like logging in, accessing your account, and maintaining security. You <strong>cannot disable</strong>
                  {' '}essential cookies without breaking the platform.
                </p>
                <div className="bg-white rounded p-4 mt-3">
                  <p className="font-bold text-gray-900 mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Authentication:</strong> Cookies that keep you logged in (e.g., <code>supabase-auth-token</code>)</li>
                    <li><strong>Security:</strong> Cookies that protect against fraud and CSRF attacks</li>
                    <li><strong>Load Balancing:</strong> Cookies that route your requests to the correct server</li>
                    <li><strong>Session Management:</strong> Cookies that track your current session state</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Legal Basis:</strong> Necessary for contract performance (providing the service)
                  </p>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-2">
                  Functional Cookies (Optional)
                </h3>
                <p className="text-gray-700 mb-2">
                  These cookies remember your preferences and settings to enhance your experience. You can disable these,
                  but the platform may not remember your preferences.
                </p>
                <div className="bg-white rounded p-4 mt-3">
                  <p className="font-bold text-gray-900 mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Language Preference:</strong> Remembers your chosen language</li>
                    <li><strong>Theme Settings:</strong> Remembers if you prefer light/dark mode</li>
                    <li><strong>Timezone:</strong> Remembers your timezone for displaying dates/times correctly</li>
                    <li><strong>Dashboard Layout:</strong> Remembers your customized dashboard layout</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Legal Basis:</strong> Legitimate interest / Consent (opt-out available)
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Analytics & Performance Cookies (Optional)
                </h3>
                <p className="text-gray-700 mb-2">
                  These cookies help us understand how users interact with our platform so we can improve it. They collect
                  <strong> anonymized data</strong> about page views, clicks, and user behavior.
                </p>
                <div className="bg-white rounded p-4 mt-3">
                  <p className="font-bold text-gray-900 mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Google Analytics:</strong> Tracks page views, session duration, bounce rate (anonymized)</li>
                    <li><strong>Mixpanel:</strong> Tracks feature usage and user flows (anonymized)</li>
                    <li><strong>Performance Monitoring:</strong> Tracks page load times and errors</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Legal Basis:</strong> Consent (you can opt out via browser settings or cookie banner)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Data Shared With:</strong> Google LLC, Mixpanel Inc. (see{' '}
                    <Link href="/privacy" className="text-champagne-600 hover:text-champagne-700 underline">
                      Privacy Policy
                    </Link> for details)
                  </p>
                </div>
              </div>

              {/* Advertising Cookies */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Advertising & Targeting Cookies (Optional)
                </h3>
                <p className="text-gray-700 mb-2">
                  These cookies track your browsing activity to show you relevant ads on other websites. We may use these
                  if we run advertising campaigns (e.g., Facebook Pixel, Google Ads).
                </p>
                <div className="bg-white rounded p-4 mt-3">
                  <p className="font-bold text-gray-900 mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li><strong>Facebook Pixel:</strong> Tracks conversions and enables retargeting ads on Facebook/Instagram</li>
                    <li><strong>Google Ads Remarketing:</strong> Shows you ads on Google properties after visiting our site</li>
                    <li><strong>LinkedIn Insight Tag:</strong> Tracks conversions and enables LinkedIn ads</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Legal Basis:</strong> Consent (you can opt out via browser settings or cookie banner)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Note:</strong> We do <strong>NOT</strong> sell your personal data. Advertising cookies are used
                    only for our own marketing purposes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Third-Party Cookies */}
          <section id="section-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Third-Party Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              Some cookies are set by third-party services we use to operate our platform. We do NOT control these cookies,
              and you should review the privacy policies of these third parties to understand how they use your data.
            </p>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Third-Party Services We Use:</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-bold text-gray-900">Google Analytics</p>
                  <p className="text-gray-700 text-sm">
                    Privacy Policy:{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      policies.google.com/privacy
                    </a>
                  </p>
                  <p className="text-gray-700 text-sm">
                    Opt-Out:{' '}
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      Google Analytics Opt-Out Browser Add-On
                    </a>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Mixpanel</p>
                  <p className="text-gray-700 text-sm">
                    Privacy Policy:{' '}
                    <a href="https://mixpanel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      mixpanel.com/legal/privacy-policy
                    </a>
                  </p>
                  <p className="text-gray-700 text-sm">
                    Opt-Out:{' '}
                    <a href="https://mixpanel.com/optout" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      mixpanel.com/optout
                    </a>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Stripe (Payment Processing)</p>
                  <p className="text-gray-700 text-sm">
                    Privacy Policy:{' '}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      stripe.com/privacy
                    </a>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Supabase (Database & Auth)</p>
                  <p className="text-gray-700 text-sm">
                    Privacy Policy:{' '}
                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      supabase.com/privacy
                    </a>
                  </p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Cloudflare (CDN & Security)</p>
                  <p className="text-gray-700 text-sm">
                    Privacy Policy:{' '}
                    <a href="https://www.cloudflare.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      cloudflare.com/privacypolicy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: How to Manage Cookies */}
          <section id="section-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-champagne-600" />
              4. How to Manage Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              You have several options to control and manage cookies:
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">1. Cookie Banner (On First Visit)</h3>
                <p className="text-gray-700">
                  When you first visit Bella Wedding AI, you will see a cookie banner asking for your consent to use
                  non-essential cookies (analytics, advertising). You can accept or reject these cookies.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">2. Browser Settings</h3>
                <p className="text-gray-700 mb-2">
                  Most browsers allow you to manage cookies through settings. You can:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Block all cookies (may break website functionality)</li>
                  <li>Block only third-party cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Set cookies to expire when you close your browser</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  <strong>How to manage cookies in popular browsers:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li><strong>Chrome:</strong> Settings ’ Privacy and security ’ Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Settings ’ Privacy & Security ’ Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences ’ Privacy ’ Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings ’ Cookies and site permissions ’ Manage and delete cookies</li>
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">3. Opt-Out Tools</h3>
                <p className="text-gray-700">
                  You can use browser extensions or industry opt-out tools:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li><strong>Google Analytics Opt-Out:</strong>{' '}
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      Install Browser Add-On
                    </a>
                  </li>
                  <li><strong>Network Advertising Initiative Opt-Out:</strong>{' '}
                    <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      optout.networkadvertising.org
                    </a>
                  </li>
                  <li><strong>Digital Advertising Alliance Opt-Out:</strong>{' '}
                    <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-champagne-600 hover:text-champagne-700 underline">
                      optout.aboutads.info
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">  Impact of Blocking Cookies</h3>
                <p className="text-gray-700">
                  If you block or delete cookies, some features of Bella Wedding AI may not work properly:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                  <li>You may be logged out unexpectedly</li>
                  <li>Your preferences and settings may not be saved</li>
                  <li>Some features may be slow or unavailable</li>
                  <li>We won't be able to personalize your experience</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Other Tracking Technologies */}
          <section id="section-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Other Tracking Technologies
            </h2>
            <p className="text-gray-700 mb-4">
              In addition to cookies, we may use other tracking technologies:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                <li>
                  <strong className="text-gray-900">Web Beacons (Pixels):</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Tiny invisible images embedded in emails or web pages that track whether you opened an email or viewed
                    a page. Used for analytics and email tracking.
                  </p>
                </li>

                <li>
                  <strong className="text-gray-900">Local Storage:</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Browser storage that saves data locally on your device (like HTML5 localStorage). We use this to store
                    preferences and cached data for faster performance.
                  </p>
                </li>

                <li>
                  <strong className="text-gray-900">Session Storage:</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Similar to local storage but clears when you close your browser tab. Used for temporary session data.
                  </p>
                </li>

                <li>
                  <strong className="text-gray-900">Device Fingerprinting:</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Collecting device characteristics (browser type, screen resolution, OS) to create a unique identifier.
                    We do NOT use fingerprinting for tracking, but third-party services may use it for fraud prevention.
                  </p>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6: Do Not Track Signals */}
          <section id="section-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Do Not Track (DNT) Signals
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
              <p className="text-gray-700">
                Some browsers offer a "Do Not Track" (DNT) setting that sends a signal to websites requesting not to be
                tracked. <strong>Currently, there is no industry standard for how to respond to DNT signals</strong>, so we
                do NOT respond to DNT signals at this time.
              </p>
              <p className="text-gray-700 mt-3">
                However, you can still manage cookies through browser settings (see Section 4) or use privacy-focused
                browsers like Brave, DuckDuckGo, or Firefox with Enhanced Tracking Protection.
              </p>
            </div>
          </section>

          {/* Updates to This Policy */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Updates to This Cookie Policy
            </h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons.
              We will notify you of material changes by updating the "Effective Date" at the top of this page and/or
              displaying a notice on our platform.
            </p>
          </section>

          {/* Severability Clause */}
          <section className="bg-gray-50 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Severability
            </h2>
            <p className="text-gray-700">
              If any provision of this Cookie Policy is found to be unlawful, void, or unenforceable, that provision shall
              be severed from this policy and shall not affect the validity and enforceability of the remaining provisions.
              This policy is part of and incorporated into our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                Terms of Service
              </Link>.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-champagne-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Questions About Cookies?
            </h2>
            <p className="text-gray-700">
              If you have questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                privacy@bellaweddingai.com
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
            <Link href="/cookies" className="text-champagne-600 hover:text-champagne-700">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
