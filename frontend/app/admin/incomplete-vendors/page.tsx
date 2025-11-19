'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, AlertCircle, Mail, Phone, Globe, MapPin, Edit, CheckCircle, Download } from 'lucide-react';

interface Vendor {
  id: string;
  business_name: string;
  category: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  short_description: string | null;
  created_at: string;
}

export default function IncompleteVendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [missingFilter, setMissingFilter] = useState<'all' | 'email' | 'phone' | 'website' | 'location'>('all');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vendor>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIncompleteVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchQuery, missingFilter]);

  const fetchIncompleteVendors = async () => {
    try {
      const response = await fetch('/api/admin/incomplete-vendors');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (missingFilter === 'email') {
      filtered = filtered.filter(v => !v.email);
    } else if (missingFilter === 'phone') {
      filtered = filtered.filter(v => !v.phone);
    } else if (missingFilter === 'website') {
      filtered = filtered.filter(v => !v.website_url);
    } else if (missingFilter === 'location') {
      filtered = filtered.filter(v => !v.city || !v.state);
    }

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.business_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVendors(filtered);
  };

  const getMissingFields = (vendor: Vendor) => {
    const missing = [];
    if (!vendor.email) missing.push('Email');
    if (!vendor.phone) missing.push('Phone');
    if (!vendor.website_url) missing.push('Website');
    if (!vendor.city || !vendor.state) missing.push('Location');
    if (!vendor.zip_code) missing.push('Zip');
    if (!vendor.short_description) missing.push('Description');
    return missing;
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditForm({
      email: vendor.email || '',
      phone: vendor.phone || '',
      website_url: vendor.website_url || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zip_code: vendor.zip_code || '',
      short_description: vendor.short_description || '',
    });
  };

  const handleSave = async () => {
    if (!editingVendor) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/incomplete-vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: editingVendor.id,
          ...editForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      await fetchIncompleteVendors();
      setEditingVendor(null);
      setEditForm({});
    } catch (error) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = 'business_name,category,city,state,zip_code,email,phone,website,missing_fields\n';
    const rows = filteredVendors.map(v => {
      const missing = getMissingFields(v).join('; ');
      const clean = (str: string | null) => (str || '').replace(/"/g, '""');
      return `"${clean(v.business_name)}","${clean(v.category)}","${clean(v.city)}","${clean(v.state)}","${clean(v.zip_code)}","${clean(v.email)}","${clean(v.phone)}","${clean(v.website_url)}","${missing}"`;
    }).join('\n');

    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incomplete-vendors.csv';
    a.click();
  };

  const stats = {
    total: vendors.length,
    missingEmail: vendors.filter(v => !v.email).length,
    missingPhone: vendors.filter(v => !v.phone).length,
    missingWebsite: vendors.filter(v => !v.website_url).length,
    missingLocation: vendors.filter(v => !v.city || !v.state).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Incomplete Vendors</h1>
          </div>
          <button onClick={exportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Incomplete</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.missingEmail}</div>
            <div className="text-sm text-red-700 mt-1">No Email</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{stats.missingPhone}</div>
            <div className="text-sm text-orange-700 mt-1">No Phone</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.missingWebsite}</div>
            <div className="text-sm text-blue-700 mt-1">No Website</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.missingLocation}</div>
            <div className="text-sm text-purple-700 mt-1">No Location</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { key: 'all', label: 'All', count: stats.total, color: 'purple' },
                { key: 'email', label: 'No Email', count: stats.missingEmail, color: 'red' },
                { key: 'phone', label: 'No Phone', count: stats.missingPhone, color: 'orange' },
                { key: 'website', label: 'No Website', count: stats.missingWebsite, color: 'blue' },
                { key: 'location', label: 'No Location', count: stats.missingLocation, color: 'purple' },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setMissingFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    missingFilter === filter.key
                      ? `bg-${filter.color}-600 text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">All vendors complete!</h3>
              <p className="text-gray-600">No vendors matching this filter</p>
            </div>
          ) : (
            filteredVendors.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{vendor.business_name}</h3>
                    <p className="text-sm text-gray-600">{vendor.category}</p>
                    {(vendor.city || vendor.state) && (
                      <p className="text-sm text-gray-500 mt-1">
                        {vendor.city}{vendor.city && vendor.state ? ', ' : ''}{vendor.state}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {getMissingFields(vendor).map(field => (
                        <span key={field} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Missing: {field}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Add Info
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Missing Info</h2>
              <p className="text-sm text-gray-600 mt-1">{editingVendor.business_name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={editForm.website_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={editForm.zip_code || ''}
                    onChange={(e) => setEditForm({ ...editForm, zip_code: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (200 chars max)</label>
                  <textarea
                    value={editForm.short_description || ''}
                    onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingVendor(null)}
                className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
