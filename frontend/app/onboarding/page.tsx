'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, User, Phone } from 'lucide-react';
import { getCurrentUser, supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [message, setMessage] = useState({ text: '', type: 'success', show: false });

  const [formData, setFormData] = useState({
    partnerOneName: '',
    partnerTwoName: '',
    weddingDate: '',
    phoneNumber: '',
  });

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    const user = await getCurrentUser();

    if (!user) {
      // Not logged in, redirect to auth
      router.push('/auth');
      return;
    }

    // Check if profile already exists
    const { data: profile } = await supabase
      .from('couples')
      .select('*')
      .eq('bride_id', user.id)
      .single();

    if (profile && profile.partner_one_name) {
      // Profile already complete, go to dashboard
      router.push('/dashboard');
      return;
    }

    setCheckingAuth(false);
  };

  const showMessage = (text: string, type: string) => {
    setMessage({ text, type, show: true });
    setTimeout(() => setMessage({ text: '', type: 'success', show: false }), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.partnerOneName || !formData.weddingDate) {
      showMessage('✗ Please fill in required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const user = await getCurrentUser();

      if (!user) {
        showMessage('✗ Not authenticated', 'error');
        router.push('/auth');
        return;
      }

      // Create or update couple profile
      const { error } = await supabase
        .from('couples')
        .upsert({
          bride_id: user.id,
          partner_one_name: formData.partnerOneName,
          partner_two_name: formData.partnerTwoName || null,
          wedding_date: formData.weddingDate,
          phone_number: formData.phoneNumber || null,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'bride_id'
        });

      if (error) throw error;

      showMessage('✓ Profile created! Redirecting to dashboard...', 'success');

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
      showMessage(`✗ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-champagne-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-champagne-600 to-rose-600 bg-clip-text text-transparent">
              Welcome to Bella!
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Let's set up your wedding profile
          </p>
        </div>

        {/* Onboarding Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Partner One Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.partnerOneName}
                  onChange={(e) => setFormData({ ...formData, partnerOneName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  placeholder="e.g., Sarah"
                  required
                />
              </div>
            </div>

            {/* Partner Two Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner's Name <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.partnerTwoName}
                  onChange={(e) => setFormData({ ...formData, partnerTwoName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  placeholder="e.g., Michael"
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wedding Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-400">(Optional - for vendor contact)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Vendors can contact you if provided</p>
            </div>

            {/* Message Display */}
            {message.show && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating Profile...' : 'Continue to Dashboard'}
            </button>
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            <span className="inline-block mr-1">🔒</span>
            Your data is encrypted and secure. You can add phone and address later in your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
