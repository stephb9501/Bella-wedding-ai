'use client';

import { useState, useEffect } from 'react';

interface Gallery {
  id: string;
  wedding_id: string;
  gallery_name: string;
  gallery_description: string;
  is_public: boolean;
  allow_guest_uploads: boolean;
  allow_comments: boolean;
  created_at: string;
}

export function PhotoGallery({ weddingId }: { weddingId: string }) {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    gallery_name: '',
    gallery_description: '',
  });

  useEffect(() => {
    fetchGalleries();
  }, [weddingId]);

  const fetchGalleries = async () => {
    try {
      const response = await fetch(`/api/gallery?weddingId=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch galleries');
      const data = await response.json();
      setGalleries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gallery', {
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
        throw new Error('Failed to create gallery');
      }

      await fetchGalleries();
      setFormData({
        gallery_name: '',
        gallery_description: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Delete this gallery? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete gallery');
      await fetchGalleries();
      setSelectedGallery(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📸 Photo Gallery</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!selectedGallery ? (
          <>
            <form onSubmit={handleCreateGallery} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Name</label>
                  <input
                    type="text"
                    name="gallery_name"
                    placeholder="e.g., Reception Photos"
                    value={formData.gallery_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    name="gallery_description"
                    placeholder="Add a description for this gallery"
                    value={formData.gallery_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create Gallery'}
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Your Galleries:</h3>
              {galleries.length === 0 ? (
                <p className="text-gray-500">No galleries created yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {galleries.map(gallery => (
                    <div
                      key={gallery.id}
                      onClick={() => setSelectedGallery(gallery)}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{gallery.gallery_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{gallery.gallery_description}</p>
                      <div className="flex gap-2 text-xs">
                        {gallery.is_public && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Public</span>}
                        {gallery.allow_guest_uploads && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Guest Upload</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <button
              onClick={() => setSelectedGallery(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Galleries
            </button>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <h3 className="font-bold text-gray-900 mb-2">{selectedGallery.gallery_name}</h3>
              <p className="text-gray-700 mb-3">{selectedGallery.gallery_description}</p>
              <div className="flex gap-2 mb-4">
                <label className="flex items-center">
                  <input type="checkbox" checked={selectedGallery.is_public} disabled className="mr-2" />
                  <span className="text-sm text-gray-700">Public Gallery</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={selectedGallery.allow_guest_uploads} disabled className="mr-2" />
                  <span className="text-sm text-gray-700">Allow Guest Uploads</span>
                </label>
              </div>

              <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-center py-8 mb-4">
                <p className="text-gray-600">📸 Upload feature coming soon</p>
                <p className="text-sm text-gray-500">Drag & drop photos here</p>
              </div>

              <button
                onClick={() => handleDeleteGallery(selectedGallery.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Delete Gallery
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
