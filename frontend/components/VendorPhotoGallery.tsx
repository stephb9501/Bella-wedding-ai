'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Star, Image as ImageIcon, Loader2 } from 'lucide-react';
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
  category?: string;
  showCaptions?: boolean;
  columns?: number;
}

export function VendorPhotoGallery({
  vendorId,
  category,
  showCaptions = true,
  columns = 3
}: Props) {
  const [photos, setPhotos] = useState<VendorPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPhotos();
  }, [vendorId, category]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const url = `/api/vendors/photos?vendor_id=${vendorId}${category ? `&category=${category}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
      console.error('Fetch photos error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const previousPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleImageError = (photoId: string) => {
    setImageLoadErrors(prev => new Set(prev).add(photoId));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') previousPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, photos.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-champagne-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 text-lg mb-2">No photos yet</p>
        <p className="text-gray-500 text-sm">
          {category ? `No photos in the ${category} category` : 'Check back soon for photos'}
        </p>
      </div>
    );
  }

  const gridColsClass = {
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns] || 'grid-cols-2 md:grid-cols-3';

  return (
    <>
      <div className={`grid ${gridColsClass} gap-4`}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 aspect-square"
            onClick={() => openLightbox(index)}
          >
            {/* Featured badge */}
            {photo.is_featured && (
              <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3 fill-white" />
                Featured
              </div>
            )}

            {/* Image */}
            {!imageLoadErrors.has(photo.id) ? (
              <Image
                src={photo.photo_url}
                alt={photo.caption || 'Vendor photo'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                loading="lazy"
                onError={() => handleImageError(photo.id)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                {showCaptions && photo.caption && (
                  <p className="text-sm font-medium line-clamp-2">{photo.caption}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && photos[currentPhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-50"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              onClick={previousPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-50 bg-black bg-opacity-50 rounded-full p-2"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next button */}
          {photos.length > 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition z-50 bg-black bg-opacity-50 rounded-full p-2"
              aria-label="Next photo"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center p-12">
            <div className="relative max-w-6xl max-h-full w-full h-full flex items-center justify-center">
              {!imageLoadErrors.has(photos[currentPhotoIndex].id) ? (
                <Image
                  src={photos[currentPhotoIndex].photo_url}
                  alt={photos[currentPhotoIndex].caption || 'Vendor photo'}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                  onError={() => handleImageError(photos[currentPhotoIndex].id)}
                />
              ) : (
                <div className="flex items-center justify-center bg-gray-800 rounded-lg p-12">
                  <div className="text-center text-white">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Image not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Caption and info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
            <div className="max-w-4xl mx-auto">
              {showCaptions && photos[currentPhotoIndex].caption && (
                <p className="text-lg mb-2">{photos[currentPhotoIndex].caption}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center gap-4">
                  {photos[currentPhotoIndex].is_featured && (
                    <span className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      <Star className="w-3 h-3 fill-white" />
                      Featured
                    </span>
                  )}
                  <span className="capitalize">{photos[currentPhotoIndex].category}</span>
                </div>
                <span>
                  {currentPhotoIndex + 1} / {photos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
