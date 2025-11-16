'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import {
  Heart, Crown, Sparkles, CheckCircle, XCircle, Calendar, CreditCard,
  TrendingUp, AlertCircle, ExternalLink, Loader2, Settings
} from 'lucide-react';

interface Subscription {
  id: string;
  plan_tier: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  stripe_subscription_id: string;
}

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscription();
    }
  }, [isAuthenticated, user]);

  const loadSubscription = async () => {
    if (!user?.id) return;

    setLoadingSubscription(true);
    try {
      const response = await fetch(`/api/subscription?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!subscription?.stripe_customer_id) return;

    setLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
          returnUrl: window.location.href,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Could not open billing portal. Please try again.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const getPlanDetails = (tier: string) => {
    const plans: { [key: string]: { name: string; price: string; icon: any; color: string } } = {
      free: { name: 'Free', price: '$0', icon: Heart, color: 'text-gray-600' },
      standard: { name: 'Standard', price: '$19.99/mo', icon: Sparkles, color: 'text-champagne-600' },
      premium: { name: 'Premium', price: '$39.99/mo', icon: Crown, color: 'text-purple-600' },
      basic: { name: 'Basic (Vendor)', price: 'Free', icon: Heart, color: 'text-gray-600' },
      silver: { name: 'Silver (Vendor)', price: '$49/mo', icon: Sparkles, color: 'text-blue-600' },
      gold: { name: 'Gold (Vendor)', price: '$99/mo', icon: Crown, color: 'text-yellow-600' },
      platinum: { name: 'Platinum (Vendor)', price: '$199/mo', icon: TrendingUp, color: 'text-purple-600' },
    };
    return plans[tier?.toLowerCase()] || plans.free;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; icon: any; color: string; bg: string } } = {
      active: { label: 'Active', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
      trialing: { label: 'Trial', icon: Clock, color: 'text-blue-700', bg: 'bg-blue-100' },
      past_due: { label: 'Past Due', icon: AlertCircle, color: 'text-orange-700', bg: 'bg-orange-100' },
      canceled: { label: 'Canceled', icon: XCircle, color: 'text-red-700', bg: 'bg-red-100' },
      unpaid: { label: 'Unpaid', icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-100' },
    };
    return statusConfig[status] || statusConfig.active;
  };

  // Loading state
  if (loading || loadingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Subscription Management"
        previewContent={
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <Settings className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
            <h2 className="text-3xl font-serif text-champagne-900 mb-4">Manage Your Subscription</h2>
            <p className="text-champagne-700">
              Sign in to view and manage your subscription, update payment methods, and view billing history.
            </p>
          </div>
        }
      />
    );
  }

  const planDetails = subscription ? getPlanDetails(subscription.plan_tier) : getPlanDetails('free');
  const PlanIcon = planDetails.icon;
  const statusBadge = subscription ? getStatusBadge(subscription.status) : null;
  const StatusIcon = statusBadge?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-champagne-900 mb-2">Subscription Management</h1>
          <p className="text-champagne-700">Manage your plan, billing, and payment methods</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${planDetails.color === 'text-purple-600' ? 'bg-purple-100' : planDetails.color === 'text-champagne-600' ? 'bg-champagne-100' : 'bg-gray-100'} flex items-center justify-center`}>
                <PlanIcon className={`w-8 h-8 ${planDetails.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-champagne-900">{planDetails.name}</h2>
                <p className="text-champagne-600">{planDetails.price}</p>
              </div>
            </div>

            {subscription && statusBadge && StatusIcon && (
              <div className={`flex items-center gap-2 px-4 py-2 ${statusBadge.bg} rounded-full`}>
                <StatusIcon className={`w-5 h-5 ${statusBadge.color}`} />
                <span className={`font-semibold ${statusBadge.color}`}>{statusBadge.label}</span>
              </div>
            )}
          </div>

          {subscription ? (
            <>
              {/* Subscription Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-champagne-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-champagne-600">Billing Period</div>
                    <div className="font-semibold text-champagne-900">
                      Renews on {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-champagne-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-champagne-600">Payment Status</div>
                    <div className="font-semibold text-champagne-900">
                      {subscription.cancel_at_period_end ? 'Cancels at period end' : 'Active - Auto-renew'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Warning */}
              {subscription.cancel_at_period_end && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-1">Subscription Ending</h3>
                      <p className="text-sm text-orange-700">
                        Your subscription will end on {new Date(subscription.current_period_end).toLocaleDateString()}.
                        You'll lose access to premium features after this date.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manage Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={openCustomerPortal}
                  disabled={loadingPortal}
                  className="flex-1 px-6 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingPortal ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Manage Billing
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg font-semibold hover:border-champagne-400 transition-colors"
                >
                  Change Plan
                </button>
              </div>

              <p className="text-xs text-champagne-600 mt-4 text-center">
                Manage payment methods, view invoices, and update billing information in the billing portal
              </p>
            </>
          ) : (
            <>
              {/* No Subscription - Free Plan */}
              <div className="text-center py-8">
                <p className="text-champagne-700 mb-6">
                  You're currently on the Free plan. Upgrade to unlock premium features!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-champagne-700 text-sm">90+ task checklist with deadlines</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-champagne-700 text-sm">Complete budget & timeline tools</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-champagne-700 text-sm">Unlimited vendor contacts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-champagne-700 text-sm">AI planning assistant</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/pricing')}
                  className="px-8 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 transition-colors"
                >
                  View Plans & Pricing
                </button>
              </div>
            </>
          )}
        </div>

        {/* Help Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-700 mb-4">
            Have questions about your subscription or need assistance? We're here to help!
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/ai-assistant')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Ask AI Assistant
            </button>
            <button className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
