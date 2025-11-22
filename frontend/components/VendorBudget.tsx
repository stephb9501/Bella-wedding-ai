'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Save, Eye, EyeOff, Trash2, Edit2, FileText, User, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BudgetItem {
  id: string;
  wedding_id: string;
  category: string;
  item_name: string;
  description: string;
  estimated_cost: number;
  actual_cost?: number;
  paid_amount: number;
  vendor_name?: string;
  payment_status: 'unpaid' | 'partial' | 'paid';
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

interface VendorBudgetProps {
  weddingId: string;
  vendorId: string;
  vendorRole: string;
}

const BUDGET_CATEGORIES = [
  'venue',
  'catering',
  'photography',
  'videography',
  'flowers',
  'music',
  'entertainment',
  'attire',
  'hair-makeup',
  'invitations',
  'decor',
  'transportation',
  'favors',
  'other',
];

const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid'] as const;

export function VendorBudget({ weddingId, vendorId, vendorRole }: VendorBudgetProps) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDrafts, setShowDrafts] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: 'venue',
    estimated_cost: '',
    actual_cost: '',
    paid_amount: '',
    vendor_name: '',
    payment_status: 'unpaid' as 'unpaid' | 'partial' | 'paid',
  });

  useEffect(() => {
    fetchItems();
  }, [weddingId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budget?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch budget items');
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
        item_name: formData.item_name,
        description: formData.description,
        category: formData.category,
        estimated_cost: parseFloat(formData.estimated_cost) || 0,
        actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
        paid_amount: parseFloat(formData.paid_amount) || 0,
        vendor_name: formData.vendor_name || null,
        payment_status: formData.payment_status,
        status: isDraft ? 'draft' : 'published',
        created_by: vendorId,
        created_by_role: vendorRole,
        is_visible_to_team: !isDraft,
        ...(editingItem && { id: editingItem.id }),
      };

      const url = '/api/budget';
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
      setFormData({
        item_name: '',
        description: '',
        category: 'venue',
        estimated_cost: '',
        actual_cost: '',
        paid_amount: '',
        vendor_name: '',
        payment_status: 'unpaid'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handlePublish = async (itemId: string) => {
    try {
      const response = await fetch('/api/budget', {
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

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this budget item?')) return;

    try {
      const response = await fetch(`/api/budget?id=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      description: item.description,
      category: item.category,
      estimated_cost: item.estimated_cost.toString(),
      actual_cost: item.actual_cost ? item.actual_cost.toString() : '',
      paid_amount: item.paid_amount.toString(),
      vendor_name: item.vendor_name || '',
      payment_status: item.payment_status,
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

  const totalEstimated = items.filter(i => i.approval_status === 'approved').reduce((sum, i) => sum + i.estimated_cost, 0);
  const totalActual = items.filter(i => i.approval_status === 'approved').reduce((sum, i) => sum + (i.actual_cost || i.estimated_cost), 0);
  const totalPaid = items.filter(i => i.approval_status === 'approved').reduce((sum, i) => sum + i.paid_amount, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading budget...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Wedding Budget</h3>
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
                setEditingItem(null);
                setFormData({
                  item_name: '',
                  description: '',
                  category: 'venue',
                  estimated_cost: '',
                  actual_cost: '',
                  paid_amount: '',
                  vendor_name: '',
                  payment_status: 'unpaid'
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Budget Item
            </button>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Estimated Total</p>
            <p className="text-2xl font-bold text-blue-900">${totalEstimated.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Actual Total</p>
            <p className="text-2xl font-bold text-purple-900">${totalActual.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-700 uppercase mb-1">Paid Total</p>
            <p className="text-2xl font-bold text-green-900">${totalPaid.toLocaleString()}</p>
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
              {editingItem ? 'Edit Budget Item' : 'Create New Budget Item'}
            </h4>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="e.g., Venue Rental"
                    required
                  />
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
                    {BUDGET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.estimated_cost}
                      onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.actual_cost}
                      onChange={(e) => setFormData({ ...formData, actual_cost: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="e.g., ABC Catering Co."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as 'unpaid' | 'partial' | 'paid' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  placeholder="Add details about this budget item..."
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

      {/* Budget Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No budget items yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add Budget Item" to create your first item</p>
          </div>
        ) : (
          filteredItems
            .sort((a, b) => b.estimated_cost - a.estimated_cost)
            .map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-md p-6 ${
                  item.status === 'draft' ? 'border-2 border-dashed border-blue-300 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{item.item_name}</h4>

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
                        item.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        item.payment_status === 'partial' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.payment_status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Estimated</p>
                        <p className="text-lg font-bold text-gray-900">${item.estimated_cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-lg font-bold text-gray-900">${(item.actual_cost || item.estimated_cost).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="text-lg font-bold text-green-700">${item.paid_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="text-lg font-bold text-red-700">${((item.actual_cost || item.estimated_cost) - item.paid_amount).toLocaleString()}</p>
                      </div>
                    </div>

                    {item.vendor_name && (
                      <p className="text-sm text-gray-600 mb-2">Vendor: <span className="font-medium">{item.vendor_name}</span></p>
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
