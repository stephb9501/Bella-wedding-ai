'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Heart, Calendar, User, Mail, Phone, MapPin, DollarSign, ArrowLeft,
  FileText, CheckSquare, Clock, Music, Camera, Plus, Save, X,
  ListChecks, Trash2, AlertCircle, Settings, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  bride_name: string;
  email: string;
  phone: string;
  wedding_date: string;
  venue: string;
  budget_range: string;
  message: string;
  status: string;
  created_at: string;
  vendors?: { category: string };
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  due_date: string | null;
}

interface TimelineEvent {
  id: string;
  time_slot: string;
  activity: string;
  duration_minutes: number;
  location: string;
  notes: string;
}

interface ChecklistItem {
  id: string;
  item_name: string;
  category: string;
  description: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Song {
  title: string;
  artist: string;
  duration: string;
  notes: string;
}

interface Playlist {
  id: string;
  event_part: string;
  songs: Song[];
}

interface Shot {
  description: string;
  location: string;
  time: string;
  completed: boolean;
}

interface ShotList {
  id: string;
  category: string;
  shots: Shot[];
}

type ToolType = 'checklist' | 'playlists' | 'shotlists';

interface RoleDefinition {
  role_name: string;
  role_display_name: string;
  parent_category: string;
  tools_enabled: string[];
}

interface VendorRoles {
  selected_roles: string[];
  enabled_tools: string[];
  export_preferences: {
    include_timeline: boolean;
    include_checklist: boolean;
    include_role_specific: boolean;
  };
}

export default function WeddingProject() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.bookingId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [shotLists, setShotLists] = useState<ShotList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks' | 'timeline' | 'tools' | 'checklist'>('overview');
  const [activeTool, setActiveTool] = useState<ToolType>('checklist');

  // Role-based tool access
  const [vendorRoles, setVendorRoles] = useState<VendorRoles | null>(null);
  const [availableRoles, setAvailableRoles] = useState<{ [category: string]: RoleDefinition[] }>({});
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // New note form
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  // New task form
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });

  // New timeline event form
  const [showNewTimelineEvent, setShowNewTimelineEvent] = useState(false);
  const [newTimelineEvent, setNewTimelineEvent] = useState({
    time_slot: '',
    activity: '',
    duration_minutes: 30,
    location: '',
    notes: ''
  });

  // New checklist item form
  const [showNewChecklistItem, setShowNewChecklistItem] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState({
    item_name: '',
    category: 'venue_details',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // New playlist form
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    event_part: 'ceremony',
    songs: [] as Song[]
  });
  const [newSong, setNewSong] = useState({ title: '', artist: '', duration: '', notes: '' });

  // New shot list form
  const [showNewShotList, setShowNewShotList] = useState(false);
  const [newShotList, setNewShotList] = useState({
    category: 'getting_ready',
    shots: [] as Shot[]
  });
  const [newShot, setNewShot] = useState({ description: '', location: '', time: '', completed: false });

  useEffect(() => {
    if (bookingId) {
      fetchProjectData();
      fetchVendorRoles();
    }
  }, [bookingId]);

  const fetchProjectData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Fetch client details from vendor_bookings
      const response = await fetch(`/api/vendor-bookings?vendor_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch client');

      const data = await response.json();
      const clientData = data.find((b: Client) => b.id === bookingId);

      if (!clientData) {
        router.push('/vendor-dashboard/clients');
        return;
      }

      setClient(clientData);

      // TODO: Fetch all project data from APIs
      // For now using empty arrays - these will be connected to the database
      setNotes([]);
      setTasks([]);
      setTimeline([]);
      setChecklist([]);
      setPlaylists([]);
      setShotLists([]);

    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      created_at: new Date().toISOString(),
    };

    setNotes([...notes, note]);
    setNewNote({ title: '', content: '' });
    setShowNewNote(false);
  };

  const handleSaveTask = async () => {
    if (!newTask.title) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      completed: false,
      due_date: newTask.due_date || null,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', due_date: '' });
    setShowNewTask(false);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleSaveTimelineEvent = () => {
    if (!newTimelineEvent.time_slot || !newTimelineEvent.activity) return;

    const event: TimelineEvent = {
      id: Date.now().toString(),
      ...newTimelineEvent,
    };

    setTimeline([...timeline, event].sort((a, b) => a.time_slot.localeCompare(b.time_slot)));
    setNewTimelineEvent({ time_slot: '', activity: '', duration_minutes: 30, location: '', notes: '' });
    setShowNewTimelineEvent(false);
  };

  const handleDeleteTimelineEvent = (id: string) => {
    setTimeline(timeline.filter(e => e.id !== id));
  };

  const handleSaveChecklistItem = () => {
    if (!newChecklistItem.item_name) return;

    const item: ChecklistItem = {
      id: Date.now().toString(),
      ...newChecklistItem,
      is_completed: false,
    };

    setChecklist([...checklist, item]);
    setNewChecklistItem({ item_name: '', category: 'venue_details', description: '', priority: 'medium' });
    setShowNewChecklistItem(false);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, is_completed: !item.is_completed } : item
    ));
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleAddSongToPlaylist = () => {
    if (!newSong.title || !newSong.artist) return;
    setNewPlaylist({
      ...newPlaylist,
      songs: [...newPlaylist.songs, { ...newSong }]
    });
    setNewSong({ title: '', artist: '', duration: '', notes: '' });
  };

  const handleSavePlaylist = () => {
    if (!newPlaylist.event_part || newPlaylist.songs.length === 0) return;

    const playlist: Playlist = {
      id: Date.now().toString(),
      ...newPlaylist,
    };

    setPlaylists([...playlists, playlist]);
    setNewPlaylist({ event_part: 'ceremony', songs: [] });
    setShowNewPlaylist(false);
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(p => p.id !== id));
  };

  const handleAddShotToList = () => {
    if (!newShot.description) return;
    setNewShotList({
      ...newShotList,
      shots: [...newShotList.shots, { ...newShot }]
    });
    setNewShot({ description: '', location: '', time: '', completed: false });
  };

  const handleSaveShotList = () => {
    if (!newShotList.category || newShotList.shots.length === 0) return;

    const shotList: ShotList = {
      id: Date.now().toString(),
      ...newShotList,
    };

    setShotLists([...shotLists, shotList]);
    setNewShotList({ category: 'getting_ready', shots: [] });
    setShowNewShotList(false);
  };

  const handleDeleteShotList = (id: string) => {
    setShotLists(shotLists.filter(s => s.id !== id));
  };

  const fetchVendorRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch available role definitions
      const rolesResponse = await fetch(`/api/wedding-vendor-roles?vendor_id=${user.id}&get_definitions=true`);
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setAvailableRoles(rolesData.role_definitions || {});
      }

      // Fetch vendor's selected roles for this wedding
      const vendorRolesResponse = await fetch(`/api/wedding-vendor-roles?booking_id=${bookingId}&vendor_id=${user.id}`);
      if (vendorRolesResponse.ok) {
        const vendorRolesData = await vendorRolesResponse.json();
        setVendorRoles(vendorRolesData);
      }
    } catch (error) {
      console.error('Error fetching vendor roles:', error);
    }
  };

  const handleUpdateRoles = async (selectedRoles: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('/api/wedding-vendor-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          vendor_id: user.id,
          selected_roles: selectedRoles
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVendorRoles({
          selected_roles: selectedRoles,
          enabled_tools: data.enabled_tools || [],
          export_preferences: vendorRoles?.export_preferences || {
            include_timeline: true,
            include_checklist: true,
            include_role_specific: true
          }
        });
        setShowRoleSelector(false);
      }
    } catch (error) {
      console.error('Error updating vendor roles:', error);
    }
  };

  const toggleRole = (roleName: string) => {
    const currentRoles = vendorRoles?.selected_roles || [];
    const newRoles = currentRoles.includes(roleName)
      ? currentRoles.filter(r => r !== roleName)
      : [...currentRoles, roleName];
    handleUpdateRoles(newRoles);
  };

  // Check if a tool is enabled based on selected roles
  const isToolEnabled = (toolName: string): boolean => {
    if (!vendorRoles) return true; // Show all by default if not set
    return vendorRoles.enabled_tools.includes(toolName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  if (!client) {
    return null;
  }

  const weddingDate = new Date(client.wedding_date);
  const daysUntilWedding = Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Determine which tools to show based on vendor's selected roles for this wedding
  const showPlaylists = isToolEnabled('music_playlists');
  const showShotLists = isToolEnabled('shot_lists');
  const showCateringMenu = isToolEnabled('catering_menu');
  const showFloralDesigns = isToolEnabled('floral_designs');
  const showVenueLogistics = isToolEnabled('venue_logistics');
  const showCakeDesigns = isToolEnabled('cake_designs');
  const showBeautySchedules = isToolEnabled('beauty_schedules');
  const showTransportation = isToolEnabled('transportation_plans');
  const showCeremonyScripts = isToolEnabled('ceremony_scripts');
  const showStationery = isToolEnabled('stationery_orders');
  const showRentals = isToolEnabled('rental_orders');

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/vendor-dashboard/clients')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Clients
            </button>

            <div className="flex items-center gap-3">
              <a
                href={`mailto:${client.email}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              )}
            </div>
          </div>

          {/* Client Info Banner */}
          <div className="bg-gradient-to-r from-champagne-100 to-rose-100 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{client.bride_name}'s Wedding</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      {weddingDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {client.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{client.venue}</span>
                    </div>
                  )}
                  {client.budget_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{client.budget_range}</span>
                    </div>
                  )}
                </div>
              </div>

              {daysUntilWedding >= 0 && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-champagne-700">{daysUntilWedding}</div>
                  <div className="text-sm text-gray-600">days until wedding</div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Role Selector */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
            >
              <Settings className="w-3 h-3" />
              <span>My Roles for This Wedding</span>
              {vendorRoles && vendorRoles.selected_roles.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-champagne-600 text-white text-xs rounded-full">
                  {vendorRoles.selected_roles.length}
                </span>
              )}
            </button>

            {vendorRoles && vendorRoles.selected_roles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {vendorRoles.selected_roles.map((role) => {
                  const roleInfo = Object.values(availableRoles)
                    .flat()
                    .find(r => r.role_name === role);
                  return roleInfo ? (
                    <span
                      key={role}
                      className="px-2 py-0.5 bg-champagne-100 text-champagne-700 text-xs rounded-full"
                    >
                      {roleInfo.role_display_name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Role Selector Dropdown */}
          {showRoleSelector && (
            <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Select Your Roles for This Wedding</h3>
                <button
                  onClick={() => setShowRoleSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Different weddings may require different services. Select all roles you're providing for this wedding to see only relevant tools.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(availableRoles).map(([category, roles]) => (
                  <div key={category} className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">{category}</h4>
                    {roles.map((role) => {
                      const isSelected = vendorRoles?.selected_roles.includes(role.role_name);
                      return (
                        <button
                          key={role.role_name}
                          onClick={() => toggleRole(role.role_name)}
                          className={`w-full text-left px-2 py-1.5 text-xs rounded transition flex items-center gap-2 ${
                            isSelected
                              ? 'bg-champagne-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-white border-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-2 h-2 text-champagne-600" />}
                          </div>
                          <span>{role.role_display_name}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'checklist', label: 'Info Needed', icon: AlertCircle, badge: checklist.filter(i => !i.is_completed).length },
              { id: 'notes', label: 'Notes', icon: FileText },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: tasks.filter(t => !t.completed).length },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'tools', label: 'Tools', icon: Music },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 font-medium transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-champagne-600 text-champagne-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{client.bride_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{client.email}</p>
                </div>
                {client.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{client.phone}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Wedding Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-gray-900">
                    {weddingDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {client.venue && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Venue</label>
                    <p className="text-gray-900">{client.venue}</p>
                  </div>
                )}
                {client.budget_range && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget Range</label>
                    <p className="text-gray-900">{client.budget_range}</p>
                  </div>
                )}
              </div>
            </div>

            {client.message && (
              <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Initial Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{client.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Info Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Information Needed from Bride</h2>
                <p className="text-sm text-gray-600 mt-1">Track what details you still need to finalize the wedding plans</p>
              </div>
              <button
                onClick={() => setShowNewChecklistItem(true)}
                className="px-4 py-2 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {showNewChecklistItem && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Request Information</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="What information do you need?"
                    value={newChecklistItem.item_name}
                    onChange={(e) => setNewChecklistItem({ ...newChecklistItem, item_name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  />
                  <select
                    value={newChecklistItem.category}
                    onChange={(e) => setNewChecklistItem({ ...newChecklistItem, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  >
                    <option value="venue_details">Venue Details</option>
                    <option value="guest_info">Guest Information</option>
                    <option value="preferences">Preferences</option>
                    <option value="schedule">Schedule</option>
                    <option value="special_requests">Special Requests</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={newChecklistItem.priority}
                    onChange={(e) => setNewChecklistItem({ ...newChecklistItem, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <textarea
                    placeholder="Additional details or notes..."
                    value={newChecklistItem.description}
                    onChange={(e) => setNewChecklistItem({ ...newChecklistItem, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveChecklistItem}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowNewChecklistItem(false);
                        setNewChecklistItem({ item_name: '', category: 'venue_details', description: '', priority: 'medium' });
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-6">
              {checklist.length === 0 && !showNewChecklistItem ? (
                <div className="text-center py-12">
                  <ListChecks className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Yet</h3>
                  <p className="text-gray-600">Add items to track what information you need from the bride.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {['urgent', 'high', 'medium', 'low'].map(priority => {
                    const items = checklist.filter(item => item.priority === priority);
                    if (items.length === 0) return null;

                    return (
                      <div key={priority}>
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">{priority} Priority</h4>
                        {items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition mb-2"
                          >
                            <button
                              onClick={() => toggleChecklistItem(item.id)}
                              className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                                item.is_completed
                                  ? 'bg-green-600 border-green-600 text-white'
                                  : 'border-gray-300 hover:border-green-600'
                              }`}
                            >
                              {item.is_completed && <CheckSquare className="w-4 h-4" />}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className={`font-medium ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                    {item.item_name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{item.category.replace('_', ' ')}</p>
                                  {item.description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteChecklistItem(item.id)}
                                  className="text-red-600 hover:text-red-700 ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
              <button
                onClick={() => setShowNewNote(true)}
                className="px-4 py-2 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>

            {showNewNote && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  />
                  <textarea
                    placeholder="Write your note here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNote}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Note
                    </button>
                    <button
                      onClick={() => {
                        setShowNewNote(false);
                        setNewNote({ title: '', content: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {notes.length === 0 && !showNewNote ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Notes Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start taking notes about this wedding project.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notes.map(note => (
                  <div key={note.id} className="bg-white rounded-2xl shadow-md p-6">
                    <h4 className="font-bold text-gray-900 mb-2">{note.title}</h4>
                    <p className="text-gray-700 text-sm mb-4 whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Task Checklist</h2>
              <button
                onClick={() => setShowNewTask(true)}
                className="px-4 py-2 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>

            {showNewTask && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  />
                  <textarea
                    placeholder="Description (optional)..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 resize-none"
                  />
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveTask}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Task
                    </button>
                    <button
                      onClick={() => {
                        setShowNewTask(false);
                        setNewTask({ title: '', description: '', due_date: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-6">
              {tasks.length === 0 && !showNewTask ? (
                <div className="text-center py-12">
                  <CheckSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Tasks Yet</h3>
                  <p className="text-gray-600">Create a checklist for this wedding project.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                          task.completed
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 hover:border-green-600'
                        }`}
                      >
                        {task.completed && <CheckSquare className="w-4 h-4" />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Wedding Day Timeline</h2>
                <p className="text-sm text-gray-600 mt-1">Create a detailed schedule for the wedding day</p>
              </div>
              <button
                onClick={() => setShowNewTimelineEvent(true)}
                className="px-4 py-2 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </div>

            {showNewTimelineEvent && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-4">Add Timeline Event</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="time"
                    value={newTimelineEvent.time_slot}
                    onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, time_slot: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  />
                  <input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={newTimelineEvent.duration_minutes}
                    onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, duration_minutes: parseInt(e.target.value) || 30 })}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                  />
                  <input
                    type="text"
                    placeholder="Activity/Event name"
                    value={newTimelineEvent.activity}
                    onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, activity: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newTimelineEvent.location}
                    onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, location: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 md:col-span-2"
                  />
                  <textarea
                    placeholder="Notes..."
                    value={newTimelineEvent.notes}
                    onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, notes: e.target.value })}
                    rows={3}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 resize-none md:col-span-2"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveTimelineEvent}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Event
                  </button>
                  <button
                    onClick={() => {
                      setShowNewTimelineEvent(false);
                      setNewTimelineEvent({ time_slot: '', activity: '', duration_minutes: 30, location: '', notes: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-6">
              {timeline.length === 0 && !showNewTimelineEvent ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
                  <p className="text-gray-600">Start building the wedding day timeline.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map(event => {
                    const startTime = event.time_slot;
                    const endTime = new Date(`2000-01-01T${event.time_slot}`);
                    endTime.setMinutes(endTime.getMinutes() + event.duration_minutes);
                    const endTimeStr = endTime.toTimeString().slice(0, 5);

                    return (
                      <div key={event.id} className="border-l-4 border-champagne-600 pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-bold text-champagne-700">
                                {startTime} - {endTimeStr}
                              </span>
                              <span className="text-xs text-gray-500">({event.duration_minutes} min)</span>
                            </div>
                            <h4 className="font-bold text-gray-900">{event.activity}</h4>
                            {event.location && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            )}
                            {event.notes && (
                              <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteTimelineEvent(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Service-Specific Tools</h2>
              <p className="text-sm text-gray-600">Specialized tools for your wedding service</p>
            </div>

            {/* Tool Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTool('checklist')}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTool === 'checklist'
                    ? 'bg-champagne-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ListChecks className="w-4 h-4 inline mr-2" />
                Info Checklist
              </button>
              {showPlaylists && (
                <button
                  onClick={() => setActiveTool('playlists')}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTool === 'playlists'
                      ? 'bg-champagne-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Music className="w-4 h-4 inline mr-2" />
                  Music Playlists
                </button>
              )}
              {showShotLists && (
                <button
                  onClick={() => setActiveTool('shotlists')}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    activeTool === 'shotlists'
                      ? 'bg-champagne-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Shot Lists
                </button>
              )}
            </div>

            {/* Music Playlists Tool */}
            {activeTool === 'playlists' && showPlaylists && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Music Playlists</h3>
                  <button
                    onClick={() => setShowNewPlaylist(true)}
                    className="px-4 py-2 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Playlist
                  </button>
                </div>

                {showNewPlaylist && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Create Playlist</h4>
                    <select
                      value={newPlaylist.event_part}
                      onChange={(e) => setNewPlaylist({ ...newPlaylist, event_part: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 mb-4"
                    >
                      <option value="ceremony">Ceremony</option>
                      <option value="cocktail_hour">Cocktail Hour</option>
                      <option value="reception">Reception</option>
                      <option value="first_dance">First Dance</option>
                      <option value="parent_dances">Parent Dances</option>
                      <option value="cake_cutting">Cake Cutting</option>
                      <option value="bouquet_toss">Bouquet Toss</option>
                      <option value="last_song">Last Song</option>
                    </select>

                    <div className="space-y-3 mb-4">
                      <h5 className="font-medium text-gray-700">Add Songs</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Song title"
                          value={newSong.title}
                          onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                        />
                        <input
                          type="text"
                          placeholder="Artist"
                          value={newSong.artist}
                          onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g., 3:45)"
                          value={newSong.duration}
                          onChange={(e) => setNewSong({ ...newSong, duration: e.target.value })}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                        />
                        <input
                          type="text"
                          placeholder="Notes"
                          value={newSong.notes}
                          onChange={(e) => setNewSong({ ...newSong, notes: e.target.value })}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                        />
                      </div>
                      <button
                        onClick={handleAddSongToPlaylist}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                      >
                        Add Song to Playlist
                      </button>
                    </div>

                    {newPlaylist.songs.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Songs ({newPlaylist.songs.length})</h5>
                        <div className="space-y-2">
                          {newPlaylist.songs.map((song, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{song.title}</p>
                                <p className="text-sm text-gray-600">{song.artist} • {song.duration || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePlaylist}
                        disabled={newPlaylist.songs.length === 0}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Playlist
                      </button>
                      <button
                        onClick={() => {
                          setShowNewPlaylist(false);
                          setNewPlaylist({ event_part: 'ceremony', songs: [] });
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {playlists.length === 0 && !showNewPlaylist ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center md:col-span-2">
                      <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Playlists Yet</h3>
                      <p className="text-gray-600">Create playlists for different parts of the wedding.</p>
                    </div>
                  ) : (
                    playlists.map(playlist => (
                      <div key={playlist.id} className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900">{playlist.event_part.replace('_', ' ').toUpperCase()}</h4>
                            <p className="text-sm text-gray-500">{playlist.songs.length} songs</p>
                          </div>
                          <button
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {playlist.songs.map((song, idx) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium text-gray-900">{song.title}</p>
                              <p className="text-gray-600">{song.artist}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Shot Lists Tool */}
            {activeTool === 'shotlists' && showShotLists && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Shot Lists</h3>
                  <button
                    onClick={() => setShowNewShotList(true)}
                    className="px-4 py-2 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Shot List
                  </button>
                </div>

                {showNewShotList && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Create Shot List</h4>
                    <select
                      value={newShotList.category}
                      onChange={(e) => setNewShotList({ ...newShotList, category: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 mb-4"
                    >
                      <option value="getting_ready">Getting Ready</option>
                      <option value="ceremony">Ceremony</option>
                      <option value="portraits">Portraits</option>
                      <option value="reception">Reception</option>
                      <option value="details">Details</option>
                      <option value="candid">Candid Moments</option>
                    </select>

                    <div className="space-y-3 mb-4">
                      <h5 className="font-medium text-gray-700">Add Shots</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Shot description"
                          value={newShot.description}
                          onChange={(e) => setNewShot({ ...newShot, description: e.target.value })}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 md:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={newShot.location}
                          onChange={(e) => setNewShot({ ...newShot, location: e.target.value })}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                        />
                        <input
                          type="time"
                          placeholder="Time"
                          value={newShot.time}
                          onChange={(e) => setNewShot({ ...newShot, time: e.target.value })}
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                        />
                      </div>
                      <button
                        onClick={handleAddShotToList}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                      >
                        Add Shot to List
                      </button>
                    </div>

                    {newShotList.shots.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2">Shots ({newShotList.shots.length})</h5>
                        <div className="space-y-2">
                          {newShotList.shots.map((shot, idx) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                              <p className="font-medium text-gray-900">{shot.description}</p>
                              <p className="text-sm text-gray-600">
                                {shot.location && `${shot.location} • `}{shot.time || 'Anytime'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveShotList}
                        disabled={newShotList.shots.length === 0}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Shot List
                      </button>
                      <button
                        onClick={() => {
                          setShowNewShotList(false);
                          setNewShotList({ category: 'getting_ready', shots: [] });
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shotLists.length === 0 && !showNewShotList ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center md:col-span-2">
                      <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No Shot Lists Yet</h3>
                      <p className="text-gray-600">Create shot lists for different parts of the wedding.</p>
                    </div>
                  ) : (
                    shotLists.map(shotList => (
                      <div key={shotList.id} className="bg-white rounded-2xl shadow-md p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900">{shotList.category.replace('_', ' ').toUpperCase()}</h4>
                            <p className="text-sm text-gray-500">{shotList.shots.length} shots</p>
                          </div>
                          <button
                            onClick={() => handleDeleteShotList(shotList.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {shotList.shots.map((shot, idx) => (
                            <div key={idx} className="text-sm">
                              <p className="font-medium text-gray-900">{shot.description}</p>
                              <p className="text-gray-600">{shot.location || 'Flexible location'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
