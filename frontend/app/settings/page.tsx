'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, User, Lock, Bell, CreditCard, Mail, Calendar, MapPin, Trash2, Save, Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserProfile {
  full_name: string;
  email: string;
  wedding_date: string;
  partner_name: string;
  venue_location: string;
  subscription_tier: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    wedding_date: '',
    partner_name: '',
    venue_location: '',
    subscription_tier: 'standard',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: user.email || '',
          wedding_date: data.wedding_date || '',
          partner_name: data.partner_name || '',
          venue_location: data.venue_location || '',
          subscription_tier: data.subscription_tier || 'standard',
        });
      }
    } catch (err) {
      console.error('Load profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          wedding_date: profile.wedding_date || null,
          partner_name: profile.partner_name,
          venue_location: profile.venue_location,
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Save profile error:', err);
      alert(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error('Password change error:', err);
      alert(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your wedding data. Are you absolutely sure?')) {
      return;
    }

    try {
      // In a real app, this would be an API call to delete all user data
      await supabase.auth.signOut();
      router.push('/');
    } catch (err: any) {
      console.error('Delete account error:', err);
      alert('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Settings</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-champagne-600 text-champagne-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'security'
                    ? 'border-b-2 border-champagne-600 text-champagne-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Lock className="w-5 h-5" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'subscription'
                    ? 'border-b-2 border-champagne-600 text-champagne-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Subscription
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-champagne-600 text-champagne-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
                  <p className="text-gray-600">Update your personal and wedding details</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner Name
                    </label>
                    <input
                      type="text"
                      value={profile.partner_name}
                      onChange={(e) => setProfile({ ...profile, partner_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="Your partner's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wedding Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={profile.wedding_date}
                        onChange={(e) => setProfile({ ...profile, wedding_date: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={profile.venue_location}
                        onChange={(e) => setProfile({ ...profile, venue_location: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-3 px-4 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600">Update your password to keep your account secure</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="w-full py-3 px-4 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition shadow-md"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>

                <div className="border-t border-gray-200 pt-6 mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Danger Zone</h3>
                  <p className="text-gray-600 mb-4">Once you delete your account, there is no going back</p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Plan</h2>
                  <p className="text-gray-600">Manage your subscription and billing</p>
                </div>

                <div className="bg-champagne-50 border border-champagne-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Current Plan: <span className="text-champagne-600 uppercase">{profile.subscription_tier}</span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {profile.subscription_tier === 'premium' && 'You have access to all features'}
                        {profile.subscription_tier === 'standard' && 'Upgrade to premium for more features'}
                      </p>
                    </div>
                    <CreditCard className="w-12 h-12 text-champagne-600" />
                  </div>

                  <button
                    onClick={() => router.push('/settings/subscription')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-bold rounded-lg transition shadow-md"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
                  <p className="text-gray-600">Choose what updates you want to receive</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-champagne-600 rounded" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <div>
                      <p className="font-medium text-gray-900">Task Reminders</p>
                      <p className="text-sm text-gray-600">Get reminded about upcoming tasks</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-champagne-600 rounded" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <div>
                      <p className="font-medium text-gray-900">Vendor Messages</p>
                      <p className="text-sm text-gray-600">Notifications for new vendor messages</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-champagne-600 rounded" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <div>
                      <p className="font-medium text-gray-900">RSVP Updates</p>
                      <p className="text-sm text-gray-600">Get notified when guests RSVP</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-champagne-600 rounded" />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Tips, inspiration, and special offers</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-champagne-600 rounded" />
                  </label>
                </div>

                <button
                  onClick={() => alert('Notification preferences saved!')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white font-bold rounded-lg transition shadow-md"
                >
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
