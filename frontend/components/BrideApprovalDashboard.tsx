'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, CheckSquare, DollarSign, AlertCircle, User, MessageSquare } from 'lucide-react';

interface PendingItem {
  id: string;
  type: 'timeline_event' | 'checklist_item' | 'budget_item';
  title: string;
  description: string;
  created_by: string;
  created_by_role: string;
  published_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  // Timeline-specific
  event_time?: string;
  category?: string;
  // Checklist-specific
  due_date?: string;
  priority?: string;
  // Budget-specific
  item_name?: string;
  estimated_cost?: number;
  actual_cost?: number;
  vendor_name?: string;
}

interface BrideApprovalDashboardProps {
  weddingId: string;
  brideId: string;
}

const ITEM_TYPE_INFO = {
  timeline_event: {
    label: 'Timeline Event',
    icon: Clock,
    color: 'text-champagne-600',
    bg: 'bg-champagne-100',
    border: 'border-champagne-200',
  },
  checklist_item: {
    label: 'Checklist Task',
    icon: CheckSquare,
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200',
  },
  budget_item: {
    label: 'Budget Item',
    icon: DollarSign,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
  },
};

export function BrideApprovalDashboard({ weddingId, brideId }: BrideApprovalDashboardProps) {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingItems();
  }, [weddingId]);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/approvals?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch pending items');
      const data = await response.json();

      // Flatten the data structure
      const allItems: PendingItem[] = [];
      data.forEach((group: any) => {
        group.items.forEach((item: any) => {
          allItems.push({ ...item, type: group.type });
        });
      });

      setPendingItems(allItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: PendingItem) => {
    try {
      setProcessingItem(item.id);
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: item.type,
          item_id: item.id,
          action: 'approve',
          approved_by: brideId,
        }),
      });

      if (!response.ok) throw new Error('Failed to approve item');

      await fetchPendingItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingItem(null);
    }
  };

  const handleReject = async (item: PendingItem) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingItem(item.id);
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: item.type,
          item_id: item.id,
          action: 'reject',
          approved_by: brideId,
          rejection_reason: rejectionReason,
        }),
      });

      if (!response.ok) throw new Error('Failed to reject item');

      await fetchPendingItems();
      setShowRejectModal(null);
      setRejectionReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingItem(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading pending approvals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Approval Center</h2>
        <p className="text-gray-600">
          Review and approve items submitted by your wedding vendors
        </p>
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-lg font-semibold text-gray-900">{pendingItems.length}</span>
            <span className="text-sm text-gray-600">items pending</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Pending Items */}
      <div className="space-y-4">
        {pendingItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">All caught up!</p>
            <p className="text-sm text-gray-500 mt-2">No pending approvals at this time</p>
          </div>
        ) : (
          pendingItems.map((item) => {
            const typeInfo = ITEM_TYPE_INFO[item.type];
            const Icon = typeInfo.icon;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${typeInfo.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Item Type Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                        <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                      </div>
                      <div>
                        <span className={`text-xs font-semibold ${typeInfo.color} uppercase`}>
                          {typeInfo.label}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <User className="w-3 h-3" />
                          <span>Submitted by {item.created_by_role}</span>
                          <span>"</span>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(item.published_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Item Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title || item.item_name}
                    </h3>

                    {item.description && (
                      <p className="text-gray-700 mb-3">{item.description}</p>
                    )}

                    {/* Type-specific details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {item.type === 'timeline_event' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Event Time</p>
                            <p className="text-sm font-medium text-gray-900">
                              {item.event_time ? new Date(item.event_time).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {item.category}
                            </p>
                          </div>
                        </>
                      )}

                      {item.type === 'checklist_item' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Priority</p>
                            <p className={`text-sm font-medium capitalize ${
                              item.priority === 'high' ? 'text-red-600' :
                              item.priority === 'medium' ? 'text-orange-600' :
                              'text-gray-600'
                            }`}>
                              {item.priority}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {item.category}
                            </p>
                          </div>
                        </>
                      )}

                      {item.type === 'budget_item' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-500">Estimated Cost</p>
                            <p className="text-sm font-bold text-gray-900">
                              ${item.estimated_cost?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Actual Cost</p>
                            <p className="text-sm font-bold text-gray-900">
                              ${item.actual_cost?.toLocaleString() || item.estimated_cost?.toLocaleString() || '0'}
                            </p>
                          </div>
                          {item.vendor_name && (
                            <div>
                              <p className="text-xs text-gray-500">Vendor</p>
                              <p className="text-sm font-medium text-gray-900">
                                {item.vendor_name}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {item.category}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={processingItem === item.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition whitespace-nowrap"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processingItem === item.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(item.id)}
                      disabled={processingItem === item.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition whitespace-nowrap"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Reject Modal */}
                {showRejectModal === item.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Item</h3>
                      <p className="text-gray-600 mb-4">
                        Please provide a reason for rejecting this item. This will help the vendor understand what needs to be changed.
                      </p>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 mb-4"
                        placeholder="e.g., The timing conflicts with another event, please adjust..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectionReason('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(item)}
                          disabled={!rejectionReason.trim() || processingItem === item.id}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                        >
                          {processingItem === item.id ? 'Processing...' : 'Confirm Rejection'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
