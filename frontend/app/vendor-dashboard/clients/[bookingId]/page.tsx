'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Heart, Calendar, User, Mail, Phone, MapPin, DollarSign, ArrowLeft,
  FileText, CheckSquare, Clock, Music, Camera, Plus, Save, X
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
  event_name: string;
  description: string;
  location: string;
  duration: number;
  notes: string;
}

export default function WeddingProject() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.bookingId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'tasks' | 'timeline' | 'tools'>('overview');

  // New note form
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  // New task form
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '' });

  useEffect(() => {
    if (bookingId) {
      fetchProjectData();
    }
  }, [bookingId]);

  const fetchProjectData = async () => {
    try {
      // Fetch client details
      const response = await fetch(`/api/vendor-bookings?vendor_id=${(await supabase.auth.getUser()).data.user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch client');

      const data = await response.json();
      const clientData = data.find((b: Client) => b.id === bookingId);

      if (!clientData) {
        router.push('/vendor-dashboard/clients');
        return;
      }

      setClient(clientData);

      // TODO: Fetch notes, tasks, timeline from database
      // For now using empty arrays
      setNotes([]);
      setTasks([]);
      setTimeline([]);

    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.title || !newNote.content) return;

    // TODO: Save to database via API
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
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'notes', label: 'Notes', icon: FileText },
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'tools', label: 'Tools', icon: Music },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 font-medium transition flex items-center gap-2 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-champagne-600 text-champagne-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
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
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wedding Day Timeline</h3>
              <p className="text-gray-600 mb-6">
                Create a detailed schedule for the wedding day.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 text-white font-medium rounded-lg transition">
                Create Timeline
              </button>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-center py-12">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Service-Specific Tools</h3>
              <p className="text-gray-600">
                Playlists, shot lists, and other specialized tools coming soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
