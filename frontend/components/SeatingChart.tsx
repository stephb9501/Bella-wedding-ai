'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Users, Circle, Square, Edit2, User, Download } from 'lucide-react';

interface Guest {
  id: string;
  name: string;
  group_name?: string;
  table_number?: number;
}

interface SeatingTable {
  id?: string;
  seating_chart_id?: string;
  table_number: number;
  table_name?: string;
  table_shape: 'round' | 'rectangular' | 'square';
  capacity: number;
  position_x: number;
  position_y: number;
  rotation: number;
  notes?: string;
  assigned_guests?: Guest[];
}

interface SeatingChart {
  id?: string;
  wedding_id: string;
  name: string;
  venue_name?: string;
  layout_data: any;
  is_active: boolean;
}

interface SeatingChartProps {
  weddingId: string;
  userRole: string;
}

export function SeatingChart({ weddingId, userRole }: SeatingChartProps) {
  const [charts, setCharts] = useState<SeatingChart[]>([]);
  const [selectedChart, setSelectedChart] = useState<SeatingChart | null>(null);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewChart, setShowNewChart] = useState(false);
  const [showNewTable, setShowNewTable] = useState(false);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<SeatingTable | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [newChart, setNewChart] = useState<SeatingChart>({
    wedding_id: weddingId,
    name: '',
    venue_name: '',
    layout_data: {},
    is_active: true,
  });
  const [newTable, setNewTable] = useState<SeatingTable>({
    table_number: 1,
    table_name: '',
    table_shape: 'round',
    capacity: 8,
    position_x: 100,
    position_y: 100,
    rotation: 0,
  });

  useEffect(() => {
    fetchCharts();
    fetchGuests();
  }, [weddingId]);

  useEffect(() => {
    if (selectedChart?.id) {
      fetchTables(selectedChart.id);
    }
  }, [selectedChart]);

  useEffect(() => {
    updateUnassignedGuests();
  }, [guests, tables]);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seating-charts?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch seating charts');
      const data = await response.json();
      setCharts(data);
      if (data.length > 0 && !selectedChart) {
        setSelectedChart(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (chartId: string) => {
    try {
      const response = await fetch(`/api/seating-charts/tables?seating_chart_id=${chartId}`);
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();

      // Fetch assigned guests for each table
      const tablesWithGuests = await Promise.all(
        data.map(async (table: SeatingTable) => {
          const assignedGuests = guests.filter(g => g.table_number === table.table_number);
          return { ...table, assigned_guests: assignedGuests };
        })
      );

      setTables(tablesWithGuests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchGuests = async () => {
    try {
      const response = await fetch(`/api/guests?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch guests');
      const data = await response.json();
      setGuests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateUnassignedGuests = () => {
    const unassigned = guests.filter(g => !g.table_number);
    setUnassignedGuests(unassigned);
  };

  const createChart = async () => {
    if (!newChart.name.trim()) {
      setError('Please enter a chart name');
      return;
    }

    try {
      const response = await fetch('/api/seating-charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChart),
      });

      if (!response.ok) throw new Error('Failed to create seating chart');
      const created = await response.json();
      setCharts([...charts, created]);
      setSelectedChart(created);
      setShowNewChart(false);
      setNewChart({
        wedding_id: weddingId,
        name: '',
        venue_name: '',
        layout_data: {},
        is_active: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteChart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this seating chart?')) return;

    try {
      const response = await fetch(`/api/seating-charts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chart');
      setCharts(charts.filter(c => c.id !== id));
      if (selectedChart?.id === id) {
        setSelectedChart(null);
        setTables([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addTable = async () => {
    if (!selectedChart?.id) {
      setError('Please select a seating chart first');
      return;
    }

    try {
      const response = await fetch('/api/seating-charts/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTable,
          seating_chart_id: selectedChart.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add table');
      const created = await response.json();
      setTables([...tables, { ...created, assigned_guests: [] }]);
      setShowNewTable(false);
      setNewTable({
        table_number: tables.length + 1,
        table_name: '',
        table_shape: 'round',
        capacity: 8,
        position_x: 100,
        position_y: 100,
        rotation: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table? Guests will be unassigned.')) return;

    try {
      const response = await fetch(`/api/seating-charts/tables?id=${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete table');
      setTables(tables.filter(t => t.id !== tableId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTableDragStart = (tableId: string) => {
    setDraggedTable(tableId);
  };

  const handleTableDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTableDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const table = tables.find(t => t.id === draggedTable);
    if (!table?.id) return;

    try {
      const response = await fetch('/api/seating-charts/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: table.id,
          position_x: x,
          position_y: y,
        }),
      });

      if (!response.ok) throw new Error('Failed to update table position');
      const updated = await response.json();
      setTables(tables.map(t => t.id === updated.id ? { ...updated, assigned_guests: t.assigned_guests } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }

    setDraggedTable(null);
  };

  const handleGuestDragStart = (guestId: string) => {
    setDraggedGuest(guestId);
  };

  const handleGuestDropOnTable = async (table: SeatingTable) => {
    if (!draggedGuest) return;

    const guest = guests.find(g => g.id === draggedGuest);
    if (!guest) return;

    // Check capacity
    const currentOccupancy = guests.filter(g => g.table_number === table.table_number).length;
    if (currentOccupancy >= table.capacity) {
      setError(`Table ${table.table_number} is at full capacity (${table.capacity} seats)`);
      setDraggedGuest(null);
      return;
    }

    try {
      const response = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guest.id,
          table_number: table.table_number,
        }),
      });

      if (!response.ok) throw new Error('Failed to assign guest to table');
      const updated = await response.json();

      setGuests(guests.map(g => g.id === updated.id ? updated : g));

      // Update table's assigned guests
      setTables(tables.map(t => {
        if (t.table_number === table.table_number) {
          return { ...t, assigned_guests: [...(t.assigned_guests || []), updated] };
        }
        return t;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }

    setDraggedGuest(null);
  };

  const removeGuestFromTable = async (guestId: string) => {
    try {
      const response = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guestId,
          table_number: null,
        }),
      });

      if (!response.ok) throw new Error('Failed to remove guest from table');
      const updated = await response.json();

      setGuests(guests.map(g => g.id === updated.id ? updated : g));

      // Update tables
      setTables(tables.map(t => ({
        ...t,
        assigned_guests: t.assigned_guests?.filter(g => g.id !== guestId) || [],
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getTableIcon = (shape: string) => {
    switch (shape) {
      case 'round':
        return <Circle className="w-6 h-6" />;
      case 'rectangular':
        return <Square className="w-6 h-6" />;
      case 'square':
        return <Square className="w-6 h-6" />;
      default:
        return <Circle className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading seating charts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Seating Chart</h2>
            <p className="text-gray-600 mt-1">Arrange tables and assign guests</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewChart(true)}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              New Chart
            </button>
            {selectedChart && (
              <button
                onClick={() => setShowNewTable(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Add Table
              </button>
            )}
          </div>
        </div>

        {/* Chart Selector */}
        <div className="flex gap-2 overflow-x-auto">
          {charts.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedChart?.id === chart.id
                  ? 'bg-champagne-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {chart.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* New Chart Modal */}
      {showNewChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Seating Chart</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart Name</label>
                <input
                  type="text"
                  value={newChart.name}
                  onChange={(e) => setNewChart({ ...newChart, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., Reception Hall Layout"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  value={newChart.venue_name || ''}
                  onChange={(e) => setNewChart({ ...newChart, venue_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., Grand Ballroom"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewChart(false);
                    setNewChart({
                      wedding_id: weddingId,
                      name: '',
                      venue_name: '',
                      layout_data: {},
                      is_active: true,
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createChart}
                  className="flex-1 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Table Modal */}
      {showNewTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Table</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                  <input
                    type="number"
                    value={newTable.table_number}
                    onChange={(e) => setNewTable({ ...newTable, table_number: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name (Optional)</label>
                <input
                  type="text"
                  value={newTable.table_name || ''}
                  onChange={(e) => setNewTable({ ...newTable, table_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="e.g., Family Table"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                <select
                  value={newTable.table_shape}
                  onChange={(e) => setNewTable({ ...newTable, table_shape: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  <option value="round">Round</option>
                  <option value="rectangular">Rectangular</option>
                  <option value="square">Square</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewTable(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addTable}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                  Add Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedChart && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unassigned Guests Panel */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Unassigned Guests ({unassignedGuests.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => handleGuestDragStart(guest.id)}
                  className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-move border-2 border-gray-200 transition"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{guest.name}</div>
                      {guest.group_name && (
                        <div className="text-xs text-gray-500">{guest.group_name}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {unassignedGuests.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">All guests assigned!</p>
                </div>
              )}
            </div>
          </div>

          {/* Floor Plan Canvas */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedChart.name}</h3>
              <div className="text-sm text-gray-600">
                {tables.length} tables • {guests.filter(g => g.table_number).length} guests seated
              </div>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              onDragOver={handleTableDragOver}
              onDrop={handleTableDrop}
              className="relative w-full h-[600px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            >
              {tables.map((table) => {
                const occupancy = table.assigned_guests?.length || 0;
                const isOverCapacity = occupancy > table.capacity;
                const isFull = occupancy === table.capacity;

                return (
                  <div
                    key={table.id}
                    draggable
                    onDragStart={() => handleTableDragStart(table.id!)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleGuestDropOnTable(table);
                    }}
                    className="absolute group cursor-move"
                    style={{
                      left: table.position_x,
                      top: table.position_y,
                      transform: `rotate(${table.rotation}deg)`,
                    }}
                  >
                    <div
                      className={`p-4 rounded-lg shadow-lg border-4 transition ${
                        isOverCapacity
                          ? 'bg-red-100 border-red-500'
                          : isFull
                          ? 'bg-yellow-100 border-yellow-500'
                          : 'bg-white border-champagne-500'
                      }`}
                      style={{
                        width: table.table_shape === 'rectangular' ? '120px' : '100px',
                        height: table.table_shape === 'rectangular' ? '80px' : '100px',
                      }}
                    >
                      <div className="text-center">
                        <div className="font-bold text-gray-900">Table {table.table_number}</div>
                        {table.table_name && (
                          <div className="text-xs text-gray-600">{table.table_name}</div>
                        )}
                        <div className="text-xs mt-1 text-gray-600">
                          {occupancy}/{table.capacity}
                        </div>
                      </div>
                    </div>

                    {/* Table Controls */}
                    <div className="absolute -top-8 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTable(table);
                        }}
                        className="p-1 bg-blue-600 text-white rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTable(table.id!);
                        }}
                        className="p-1 bg-red-600 text-white rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Assigned Guests Tooltip */}
                    {occupancy > 0 && (
                      <div className="absolute top-full left-0 mt-2 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 min-w-[150px]">
                        <div className="font-bold mb-1">Seated:</div>
                        {table.assigned_guests?.map((guest) => (
                          <div key={guest.id}>{guest.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {tables.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Circle className="w-16 h-16 mx-auto mb-2" />
                    <p>Click "Add Table" to start arranging your floor plan</p>
                  </div>
                </div>
              )}
            </div>

            {/* Table Details Panel */}
            {selectedTable && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">Table {selectedTable.table_number} - Guests</h4>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedTable.assigned_guests?.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <span className="text-sm">{guest.name}</span>
                      <button
                        onClick={() => removeGuestFromTable(guest.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(!selectedTable.assigned_guests || selectedTable.assigned_guests.length === 0) && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Drag guests here to assign them to this table
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
