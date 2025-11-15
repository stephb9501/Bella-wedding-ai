'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

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

interface Photo {
  id: string;
  gallery_id: string;
  photo_url: string;
  file_name: string;
  created_at: string;
}

const TIER_LIMITS = {
  standard: { photos: 30 },
  premium: { photos: 150 },
};

export function PhotoGallery({ weddingId, tier = 'standard' }: { weddingId: string; tier?: 'standard' | 'premium' }) {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    gallery_name: '',
    gallery_description: '',
  });

  const tierLimit = TIER_LIMITS[tier];

  useEffect(() => {
    fetchGalleries();
    fetchAllPhotos();
  }, [weddingId]);

  useEffect(() => {
    if (selectedGallery) {
      fetchPhotos(selectedGallery.id);
    }
  }, [selectedGallery]);

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

  const fetchAllPhotos = async () => {
    try {
      const response = await fetch(`/api/gallery/upload?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setAllPhotos(data || []);
    } catch (err) {
      console.error('Error fetching all photos:', err);
    }
  };

  const fetchPhotos = async (galleryId: string) => {
    try {
      const response = await fetch(`/api/gallery/upload?gallery_id=${galleryId}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(data || []);
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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedGallery) return;

    // Check tier limit
    const currentPhotoCount = allPhotos.length;
    const newPhotoCount = currentPhotoCount + files.length;

    if (newPhotoCount > tierLimit.photos) {
      setError(
        `Your ${tier} plan allows only ${tierLimit.photos} photos. ` +
        `You have ${currentPhotoCount} photos and are trying to upload ${files.length} more. ` +
        `Upgrade to Premium for ${tier === 'standard' ? '150 photos' : 'more photos'}!`
      );
      return;
    }

    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('gallery_id', selectedGallery.id);
        formData.append('wedding_id', weddingId);

        const response = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
      }

      await fetchPhotos(selectedGallery.id);
      await fetchAllPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      const response = await fetch(`/api/gallery/upload?id=${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete photo');
      if (selectedGallery) {
        await fetchPhotos(selectedGallery.id);
      }
      await fetchAllPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
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

              {/* Upload Area */}
              <div
                className={`p-8 border-2 border-dashed rounded-lg text-center transition ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-1">
                  {uploading ? 'Uploading...' : 'Drag & drop photos here'}
                </p>
                <p className="text-sm text-gray-500 mb-3">or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  Choose Files
                </button>
                <p className="text-xs text-gray-500 mt-2">Max 10MB per photo</p>
              </div>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Photos ({photos.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={photo.photo_url}
                            alt={photo.file_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {photos.length === 0 && !uploading && (
                <div className="mt-6 text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No photos yet. Upload your first photo!</p>
                </div>
              )}

              <button
                onClick={() => handleDeleteGallery(selectedGallery.id)}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
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
