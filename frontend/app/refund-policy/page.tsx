'use client';

import Link from 'next/link';
import { DollarSign, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      <header className="bg-white shadow-sm border-b border-champagne-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-champagne-600 hover:text-champagne-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-champagne-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Refund & Cancellation Policy
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
              This Refund & Cancellation Policy explains our refund and cancellation procedures for Bella Wedding AI
              subscriptions. This policy is part of our{' '}
              <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">Terms of Service</Link>.
            </p>
          </section>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-900 mb-2">30-Day Money-Back Guarantee</p>
                <p className="text-gray-700">
                  We offer a <strong>30-day money-back guarantee</strong> on all new paid subscriptions. If you're not
                  satisfied within the first 30 days, we'll refund your paymentno questions asked.
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Subscription Plans & Billing</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">How Billing Works:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Monthly Plans:</strong> Billed monthly on the date you subscribed</li>
                <li><strong>Annual Plans:</strong> Billed once per year on the subscription anniversary date</li>
                <li><strong>Auto-Renewal:</strong> Subscriptions auto-renew unless you cancel before the renewal date</li>
                <li><strong>Payment Processing:</strong> All payments are processed securely through Stripe</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Eligibility</h2>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  You ARE Eligible for a Refund If:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You request a refund <strong>within 30 days</strong> of your initial subscription purchase</li>
                  <li>There was a billing error or unauthorized charge</li>
                  <li>You were charged after canceling (if you canceled before the renewal date)</li>
                  <li>The platform has a critical bug that prevents you from using core features (and we cannot fix it
                  within a reasonable timeframe)</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  You Are NOT Eligible for a Refund If:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>You request a refund <strong>after 30 days</strong> of your initial purchase</li>
                  <li>You used the service and simply changed your mind after 30 days</li>
                  <li>You forgot to cancel before auto-renewal (but you can cancel anytime to avoid future charges)</li>
                  <li>You violated our <Link href="/terms" className="text-champagne-600 hover:text-champagne-700 underline">
                  Terms of Service</Link> or{' '}
                  <Link href="/acceptable-use" className="text-champagne-600 hover:text-champagne-700 underline">
                  Acceptable Use Policy</Link> (leading to account suspension/termination)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How to Request a Refund</h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                To request a refund, please contact us within 30 days of your purchase:
              </p>
              <p className="font-bold text-gray-900">Refund Requests:</p>
              <p className="text-gray-700">
                Email: <a href="mailto:billing@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                billing@bellaweddingai.com</a>
              </p>
              <p className="text-gray-700 mt-3">
                <strong>Include in your email:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
                <li>Your account email address</li>
                <li>Date of purchase</li>
                <li>Reason for refund request (optional but helpful)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>Response Time:</strong> We will process your refund request within <strong>5-7 business days</strong>.
                Refunds are issued to the original payment method and may take 5-10 business days to appear in your account
                (depending on your bank).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation Policy</h2>
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-3">How to Cancel Your Subscription:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Log in to your Bella Wedding AI account</li>
                <li>Go to <strong>Account Settings ’ Subscription</strong></li>
                <li>Click <strong>"Cancel Subscription"</strong></li>
                <li>Confirm cancellation</li>
              </ol>
              <p className="text-gray-700 mt-3">
                Alternatively, email us at{' '}
                <a href="mailto:billing@bellaweddingai.com" className="text-champagne-600 hover:text-champagne-700 underline">
                  billing@bellaweddingai.com
                </a>{' '}
                with your account email and request cancellation.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">What Happens When You Cancel:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Immediate Effect:</strong> Your subscription will NOT auto-renew</li>
                <li><strong>Access Until End of Billing Period:</strong> You retain full access to paid features until the
                end of your current billing period (no pro-rated refunds for the current period)</li>
                <li><strong>No Future Charges:</strong> You will NOT be charged again unless you re-subscribe</li>
                <li><strong>Data Retention:</strong> Your account and data remain accessible for 90 days after cancellation.
                See our <Link href="/data-retention" className="text-champagne-600 hover:text-champagne-700 underline">
                Data Retention Policy</Link>.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. State-Specific Rights</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">California Residents:</h3>
              <p className="text-gray-700 mb-2">
                Under California's automatic renewal law (Business & Professions Code § 17602), you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Receive clear disclosure of auto-renewal terms before purchase</li>
                <li>Cancel your subscription easily online or by calling customer support</li>
                <li>Receive a confirmation of cancellation</li>
              </ul>
              <p className="text-gray-700 mt-3">
                If you purchased through a third-party platform (Apple App Store, Google Play), you must cancel through
                that platform's subscription management system.
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Severability</h2>
            <p className="text-gray-700">
              If any provision of this Refund Policy is found to be unlawful, void, or unenforceable, that provision shall
              be severed and shall not affect the remaining provisions. This policy is part of our{' '}
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
