'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Plus, Users, Trash2, Edit3, Save } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  tableId: string | null;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  guests: Guest[];
}

export default function SeatingChart() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([
    { id: '1', name: 'Head Table', capacity: 10, guests: [] },
    { id: '2', name: 'Table 2', capacity: 8, guests: [] },
  ]);
  const [unassigned, setUnassigned] = useState<Guest[]>([
    { id: 'g1', name: 'John Smith', tableId: null },
    { id: 'g2', name: 'Jane Doe', tableId: null },
  ]);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(8);

  const addTable = () => {
    if (!newTableName) return;
    const newTable: Table = {
      id: Date.now().toString(),
      name: newTableName,
      capacity: newTableCapacity,
      guests: [],
    };
    setTables([...tables, newTable]);
    setNewTableName('');
    setNewTableCapacity(8);
  };

  const assignGuest = (guestId: string, tableId: string) => {
    const guest = unassigned.find(g => g.id === guestId);
    if (!guest) return;

    const table = tables.find(t => t.id === tableId);
    if (!table || table.guests.length >= table.capacity) {
      alert('Table is full!');
      return;
    }

    guest.tableId = tableId;
    setUnassigned(unassigned.filter(g => g.id !== guestId));
    setTables(tables.map(t =>
      t.id === tableId ? { ...t, guests: [...t.guests, guest] } : t
    ));
  };

  const unassignGuest = (guestId: string, tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const guest = table.guests.find(g => g.id === guestId);
    if (!guest) return;

    guest.tableId = null;
    setUnassigned([...unassigned, guest]);
    setTables(tables.map(t =>
      t.id === tableId ? { ...t, guests: t.guests.filter(g => g.id !== guestId) } : t
    ));
  };

  const deleteTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const freedGuests = table.guests.map(g => ({ ...g, tableId: null }));
    setUnassigned([...unassigned, ...freedGuests]);
    setTables(tables.filter(t => t.id !== tableId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Seating Chart</h1>
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
                    onDragStart={e => e.dataTransfer.setData('guestId', guest.id)}
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
                <button
                  onClick={addTable}
                  className="px-6 py-2 bg-champagne-600 hover:bg-champagne-700 text-white rounded-lg flex items-center gap-2"
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
                    const guestId = e.dataTransfer.getData('guestId');
                    assignGuest(guestId, table.id);
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

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => alert('Seating chart saved! (Database integration coming soon)')}
            className="px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 hover:from-champagne-600 hover:to-rose-600 text-white rounded-lg flex items-center gap-2 font-medium"
          >
            <Save className="w-5 h-5" />
            Save Seating Chart
          </button>
        </div>
      </div>
    </div>
  );
}