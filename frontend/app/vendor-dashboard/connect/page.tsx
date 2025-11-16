'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface ConnectStatus {
  hasAccount: boolean;
  isOnboarded: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  stripeAccountId?: string;
  vendorTier?: string;
}

export default function VendorConnectPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/vendor-dashboard/connect');
      return;
    }

    // Check for onboarding callback
    const onboardingStatus = searchParams?.get('onboarding');
    if (onboardingStatus === 'success') {
      setMessage('Onboarding completed successfully! Your account is being verified.');
    } else if (onboardingStatus === 'refresh') {
      setMessage('Please complete the onboarding process.');
    }

    checkConnectStatus();
  }, [isAuthenticated, router, searchParams]);

  const checkConnectStatus = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/vendor/connect-onboarding?vendorId=${user.id}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    if (!user) return;

    setOnboarding(true);
    setMessage('');

    try {
      const response = await fetch('/api/vendor/connect-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: user.id,
          email: user.email,
          businessName: user.name || 'My Business',
        }),
      });

      const data = await response.json();

      if (data.success && data.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      } else {
        setMessage('Error: ' + (data.error || 'Failed to start onboarding'));
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setMessage('Failed to start onboarding. Please try again.');
    } finally {
      setOnboarding(false);
    }
  };

  const getCommissionRate = (tier: string) => {
    const rates: Record<string, string> = {
      free: '10%',
      premium: '5%',
      featured: '2%',
      elite: '0%',
    };
    return rates[tier] || '10%';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif text-champagne-900 mb-2 text-center">
          Stripe Connect Setup
        </h1>
        <p className="text-champagne-600 text-center mb-8">
          Accept payments and bookings from brides
        </p>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            {message}
          </div>
        )}

        {!status?.hasAccount && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <DollarSign className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-serif text-champagne-900 mb-3">
                Get Paid for Your Services
              </h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Connect your bank account via Stripe to receive payments when brides book your services.
                Secure, fast, and reliable.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-champagne-900 mb-1">Instant Deposit</div>
                <div className="text-sm text-champagne-600">30% upfront when booked</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-champagne-900 mb-1">Secure Escrow</div>
                <div className="text-sm text-champagne-600">70% held until completion</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-champagne-900 mb-1">Fast Payouts</div>
                <div className="text-sm text-champagne-600">2-3 business days</div>
              </div>
            </div>

            {status?.vendorTier && (
              <div className="mb-6 p-4 bg-champagne-50 border-2 border-champagne-200 rounded-lg">
                <div className="text-sm text-champagne-600 mb-1">Your commission rate:</div>
                <div className="text-3xl font-bold text-champagne-900">
                  {getCommissionRate(status.vendorTier)}
                </div>
                <div className="text-sm text-champagne-600 mt-1">
                  Based on your {status.vendorTier} plan
                </div>
              </div>
            )}

            <button
              onClick={startOnboarding}
              disabled={onboarding}
              className="w-full py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {onboarding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting...
                </>
              ) : (
                'Connect Stripe Account'
              )}
            </button>

            <p className="text-xs text-champagne-600 text-center mt-4">
              Takes about 5 minutes • Powered by Stripe
            </p>
          </div>
        )}

        {status?.hasAccount && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              {status.isOnboarded ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif text-champagne-900 mb-2">
                    You're All Set!
                  </h2>
                  <p className="text-champagne-700">
                    Your account is connected and ready to accept payments
                  </p>
                </>
              ) : (
                <>
                  <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-serif text-champagne-900 mb-2">
                    Onboarding In Progress
                  </h2>
                  <p className="text-champagne-700">
                    Please complete your Stripe onboarding
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-champagne-700">Charges Enabled</span>
                {status.chargesEnabled ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-champagne-700">Payouts Enabled</span>
                {status.payoutsEnabled ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-champagne-700">Details Submitted</span>
                {status.isOnboarded ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            {status.vendorTier && (
              <div className="p-4 bg-champagne-50 border-2 border-champagne-200 rounded-lg text-center">
                <div className="text-sm text-champagne-600 mb-1">Your commission rate:</div>
                <div className="text-3xl font-bold text-champagne-900">
                  {getCommissionRate(status.vendorTier)}
                </div>
              </div>
            )}

            {!status.isOnboarded && (
              <button
                onClick={startOnboarding}
                disabled={onboarding}
                className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {onboarding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Complete Onboarding'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
