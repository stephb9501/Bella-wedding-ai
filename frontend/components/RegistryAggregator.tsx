'use client';

import { useState, useEffect } from 'react';

interface RegistryLink {
  id: string;
  wedding_id: string;
  platform: string;
  url: string;
  link_title: string;
  is_active: boolean;
}

const PLATFORMS = [
  { name: 'Zola', id: 'zola', icon: '💍' },
  { name: 'Amazon', id: 'amazon', icon: '📦' },
  { name: 'Target', id: 'target', icon: '🎯' },
  { name: 'Williams-Sonoma', id: 'williams-sonoma', icon: '🍳' },
  { name: 'Bed Bath & Beyond', id: 'bed-bath-beyond', icon: '🛏️' },
  { name: 'Honeyfund', id: 'honeyfund', icon: '✈️' },
  { name: 'Bloomingdale\'s', id: 'bloomingdales', icon: '👗' },
  { name: 'Macy\'s', id: 'macys', icon: '🏬' },
  { name: 'Pottery Barn', id: 'pottery-barn', icon: '🏠' },
  { name: 'John Lewis', id: 'john-lewis', icon: '🛍️' },
];

export function RegistryAggregator({ weddingId }: { weddingId: string }) {
  const [registries, setRegistries] = useState<RegistryLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    platform: 'zola',
    url: '',
    link_title: '',
  });

  useEffect(() => {
    fetchRegistries();
  }, [weddingId]);

  const fetchRegistries = async () => {
    try {
      const response = await fetch(`/api/registry?weddingId=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch registries');
      const data = await response.json();
      setRegistries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRegistry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/registry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wedding_id: weddingId,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add registry');
      }

      await fetchRegistries();
      setFormData({
        platform: 'zola',
        url: '',
        link_title: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegistry = async (id: string) => {
    if (!confirm('Delete this registry link?')) return;

    try {
      const response = await fetch(`/api/registry?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete registry');
      await fetchRegistries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const platformName = PLATFORMS.find(p => p.id === formData.platform)?.name || 'Zola';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🎁 Registry Aggregator</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleAddRegistry} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registry Title</label>
              <input
                type="text"
                name="link_title"
                placeholder="e.g., Our Kitchen Registry"
                value={formData.link_title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registry URL</label>
              <input
                type="url"
                name="url"
                placeholder="https://..."
                value={formData.url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {loading ? 'Adding...' : 'Add Registry'}
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Your Registries:</h3>
          {registries.length === 0 ? (
            <p className="text-gray-500">No registries added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {registries.map(registry => {
                const platform = PLATFORMS.find(p => p.id === registry.platform);
                return (
                  <div key={registry.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{platform?.icon} {registry.link_title}</p>
                        <p className="text-sm text-gray-600">{platform?.name}</p>
                        <a href={registry.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          View Registry →
                        </a>
                      </div>
                      <button
                        onClick={() => handleDeleteRegistry(registry.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}