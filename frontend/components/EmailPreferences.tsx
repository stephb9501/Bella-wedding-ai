'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Calendar, Star, TrendingUp, Briefcase, Gift } from 'lucide-react';

interface EmailPreference {
  key: string;
  label: string;
  description: string;
  icon: any;
  category: 'essential' | 'updates' | 'marketing';
}

const emailPreferences: EmailPreference[] = [
  {
    key: 'booking_confirmed',
    label: 'Booking Confirmations',
    description: 'Get notified when vendors confirm your bookings',
    icon: Calendar,
    category: 'essential',
  },
  {
    key: 'booking_reminder',
    label: 'Booking Reminders',
    description: 'Reminders for upcoming vendor bookings and events',
    icon: Bell,
    category: 'essential',
  },
  {
    key: 'message_notification',
    label: 'New Messages',
    description: 'Notifications when you receive messages from vendors or couples',
    icon: MessageSquare,
    category: 'essential',
  },
  {
    key: 'vendor_lead',
    label: 'New Leads (Vendors)',
    description: 'Get notified when couples request your services',
    icon: Briefcase,
    category: 'essential',
  },
  {
    key: 'review_request',
    label: 'Review Requests',
    description: 'Reminders to review vendors after your event',
    icon: Star,
    category: 'updates',
  },
  {
    key: 'weekly_digest',
    label: 'Weekly Planning Digest',
    description: 'Weekly summary of your wedding planning progress',
    icon: TrendingUp,
    category: 'updates',
  },
  {
    key: 'welcome',
    label: 'Welcome Emails',
    description: 'Welcome messages and getting started guides',
    icon: Gift,
    category: 'updates',
  },
  {
    key: 'marketing_emails',
    label: 'Marketing Emails',
    description: 'Special offers, tips, and wedding inspiration',
    icon: Mail,
    category: 'marketing',
  },
  {
    key: 'product_updates',
    label: 'Product Updates',
    description: 'News about new features and improvements',
    icon: TrendingUp,
    category: 'marketing',
  },
];

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current preferences
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();

      // Convert to Record<string, boolean>
      const prefs: Record<string, boolean> = {};
      emailPreferences.forEach(pref => {
        prefs[pref.key] = data[pref.key] ?? true;
      });

      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load email preferences' });

      // Set defaults if fetch fails
      const defaults: Record<string, boolean> = {};
      emailPreferences.forEach(pref => {
        defaults[pref.key] = true;
      });
      setPreferences(defaults);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setMessage({ type: 'success', text: 'Email preferences saved successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const renderPreferencesByCategory = (category: 'essential' | 'updates' | 'marketing') => {
    const categoryPrefs = emailPreferences.filter(p => p.category === category);

    return categoryPrefs.map(pref => {
      const Icon = pref.icon;
      const isEnabled = preferences[pref.key] ?? true;

      return (
        <div
          key={pref.key}
          className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-rose-300 transition-colors"
        >
          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-rose-100' : 'bg-gray-100'}`}>
            <Icon className={`w-5 h-5 ${isEnabled ? 'text-rose-600' : 'text-gray-400'}`} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{pref.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
          </div>

          <button
            onClick={() => handleToggle(pref.key)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-rose-600' : 'bg-gray-300'
            }`}
            disabled={loading}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3 mt-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h1>
        <p className="text-gray-600">
          Manage which email notifications you want to receive. You can always change these settings later.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Essential Notifications */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Essential Notifications</h2>
            <p className="text-sm text-gray-600 mt-1">
              Important updates about your bookings and messages
            </p>
          </div>
          <div className="space-y-3">
            {renderPreferencesByCategory('essential')}
          </div>
        </section>

        {/* Updates & Activity */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Updates & Activity</h2>
            <p className="text-sm text-gray-600 mt-1">
              Stay updated with your planning progress and activity
            </p>
          </div>
          <div className="space-y-3">
            {renderPreferencesByCategory('updates')}
          </div>
        </section>

        {/* Marketing & Promotional */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Marketing & Promotional</h2>
            <p className="text-sm text-gray-600 mt-1">
              Special offers, tips, and inspiration for your wedding
            </p>
          </div>
          <div className="space-y-3">
            {renderPreferencesByCategory('marketing')}
          </div>
        </section>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>

        <button
          onClick={fetchPreferences}
          disabled={loading || saving}
          className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Unsubscribe Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> You can also unsubscribe from all emails using the link at the bottom
          of any email we send you. However, we strongly recommend keeping essential notifications
          enabled to stay updated on your bookings and important messages.
        </p>
      </div>
    </div>
  );
}
