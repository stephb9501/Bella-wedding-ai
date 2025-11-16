'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import {
  Heart, User, Bell, Shield, Save, Calendar, MapPin, Users,
  DollarSign, Palette, Globe, Mail, MessageSquare, Check
} from 'lucide-react';

interface WeddingProfile {
  partner_one_name: string;
  partner_two_name: string;
  wedding_date: string;
  wedding_location: string;
  venue_name: string;
  guest_count: number;
  budget_total: number;
  wedding_theme: string;
  timezone: string;
}

interface UserPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  task_reminders: boolean;
  vendor_messages: boolean;
  marketing_emails: boolean;
  reminder_days_before: number;
  theme_preference: string;
  language: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<WeddingProfile>({
    partner_one_name: '',
    partner_two_name: '',
    wedding_date: '',
    wedding_location: '',
    venue_name: '',
    guest_count: 0,
    budget_total: 0,
    wedding_theme: '',
    timezone: 'America/New_York'
  });

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    sms_notifications: false,
    task_reminders: true,
    vendor_messages: true,
    marketing_emails: false,
    reminder_days_before: 7,
    theme_preference: 'light',
    language: 'en'
  });

  // Load data
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchProfile();
      fetchPreferences();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/settings/profile?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile({
            partner_one_name: data.profile.partner_one_name || '',
            partner_two_name: data.profile.partner_two_name || '',
            wedding_date: data.profile.wedding_date || '',
            wedding_location: data.profile.wedding_location || '',
            venue_name: data.profile.venue_name || '',
            guest_count: data.profile.guest_count || 0,
            budget_total: data.profile.budget_total || 0,
            wedding_theme: data.profile.wedding_theme || '',
            timezone: data.profile.timezone || 'America/New_York'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPreferences = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/settings/preferences?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          partnerOneName: profile.partner_one_name,
          partnerTwoName: profile.partner_two_name,
          weddingDate: profile.wedding_date,
          weddingLocation: profile.wedding_location,
          venueName: profile.venue_name,
          guestCount: profile.guest_count,
          budgetTotal: profile.budget_total,
          weddingTheme: profile.wedding_theme,
          timezone: profile.timezone
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          emailNotifications: preferences.email_notifications,
          smsNotifications: preferences.sms_notifications,
          taskReminders: preferences.task_reminders,
          vendorMessages: preferences.vendor_messages,
          marketingEmails: preferences.marketing_emails,
          reminderDaysBefore: preferences.reminder_days_before,
          themePreference: preferences.theme_preference,
          language: preferences.language
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Settings & Profile"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Customize Your Experience</h2>
              <p className="text-champagne-700">
                Manage your wedding details, notification preferences, and account settings all in one place.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <User className="w-12 h-12 text-champagne-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Wedding Profile</h3>
                <p className="text-sm text-champagne-600">Store your wedding details, venue, and guest count</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Bell className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Notifications</h3>
                <p className="text-sm text-champagne-600">Control email, SMS, and task reminder preferences</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Security</h3>
                <p className="text-sm text-champagne-600">Manage password and account security settings</p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-champagne-900 mb-2">Settings</h1>
          <p className="text-champagne-700">Manage your wedding profile and preferences</p>
        </div>

        {/* Save Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Settings saved successfully!</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-champagne-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'profile'
                ? 'border-b-2 border-champagne-600 text-champagne-900'
                : 'text-champagne-600 hover:text-champagne-900'
            }`}
          >
            <User className="w-5 h-5 inline-block mr-2" />
            Wedding Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'preferences'
                ? 'border-b-2 border-champagne-600 text-champagne-900'
                : 'text-champagne-600 hover:text-champagne-900'
            }`}
          >
            <Bell className="w-5 h-5 inline-block mr-2" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'security'
                ? 'border-b-2 border-champagne-600 text-champagne-900'
                : 'text-champagne-600 hover:text-champagne-900'
            }`}
          >
            <Shield className="w-5 h-5 inline-block mr-2" />
            Security
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-serif text-champagne-900 mb-6">Wedding Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <User className="w-4 h-4 inline-block mr-1" />
                  Partner One Name
                </label>
                <input
                  type="text"
                  value={profile.partner_one_name}
                  onChange={(e) => setProfile({ ...profile, partner_one_name: e.target.value })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., Sarah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <User className="w-4 h-4 inline-block mr-1" />
                  Partner Two Name
                </label>
                <input
                  type="text"
                  value={profile.partner_two_name}
                  onChange={(e) => setProfile({ ...profile, partner_two_name: e.target.value })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={profile.wedding_date}
                  onChange={(e) => setProfile({ ...profile, wedding_date: e.target.value })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  Wedding Location
                </label>
                <input
                  type="text"
                  value={profile.wedding_location}
                  onChange={(e) => setProfile({ ...profile, wedding_location: e.target.value })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., Napa Valley, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  Venue Name
                </label>
                <input
                  type="text"
                  value={profile.venue_name}
                  onChange={(e) => setProfile({ ...profile, venue_name: e.target.value })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., Sunset Vineyard Estate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <Users className="w-4 h-4 inline-block mr-1" />
                  Guest Count
                </label>
                <input
                  type="number"
                  value={profile.guest_count || ''}
                  onChange={(e) => setProfile({ ...profile, guest_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., 150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <DollarSign className="w-4 h-4 inline-block mr-1" />
                  Total Budget
                </label>
                <input
                  type="number"
                  value={profile.budget_total || ''}
                  onChange={(e) => setProfile({ ...profile, budget_total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., 30000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <Palette className="w-4 h-4 inline-block mr-1" />
                  Wedding Theme
                </label>
                <select
                  value={profile.wedding_theme}
                  onChange={(e) => setProfile({ ...profile, wedding_theme: e.target.value })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  <option value="">Select a theme</option>
                  <option value="modern">Modern Minimalist</option>
                  <option value="rustic">Rustic Charm</option>
                  <option value="boho">Boho Chic</option>
                  <option value="glamorous">Glamorous</option>
                  <option value="garden">Garden Romance</option>
                  <option value="vintage">Vintage Elegance</option>
                  <option value="industrial">Industrial Modern</option>
                  <option value="beach">Beach/Coastal</option>
                  <option value="fairytale">Fairytale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  <Globe className="w-4 h-4 inline-block mr-1" />
                  Timezone
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="America/Anchorage">Alaska Time</option>
                  <option value="Pacific/Honolulu">Hawaii Time</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-serif text-champagne-900 mb-6">Notification Preferences</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-champagne-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-champagne-600" />
                  <div>
                    <div className="font-medium text-champagne-900">Email Notifications</div>
                    <div className="text-sm text-champagne-600">Receive updates about your wedding planning</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email_notifications}
                    onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-champagne-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-champagne-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-champagne-100">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-champagne-600" />
                  <div>
                    <div className="font-medium text-champagne-900">SMS Notifications</div>
                    <div className="text-sm text-champagne-600">Get text message reminders</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sms_notifications}
                    onChange={(e) => setPreferences({ ...preferences, sms_notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-champagne-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-champagne-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-champagne-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-champagne-600" />
                  <div>
                    <div className="font-medium text-champagne-900">Task Reminders</div>
                    <div className="text-sm text-champagne-600">Reminders for upcoming tasks and deadlines</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.task_reminders}
                    onChange={(e) => setPreferences({ ...preferences, task_reminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-champagne-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-champagne-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-champagne-100">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-champagne-600" />
                  <div>
                    <div className="font-medium text-champagne-900">Vendor Messages</div>
                    <div className="text-sm text-champagne-600">Get notified of messages from vendors</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.vendor_messages}
                    onChange={(e) => setPreferences({ ...preferences, vendor_messages: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-champagne-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-champagne-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-champagne-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-champagne-600" />
                  <div>
                    <div className="font-medium text-champagne-900">Marketing Emails</div>
                    <div className="text-sm text-champagne-600">Tips, offers, and wedding inspiration</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing_emails}
                    onChange={(e) => setPreferences({ ...preferences, marketing_emails: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-champagne-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-champagne-600"></div>
                </label>
              </div>

              <div className="py-3">
                <label className="block text-sm font-medium text-champagne-700 mb-2">
                  Reminder Days Before Tasks
                </label>
                <select
                  value={preferences.reminder_days_before}
                  onChange={(e) => setPreferences({ ...preferences, reminder_days_before: parseInt(e.target.value) })}
                  className="w-full md:w-64 px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                  <option value="14">2 weeks before</option>
                  <option value="30">1 month before</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="px-6 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-serif text-champagne-900 mb-6">Security Settings</h2>

            <div className="space-y-6">
              <div className="border border-champagne-200 rounded-lg p-6">
                <h3 className="font-semibold text-champagne-900 mb-2">Change Password</h3>
                <p className="text-sm text-champagne-600 mb-4">Update your password to keep your account secure</p>
                <button className="px-4 py-2 bg-champagne-100 text-champagne-700 rounded-lg font-medium hover:bg-champagne-200">
                  Change Password
                </button>
              </div>

              <div className="border border-champagne-200 rounded-lg p-6">
                <h3 className="font-semibold text-champagne-900 mb-2">Email Verification</h3>
                <p className="text-sm text-champagne-600 mb-4">Verify your email address to enhance security</p>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Email Verified</span>
                </div>
              </div>

              <div className="border border-champagne-200 rounded-lg p-6">
                <h3 className="font-semibold text-champagne-900 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-champagne-600 mb-4">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 bg-champagne-100 text-champagne-700 rounded-lg font-medium hover:bg-champagne-200">
                  Enable 2FA
                </button>
              </div>

              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
                <p className="text-sm text-red-700 mb-4">Permanently delete your account and all associated data</p>
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
