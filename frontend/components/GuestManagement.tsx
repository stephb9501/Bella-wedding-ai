'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Download, Upload, Search, Filter, UserCheck, UserX, Clock, UtensilsCrossed } from 'lucide-react';

interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  email?: string;
  phone?: string;
  group_name?: string;
  rsvp_status: 'pending' | 'attending' | 'declined';
  plus_one_allowed: boolean;
  plus_one_name?: string;
  plus_one_rsvp?: 'pending' | 'attending' | 'declined';
  dietary_restrictions?: string;
  table_number?: number;
  notes?: string;
  created_at: string;
}

interface GuestManagementProps {
  weddingId: string;
}

export function GuestManagement({ weddingId }: GuestManagementProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRsvp, setFilterRsvp] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    group_name: '',
    rsvp_status: 'pending' as 'pending' | 'attending' | 'declined',
    plus_one_allowed: false,
    plus_one_name: '',
    plus_one_rsvp: 'pending' as 'pending' | 'attending' | 'declined',
    dietary_restrictions: '',
    notes: '',
  });

  useEffect(() => {
    fetchGuests();
  }, [weddingId]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guests?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch guests');
      const data = await response.json();
      setGuests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const guestData = {
        wedding_id: weddingId,
        ...formData,
        ...(editingGuest && { id: editingGuest.id }),
      };

      const url = '/api/guests';
      const method = editingGuest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) throw new Error('Failed to save guest');

      await fetchGuests();
      setIsCreating(false);
      setEditingGuest(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        group_name: '',
        rsvp_status: 'pending',
        plus_one_allowed: false,
        plus_one_name: '',
        plus_one_rsvp: 'pending',
        dietary_restrictions: '',
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (guestId: string) => {
    if (!confirm('Delete this guest?')) return;

    try {
      const response = await fetch(`/api/guests?id=${guestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete guest');
      await fetchGuests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email || '',
      phone: guest.phone || '',
      group_name: guest.group_name || '',
      rsvp_status: guest.rsvp_status,
      plus_one_allowed: guest.plus_one_allowed,
      plus_one_name: guest.plus_one_name || '',
      plus_one_rsvp: guest.plus_one_rsvp || 'pending',
      dietary_restrictions: guest.dietary_restrictions || '',
      notes: guest.notes || '',
    });
    setIsCreating(true);
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Group', 'RSVP', 'Plus One', 'Plus One RSVP', 'Dietary Restrictions', 'Table', 'Notes'],
      ...guests.map(g => [
        g.name,
        g.email || '',
        g.phone || '',
        g.group_name || '',
        g.rsvp_status,
        g.plus_one_allowed ? (g.plus_one_name || 'Allowed') : 'No',
        g.plus_one_rsvp || '',
        g.dietary_restrictions || '',
        g.table_number || '',
        g.notes || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding-guests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.group_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRsvp = filterRsvp === 'all' || guest.rsvp_status === filterRsvp;
    return matchesSearch && matchesRsvp;
  });

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvp_status === 'attending').length,
    declined: guests.filter(g => g.rsvp_status === 'declined').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    plusOnes: guests.filter(g => g.plus_one_allowed && g.plus_one_rsvp === 'attending').length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading guests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Guest List</h3>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} total • {stats.attending} attending • {stats.pending} pending • {stats.declined} declined
              {stats.plusOnes > 0 && ` • ${stats.plusOnes} plus-ones`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>

            <button
              onClick={() => {
                setIsCreating(true);
                setEditingGuest(null);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  group_name: '',
                  rsvp_status: 'pending',
                  plus_one_allowed: false,
                  plus_one_name: '',
                  plus_one_rsvp: 'pending',
                  dietary_restrictions: '',
                  notes: '',
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Guest
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-semibold text-blue-700 uppercase">Total</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-700 uppercase">Attending</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.attending}</p>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-xs font-semibold text-yellow-700 uppercase">Pending</p>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <UserX className="w-4 h-4 text-red-600" />
              <p className="text-xs font-semibold text-red-700 uppercase">Declined</p>
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.declined}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search guests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
            />
          </div>
          <select
            value={filterRsvp}
            onChange={(e) => setFilterRsvp(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
          >
            <option value="all">All RSVPs</option>
            <option value="attending">Attending</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="mt-6 p-6 bg-champagne-50 border border-champagne-200 rounded-xl">
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              {editingGuest ? 'Edit Guest' : 'Add New Guest'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group (e.g., Family, Friends)</label>
                  <input
                    type="text"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Status</label>
                  <select
                    value={formData.rsvp_status}
                    onChange={(e) => setFormData({ ...formData, rsvp_status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <input
                      type="checkbox"
                      checked={formData.plus_one_allowed}
                      onChange={(e) => setFormData({ ...formData, plus_one_allowed: e.target.checked })}
                      className="w-4 h-4 text-champagne-600 rounded focus:ring-champagne-500"
                    />
                    Allow Plus One
                  </label>
                </div>
              </div>

              {formData.plus_one_allowed && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plus One Name</label>
                    <input
                      type="text"
                      value={formData.plus_one_name}
                      onChange={(e) => setFormData({ ...formData, plus_one_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plus One RSVP</label>
                    <select
                      value={formData.plus_one_rsvp}
                      onChange={(e) => setFormData({ ...formData, plus_one_rsvp: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="attending">Attending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                <input
                  type="text"
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                  placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingGuest(null);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
                >
                  {editingGuest ? 'Update Guest' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Guest List */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Group</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">RSVP</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Plus One</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dietary</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No guests found</p>
                </td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{guest.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {guest.email && <div>{guest.email}</div>}
                    {guest.phone && <div>{guest.phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{guest.group_name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      guest.rsvp_status === 'attending' ? 'bg-green-100 text-green-700' :
                      guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {guest.rsvp_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {guest.plus_one_allowed ? (
                      <div>
                        {guest.plus_one_name || 'Allowed'}
                        {guest.plus_one_name && (
                          <span className={`ml-2 text-xs ${
                            guest.plus_one_rsvp === 'attending' ? 'text-green-600' :
                            guest.plus_one_rsvp === 'declined' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            ({guest.plus_one_rsvp})
                          </span>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {guest.dietary_restrictions ? (
                      <div className="flex items-center gap-1">
                        <UtensilsCrossed className="w-3 h-3" />
                        {guest.dietary_restrictions}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(guest)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
