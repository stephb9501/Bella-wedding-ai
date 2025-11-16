'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import {
  Users, CheckCircle, XCircle, Clock, Mail, Phone, Download,
  Filter, Search, Plus, Edit2, Trash2, UserPlus, PieChart
} from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  party: string; // Bride, Groom, Both
  group: string; // Family, Friends, Coworkers, etc.
  rsvpStatus: 'pending' | 'attending' | 'declined' | 'maybe';
  plusOne: boolean;
  plusOneName?: string;
  mealChoice?: string;
  dietaryRestrictions?: string;
  notes?: string;
  inviteSent: boolean;
  rsvpDate?: string;
}

export default function RSVPTrackerPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    party: 'Both',
    group: 'Friends',
    rsvpStatus: 'pending',
    plusOne: false,
    inviteSent: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth?redirect=/rsvp-tracker');
      return;
    }

    loadGuests();
  }, [isAuthenticated, router]);

  const loadGuests = () => {
    // Load from localStorage for now
    const stored = localStorage.getItem(`bella_rsvp_${user?.id}`);
    if (stored) {
      setGuests(JSON.parse(stored));
    } else {
      // Demo data for first time
      const demoGuests: Guest[] = [
        {
          id: '1',
          name: 'John & Sarah Smith',
          email: 'john.smith@email.com',
          party: 'Both',
          group: 'Family',
          rsvpStatus: 'attending',
          plusOne: false,
          mealChoice: 'Chicken',
          inviteSent: true,
          rsvpDate: '2025-10-15',
        },
        {
          id: '2',
          name: 'Emily Johnson',
          email: 'emily.j@email.com',
          party: 'Bride',
          group: 'Friends',
          rsvpStatus: 'pending',
          plusOne: true,
          inviteSent: true,
        },
        {
          id: '3',
          name: 'Michael Davis',
          party: 'Groom',
          group: 'Coworkers',
          rsvpStatus: 'declined',
          plusOne: false,
          inviteSent: true,
          rsvpDate: '2025-10-20',
        },
      ];
      setGuests(demoGuests);
      saveGuests(demoGuests);
    }
  };

  const saveGuests = (guestList: Guest[]) => {
    localStorage.setItem(`bella_rsvp_${user?.id}`, JSON.stringify(guestList));
    setGuests(guestList);
  };

  const addGuest = () => {
    if (!newGuest.name) {
      alert('Please enter guest name');
      return;
    }

    const guest: Guest = {
      id: Date.now().toString(),
      name: newGuest.name,
      email: newGuest.email,
      phone: newGuest.phone,
      party: (newGuest.party as any) || 'Both',
      group: (newGuest.group as any) || 'Friends',
      rsvpStatus: 'pending',
      plusOne: newGuest.plusOne || false,
      plusOneName: newGuest.plusOneName,
      inviteSent: false,
    };

    saveGuests([...guests, guest]);
    setShowAddModal(false);
    setNewGuest({
      party: 'Both',
      group: 'Friends',
      rsvpStatus: 'pending',
      plusOne: false,
      inviteSent: false,
    });
  };

  const updateRSVP = (guestId: string, status: 'attending' | 'declined' | 'maybe') => {
    const updated = guests.map(g =>
      g.id === guestId
        ? { ...g, rsvpStatus: status, rsvpDate: new Date().toISOString().split('T')[0] }
        : g
    );
    saveGuests(updated);
  };

  const deleteGuest = (guestId: string) => {
    if (confirm('Remove this guest from your list?')) {
      saveGuests(guests.filter(g => g.id !== guestId));
    }
  };

  const markInviteSent = (guestId: string) => {
    const updated = guests.map(g =>
      g.id === guestId ? { ...g, inviteSent: true } : g
    );
    saveGuests(updated);
  };

  // Statistics
  const stats = {
    total: guests.length,
    totalWithPlusOnes: guests.reduce((sum, g) => sum + (g.plusOne ? 2 : 1), 0),
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    attendingWithPlusOnes: guests
      .filter(g => g.rsvpStatus === 'attending')
      .reduce((sum, g) => sum + (g.plusOne ? 2 : 1), 0),
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    invitesSent: guests.filter(g => g.inviteSent).length,
    responseRate: guests.filter(g => g.rsvpStatus !== 'pending').length / Math.max(guests.length, 1),
  };

  // Filtered guests
  const filteredGuests = guests
    .filter(g => {
      if (filterStatus !== 'all' && g.rsvpStatus !== filterStatus) return false;
      if (filterGroup !== 'all' && g.group !== filterGroup) return false;
      if (searchTerm && !g.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'maybe':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-rose-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-champagne-900 mb-3">RSVP Tracker</h1>
          <p className="text-xl text-champagne-700">
            Manage your guest list and track responses
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-champagne-900">{stats.totalWithPlusOnes}</div>
            <div className="text-sm text-champagne-600">Total Invited</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600">{stats.attendingWithPlusOnes}</div>
            <div className="text-sm text-champagne-600">Attending</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-600">{stats.declined}</div>
            <div className="text-sm text-champagne-600">Declined</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-champagne-600">Pending</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <PieChart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-600">{Math.round(stats.responseRate * 100)}%</div>
            <div className="text-sm text-champagne-600">Response Rate</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="attending">Attending</option>
              <option value="declined">Declined</option>
              <option value="maybe">Maybe</option>
            </select>

            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Groups</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends</option>
              <option value="Coworkers">Coworkers</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Guest
            </button>
          </div>

          <div className="flex gap-4">
            <button className="px-4 py-2 bg-champagne-100 text-champagne-700 rounded-lg hover:bg-champagne-200 transition-colors text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Pending Guests
            </button>
          </div>
        </div>

        {/* Guest List Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-champagne-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Group</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Plus One</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-champagne-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredGuests.length > 0 ? (
                  filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-champagne-900">{guest.name}</div>
                        {guest.party && <div className="text-xs text-champagne-600">{guest.party} Side</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-champagne-700">{guest.group}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(guest.rsvpStatus)}
                          <span className="text-sm font-medium capitalize">{guest.rsvpStatus}</span>
                        </div>
                        {guest.rsvpDate && <div className="text-xs text-gray-500 mt-1">{guest.rsvpDate}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {guest.plusOne ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {guest.email && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Mail className="w-4 h-4" />
                            <span className="text-xs">{guest.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {guest.rsvpStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => updateRSVP(guest.id, 'attending')}
                                className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Mark Attending"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateRSVP(guest.id, 'declined')}
                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Mark Declined"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteGuest(guest.id)}
                            className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            title="Delete Guest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No guests found. Click "Add Guest" to start building your list!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Guest Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
              <h2 className="text-2xl font-serif text-champagne-900 mb-6">Add Guest</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    value={newGuest.name || ''}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John & Jane Smith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Party</label>
                    <select
                      value={newGuest.party || 'Both'}
                      onChange={(e) => setNewGuest({ ...newGuest, party: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Bride">Bride Side</option>
                      <option value="Groom">Groom Side</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                    <select
                      value={newGuest.group || 'Friends'}
                      onChange={(e) => setNewGuest({ ...newGuest, group: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Family">Family</option>
                      <option value="Friends">Friends</option>
                      <option value="Coworkers">Coworkers</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newGuest.email || ''}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="guest@email.com"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="plusOne"
                    checked={newGuest.plusOne || false}
                    onChange={(e) => setNewGuest({ ...newGuest, plusOne: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="plusOne" className="text-sm font-medium text-gray-700">
                    Allow Plus One
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addGuest}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Guest
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
