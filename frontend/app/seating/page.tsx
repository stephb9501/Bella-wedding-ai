'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Plus, Users, Trash2, Edit3, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';

interface Guest {
  id: number;
  name: string;
  email?: string;
  tableId: number | null;
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangle';
  tableNumber: number;
  guests: Guest[];
}

export default function SeatingChart() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [unassigned, setUnassigned] = useState<Guest[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(8);
  const [newTableShape, setNewTableShape] = useState<'round' | 'rectangle'>('round');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Get user ID from database
  useEffect(() => {
    async function fetchUserId() {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (data && !error) {
        setUserId(data.id);
      }
    }

    if (user) {
      fetchUserId();
    }
  }, [user]);

  // Load seating data from database
  useEffect(() => {
    async function loadSeatingData() {
      if (!userId) return;

      try {
        setLoading(true);

        // Fetch tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('seating_tables')
          .select('*')
          .eq('user_id', userId)
          .order('table_number');

        if (tablesError) throw tablesError;

        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('seating_assignments')
          .select('*')
          .eq('user_id', userId);

        if (assignmentsError) throw assignmentsError;

        // Map data to state structure
        const tablesWithGuests: Table[] = (tablesData || []).map(table => ({
          id: table.id,
          name: table.table_name,
          capacity: table.capacity,
          shape: table.shape as 'round' | 'rectangle',
          tableNumber: table.table_number,
          guests: (assignmentsData || [])
            .filter(a => a.table_id === table.id)
            .map(a => ({
              id: a.id,
              name: a.guest_name,
              email: a.guest_email,
              tableId: a.table_id,
            })),
        }));

        // Unassigned guests are those with null table_id
        const unassignedGuests: Guest[] = (assignmentsData || [])
          .filter(a => a.table_id === null)
          .map(a => ({
            id: a.id,
            name: a.guest_name,
            email: a.guest_email,
            tableId: null,
          }));

        setTables(tablesWithGuests);
        setUnassigned(unassignedGuests);
      } catch (error) {
        console.error('Error loading seating data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSeatingData();
  }, [userId]);

  const addTable = async () => {
    if (!newTableName || !userId) return;

    try {
      setSaving(true);
      const tableNumber = tables.length + 1;

      const { data, error } = await supabase
        .from('seating_tables')
        .insert({
          user_id: userId,
          table_number: tableNumber,
          table_name: newTableName,
          capacity: newTableCapacity,
          shape: newTableShape,
        })
        .select()
        .single();

      if (error) throw error;

      const newTable: Table = {
        id: data.id,
        name: data.table_name,
        capacity: data.capacity,
        shape: data.shape,
        tableNumber: data.table_number,
        guests: [],
      };

      setTables([...tables, newTable]);
      setNewTableName('');
      setNewTableCapacity(8);
      setNewTableShape('round');
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Failed to add table. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const assignGuest = async (guestId: number, tableId: number) => {
    const guest = unassigned.find(g => g.id === guestId);
    if (!guest || !userId) return;

    const table = tables.find(t => t.id === tableId);
    if (!table || table.guests.length >= table.capacity) {
      alert('Table is full!');
      return;
    }

    try {
      setSaving(true);

      // Update the assignment in database
      const { error } = await supabase
        .from('seating_assignments')
        .update({ table_id: tableId })
        .eq('id', guestId);

      if (error) throw error;

      // Update local state
      guest.tableId = tableId;
      setUnassigned(unassigned.filter(g => g.id !== guestId));
      setTables(tables.map(t =>
        t.id === tableId ? { ...t, guests: [...t.guests, guest] } : t
      ));
    } catch (error) {
      console.error('Error assigning guest:', error);
      alert('Failed to assign guest. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const unassignGuest = async (guestId: number, tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !userId) return;

    const guest = table.guests.find(g => g.id === guestId);
    if (!guest) return;

    try {
      setSaving(true);

      // Update the assignment in database
      const { error } = await supabase
        .from('seating_assignments')
        .update({ table_id: null })
        .eq('id', guestId);

      if (error) throw error;

      // Update local state
      guest.tableId = null;
      setUnassigned([...unassigned, guest]);
      setTables(tables.map(t =>
        t.id === tableId ? { ...t, guests: t.guests.filter(g => g.id !== guestId) } : t
      ));
    } catch (error) {
      console.error('Error unassigning guest:', error);
      alert('Failed to unassign guest. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTable = async (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !userId) return;

    if (!confirm(`Are you sure you want to delete "${table.name}"? Guests will be unassigned.`)) {
      return;
    }

    try {
      setSaving(true);

      // First, unassign all guests from this table
      if (table.guests.length > 0) {
        const { error: updateError } = await supabase
          .from('seating_assignments')
          .update({ table_id: null })
          .eq('table_id', tableId);

        if (updateError) throw updateError;
      }

      // Then delete the table
      const { error } = await supabase
        .from('seating_tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;

      // Update local state
      const freedGuests = table.guests.map(g => ({ ...g, tableId: null }));
      setUnassigned([...unassigned, ...freedGuests]);
      setTables(tables.filter(t => t.id !== tableId));
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Failed to delete table. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add a new guest to unassigned
  const addGuest = async (name: string, email?: string) => {
    if (!name || !userId) return;

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('seating_assignments')
        .insert({
          user_id: userId,
          guest_name: name,
          guest_email: email,
          table_id: null,
        })
        .select()
        .single();

      if (error) throw error;

      const newGuest: Guest = {
        id: data.id,
        name: data.guest_name,
        email: data.guest_email,
        tableId: null,
      };

      setUnassigned([...unassigned, newGuest]);
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('Failed to add guest. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-champagne-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading seating chart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your seating chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Seating Chart</h1>
            {saving && (
              <div className="flex items-center gap-2 text-sm text-champagne-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned Guests */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Unassigned Guests ({unassigned.length})
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unassigned.length === 0 ? (
                <p className="text-gray-500 text-sm">All guests assigned!</p>
              ) : (
                unassigned.map(guest => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('guestId', guest.id.toString())}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 transition"
                  >
                    {guest.name}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tables */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Table Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Table</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Table Name"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(Number(e.target.value))}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
                <select
                  value={newTableShape}
                  onChange={e => setNewTableShape(e.target.value as 'round' | 'rectangle')}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="round">Round</option>
                  <option value="rectangle">Rectangle</option>
                </select>
                <button
                  onClick={addTable}
                  disabled={saving}
                  className="px-6 py-2 bg-champagne-600 hover:bg-champagne-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map(table => (
                <div
                  key={table.id}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const guestId = parseInt(e.dataTransfer.getData('guestId'), 10);
                    if (!isNaN(guestId)) {
                      assignGuest(guestId, table.id);
                    }
                  }}
                  className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-champagne-300 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{table.name}</h3>
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {table.guests.length} / {table.capacity} seats
                  </div>
                  <div className="space-y-2 min-h-24">
                    {table.guests.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">Drag guests here</p>
                    ) : (
                      table.guests.map(guest => (
                        <div
                          key={guest.id}
                          className="p-2 bg-champagne-50 rounded-lg text-sm flex items-center justify-between"
                        >
                          {guest.name}
                          <button
                            onClick={() => unassignGuest(guest.id, table.id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            {tables.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tables yet. Add your first table above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}