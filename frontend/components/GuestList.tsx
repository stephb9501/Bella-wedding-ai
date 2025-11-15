'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Mail, Phone, MapPin, Users } from 'lucide-react';

interface Guest {
  id: string;
  wedding_id: string;
  guest_token: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rsvp_status: 'pending' | 'yes' | 'no';
  has_plus_one: boolean;
  plus_one_name: string;
  dietary_restrictions: string;
  link_clicked: boolean;
  response_submitted: boolean;
  created_at: string;
}

export function GuestList({ weddingId }: { weddingId: string }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchGuests();
  }, [weddingId]);

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/guests?weddingId=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch guests');
      const data = await response.json();
      setGuests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedding_id: weddingId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to add guest');

      await fetchGuests();
      setFormData({ name: '', email: '', phone: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!confirm('Delete this guest?')) return;

    try {
      const response = await fetch(`/api/guests?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete guest');
      await fetchGuests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const copyGuestLink = async (guestToken: string, guestId: string) => {
    const link = `${window.location.origin}/guest-response/${guestToken}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(guestId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stats = {
    total: guests.length,
    responded: guests.filter(g => g.rsvp_status !== 'pending').length,
    yes: guests.filter(g => g.rsvp_status === 'yes').length,
    no: guests.filter(g => g.rsvp_status === 'no').length,
    addressCollected: guests.filter(g => g.address).length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">👥 Guest List</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {showForm ? 'Cancel' : '+ Add Guest'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Guests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">RSVPed Yes</p>
            <p className="text-2xl font-bold text-green-600">{stats.yes}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">RSVPed No</p>
            <p className="text-2xl font-bold text-red-600">{stats.no}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Responded</p>
            <p className="text-2xl font-bold text-blue-600">{stats.responded}/{stats.total}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Addresses</p>
            <p className="text-2xl font-bold text-purple-600">{stats.addressCollected}/{stats.total}</p>
          </div>
        </div>

        {/* Add Guest Form */}
        {showForm && (
          <form onSubmit={handleAddGuest} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {loading ? 'Adding...' : 'Add Guest'}
            </button>
          </form>
        )}

        {/* Guest List */}
        <div className="overflow-x-auto">
          {guests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No guests added yet. Click "Add Guest" to get started!</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">RSVP</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Address</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">+1</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Link</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map(guest => (
                  <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-900">{guest.name}</p>
                      {guest.dietary_restrictions && (
                        <p className="text-xs text-gray-600">🍽️ {guest.dietary_restrictions}</p>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {guest.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {guest.email}
                        </p>
                      )}
                      {guest.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {guest.phone}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        guest.rsvp_status === 'yes' ? 'bg-green-100 text-green-800' :
                        guest.rsvp_status === 'no' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {guest.rsvp_status === 'pending' ? 'Pending' : guest.rsvp_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {guest.address ? (
                        <p className="text-sm text-gray-600">
                          <MapPin className="w-3 h-3 inline" /> {guest.city}, {guest.state}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-400">Not provided</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {guest.has_plus_one ? (
                        <span className="text-sm text-green-600">✓ {guest.plus_one_name || 'Yes'}</span>
                      ) : (
                        <span className="text-sm text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => copyGuestLink(guest.guest_token, guest.id)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {copiedId === guest.id ? (
                          <>
                            <Check className="w-4 h-4" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copy
                          </>
                        )}
                      </button>
                      {guest.link_clicked && (
                        <span className="text-xs text-green-600">✓ Clicked</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
