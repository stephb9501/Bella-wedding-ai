'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Check, Eye, EyeOff } from 'lucide-react';
import { validatePassword } from '@/lib/password-validator';

const VENDOR_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    commission: '10%',
    features: [
      '1 photo',
      'Basic profile',
      'Bottom of search results',
      '5 replies/month',
      '10% commission per booking',
      'No analytics',
      'Not eligible for AI matching'
    ],
    color: 'from-gray-400 to-gray-600'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$34.99/mo',
    commission: '5%',
    popular: false,
    features: [
      'Up to 25 photos',
      'Full profile',
      'Medium search visibility',
      'Unlimited messages',
      'Basic analytics',
      '5% commission per booking',
      '1 region, 1 category',
      '1 staff login'
    ],
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'featured',
    name: 'Featured',
    price: '$49.99/mo',
    commission: '2%',
    popular: true,
    features: [
      'Up to 50 photos',
      'Priority search placement',
      'Featured badge',
      'Homepage rotation',
      'Full analytics',
      'AI profile optimizer',
      '2% commission per booking',
      '2 categories, 2 regions',
      '2 staff accounts'
    ],
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$79.99/mo',
    commission: '0%',
    popular: false,
    features: [
      'Unlimited photos',
      'Top search placement',
      '"Recommended Vendor" section',
      'Multi-city (up to 3)',
      'Up to 3 categories',
      'Up to 5 staff accounts',
      'AI automation tools',
      'Custom support',
      '0% commission - no booking fees'
    ],
    color: 'from-amber-400 to-amber-600'
  }
];

const CATEGORIES = [
  'Venue', 'Catering', 'Photography', 'Videography', 'Florist',
  'DJ/Music', 'Hair & Makeup', 'Wedding Planner', 'Cake', 'Transportation',
  'Officiant', 'Invitations', 'Dress & Attire', 'Rentals', 'Other'
];

export default function VendorRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState('featured');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    phone: '',
    categories: [] as string[], // Changed to array for multiple selections
    city: '',
    state: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time password validation
    if (name === 'password' && value) {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
    } else if (name === 'password' && !value) {
      setPasswordErrors([]);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate at least one category is selected
    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      setLoading(false);
      return;
    }

    // Validate password strength
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      setPasswordErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tier: selectedTier,
        }),
      });

      if (!response.ok) throw new Error('Failed to register');

      // Redirect to vendor dashboard
      router.push('/vendor-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding - Vendor</h1>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-champagne-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-champagne-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="font-medium">Choose Plan</span>
            </div>
            <div className="w-16 h-1 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-champagne-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-champagne-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="font-medium">Business Info</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {/* Step 1: Choose Tier */}
        {step === 1 && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600">
                Select the perfect plan for your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-5xl mx-auto">
              {VENDOR_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative bg-white rounded-2xl p-6 cursor-pointer transition ${
                    selectedTier === tier.id
                      ? 'ring-2 ring-champagne-500 shadow-lg scale-105'
                      : 'shadow-md hover:shadow-lg'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-champagne-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 bg-gradient-to-br ${tier.color} rounded-xl mb-4`}></div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                    {tier.id !== 'free' && <span className="text-gray-600">/month</span>}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {tier.commission} commission
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedTier === tier.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-champagne-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition"
              >
                Continue to Registration
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                Business Information
              </h2>
              <p className="text-gray-600">
                Selected Plan: <span className="font-bold text-champagne-600">
                  {VENDOR_TIERS.find(t => t.id === selectedTier)?.name}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className={`mt-2 p-3 rounded-lg text-xs ${
                      passwordErrors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="font-semibold mb-2 text-gray-700">
                        Password Requirements:
                      </div>
                      <ul className="space-y-1 text-gray-600">
                        <li className={formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                          {formData.password.length >= 8 ? '✓' : '✗'} At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          {/[A-Z]/.test(formData.password) ? '✓' : '✗'} One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          {/[a-z]/.test(formData.password) ? '✓' : '✗'} One lowercase letter
                        </li>
                        <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          {/[0-9]/.test(formData.password) ? '✓' : '✗'} One number
                        </li>
                        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓' : '✗'} One special character (!@#$%^&*)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Categories * <span className="text-xs text-gray-500">(Select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    {CATEGORIES.map(cat => (
                      <label
                        key={cat}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 text-champagne-600 border-gray-300 rounded focus:ring-champagne-500"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                  {formData.categories.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      Selected: {formData.categories.join(', ')}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="CA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Tell couples about your business..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
