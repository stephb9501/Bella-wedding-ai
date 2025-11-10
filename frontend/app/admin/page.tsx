'use client';
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Settings, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface UploadedImage {
  id: string;
  filename: string;
  url: string;
  uploadedAt: string;
  size: number;
  dimensions: { width: number; height: number };
}

export default function AdminMediaManager() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('manage');

  useEffect(() => {
    const saved = localStorage.getItem('bella_all_images');
    if (saved) setImages(JSON.parse(saved));
  }, []);

  const saveImages = (newImages: UploadedImage[]) => {
    setImages(newImages);
    localStorage.setItem('bella_all_images', JSON.stringify(newImages));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newImage = await response.json();
        saveImages([newImage, ...images]);
        alert('✅ Photo uploaded!');
      }
    } catch (error) {
      alert('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    const image = images.find(i => i.id === imageId);
    if (!image || !confirm('Delete this photo?')) return;

    try {
      await fetch(`/api/admin/delete-image/${imageId}?filename=${image.filename}`, {
        method: 'DELETE',
      });
      saveImages(images.filter(i => i.id !== imageId));
    } catch (error) {
      alert('Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">📸 Photo Manager</h1>
        <p className="text-gray-600 mb-8">Upload photos for your site</p>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'upload'
                ? 'text-champagne-600 border-b-2 border-champagne-600'
                : 'text-gray-600'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'manage'
                ? 'text-champagne-600 border-b-2 border-champagne-600'
                : 'text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            My Photos ({images.length})
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <label className="block">
              <div className="border-2 border-dashed border-champagne-300 rounded-xl p-12 hover:border-champagne-500 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-champagne-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop photo here</h3>
                  <p className="text-gray-600">JPG, PNG • Max 10MB</p>
                </div>
              </div>
            </label>
            {uploading && <p className="text-center mt-4 text-gray-600">Uploading...</p>}
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Photos</h3>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map(img => (
                  <div key={img.id} className="group relative">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={img.url} alt="photo" fill className="object-cover" />
                    </div>
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-12">No photos uploaded yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}