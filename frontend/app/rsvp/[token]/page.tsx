'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, CheckCircle, XCircle, Loader, Users, MessageSquare } from 'lucide-react';

interface InviteData {
  guest_name: string;
  rsvp_status: string;
}

export default function GuestRSVPPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    attending: '',
    mealChoice: '',
    plusOnes: 0,
    message: '',
  });

  // Load invitation data
  useEffect(() => {
    const loadInvite = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/invitations/rsvp?token=${token}`);
        if (response.ok) {
          const data = await response.json();
          setInviteData(data);

          // Mark as opened
          await fetch('/api/invitations/rsvp', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, opened: true }),
          });

          // Check if already responded
          if (data.rsvp_status !== 'pending') {
            setSubmitted(true);
          }
        } else {
          setError('Invalid invitation link');
        }
      } catch (err) {
        setError('Error loading invitation');
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  // Submit RSVP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.attending) {
      alert('Please select whether you will be attending');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/invitations/rsvp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rsvp_status: formData.attending,
          meal_choice: formData.mealChoice,
          plus_ones: formData.plusOnes,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit RSVP. Please try again.');
      }
    } catch (error) {
      alert('Error submitting RSVP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-champagne-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Invitation Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Thank You!
          </h1>
          <p className="text-gray-600 mb-4">
            {formData.attending === 'yes' || inviteData?.rsvp_status === 'yes'
              ? "We can't wait to celebrate with you!"
              : "We'll miss you at the celebration."}
          </p>
          <p className="text-sm text-gray-500">
            Your RSVP has been recorded. You'll receive a confirmation email shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            You're Invited!
          </h1>
          <p className="text-xl text-gray-600">
            {inviteData?.guest_name}
          </p>
        </div>

        {/* RSVP Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Attending */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Will you be attending?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, attending: 'yes' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.attending === 'yes'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                    formData.attending === 'yes' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium text-gray-900">Joyfully Accept</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, attending: 'no' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.attending === 'no'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <XCircle className={`w-8 h-8 mx-auto mb-2 ${
                    formData.attending === 'no' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="font-medium text-gray-900">Regretfully Decline</p>
                </button>
              </div>
            </div>

            {formData.attending === 'yes' && (
              <>
                {/* Meal Choice */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Meal Preference
                  </label>
                  <select
                    value={formData.mealChoice}
                    onChange={(e) => setFormData({ ...formData, mealChoice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  >
                    <option value="">Select a meal</option>
                    <option value="chicken">Chicken</option>
                    <option value="beef">Beef</option>
                    <option value="fish">Fish</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                {/* Plus Ones */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Number of Additional Guests
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, plusOnes: Math.max(0, formData.plusOnes - 1) })}
                      className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-xl"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                      {formData.plusOnes}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, plusOnes: Math.min(5, formData.plusOnes + 1) })}
                      className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Message */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Message to the Couple (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                placeholder="Share your excitement or well wishes..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.attending}
              className="w-full py-4 bg-gradient-to-r from-champagne-600 to-rose-600 text-white rounded-lg hover:from-champagne-700 hover:to-rose-700 transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit RSVP'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Questions? Contact the couple directly.
        </p>
      </div>
    </div>
  );
}
