'use client';

import Link from 'next/link';
import { DollarSign, ArrowLeft } from 'lucide-react';

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
                Refund Policy
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
            <p className="text-gray-700 leading-relaxed">
              Bella Wedding AI offers a fair and transparent refund policy to ensure customer satisfaction.
              This policy outlines the conditions under which refunds are granted, the refund request process,
              and important exceptions and limitations. We want you to be completely satisfied with our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. 30-Day Money-Back Guarantee
            </h2>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-4">
              <h3 className="font-semibold text-green-900 mb-3">30-Day Satisfaction Guarantee</h3>
              <p className="text-green-800 leading-relaxed">
                We offer a 30-day money-back guarantee on all paid subscriptions. If you're not satisfied with
                Bella Wedding AI for any reason, request a full refund within 30 days of your initial purchase.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.1 Eligibility Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To qualify for a 30-day refund:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Request must be made within 30 days of your initial subscription purchase
                  </p>
                  <p className="text-gray-700">
                    * This is your first subscription to Bella Wedding AI (first-time customers only)
                  </p>
                  <p className="text-gray-700">
                    * You have not previously received a refund from us
                  </p>
                  <p className="text-gray-700">
                    * Your account has not been suspended or terminated for policy violations
                  </p>
                  <p className="text-gray-700">
                    * You have not engaged in fraudulent or abusive behavior
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.2 What Gets Refunded</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Within the 30-day window, you will receive:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * 100% refund of your initial subscription fee
                  </p>
                  <p className="text-gray-700">
                    * Refund processed to your original payment method
                  </p>
                  <p className="text-gray-700">
                    * No questions asked (reason for refund is optional)
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">2.3 After 30 Days</h3>
                <p className="text-gray-700 leading-relaxed">
                  After the 30-day guarantee period expires, refunds are generally not available except in
                  cases of billing errors, technical failures, or other exceptional circumstances at our
                  discretion. See Section 5 for details.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. Subscription Cancellation
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3">Cancel Anytime - No Penalties</h3>
              <p className="text-blue-800 leading-relaxed">
                You can cancel your subscription at any time without penalty. Cancellation stops future
                billing but does not automatically trigger a refund. You retain access until the end of
                your current billing period.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.1 How to Cancel</h3>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">Self-Service Cancellation:</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">1. Log into your Bella Wedding AI account</p>
                    <p className="text-gray-700">2. Go to Settings -> Subscription -> Manage Subscription</p>
                    <p className="text-gray-700">3. Click "Cancel Subscription"</p>
                    <p className="text-gray-700">4. Confirm cancellation</p>
                    <p className="text-gray-700">5. Receive confirmation email immediately</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Email Cancellation:</h4>
                  <div className="space-y-2">
                    <p className="text-gray-700">Email: billing@bellaweddingai.com</p>
                    <p className="text-gray-700">Subject: Subscription Cancellation Request</p>
                    <p className="text-gray-700">Include: Your account email address</p>
                    <p className="text-gray-700">Processing Time: 1-2 business days</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.2 What Happens After Cancellation</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Your subscription continues until the end of the current billing period
                  </p>
                  <p className="text-gray-700">
                    * You retain full access to paid features during this time
                  </p>
                  <p className="text-gray-700">
                    * No additional charges will be made after cancellation
                  </p>
                  <p className="text-gray-700">
                    * After the billing period ends, your account reverts to the free tier
                  </p>
                  <p className="text-gray-700">
                    * Your data is retained according to our Data Retention Policy
                  </p>
                  <p className="text-gray-700">
                    * You can reactivate your subscription at any time
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">3.3 Partial Period Refunds</h3>
                <p className="text-gray-700 leading-relaxed">
                  We do NOT provide prorated refunds for partial billing periods. If you cancel mid-month or
                  mid-year, you will not receive a refund for the unused portion unless within the 30-day
                  guarantee period or under exceptional circumstances.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. How to Request a Refund
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.1 Refund Request Process</h3>

                <div className="bg-champagne-50 border border-champagne-200 rounded-lg p-6">
                  <p className="font-semibold text-gray-900 mb-3">Submit a refund request:</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-700">Email: billing@bellaweddingai.com</p>
                    <p className="text-gray-700">Subject: Refund Request</p>
                  </div>

                  <p className="font-semibold text-gray-900 mb-2">Include the following information:</p>
                  <div className="space-y-2">
                    <p className="text-gray-700">* Your account email address</p>
                    <p className="text-gray-700">* Date of subscription purchase</p>
                    <p className="text-gray-700">* Reason for refund (optional but helpful)</p>
                    <p className="text-gray-700">* Order/transaction ID (if available)</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.2 Refund Processing Timeline</h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Step 1: Request Review</p>
                      <p className="text-gray-700 text-sm">Timeline: 1-3 business days</p>
                      <p className="text-gray-700 text-sm">
                        We review your request and verify eligibility
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Step 2: Approval Notification</p>
                      <p className="text-gray-700 text-sm">Timeline: Within 3 business days</p>
                      <p className="text-gray-700 text-sm">
                        You receive email confirmation of approval or denial
                      </p>
                    </div>

                    <div className="border-b border-gray-200 pb-2">
                      <p className="font-semibold text-gray-900">Step 3: Refund Processing</p>
                      <p className="text-gray-700 text-sm">Timeline: 3-5 business days</p>
                      <p className="text-gray-700 text-sm">
                        Refund is processed to your original payment method
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">Step 4: Bank Processing</p>
                      <p className="text-gray-700 text-sm">Timeline: 5-10 business days</p>
                      <p className="text-gray-700 text-sm">
                        Your bank/credit card company processes the refund (varies by institution)
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mt-3">
                  Total time from request to refund appearing in your account: 7-15 business days
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">4.3 Refund Methods</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Refunds are issued to the original payment method used for purchase
                  </p>
                  <p className="text-gray-700">
                    * Credit card refunds appear as a credit on your statement
                  </p>
                  <p className="text-gray-700">
                    * PayPal refunds are returned to your PayPal account
                  </p>
                  <p className="text-gray-700">
                    * We cannot issue refunds to different payment methods or accounts
                  </p>
                  <p className="text-gray-700">
                    * If original payment method is no longer valid, contact billing support
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Exceptions and Special Circumstances
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.1 Billing Errors</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you were charged incorrectly due to a technical error, duplicate charge, or billing
                  system malfunction, we will issue a full refund regardless of the 30-day window. Report
                  billing errors immediately to billing@bellaweddingai.com.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.2 Service Unavailability</h3>
                <p className="text-gray-700 leading-relaxed">
                  If Bella Wedding AI experiences significant downtime or service unavailability (more than
                  48 consecutive hours), you may be eligible for a prorated refund or service credit at our
                  discretion.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.3 Account Termination by Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  If we terminate your account for Terms of Service violations, Acceptable Use Policy
                  violations, or fraudulent activity, you are NOT entitled to a refund. All fees paid are
                  forfeited.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.4 Promotional Pricing and Discounts</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you purchased a subscription at a promotional or discounted price, refunds (if eligible)
                  will be for the amount actually paid, not the regular price.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">5.5 Exceptional Circumstances</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  In rare cases, we may grant refunds outside the normal policy for exceptional circumstances
                  such as:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Medical emergencies or family hardship</p>
                  <p className="text-gray-700">* Wedding cancellation due to unforeseen events</p>
                  <p className="text-gray-700">* Technical issues preventing platform use</p>
                  <p className="text-gray-700">* Other extraordinary situations at our sole discretion</p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-3">
                  These exceptions are evaluated case-by-case and are not guaranteed.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. What is NOT Refundable
            </h2>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-amber-900 mb-3">Non-Refundable Items</h3>
              <p className="text-amber-800 leading-relaxed">
                The following are NOT eligible for refunds under any circumstances:
              </p>
            </div>

            <div className="space-y-3">
              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">[X] Renewal Charges (After 30 Days)</h3>
                <p className="text-gray-700">
                  Automatic subscription renewals are not refundable. Cancel before your renewal date to
                  avoid charges.
                </p>
              </div>

              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">[X] Unused Subscription Time</h3>
                <p className="text-gray-700">
                  We do not provide prorated refunds for unused portions of your subscription period if
                  cancelled after the 30-day guarantee window.
                </p>
              </div>

              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">[X] Third-Party Services</h3>
                <p className="text-gray-700">
                  Any third-party services, integrations, or purchases made outside of Bella Wedding AI
                  are not refundable through us.
                </p>
              </div>

              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">[X] Repeat Refund Requests</h3>
                <p className="text-gray-700">
                  If you have previously received a refund from Bella Wedding AI, you are not eligible for
                  additional refunds on subsequent subscriptions.
                </p>
              </div>

              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">[X] Fraudulent Purchases</h3>
                <p className="text-gray-700">
                  Subscriptions purchased with stolen payment methods or fraudulent information are not
                  eligible for refunds and will result in account termination.
                </p>
              </div>

              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">[X] Free Trials (No Purchase)</h3>
                <p className="text-gray-700">
                  Since free trials have no cost, there is nothing to refund. Simply cancel before the trial
                  ends to avoid charges.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Chargebacks and Disputes
            </h2>

            <div className="bg-rose-50 border-l-4 border-rose-500 p-6 mb-4">
              <h3 className="font-semibold text-rose-900 mb-3">WARNING: Contact Us Before Filing a Chargeback</h3>
              <p className="text-rose-800 leading-relaxed">
                If you have a billing concern, please contact our billing team BEFORE filing a credit card
                chargeback or payment dispute. Chargebacks harm our business and will result in immediate
                account suspension.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">7.1 Chargeback Policy</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    * Filing a chargeback instead of requesting a refund will result in account termination
                  </p>
                  <p className="text-gray-700">
                    * We will contest unjustified chargebacks and provide evidence to payment processors
                  </p>
                  <p className="text-gray-700">
                    * Chargeback fees may be charged to your account
                  </p>
                  <p className="text-gray-700">
                    * Accounts terminated due to chargebacks cannot be reactivated
                  </p>
                  <p className="text-gray-700">
                    * All data may be deleted immediately upon chargeback-related termination
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-3">7.2 Legitimate Chargeback Situations</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  File a chargeback only in cases of:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">* Unauthorized charges (credit card fraud or theft)</p>
                  <p className="text-gray-700">* Charges after account was cancelled (if we fail to respond)</p>
                  <p className="text-gray-700">* We refuse to provide a refund for a clear billing error</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Currency and International Refunds
            </h2>

            <div className="space-y-3">
              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">8.1 Currency Exchange</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you paid in a currency different from USD, refunds are processed in the original currency.
                  Exchange rate fluctuations may result in a slightly different amount due to currency conversion
                  fees charged by your bank.
                </p>
              </div>

              <div className="border-l-4 border-champagne-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">8.2 International Transaction Fees</h3>
                <p className="text-gray-700 leading-relaxed">
                  International transaction fees charged by your bank or payment processor are not refundable.
                  We are not responsible for third-party fees.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Changes to This Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify this Refund Policy at any time. Changes will be posted on this
              page with a revised "Effective Date." Material changes will be communicated via email.
              Subscriptions purchased before policy changes remain subject to the policy in effect at the
              time of purchase for that billing cycle only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              10. Contact Information
            </h2>
            <div className="bg-champagne-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                For refund requests, billing questions, or cancellation assistance:
              </p>
              <p className="text-gray-700 mb-2">Email: billing@bellaweddingai.com</p>
              <p className="text-gray-700 mb-2">Subject: Refund Request or Billing Inquiry</p>
              <p className="text-gray-700">Response Time: 1-3 business days</p>
            </div>
          </section>

          <section className="bg-blue-50 border-l-4 border-blue-500 p-6">
            <p className="text-sm text-gray-700">
              By subscribing to Bella Wedding AI, you acknowledge that you have read, understood, and agree
              to this Refund Policy. This policy is part of our Terms of Service.
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
