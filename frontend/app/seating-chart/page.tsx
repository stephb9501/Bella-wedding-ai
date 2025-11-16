'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import {
  Heart, Users, Plus, Trash2, Edit2, Save, Crown, Lock, Sparkles,
  Check, X, UserPlus, Grid, List, Download
} from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  tableNumber: number | null;
  isVIP: boolean;
  dietaryRestrictions?: string;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  shape: 'round' | 'rectangle';
  label: string;
  guests: Guest[];
  x: number;
  y: number;
}

export default function SeatingChartPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [userTier, setUserTier] = useState<'free' | 'standard' | 'premium'>('premium'); // Mock as premium
  const [tables, setTables] = useState<Table[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [editingTable, setEditingTable] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSeatingData();
    }
  }, [isAuthenticated]);

  const loadSeatingData = () => {
    // Mock data - replace with API call
    const mockTables: Table[] = [
      {
        id: 't1',
        number: 1,
        capacity: 8,
        shape: 'round',
        label: 'Table 1 - Family',
        guests: [],
        x: 100,
        y: 100
      },
      {
        id: 't2',
        number: 2,
        capacity: 8,
        shape: 'round',
        label: 'Table 2',
        guests: [],
        x: 300,
        y: 100
      },
      {
        id: 't3',
        number: 3,
        capacity: 10,
        shape: 'rectangle',
        label: 'Head Table',
        guests: [],
        x: 200,
        y: 300
      }
    ];

    const mockGuests: Guest[] = [
      { id: 'g1', name: 'John Smith', tableNumber: null, isVIP: false },
      { id: 'g2', name: 'Jane Doe', tableNumber: null, isVIP: false },
      { id: 'g3', name: 'Robert Johnson', tableNumber: null, isVIP: true },
      { id: 'g4', name: 'Emily Williams', tableNumber: null, isVIP: false },
      { id: 'g5', name: 'Michael Brown', tableNumber: null, isVIP: false },
    ];

    setTables(mockTables);
    setUnassignedGuests(mockGuests);
  };

  const addTable = () => {
    const newTable: Table = {
      id: `t${tables.length + 1}`,
      number: tables.length + 1,
      capacity: 8,
      shape: 'round',
      label: `Table ${tables.length + 1}`,
      guests: [],
      x: 100 + (tables.length % 3) * 200,
      y: 100 + Math.floor(tables.length / 3) * 150
    };
    setTables([...tables, newTable]);
  };

  const deleteTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table && table.guests.length > 0) {
      // Move guests back to unassigned
      setUnassignedGuests([...unassignedGuests, ...table.guests.map(g => ({ ...g, tableNumber: null }))]);
    }
    setTables(tables.filter(t => t.id !== tableId));
    setSelectedTable(null);
  };

  const assignGuestToTable = (guestId: string, tableId: string) => {
    const guest = unassignedGuests.find(g => g.id === guestId);
    const table = tables.find(t => t.id === tableId);

    if (!guest || !table) return;

    // Check capacity
    if (table.guests.length >= table.capacity) {
      alert(`Table ${table.number} is full (${table.capacity} guests)`);
      return;
    }

    // Update table
    const updatedTables = tables.map(t => {
      if (t.id === tableId) {
        return { ...t, guests: [...t.guests, { ...guest, tableNumber: table.number }] };
      }
      return t;
    });

    // Remove from unassigned
    const updatedUnassigned = unassignedGuests.filter(g => g.id !== guestId);

    setTables(updatedTables);
    setUnassignedGuests(updatedUnassigned);
  };

  const removeGuestFromTable = (guestId: string, tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    const guest = table?.guests.find(g => g.id === guestId);

    if (!guest || !table) return;

    // Update table
    const updatedTables = tables.map(t => {
      if (t.id === tableId) {
        return { ...t, guests: t.guests.filter(g => g.id !== guestId) };
      }
      return t;
    });

    // Add back to unassigned
    setTables(updatedTables);
    setUnassignedGuests([...unassignedGuests, { ...guest, tableNumber: null }]);
  };

  const addNewGuest = () => {
    if (!newGuestName.trim()) return;

    const newGuest: Guest = {
      id: `g${Date.now()}`,
      name: newGuestName,
      tableNumber: null,
      isVIP: false
    };

    setUnassignedGuests([...unassignedGuests, newGuest]);
    setNewGuestName('');
    setShowAddGuestModal(false);
  };

  const saveSeatingChart = async () => {
    // In real app, save to API
    alert('✅ Seating chart saved!');
    console.log('Saving:', { tables, unassignedGuests });
  };

  const exportSeatingChart = () => {
    // Generate CSV or PDF
    alert('📥 Exporting seating chart... (Feature coming soon)');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Seating Chart Designer"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Users className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Design Your Perfect Seating Arrangement</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Create beautiful seating charts with drag-and-drop simplicity. Organize your guests and ensure everyone has a great time!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Grid className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Visual Designer</h3>
                <p className="text-sm text-champagne-600">Drag and drop guests to tables</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <List className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">List View</h3>
                <p className="text-sm text-champagne-600">See all assignments at a glance</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Download className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Export & Print</h3>
                <p className="text-sm text-champagne-600">Download for your venue</p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  // Check Premium access
  if (userTier !== 'premium') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-champagne-900 mb-4">Premium Feature</h1>
          <p className="text-champagne-700 mb-6">
            The Seating Chart Designer is available exclusively for Premium subscribers.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-serif text-champagne-900 mb-4">Premium Includes:</h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Drag-and-drop seating chart designer</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Unlimited tables and guests</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Visual and list view modes</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Export and print capabilities</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Plus wedding website builder, RSVP tracking & more</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Upgrade to Premium - $39.99/mo
          </button>
        </div>
      </div>
    );
  }

  const totalGuests = tables.reduce((sum, t) => sum + t.guests.length, 0) + unassignedGuests.length;
  const assignedGuests = tables.reduce((sum, t) => sum + t.guests.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-champagne-600" />
              <div>
                <h1 className="text-2xl font-serif text-champagne-900">Seating Chart Designer</h1>
                <p className="text-sm text-champagne-600">
                  {assignedGuests} of {totalGuests} guests assigned
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'visual' ? 'bg-white shadow text-champagne-900' : 'text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-champagne-900' : 'text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={exportSeatingChart}
                className="px-4 py-2 border-2 border-champagne-300 text-champagne-700 rounded-lg font-medium hover:border-champagne-400 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export
              </button>

              <button
                onClick={saveSeatingChart}
                className="px-4 py-2 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unassigned Guests Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-champagne-900">Unassigned Guests</h3>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  {unassignedGuests.length}
                </span>
              </div>

              <button
                onClick={() => setShowAddGuestModal(true)}
                className="w-full mb-4 py-2 border-2 border-dashed border-champagne-300 text-champagne-600 rounded-lg hover:border-champagne-400 hover:text-champagne-700 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Guest
              </button>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {unassignedGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('guestId', guest.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-champagne-900 text-sm flex items-center gap-2">
                          {guest.name}
                          {guest.isVIP && <Crown className="w-4 h-4 text-yellow-600" />}
                        </div>
                        {guest.dietaryRestrictions && (
                          <div className="text-xs text-champagne-600">{guest.dietaryRestrictions}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {viewMode === 'visual' ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif text-champagne-900">Floor Plan</h3>
                  <button
                    onClick={addTable}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Table
                  </button>
                </div>

                {/* Visual Floor Plan */}
                <div className="relative bg-gray-50 rounded-lg p-8 min-h-[600px] border-2 border-dashed border-gray-300">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`absolute bg-white rounded-xl shadow-md p-4 border-2 cursor-pointer ${
                        selectedTable?.id === table.id ? 'border-champagne-600' : 'border-gray-200'
                      }`}
                      style={{
                        left: `${table.x}px`,
                        top: `${table.y}px`,
                        width: table.shape === 'round' ? '150px' : '200px',
                        height: table.shape === 'round' ? '150px' : '100px',
                        borderRadius: table.shape === 'round' ? '50%' : '12px'
                      }}
                      onClick={() => setSelectedTable(table)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const guestId = e.dataTransfer.getData('guestId');
                        assignGuestToTable(guestId, table.id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-champagne-900 text-sm mb-1">
                          Table {table.number}
                        </div>
                        <div className="text-xs text-champagne-600">
                          {table.guests.length}/{table.capacity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Table Details */}
                {selectedTable && (
                  <div className="mt-6 p-6 bg-champagne-50 rounded-lg border border-champagne-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-champagne-900">{selectedTable.label}</h4>
                        <p className="text-sm text-champagne-600">
                          {selectedTable.guests.length} of {selectedTable.capacity} seats filled
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTable(selectedTable.id)}
                          className="p-2 hover:bg-champagne-100 rounded-lg"
                        >
                          <Edit2 className="w-5 h-5 text-champagne-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this table?')) {
                              deleteTable(selectedTable.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selectedTable.guests.length === 0 ? (
                        <p className="text-sm text-champagne-600 italic">No guests assigned yet. Drag guests here!</p>
                      ) : (
                        selectedTable.guests.map((guest) => (
                          <div key={guest.id} className="flex items-center justify-between p-2 bg-white rounded">
                            <span className="text-sm text-champagne-900">{guest.name}</span>
                            <button
                              onClick={() => removeGuestFromTable(guest.id, selectedTable.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-serif text-champagne-900 mb-6">Table Assignments</h3>
                <div className="space-y-4">
                  {tables.map((table) => (
                    <div key={table.id} className="border border-champagne-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-champagne-900">{table.label}</h4>
                          <p className="text-sm text-champagne-600">
                            {table.shape} table • {table.guests.length}/{table.capacity} guests
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete this table?')) {
                              deleteTable(table.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {table.guests.map((guest) => (
                          <div key={guest.id} className="text-sm text-champagne-700 bg-champagne-50 rounded px-3 py-2">
                            {guest.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-serif text-champagne-900 mb-4">Add Guest</h3>
            <input
              type="text"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNewGuest()}
              placeholder="Guest name"
              className="w-full px-4 py-3 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddGuestModal(false);
                  setNewGuestName('');
                }}
                className="flex-1 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg font-medium hover:border-champagne-400"
              >
                Cancel
              </button>
              <button
                onClick={addNewGuest}
                disabled={!newGuestName.trim()}
                className="flex-1 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700 disabled:opacity-50"
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
