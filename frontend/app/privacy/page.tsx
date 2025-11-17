'use client';

import { useRouter } from 'next/navigation';
import { Heart, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-white">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding AI</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-champagne-600" />
          <h1 className="text-4xl font-serif font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 text-gray-700">
          <p className="text-sm text-gray-600"><strong>Last Updated:</strong> January 2025</p>
          
          <p>Bella Wedding AI is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Information We Collect</h2>
            <p>We collect information you provide (name, email, wedding details), payment data (via Stripe), and usage data.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide wedding planning services</li>
              <li>Process payments</li>
              <li>Connect you with vendors</li>
              <li>Improve our platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Security</h2>
            <p>We use industry-standard encryption and security measures including Supabase Auth and Row Level Security.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact</h2>
            <p>Email: privacy@bellaweddingai.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
