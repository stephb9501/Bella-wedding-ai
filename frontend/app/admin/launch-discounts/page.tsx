'use client';

import { useState, useEffect } from 'react';
import { Percent, Gift, Zap, Crown, Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Discount {
  name: string;
  code: string;
  percentOff?: number;
  duration: string;
  durationInMonths?: number;
  maxRedemptions?: number;
  description: string;
}

export default function LaunchDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/admin/create-launch-coupons');
      const data = await response.json();
      setDiscounts(data.availableDiscounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAllCoupons = async () => {
    setCreating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/create-launch-coupons', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error creating coupons:', error);
      setResult({ error: 'Failed to create coupons' });
    } finally {
      setCreating(false);
    }
  };

  const getDiscountIcon = (name: string) => {
    if (name.includes('LAUNCH')) return Zap;
    if (name.includes('FOUNDING')) return Crown;
    if (name.includes('FREE')) return Gift;
    return Percent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tag className="w-10 h-10 text-purple-600" />
            <h1 className="text-5xl font-serif text-champagne-900">Launch Discounts</h1>
          </div>
          <p className="text-xl text-champagne-700 max-w-3xl mx-auto">
            Manage promotional codes for your platform launch. Create these coupons in Stripe with one click.
          </p>
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-serif text-champagne-900 mb-4">
              Create All Launch Coupons in Stripe
            </h2>
            <p className="text-champagne-600 mb-6">
              This will create all predefined discount codes in your Stripe account.
              Run this once before launch.
            </p>
            <button
              onClick={createAllCoupons}
              disabled={creating}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Coupons...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Create All Coupons in Stripe
                </>
              )}
            </button>
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.success ? (
                <div>
                  <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    Success! Coupons Created
                  </div>
                  <div className="text-sm text-green-700">
                    {result.created?.map((item: any, index: number) => (
                      <div key={index} className="mb-1">
                        ✓ <strong>{item.code}</strong> {item.status === 'already_exists' ? '(already exists)' : '(created)'}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-800 font-semibold">
                  <XCircle className="w-5 h-5" />
                  {result.error || 'Failed to create coupons'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available Discounts */}
        <h2 className="text-3xl font-serif text-champagne-900 mb-6 text-center">
          Available Launch Discounts
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-champagne-600">Loading discounts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {discounts.map((discount) => {
              const Icon = getDiscountIcon(discount.name);
              return (
                <div
                  key={discount.name}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-purple-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-champagne-900 mb-1">
                        {discount.code}
                      </h3>
                      <p className="text-champagne-600 text-sm mb-3">{discount.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-champagne-500">Discount:</span>
                          <span className="ml-2 font-semibold text-purple-600">
                            {discount.percentOff}% off
                          </span>
                        </div>
                        <div>
                          <span className="text-champagne-500">Duration:</span>
                          <span className="ml-2 font-semibold text-champagne-900">
                            {discount.duration === 'once'
                              ? 'First payment'
                              : discount.duration === 'repeating'
                              ? `${discount.durationInMonths} months`
                              : 'Forever'}
                          </span>
                        </div>
                        {discount.maxRedemptions && (
                          <div className="col-span-2">
                            <span className="text-champagne-500">Max uses:</span>
                            <span className="ml-2 font-semibold text-champagne-900">
                              {discount.maxRedemptions} customers
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-champagne-50 rounded-xl p-8 border-2 border-champagne-200">
          <h3 className="text-2xl font-serif text-champagne-900 mb-4">How to Use</h3>
          <div className="space-y-3 text-champagne-700">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <p>
                <strong>Click "Create All Coupons"</strong> above to create these discount codes in
                your Stripe account
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <p>
                <strong>Share promo codes</strong> with early adopters, email lists, social media
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <p>
                <strong>Customers enter codes at checkout</strong> - Stripe will apply the discount
                automatically
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </span>
              <p>
                <strong>Track usage in Stripe Dashboard</strong> - See how many people use each code
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-semibold text-champagne-900 mb-3">Quick Reference - Which Code to Use?</h4>
          <div className="space-y-2 text-sm text-champagne-700">
            <p>
              <strong className="text-purple-600">LAUNCH50</strong> - Best for social media
              announcements (50% off first month)
            </p>
            <p>
              <strong className="text-purple-600">EARLYADOPTER</strong> - Best for email subscribers
              (30% off for 3 months)
            </p>
            <p>
              <strong className="text-purple-600">FIRSTMONTHFREE</strong> - Best for influencer
              partnerships (100% off first month)
            </p>
            <p>
              <strong className="text-purple-600">FOUNDING20</strong> - Best for VIP early supporters
              (20% off forever!)
            </p>
            <p>
              <strong className="text-purple-600">VENDORLAUNCH</strong> - Vendor-specific launch offer
              (40% off for 3 months)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
