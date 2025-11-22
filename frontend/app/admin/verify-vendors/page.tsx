'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Star,
  MapPin,
  Mail,
  Phone,
  Award,
  Crown,
  Clock,
  MessageCircle,
  ArrowLeft,
  Shield,
  AlertCircle,
} from 'lucide-react';
import BadgeGrid from '@/components/badges/BadgeGrid';
import VendorBadge, { BadgeType } from '@/components/badges/VendorBadge';
import { getAllBadgeTypes } from '@/lib/badge-criteria';

interface Vendor {
  id: string;
  business_name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  state: string;
  description: string;
  tier: string;
  is_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  is_featured: boolean;
  featured_until: string | null;
  average_rating: number;
  review_count: number;
  response_rate: number;
  avg_response_time_hours: number;
  created_at: string;
  badges: any[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function VerifyVendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, [pagination.page, statusFilter, searchQuery]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/vendor-verification?${params}`);
      if (!response.ok) {
        if (response.status === 403) {
          alert('Admin access required');
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch vendors');
      }

      const data = await response.json();
      setVendors(data.vendors || []);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      alert(error.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowVerifyModal(true);
  };

  const handleRevokeVerification = async (vendorId: string) => {
    if (!confirm('Are you sure you want to revoke verification for this vendor?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/vendor-verification?vendor_id=${vendorId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to revoke verification');
      }

      alert('Verification revoked successfully');
      fetchVendors();
    } catch (error: any) {
      console.error('Error revoking verification:', error);
      alert(error.message || 'Failed to revoke verification');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-7 h-7 text-blue-600" />
                  Vendor Verification
                </h1>
                <p className="text-sm text-gray-600">Review and verify vendor accounts</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Vendors</option>
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-sm text-gray-600">Total Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {vendors.filter(v => v.is_verified).length}
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {vendors.filter(v => !v.is_verified).length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        {/* Vendors List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-champagne-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onVerify={handleVerify}
                onRevokeVerification={handleRevokeVerification}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-md p-4 mt-6">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && selectedVendor && (
        <VerifyModal
          vendor={selectedVendor}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedVendor(null);
          }}
          onSuccess={() => {
            setShowVerifyModal(false);
            setSelectedVendor(null);
            fetchVendors();
          }}
        />
      )}
    </div>
  );
}

function VendorCard({
  vendor,
  onVerify,
  onRevokeVerification,
}: {
  vendor: Vendor;
  onVerify: (vendor: Vendor) => void;
  onRevokeVerification: (vendorId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{vendor.business_name}</h3>
              {vendor.is_verified && (
                <CheckCircle className="w-5 h-5 text-blue-600 fill-current" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {vendor.category}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {vendor.city}, {vendor.state}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {vendor.average_rating.toFixed(1)} ({vendor.review_count} reviews)
              </span>
            </div>
            {vendor.badges && vendor.badges.length > 0 && (
              <div className="mb-3">
                <BadgeGrid badges={vendor.badges} size="sm" maxDisplay={5} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {vendor.is_verified ? (
              <button
                onClick={() => onRevokeVerification(vendor.id)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Revoke
              </button>
            ) : (
              <button
                onClick={() => onVerify(vendor)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Verify
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
            >
              {expanded ? 'Less' : 'More'}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{vendor.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">Tier: {vendor.tier}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  Response: {vendor.response_rate?.toFixed(0) || 0}%
                  {vendor.avg_response_time_hours && ` (${vendor.avg_response_time_hours.toFixed(1)}h)`}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-700">{vendor.description}</p>
            </div>
            {vendor.verification_notes && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-blue-900 mb-1">Verification Notes</div>
                <p className="text-sm text-blue-700">{vendor.verification_notes}</p>
              </div>
            )}
            {vendor.verified_at && (
              <div className="text-xs text-gray-500">
                Verified on {new Date(vendor.verified_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VerifyModal({
  vendor,
  onClose,
  onSuccess,
}: {
  vendor: Vendor;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<BadgeType[]>([]);
  const [featuredDays, setFeaturedDays] = useState(0);
  const [loading, setLoading] = useState(false);

  const allBadges = getAllBadgeTypes().filter(
    badge => !['verified', 'elite', 'top_rated', 'responsive', 'featured'].includes(badge)
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/vendor-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.id,
          notes,
          badges_to_award: selectedBadges,
          featured_days: featuredDays > 0 ? featuredDays : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify vendor');
      }

      alert('Vendor verified successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error verifying vendor:', error);
      alert(error.message || 'Failed to verify vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
          <h3 className="text-2xl font-bold text-white">Verify Vendor</h3>
          <p className="text-blue-50 text-sm">{vendor.business_name}</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Verification Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the verification process..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Additional Badges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Award Additional Badges
            </label>
            <div className="grid grid-cols-2 gap-3">
              {allBadges.map((badge) => (
                <label
                  key={badge}
                  className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedBadges.includes(badge)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBadges([...selectedBadges, badge]);
                      } else {
                        setSelectedBadges(selectedBadges.filter(b => b !== badge));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <VendorBadge type={badge} size="sm" showTooltip={false} />
                </label>
              ))}
            </div>
          </div>

          {/* Featured Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set Featured (Optional)
            </label>
            <select
              value={featuredDays}
              onChange={(e) => setFeaturedDays(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Not Featured</option>
              <option value={7}>Featured for 7 days</option>
              <option value={30}>Featured for 30 days</option>
              <option value={90}>Featured for 90 days</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
            >
              {loading ? 'Verifying...' : 'Verify Vendor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
