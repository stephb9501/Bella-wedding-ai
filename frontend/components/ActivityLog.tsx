'use client';

import { useState, useEffect } from 'react';
import { Activity, User, Clock, FileText, CheckSquare, DollarSign, Users, MapPin, Filter } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  wedding_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  changes: any;
  reason?: string;
  created_at: string;
}

interface ActivityLogProps {
  weddingId: string;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  published: 'Published',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  uncompleted: 'Uncompleted',
};

const ENTITY_TYPE_LABELS: Record<string, string> = {
  timeline_event: 'Timeline Event',
  checklist_item: 'Checklist Item',
  budget_item: 'Budget Item',
  guest: 'Guest',
  seating_chart: 'Seating Chart',
  wedding: 'Wedding Details',
};

const ENTITY_ICONS: Record<string, any> = {
  timeline_event: Clock,
  checklist_item: CheckSquare,
  budget_item: DollarSign,
  guest: Users,
  seating_chart: MapPin,
  wedding: FileText,
};

export function ActivityLog({ weddingId }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterEntityType, setFilterEntityType] = useState<string>('all');
  const [filterActionType, setFilterActionType] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [weddingId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activity?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch activity log');
      const data = await response.json();
      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filterEntityType !== 'all' && activity.entity_type !== filterEntityType) return false;
    if (filterActionType !== 'all' && activity.action_type !== filterActionType) return false;
    return true;
  });

  const uniqueEntityTypes = Array.from(new Set(activities.map(a => a.entity_type)));
  const uniqueActionTypes = Array.from(new Set(activities.map(a => a.action_type)));

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'created':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'updated':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deleted':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading activity log...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-7 h-7 text-champagne-600" />
              Activity Log
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredActivities.length} activities
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500"
              >
                <option value="all">All Types</option>
                {uniqueEntityTypes.map(type => (
                  <option key={type} value={type}>
                    {ENTITY_TYPE_LABELS[type] || type}
                  </option>
                ))}
              </select>

              <select
                value={filterActionType}
                onChange={(e) => setFilterActionType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-champagne-500"
              >
                <option value="all">All Actions</option>
                {uniqueActionTypes.map(type => (
                  <option key={type} value={type}>
                    {ACTION_TYPE_LABELS[type] || type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No activity yet</p>
            <p className="text-sm text-gray-500 mt-2">Activity will appear here as changes are made</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const EntityIcon = ENTITY_ICONS[activity.entity_type] || FileText;
            const actionColor = getActionColor(activity.action_type);

            return (
              <div key={activity.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${actionColor} border flex items-center justify-center`}>
                      <EntityIcon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${actionColor} border`}>
                        {ACTION_TYPE_LABELS[activity.action_type] || activity.action_type}
                      </span>
                      <span className="px-3 py-1 bg-champagne-100 text-champagne-700 rounded-full text-xs font-medium">
                        {ENTITY_TYPE_LABELS[activity.entity_type] || activity.entity_type}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {activity.entity_name}
                    </h4>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{activity.user_name}</span>
                        <span className="text-gray-500">({activity.user_role})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Changes */}
                    {activity.changes && Object.keys(activity.changes).length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Changes:</p>
                        <div className="space-y-1">
                          {Object.entries(activity.changes).map(([key, value]: [string, any]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-gray-700">{key}:</span>{' '}
                              {value?.old !== undefined && (
                                <>
                                  <span className="text-red-600 line-through">{formatChangeValue(value.old)}</span>
                                  {' → '}
                                </>
                              )}
                              <span className="text-green-600">{formatChangeValue(value?.new || value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reason (for rejections, etc.) */}
                    {activity.reason && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-xs font-semibold text-orange-700 mb-1">Reason:</p>
                        <p className="text-sm text-orange-900">{activity.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
