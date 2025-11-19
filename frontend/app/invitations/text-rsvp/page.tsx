'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Users, CheckCircle, XCircle, Clock, ChevronLeft,
  Mail, Phone, Copy, Download, Plus, Trash2, Eye, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

interface TextInvite {
  id: number;
  guest_name: string;
  guest_phone: string;
  rsvp_token: string;
  sent_at: string | null;
  delivered: boolean;
  opened: boolean;
  rsvp_status: 'pending' | 'yes' | 'no';
  rsvp_at: string | null;
  message: string | null;
  meal_choice: string | null;
  plus_ones: number;
}

interface Guest {
  id: number;
  name: string;
  phone: string;
}

export default function TextRSVPPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [textInvites, setTextInvites] = useState<TextInvite[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);

  // New guest form
  const [newGuest, setNewGuest] = useState({ name: '', phone: '' });

  // Load existing text invites
  useEffect(() => {
    if (!user) return;

    const loadTextInvites = async () => {
      try {
        const response = await fetch(`/api/invitations/text-invites?email=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setTextInvites(data);
        }
      } catch (error) {
        console.error('Error loading text invites:', error);
      }
    };

    loadTextInvites();
  }, [user]);

  // Load guests from guest list
  useEffect(() => {
    if (!user) return;

    const loadGuests = async () => {
      try {
        const userResponse = await fetch(`/api/users?email=${user.email}`);
        const userData = await userResponse.json();

        const guestsResponse = await fetch(`/api/guests?weddingId=${userData.id}`);
        if (guestsResponse.ok) {
          const guestData = await guestsResponse.json();
          setGuests(guestData.filter((g: any) => g.phone).map((g: any) => ({
            id: g.id,
            name: g.name,
            phone: g.phone
          })));
        }
      } catch (error) {
        console.error('Error loading guests:', error);
      }
    };

    loadGuests();
  }, [user]);

  // Toggle guest selection
  const toggleGuestSelection = (guestId: number) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  // Add new guest
  const handleAddGuest = () => {
    if (!newGuest.name || !newGuest.phone) return;

    const guest: Guest = {
      id: Date.now(),
      name: newGuest.name,
      phone: newGuest.phone,
    };

    setGuests(prev => [...prev, guest]);
    setNewGuest({ name: '', phone: '' });
    setShowAddGuest(false);
  };

  // Send bulk text invites
  const sendTextInvites = async () => {
    if (!user || selectedGuests.length === 0) return;

    setSending(true);
    try {
      const selectedGuestData = guests.filter(g => selectedGuests.includes(g.id));

      const response = await fetch('/api/invitations/send-texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          guests: selectedGuestData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTextInvites(data.invites);
        setSelectedGuests([]);
        alert(`Successfully sent ${data.sent} text invitations!`);
      } else {
        alert('Failed to send text invitations. Check Twilio credentials.');
      }
    } catch (error) {
      console.error('Error sending text invites:', error);
      alert('Error sending text invitations');
    } finally {
      setSending(false);
    }
  };

  // Copy RSVP link
  const copyRSVPLink = (token: string) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    alert('RSVP link copied to clipboard!');
  };

  // Get stats
  const stats = {
    total: textInvites.length,
    sent: textInvites.filter(i => i.sent_at).length,
    delivered: textInvites.filter(i => i.delivered).length,
    opened: textInvites.filter(i => i.opened).length,
    responded: textInvites.filter(i => i.rsvp_status !== 'pending').length,
    attending: textInvites.filter(i => i.rsvp_status === 'yes').length,
    declined: textInvites.filter(i => i.rsvp_status === 'no').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-champagne-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWall featureName="Text RSVP System" fullLock={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/invitations')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-gray-900">
                    Text RSVP System
                  </h1>
                  <p className="text-sm text-gray-600">Send text invites and track RSVPs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attending}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-champagne-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-gray-900">{stats.declined}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Send Invites */}
          <div className="bg-white rounded-2xl shadow-sm border border-champagne-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Send Text Invites
              </h2>
              <button
                onClick={() => setShowAddGuest(true)}
                className="flex items-center gap-2 px-3 py-2 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Guest
              </button>
            </div>

            {showAddGuest && (
              <div className="mb-6 p-4 bg-champagne-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Guest</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (e.g., +1234567890)"
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddGuest}
                      className="flex-1 px-4 py-2 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddGuest(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {guests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No guests with phone numbers. Add guests above.
                </p>
              ) : (
                guests.map((guest) => (
                  <div
                    key={guest.id}
                    className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                      selectedGuests.includes(guest.id)
                        ? 'border-champagne-600 bg-champagne-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleGuestSelection(guest.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{guest.name}</p>
                        <p className="text-sm text-gray-600">{guest.phone}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedGuests.includes(guest.id)}
                        onChange={() => toggleGuestSelection(guest.id)}
                        className="w-5 h-5 text-champagne-600 rounded"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={sendTextInvites}
              disabled={sending || selectedGuests.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : `Send to ${selectedGuests.length} Guest${selectedGuests.length !== 1 ? 's' : ''}`}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Note: Requires Twilio API credentials in environment variables
            </p>
          </div>

          {/* Right: Sent Invites & Responses */}
          <div className="bg-white rounded-2xl shadow-sm border border-champagne-100 p-6">
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">
              Sent Invites & Responses
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {textInvites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No text invites sent yet. Select guests and send invites.
                </p>
              ) : (
                textInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{invite.guest_name}</p>
                        <p className="text-sm text-gray-600">{invite.guest_phone}</p>
                      </div>
                      <button
                        onClick={() => copyRSVPLink(invite.rsvp_token)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Copy RSVP link"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          invite.rsvp_status === 'yes'
                            ? 'bg-green-100 text-green-700'
                            : invite.rsvp_status === 'no'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {invite.rsvp_status === 'yes' ? 'Attending' : invite.rsvp_status === 'no' ? 'Declined' : 'Pending'}
                      </span>
                      {invite.delivered && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                          Delivered
                        </span>
                      )}
                      {invite.opened && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                          Opened
                        </span>
                      )}
                    </div>

                    {invite.rsvp_status !== 'pending' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                        {invite.plus_ones > 0 && (
                          <p className="text-gray-700">Plus ones: {invite.plus_ones}</p>
                        )}
                        {invite.meal_choice && (
                          <p className="text-gray-700">Meal: {invite.meal_choice}</p>
                        )}
                        {invite.message && (
                          <p className="text-gray-700 italic mt-1">&quot;{invite.message}&quot;</p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                          Responded {new Date(invite.rsvp_at!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
