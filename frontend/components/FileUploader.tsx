'use client';

import { useState, useEffect } from 'react';
import { Upload, File, Image, FileText, X, Download, Loader2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
}

interface Props {
  userId: string;
  category?: string;
  onUploadComplete?: () => void;
}

const CATEGORIES = [
  { id: 'general', name: 'General' },
  { id: 'contracts', name: 'Contracts' },
  { id: 'invoices', name: 'Invoices' },
  { id: 'inspiration', name: 'Inspiration' },
  { id: 'venue', name: 'Venue' },
  { id: 'vendors', name: 'Vendors' },
  { id: 'photos', name: 'Photos' },
];

export function FileUploader({ userId, category: defaultCategory, onUploadComplete }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || 'general');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [selectedCategory]);

  const loadFiles = async () => {
    try {
      const url = `/api/files/upload?user_id=${userId}${selectedCategory ? `&category=${selectedCategory}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load files');
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Load files error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      formData.append('category', selectedCategory);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      await loadFiles();
      onUploadComplete?.();
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/upload?id=${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete file');

      await loadFiles();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file');
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-champagne-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-champagne-500'
            }`}
          >
            {cat.name}
          </button>
        ))}
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
            : 'border-gray-300 bg-white'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-champagne-600 animate-spin" />
              <p className="text-gray-900 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-champagne-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-champagne-600" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, DOC, XLS, or images up to 10MB
                </p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-champagne-600 mx-auto" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No files uploaded yet in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const Icon = getFileIcon(file.file_type);
            return (
              <div
                key={file.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-champagne-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-champagne-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-champagne-600 hover:text-champagne-700 font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
