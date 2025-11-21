'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Save, Eye, EyeOff, Trash2, Edit2, FileText, User, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  wedding_id: string;
  title: string;
  description: string;
  category: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  approval_status: 'pending' | 'approved' | 'rejected';
  is_completed: boolean;
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

interface VendorChecklistProps {
  weddingId: string;
  vendorId: string;
  vendorRole: string;
}

const CHECKLIST_CATEGORIES = [
  'ceremony',
  'reception',
  'decor',
  'music',
  'catering',
  'photography',
  'videography',
  'flowers',
  'transportation',
  'attire',
  'vendors',
  'invitations',
  'guests',
  'other',
];

const PRIORITIES = ['low', 'medium', 'high'] as const;

export function VendorChecklist({ weddingId, vendorId, vendorRole }: VendorChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDrafts, setShowDrafts] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'ceremony',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  });

  useEffect(() => {
    fetchItems();
  }, [weddingId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/checklist?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch checklist items');
      const data = await response.json();
      setItems(data || []);
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
      const itemData = {
        wedding_id: weddingId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        due_date: formData.due_date || null,
        status: isDraft ? 'draft' : 'published',
        created_by: vendorId,
        created_by_role: vendorRole,
        is_visible_to_team: !isDraft,
        ...(editingItem && { id: editingItem.id }),
      };

      const url = '/api/checklist';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) throw new Error('Failed to save item');

      await fetchItems();
      setIsCreating(false);
      setEditingItem(null);
      setFormData({ title: '', description: '', category: 'ceremony', priority: 'medium', due_date: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handlePublish = async (itemId: string) => {
    try {
      const response = await fetch('/api/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          status: 'published',
          is_visible_to_team: true,
          published_by: vendorId,
          published_at: new Date().toISOString(),
          last_edited_by: vendorId,
          last_edited_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to publish item');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleToggleComplete = async (item: ChecklistItem) => {
    try {
      const response = await fetch('/api/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          is_completed: !item.is_completed,
          last_edited_by: vendorId,
          last_edited_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update item');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const response = await fetch(`/api/checklist?id=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      due_date: item.due_date || '',
    });
    setIsCreating(true);
  };

  const filteredItems = items.filter(item => {
    if (!showDrafts && item.status === 'draft') return false;
    return true;
  });

  const draftCount = items.filter(i => i.status === 'draft' && i.created_by === vendorId).length;
  const pendingApprovalCount = items.filter(i => i.status === 'published' && i.approval_status === 'pending' && i.created_by === vendorId).length;
  const approvedCount = items.filter(i => i.approval_status === 'approved').length;
  const rejectedCount = items.filter(i => i.approval_status === 'rejected' && i.created_by === vendorId).length;
  const completedCount = items.filter(i => i.is_completed).length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Wedding Checklist</h3>
            <p className="text-sm text-gray-600 mt-1">
              {approvedCount} approved • {pendingApprovalCount} pending • {draftCount} drafts • {completedCount} completed
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
                setEditingItem(null);
                setFormData({ title: '', description: '', category: 'ceremony', priority: 'medium', due_date: '' });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Task
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
              {editingItem ? 'Edit Task' : 'Create New Task'}
            </h4>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="e.g., Confirm flower delivery"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  >
                    {CHECKLIST_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
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
                  placeholder="Add details about this task..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingItem(null);
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

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No checklist items yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add Task" to create your first item</p>
          </div>
        ) : (
          filteredItems
            .sort((a, b) => {
              // Sort by: not completed first, then by priority, then by due date
              if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              if (a.due_date && b.due_date) {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
              }
              return 0;
            })
            .map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-md p-6 ${
                  item.status === 'draft' ? 'border-2 border-dashed border-blue-300 bg-blue-50' : ''
                } ${item.is_completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(item)}
                      className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                        item.is_completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-champagne-500'
                      }`}
                    >
                      {item.is_completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`text-lg font-bold ${item.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.title}
                        </h4>

                        {item.status === 'draft' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            DRAFT
                          </span>
                        )}

                        {item.status === 'published' && item.approval_status === 'pending' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            PENDING APPROVAL
                          </span>
                        )}

                        {item.approval_status === 'approved' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            APPROVED
                          </span>
                        )}

                        {item.approval_status === 'rejected' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            REJECTED
                          </span>
                        )}

                        <span className="px-2 py-1 bg-champagne-100 text-champagne-700 text-xs font-medium rounded">
                          {item.category}
                        </span>

                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>

                      {item.due_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </div>
                      )}

                      {item.description && (
                        <p className="text-gray-700 mb-3">{item.description}</p>
                      )}

                      {item.approval_status === 'rejected' && item.rejection_reason && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-900">{item.rejection_reason}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Created by {item.created_by_role}
                        </div>
                        {item.published_at && (
                          <div>
                            Published {new Date(item.published_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {item.created_by === vendorId && (
                    <div className="flex items-center gap-2 ml-4">
                      {item.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(item.id)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
                          title="Publish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
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
