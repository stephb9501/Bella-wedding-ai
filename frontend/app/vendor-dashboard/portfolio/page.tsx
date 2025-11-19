'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Upload, Image as ImageIcon, Star, Trash2, Edit2, X, ArrowLeft, Tag, Folder, Check } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface PortfolioPhoto {
  id: string;
  vendor_id: string;
  photo_url: string;
  caption: string | null;
  tags: string[] | null;
  featured: boolean;
  album: string | null;
  sort_order: number;
  created_at: string;
}

const TIER_LIMITS = {
  free: 5,
  premium: 20,
  featured: 50,
  elite: 999
};

export default function PortfolioManager() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorTier, setVendorTier] = useState<keyof typeof TIER_LIMITS>('free');
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioPhoto | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterAlbum, setFilterAlbum] = useState<string>('all');
  const [albums, setAlbums] = useState<string[]>([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    caption: '',
    tags: '',
    featured: false,
    album: ''
  });

  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setVendorId(user.id);

      // Fetch vendor tier
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('tier')
        .eq('id', user.id)
        .single();

      if (vendorData) {
        setVendorTier(vendorData.tier);
      }
    };
    initializePage();
  }, [router]);

  useEffect(() => {
    if (vendorId) {
      fetchPhotos();
    }
  }, [vendorId]);

  useEffect(() => {
    // Extract unique albums
    const uniqueAlbums = [...new Set(photos.map(p => p.album).filter(Boolean) as string[])];
    setAlbums(uniqueAlbums);
  }, [photos]);

  const fetchPhotos = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('vendor_portfolio')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !vendorId) return;

    const photoLimit = TIER_LIMITS[vendorTier];
    if (photos.length >= photoLimit && photoLimit !== 999) {
      alert(`Your ${vendorTier} plan allows only ${photoLimit} photos. Upgrade to add more!`);
      return;
    }

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        if (photos.length + i >= photoLimit && photoLimit !== 999) {
          alert(`Reached ${photoLimit} photo limit for ${vendorTier} tier`);
          break;
        }

        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${vendorId}/${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vendor-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vendor-photos')
          .getPublicUrl(fileName);

        // Insert into database
        const { error: insertError } = await supabase
          .from('vendor_portfolio')
          .insert([{
            vendor_id: vendorId,
            photo_url: publicUrl,
            sort_order: photos.length + i
          }]);

        if (insertError) throw insertError;
      }

      await fetchPhotos();
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (photo: PortfolioPhoto) => {
    setSelectedPhoto(photo);
    setEditForm({
      caption: photo.caption || '',
      tags: photo.tags?.join(', ') || '',
      featured: photo.featured,
      album: photo.album || ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePhoto = async () => {
    if (!selectedPhoto) return;

    try {
      const { error } = await supabase
        .from('vendor_portfolio')
        .update({
          caption: editForm.caption || null,
          tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()) : null,
          featured: editForm.featured,
          album: editForm.album || null
        })
        .eq('id', selectedPhoto.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedPhoto(null);
      await fetchPhotos();
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Failed to update photo');
    }
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // vendor_id/filename

      // Delete from storage
      await supabase.storage
        .from('vendor-photos')
        .remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from('vendor_portfolio')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      await fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  const toggleFeatured = async (photo: PortfolioPhoto) => {
    try {
      const { error } = await supabase
        .from('vendor_portfolio')
        .update({ featured: !photo.featured })
        .eq('id', photo.id);

      if (error) throw error;
      await fetchPhotos();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const filteredPhotos = filterAlbum === 'all'
    ? photos
    : photos.filter(p => p.album === filterAlbum);

  const photoLimit = TIER_LIMITS[vendorTier];
  const photosRemaining = photoLimit === 999 ? '∞' : photoLimit - photos.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/vendor-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-serif font-bold text-gray-900">Portfolio Manager</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Portfolio</h2>
              <p className="text-gray-600">
                {photos.length} of {photoLimit === 999 ? '∞' : photoLimit} photos used
                {photoLimit !== 999 && (
                  <span className="ml-2 text-champagne-600 font-medium">
                    ({photosRemaining} remaining)
                  </span>
                )}
              </p>
              {photos.filter(p => p.featured).length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {photos.filter(p => p.featured).length} featured photo{photos.filter(p => p.featured).length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {(photos.length < photoLimit || photoLimit === 999) && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Uploading...' : 'Upload Photos'}
                </button>
              )}

              {photos.length >= photoLimit && photoLimit !== 999 && (
                <button
                  onClick={() => router.push('/vendor-pricing')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-medium rounded-lg transition"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Album Filter */}
        {albums.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Folder className="w-5 h-5 text-gray-500" />
              <button
                onClick={() => setFilterAlbum('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterAlbum === 'all' ? 'bg-champagne-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Photos ({photos.length})
              </button>
              {albums.map(album => (
                <button
                  key={album}
                  onClick={() => setFilterAlbum(album)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterAlbum === album ? 'bg-champagne-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {album} ({photos.filter(p => p.album === album).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {photos.length === 0 ? 'No photos yet' : 'No photos in this album'}
            </h3>
            <p className="text-gray-600 mb-4">
              {photos.length === 0
                ? 'Upload photos to showcase your work to potential clients'
                : 'Switch to another album or upload new photos'
              }
            </p>
            {photos.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition inline-flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Your First Photo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map(photo => (
              <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition">
                <div className="relative aspect-square">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Portfolio photo'}
                    fill
                    className="object-cover"
                  />

                  {/* Featured Badge */}
                  {photo.featured && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                      <Star className="w-3 h-3 fill-white" />
                      Featured
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => toggleFeatured(photo)}
                      className={`p-2 rounded-full ${
                        photo.featured ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'
                      } hover:scale-110 transition`}
                      title={photo.featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className={`w-4 h-4 ${photo.featured ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      onClick={() => openEditModal(photo)}
                      className="p-2 bg-blue-600 text-white rounded-full hover:scale-110 transition"
                      title="Edit photo details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                      className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Info */}
                <div className="p-3">
                  {photo.caption && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{photo.caption}</p>
                  )}

                  {photo.album && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Folder className="w-3 h-3" />
                      {photo.album}
                    </div>
                  )}

                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {photo.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{photo.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tier Limit Warning */}
        {photos.length >= photoLimit * 0.8 && photoLimit !== 999 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800">
              <strong>Photo limit warning:</strong> You're using {photos.length} of {photoLimit} photos.
              {photos.length >= photoLimit ? (
                <> You've reached your limit. </>
              ) : (
                <> Only {photoLimit - photos.length} photo{photoLimit - photos.length !== 1 ? 's' : ''} remaining. </>
              )}
              <button
                onClick={() => router.push('/vendor-pricing')}
                className="ml-2 text-amber-600 hover:text-amber-700 font-medium underline"
              >
                Upgrade your plan
              </button>
              {' '}to add more photos.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Photo Details</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPhoto(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Preview */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={selectedPhoto.photo_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Edit Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Caption
                    </label>
                    <textarea
                      value={editForm.caption}
                      onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                      rows={3}
                      placeholder="Describe this photo..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Album
                    </label>
                    <input
                      type="text"
                      value={editForm.album}
                      onChange={(e) => setEditForm({ ...editForm, album: e.target.value })}
                      placeholder="e.g., Weddings 2024, Outdoor Ceremonies"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                      list="albums"
                    />
                    <datalist id="albums">
                      {albums.map(album => (
                        <option key={album} value={album} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="e.g., outdoor, rustic, summer"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas. Tags help organize and search your photos.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={editForm.featured}
                      onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                      className="w-4 h-4 text-champagne-600 rounded focus:ring-champagne-500"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Mark as Featured Photo
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdatePhoto}
                      className="flex-1 px-6 py-3 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedPhoto(null);
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
