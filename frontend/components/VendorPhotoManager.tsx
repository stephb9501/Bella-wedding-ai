'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Edit2,
  Save,
  Star,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

interface VendorPhoto {
  id: string;
  vendor_id: string;
  photo_url: string;
  caption: string | null;
  category: string;
  display_order: number;
  is_featured: boolean;
  uploaded_at: string;
  updated_at: string;
}

interface Props {
  vendorId: string;
  onPhotoChange?: () => void;
}

const PHOTO_CATEGORIES = [
  { id: 'gallery', name: 'Gallery', description: 'General portfolio photos' },
  { id: 'portfolio', name: 'Portfolio', description: 'Best work showcase' },
  { id: 'before', name: 'Before', description: 'Before photos' },
  { id: 'after', name: 'After', description: 'After photos' },
  { id: 'profile', name: 'Profile', description: 'Profile/header images' },
];

export function VendorPhotoManager({ vendorId, onPhotoChange }: Props) {
  const [photos, setPhotos] = useState<VendorPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ caption: '', category: '', is_featured: false });
  const [draggedPhoto, setDraggedPhoto] = useState<VendorPhoto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('gallery');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, [vendorId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendors/photos?vendor_id=${vendorId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} exceeds 10MB limit`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('vendor_id', vendorId);
        formData.append('category', selectedCategory);
        formData.append('is_featured', 'false');

        const response = await fetch('/api/vendors/photos', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload photo');
        }
      }

      setSuccess(`Successfully uploaded ${files.length} photo${files.length > 1 ? 's' : ''}`);
      await fetchPhotos();
      onPhotoChange?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const startEdit = (photo: VendorPhoto) => {
    setEditingPhotoId(photo.id);
    setEditForm({
      caption: photo.caption || '',
      category: photo.category,
      is_featured: photo.is_featured,
    });
  };

  const cancelEdit = () => {
    setEditingPhotoId(null);
    setEditForm({ caption: '', category: '', is_featured: false });
  };

  const saveEdit = async (photoId: string) => {
    try {
      setError('');
      const response = await fetch('/api/vendors/photos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: photoId,
          ...editForm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update photo');
      }

      setSuccess('Photo updated successfully');
      await fetchPhotos();
      onPhotoChange?.();
      cancelEdit();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/vendors/photos?id=${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete photo');
      }

      setSuccess('Photo deleted successfully');
      await fetchPhotos();
      onPhotoChange?.();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const toggleFeatured = async (photo: VendorPhoto) => {
    try {
      setError('');
      const response = await fetch('/api/vendors/photos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: photo.id,
          is_featured: !photo.is_featured,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update photo');
      }

      await fetchPhotos();
      onPhotoChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  // Drag and drop reordering
  const handlePhotosDragStart = (e: React.DragEvent, photo: VendorPhoto) => {
    setDraggedPhoto(photo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePhotosDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePhotosDrop = async (e: React.DragEvent, targetPhoto: VendorPhoto) => {
    e.preventDefault();

    if (!draggedPhoto || draggedPhoto.id === targetPhoto.id) {
      setDraggedPhoto(null);
      return;
    }

    try {
      setError('');

      // Swap display orders
      const updates = [
        {
          id: draggedPhoto.id,
          display_order: targetPhoto.display_order,
        },
        {
          id: targetPhoto.id,
          display_order: draggedPhoto.display_order,
        },
      ];

      // Update both photos
      for (const update of updates) {
        const response = await fetch('/api/vendors/photos', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update),
        });

        if (!response.ok) {
          throw new Error('Failed to reorder photos');
        }
      }

      await fetchPhotos();
      onPhotoChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed');
    } finally {
      setDraggedPhoto(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Photo Manager</h2>
        <p className="text-gray-600 text-sm">
          Upload and manage your vendor portfolio photos. Drag photos to reorder them.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Photos</h3>

        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {PHOTO_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg border-2 transition text-left ${
                  selectedCategory === cat.id
                    ? 'border-champagne-600 bg-champagne-50'
                    : 'border-gray-200 hover:border-champagne-300'
                }`}
              >
                <div className="font-medium text-sm text-gray-900">{cat.name}</div>
                <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            dragActive
              ? 'border-champagne-500 bg-champagne-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-champagne-600 mx-auto mb-3 animate-spin" />
              <p className="text-gray-900 font-medium">Uploading photos...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-champagne-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-8 h-8 text-champagne-600" />
              </div>
              <p className="text-gray-900 font-medium mb-1">Drag and drop photos here</p>
              <p className="text-sm text-gray-500 mb-3">or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-champagne-600 hover:bg-champagne-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                Choose Files
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Images only, max 10MB each. Multiple files supported.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Photos ({photos.length})
          </h3>
          <p className="text-sm text-gray-500">Drag to reorder</p>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No photos uploaded yet</p>
            <p className="text-gray-500 text-sm mt-2">Upload your first photo to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => handlePhotosDragStart(e, photo)}
                onDragOver={handlePhotosDragOver}
                onDrop={(e) => handlePhotosDrop(e, photo)}
                className={`border rounded-lg overflow-hidden transition ${
                  draggedPhoto?.id === photo.id
                    ? 'opacity-50 border-champagne-500'
                    : 'border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-video bg-gray-100">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Vendor photo'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded p-1 cursor-move">
                    <GripVertical className="w-5 h-5 text-white" />
                  </div>

                  {/* Featured badge */}
                  {photo.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Featured
                    </div>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="p-4">
                  {editingPhotoId === photo.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Caption
                        </label>
                        <input
                          type="text"
                          value={editForm.caption}
                          onChange={(e) =>
                            setEditForm({ ...editForm, caption: e.target.value })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-champagne-500"
                          placeholder="Add a caption..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        >
                          {PHOTO_CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editForm.is_featured}
                          onChange={(e) =>
                            setEditForm({ ...editForm, is_featured: e.target.checked })
                          }
                          className="rounded border-gray-300 text-champagne-600 focus:ring-champagne-500"
                        />
                        <span className="text-gray-700">Mark as featured</span>
                      </label>

                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(photo.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded transition flex items-center justify-center gap-1"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 rounded transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2 mb-1">
                          {photo.caption || 'No caption'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{photo.category}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFeatured(photo)}
                          className={`flex-1 text-xs py-2 rounded transition flex items-center justify-center gap-1 ${
                            photo.is_featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={photo.is_featured ? 'Unmark as featured' : 'Mark as featured'}
                        >
                          <Star className={`w-3 h-3 ${photo.is_featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => startEdit(photo)}
                          className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs py-2 rounded transition flex items-center justify-center gap-1"
                          title="Edit photo"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs py-2 rounded transition flex items-center justify-center gap-1"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Tips for better photos</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use high-quality images that showcase your best work</li>
          <li>• Add descriptive captions to help couples understand your style</li>
          <li>• Mark your best photos as "Featured" to highlight them</li>
          <li>• Organize photos by category (portfolio, before/after, etc.)</li>
          <li>• Drag photos to reorder them - put your best work first</li>
        </ul>
      </div>
    </div>
  );
}
