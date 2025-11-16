'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import { Heart } from 'lucide-react';

interface DecorStyle {
  id: string;
  name: string;
  description: string;
  color_palette: string[];
}

interface DecorZone {
  id: string;
  bride_id: string;
  zone_name: string;
  zone_type: string;
  is_applicable: boolean;
  is_custom: boolean;
  display_order: number;
  notes: string;
}

interface DecorItem {
  id: string;
  zone_id: string;
  item_name: string;
  item_category: string;
  quantity: number;
  packed_in_box?: string;
  assigned_to?: string;
  setup_time?: string;
  is_completed: boolean;
  is_packed: boolean;
  is_setup: boolean;
  estimated_cost?: number;
  is_rental: boolean;
  rental_vendor?: string;
}

interface EmergencyItem {
  id: string;
  item_name: string;
  item_type: string;
  quantity: number;
  packed_in_box?: string;
  is_packed: boolean;
  notes?: string;
}

interface PackingBox {
  id: string;
  box_name: string;
  zone_id?: string;
  box_color?: string;
  assigned_to?: string;
  is_packed: boolean;
  notes?: string;
  decor_zones?: { zone_name: string };
}

export default function DecorPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [brideId, setBrideId] = useState<string | null>(null);

  // State
  const [styles, setStyles] = useState<DecorStyle[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [zones, setZones] = useState<DecorZone[]>([]);
  const [items, setItems] = useState<DecorItem[]>([]);
  const [emergencyItems, setEmergencyItems] = useState<EmergencyItem[]>([]);
  const [packingBoxes, setPackingBoxes] = useState<PackingBox[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<'zones' | 'packing' | 'emergency'>('zones');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showAddZone, setShowAddZone] = useState(false);
  const [showAddBox, setShowAddBox] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newBoxName, setNewBoxName] = useState('');

  // Load data on mount when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setBrideId(user.id.toString());
      fetchStyles();
      fetchZones(user.id.toString());
      fetchItems(user.id.toString());
      fetchEmergencyItems(user.id.toString());
      fetchPackingBoxes(user.id.toString());
    }
  }, [isAuthenticated, user]);

  // Fetch functions
  const fetchStyles = async () => {
    try {
      const res = await fetch('/api/decor/styles');
      if (!res.ok) {
        console.error('Failed to fetch styles:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setStyles(data.styles || []);
    } catch (error) {
      console.error('Error fetching styles:', error);
    }
  };

  const fetchZones = async (userId: string) => {
    try {
      const res = await fetch(`/api/decor/zones?brideId=${userId}`);
      if (!res.ok) {
        console.error('Failed to fetch zones:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setZones(data.zones || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchItems = async (userId: string) => {
    try {
      const res = await fetch(`/api/decor/items?brideId=${userId}`);
      if (!res.ok) {
        console.error('Failed to fetch items:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchEmergencyItems = async (userId: string) => {
    try {
      const res = await fetch(`/api/decor/emergency?brideId=${userId}`);
      if (!res.ok) {
        console.error('Failed to fetch emergency items:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setEmergencyItems(data.items || []);
    } catch (error) {
      console.error('Error fetching emergency items:', error);
    }
  };

  const fetchPackingBoxes = async (userId: string) => {
    try {
      const res = await fetch(`/api/decor/boxes?brideId=${userId}`);
      if (!res.ok) {
        console.error('Failed to fetch packing boxes:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setPackingBoxes(data.boxes || []);
    } catch (error) {
      console.error('Error fetching packing boxes:', error);
    }
  };

  // Zone actions
  const toggleZoneApplicable = async (zoneId: string, currentState: boolean) => {
    await fetch('/api/decor/zones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoneId, isApplicable: !currentState }),
    });
    if (brideId) fetchZones(brideId);
  };

  const addCustomZone = async () => {
    if (!brideId || !newZoneName.trim()) return;
    await fetch('/api/decor/zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brideId, zoneName: newZoneName, zoneType: 'custom' }),
    });
    setNewZoneName('');
    setShowAddZone(false);
    fetchZones(brideId);
  };

  const loadZoneChecklist = async (zone: DecorZone) => {
    if (!brideId) return;
    setSelectedZone(zone.id);

    // Check if zone already has items
    const zoneItems = items.filter((item) => item.zone_id === zone.id);
    if (zoneItems.length > 0) return; // Already loaded

    // Load from template
    await fetch('/api/decor/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brideId,
        zoneId: zone.id,
        zoneType: zone.zone_type,
        includeUniversal: true,
      }),
    });
    fetchItems(brideId);
  };

  const toggleItemCompleted = async (itemId: string, currentState: boolean) => {
    await fetch('/api/decor/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, isCompleted: !currentState }),
    });
    if (brideId) fetchItems(brideId);
  };

  const toggleItemPacked = async (itemId: string, currentState: boolean) => {
    await fetch('/api/decor/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, isPacked: !currentState }),
    });
    if (brideId) fetchItems(brideId);
  };

  // Packing box actions
  const addPackingBox = async () => {
    if (!brideId || !newBoxName.trim()) return;
    await fetch('/api/decor/boxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brideId, boxName: newBoxName }),
    });
    setNewBoxName('');
    setShowAddBox(false);
    fetchPackingBoxes(brideId);
  };

  const assignItemToBox = async (itemId: string, boxName: string) => {
    await fetch('/api/decor/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, packedInBox: boxName }),
    });
    if (brideId) fetchItems(brideId);
  };

  // Emergency item actions
  const toggleEmergencyPacked = async (itemId: string, currentState: boolean) => {
    await fetch('/api/decor/emergency', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, isPacked: !currentState }),
    });
    if (brideId) fetchEmergencyItems(brideId);
  };

  // Computed stats
  const applicableZones = zones.filter((z) => z.is_applicable);
  const completedItems = items.filter((i) => i.is_completed).length;
  const packedItems = items.filter((i) => i.is_packed).length;
  const emergencyPacked = emergencyItems.filter((i) => i.is_packed).length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Décor & Setup Planner"
        previewContent={
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Organize Every Detail</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Plan event zones, manage packing lists, track setup assignments, and never forget essential items with our comprehensive décor management system.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-champagne-900 mb-2">9 Wedding Styles</h3>
                <p className="text-sm text-champagne-600">Choose from Modern, Rustic, Boho, Glamorous, Garden, Vintage, Industrial, Beach, or Fairytale themes</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-champagne-900 mb-2">Event Zone Planning</h3>
                <p className="text-sm text-champagne-600">Manage 10 default zones plus add custom areas. Mark zones as applicable or N/A for your event</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-champagne-900 mb-2">Packing & Setup Tracking</h3>
                <p className="text-sm text-champagne-600">Organize items by boxes, assign setup responsibilities, and track emergency items</p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne-50 to-rose-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-champagne-900 mb-2">Décor & Setup</h1>
          <p className="text-champagne-700">
            Plan every area, organize packing, and track setup assignments
          </p>
        </div>

        {/* Style Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-serif text-champagne-900 mb-4">Select Your Wedding Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-champagne-200 hover:border-champagne-400'
                }`}
              >
                <div className="font-semibold text-champagne-900 mb-2">{style.name}</div>
                <div className="text-sm text-champagne-600 mb-3">{style.description}</div>
                <div className="flex gap-2">
                  {style.color_palette?.slice(0, 4).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full border border-champagne-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-champagne-900">{applicableZones.length}</div>
            <div className="text-sm text-champagne-600">Active Zones</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {completedItems}/{items.length}
            </div>
            <div className="text-sm text-champagne-600">Items Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {packedItems}/{items.length}
            </div>
            <div className="text-sm text-champagne-600">Items Packed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">
              {emergencyPacked}/{emergencyItems.length}
            </div>
            <div className="text-sm text-champagne-600">Emergency Items</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'zones'
                ? 'bg-champagne-600 text-white'
                : 'bg-white text-champagne-700 hover:bg-champagne-100'
            }`}
          >
            Zones & Checklists
          </button>
          <button
            onClick={() => setActiveTab('packing')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'packing'
                ? 'bg-champagne-600 text-white'
                : 'bg-white text-champagne-700 hover:bg-champagne-100'
            }`}
          >
            Packing Lists
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'emergency'
                ? 'bg-champagne-600 text-white'
                : 'bg-white text-champagne-700 hover:bg-champagne-100'
            }`}
          >
            Emergency Items
          </button>
        </div>

        {/* ZONES TAB */}
        {activeTab === 'zones' && (
          <div className="space-y-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  !zone.is_applicable ? 'opacity-50' : ''
                }`}
              >
                {/* Zone Header */}
                <div className="p-4 bg-champagne-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={zone.is_applicable}
                      onChange={() => toggleZoneApplicable(zone.id, zone.is_applicable)}
                      className="w-5 h-5 rounded border-champagne-300"
                    />
                    <h3 className="text-lg font-semibold text-champagne-900">{zone.zone_name}</h3>
                    {zone.is_custom && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadZoneChecklist(zone)}
                      disabled={!zone.is_applicable}
                      className="px-4 py-2 bg-champagne-600 text-white rounded hover:bg-champagne-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {items.filter((i) => i.zone_id === zone.id).length > 0
                        ? 'View Checklist'
                        : 'Load Checklist'}
                    </button>
                  </div>
                </div>

                {/* Zone Items */}
                {zone.is_applicable && selectedZone === zone.id && (
                  <div className="p-4">
                    <div className="space-y-2">
                      {items
                        .filter((item) => item.zone_id === zone.id)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-champagne-50 rounded-lg hover:bg-champagne-100 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.is_completed}
                              onChange={() => toggleItemCompleted(item.id, item.is_completed)}
                              className="w-5 h-5 rounded border-champagne-300"
                            />
                            <div className="flex-1">
                              <div
                                className={`font-medium ${
                                  item.is_completed
                                    ? 'line-through text-champagne-500'
                                    : 'text-champagne-900'
                                }`}
                              >
                                {item.item_name}
                              </div>
                              {item.item_category && (
                                <div className="text-sm text-champagne-600">
                                  {item.item_category}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <label className="flex items-center gap-1 text-sm text-champagne-700">
                                <input
                                  type="checkbox"
                                  checked={item.is_packed}
                                  onChange={() => toggleItemPacked(item.id, item.is_packed)}
                                  className="w-4 h-4 rounded border-champagne-300"
                                />
                                Packed
                              </label>
                              {item.packed_in_box && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  {item.packed_in_box}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Custom Zone */}
            <div className="bg-white rounded-lg shadow-md p-4">
              {showAddZone ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Enter custom zone name..."
                    className="flex-1 px-4 py-2 border border-champagne-300 rounded focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                  <button
                    onClick={addCustomZone}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddZone(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddZone(true)}
                  className="w-full py-3 border-2 border-dashed border-champagne-300 rounded-lg text-champagne-600 hover:border-champagne-500 hover:text-champagne-700 transition-colors"
                >
                  + Add Custom Zone
                </button>
              )}
            </div>
          </div>
        )}

        {/* PACKING TAB */}
        {activeTab === 'packing' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-serif text-champagne-900 mb-4">Packing Boxes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {packingBoxes.map((box) => {
                  const boxItems = items.filter((i) => i.packed_in_box === box.box_name);
                  const packedCount = boxItems.filter((i) => i.is_packed).length;

                  return (
                    <div key={box.id} className="border border-champagne-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-champagne-900">{box.box_name}</h3>
                        <span className="text-sm text-champagne-600">
                          {packedCount}/{boxItems.length} packed
                        </span>
                      </div>
                      {box.decor_zones && (
                        <div className="text-sm text-champagne-600 mb-2">
                          Zone: {box.decor_zones.zone_name}
                        </div>
                      )}
                      {box.assigned_to && (
                        <div className="text-sm text-blue-600 mb-2">Setup: {box.assigned_to}</div>
                      )}
                      <div className="text-xs text-champagne-500">
                        {boxItems.length} items in this box
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Box */}
              {showAddBox ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBoxName}
                    onChange={(e) => setNewBoxName(e.target.value)}
                    placeholder="e.g., Box 1: Entrance Décor"
                    className="flex-1 px-4 py-2 border border-champagne-300 rounded focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                  <button
                    onClick={addPackingBox}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddBox(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddBox(true)}
                  className="w-full py-3 border-2 border-dashed border-champagne-300 rounded-lg text-champagne-600 hover:border-champagne-500 hover:text-champagne-700"
                >
                  + Add Packing Box
                </button>
              )}
            </div>
          </div>
        )}

        {/* EMERGENCY TAB */}
        {activeTab === 'emergency' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-serif text-champagne-900 mb-4">
              Emergency & Most Forgotten Items
            </h2>
            <p className="text-champagne-600 mb-6">
              Don't forget these essential items! Check them off as you pack them.
            </p>
            <div className="space-y-2">
              {emergencyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-champagne-50 rounded-lg hover:bg-champagne-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.is_packed}
                    onChange={() => toggleEmergencyPacked(item.id, item.is_packed)}
                    className="w-5 h-5 rounded border-champagne-300"
                  />
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        item.is_packed
                          ? 'line-through text-champagne-500'
                          : 'text-champagne-900'
                      }`}
                    >
                      {item.item_name}
                    </div>
                    {item.notes && (
                      <div className="text-sm text-champagne-600">{item.notes}</div>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                    {item.item_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
