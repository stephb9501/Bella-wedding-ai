'use client';

import { useState, useEffect } from 'react';
import { Clock, Plus, Save, Eye, EyeOff, Trash2, Edit2, FileText, User, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  wedding_id: string;
  title: string;
  description: string;
  event_time: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_by_role: string;
  published_by?: string;
  published_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  last_edited_by?: string;
  last_edited_at?: string;
  is_visible_to_team: boolean;
  created_at: string;
}

interface VendorTimelineProps {
  weddingId: string;
  vendorId: string;
  vendorRole: string;
}

const TIMELINE_CATEGORIES = [
  'ceremony',
  'reception',
  'cocktail-hour',
  'music',
  'dance',
  'decor',
  'setup',
  'getting-ready',
  'prep',
  'photography',
  'videography',
  'catering',
  'dinner',
  'cake-cutting',
  'transportation',
  'other',
];

export function VendorTimeline({ weddingId, vendorId, vendorRole }: VendorTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDrafts, setShowDrafts] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_time: '',
    category: 'ceremony',
  });

  useEffect(() => {
    fetchEvents();
  }, [weddingId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeline?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch timeline events');
      const data = await response.json();
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setError('');

    try {
      const eventData = {
        wedding_id: weddingId,
        title: formData.title,
        description: formData.description,
        event_time: formData.event_time,
        category: formData.category,
        status: isDraft ? 'draft' : 'published',
        created_by: vendorId,
        created_by_role: vendorRole,
        is_visible_to_team: !isDraft,
        ...(editingEvent && { id: editingEvent.id }),
      };

      const url = editingEvent ? '/api/timeline' : '/api/timeline';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) throw new Error('Failed to save event');

      await fetchEvents();
      setIsCreating(false);
      setEditingEvent(null);
      setFormData({ title: '', description: '', event_time: '', category: 'ceremony' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handlePublish = async (eventId: string) => {
    try {
      const response = await fetch('/api/timeline', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: eventId,
          status: 'published',
          is_visible_to_team: true,
          published_by: vendorId,
          published_at: new Date().toISOString(),
          last_edited_by: vendorId,
          last_edited_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to publish event');
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Delete this event?')) return;

    try {
      const response = await fetch(`/api/timeline?id=${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete event');
      await fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_time: event.event_time,
      category: event.category,
    });
    setIsCreating(true);
  };

  const filteredEvents = events.filter(event => {
    if (!showDrafts && event.status === 'draft') return false;
    return true;
  });

  const draftCount = events.filter(e => e.status === 'draft' && e.created_by === vendorId).length;
  const pendingApprovalCount = events.filter(e => e.status === 'published' && e.approval_status === 'pending' && e.created_by === vendorId).length;
  const approvedCount = events.filter(e => e.approval_status === 'approved').length;
  const rejectedCount = events.filter(e => e.approval_status === 'rejected' && e.created_by === vendorId).length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Wedding Timeline</h3>
            <p className="text-sm text-gray-600 mt-1">
              {approvedCount} approved • {pendingApprovalCount} pending • {draftCount} drafts
              {rejectedCount > 0 && <span className="text-red-600"> • {rejectedCount} rejected</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
            >
              {showDrafts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showDrafts ? 'Hide Drafts' : 'Show Drafts'}
            </button>

            <button
              onClick={() => {
                setIsCreating(true);
                setEditingEvent(null);
                setFormData({ title: '', description: '', event_time: '', category: 'ceremony' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="mt-6 p-6 bg-champagne-50 border border-champagne-200 rounded-xl">
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h4>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="e.g., Ceremony Starts"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  {TIMELINE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="Add details about this event..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Timeline Events List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No timeline events yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add Event" to create your first event</p>
          </div>
        ) : (
          filteredEvents
            .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())
            .map((event) => (
              <div
                key={event.id}
                className={`bg-white rounded-xl shadow-md p-6 ${
                  event.status === 'draft' ? 'border-2 border-dashed border-blue-300 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>

                      {event.status === 'draft' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          DRAFT
                        </span>
                      )}

                      {event.status === 'published' && event.approval_status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          PENDING APPROVAL
                        </span>
                      )}

                      {event.approval_status === 'approved' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          APPROVED
                        </span>
                      )}

                      {event.approval_status === 'rejected' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          REJECTED
                        </span>
                      )}

                      <span className="px-2 py-1 bg-champagne-100 text-champagne-700 text-xs font-medium rounded">
                        {event.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.event_time).toLocaleString()}
                    </div>

                    {event.description && (
                      <p className="text-gray-700 mb-3">{event.description}</p>
                    )}

                    {event.approval_status === 'rejected' && event.rejection_reason && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-900">{event.rejection_reason}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Created by {event.created_by_role}
                      </div>
                      {event.published_at && (
                        <div>
                          Published {new Date(event.published_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {event.created_by === vendorId && (
                    <div className="flex items-center gap-2 ml-4">
                      {event.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(event.id)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
                          title="Publish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
