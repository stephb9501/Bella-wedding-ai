'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Upload, Trash2, Check, X, Image as ImageIcon, AlertCircle, Type,
  Palette, FileText, Video, Settings, Eye, EyeOff, Plus
} from 'lucide-react';

type ImageType = 'landing_hero' | 'dashboard_banner' | 'marketing_block' | 'testimonial' | 'vendor_showcase' | 'logo' | 'other';

interface AdminImage {
  id: string;
  created_at: string;
  name: string;
  storage_path: string;
  public_url: string;
  file_size: number;
  mime_type: string;
  image_type: ImageType;
  is_active: boolean;
  is_archived: boolean;
  description: string | null;
  alt_text: string | null;
}

interface SiteSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  logo_url: string;
  site_name: string;
}

export default function AdminCMS() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'content' | 'colors' | 'settings'>('photos');

  // Photo manager state
  const [images, setImages] = useState<AdminImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<ImageType>('landing_hero');
  const [dragActive, setDragActive] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SiteSettings>({
    primary_color: '#E11D48',
    secondary_color: '#F3E5D8',
    accent_color: '#FB7185',
    font_heading: 'Playfair Display',
    font_body: 'Inter',
    logo_url: '',
    site_name: 'Bella Wedding AI',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const imageTypes = [
    { value: 'landing_hero', label: 'Landing Hero', icon: '🏠' },
    { value: 'dashboard_banner', label: 'Dashboard Banner', icon: '📊' },
    { value: 'marketing_block', label: 'Marketing Block', icon: '📢' },
    { value: 'testimonial', label: 'Testimonial', icon: '💬' },
    { value: 'vendor_showcase', label: 'Vendor Showcase', icon: '🎉' },
    { value: 'logo', label: 'Logo', icon: '🏷️' },
    { value: 'other', label: 'Other', icon: '📁' },
  ];

  const fontOptions = [
    'Playfair Display',
    'Inter',
    'Lora',
    'Montserrat',
    'Roboto',
    'Open Sans',
    'Poppins',
    'Raleway',
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);

      // Check if user is admin
      const adminEmails = [
        process.env.NEXT_PUBLIC_ADMIN_EMAIL,
        'stephb9501@gmail.com',
      ];

      const isAdminEmail = adminEmails.includes(user.email);

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdminRole = userData?.role === 'admin';

      if (!isAdminEmail && !isAdminRole) {
        setError('Access denied. Admin only.');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }

      setIsAdmin(true);
      await fetchImages();
      await loadSettings();
    } catch (err) {
      console.error('Admin check error:', err);
      setError('Failed to verify admin access');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      console.error('Fetch images error:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const saved = localStorage.getItem('bella_site_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Load settings error:', err);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('bella_site_settings', JSON.stringify(settings));
      setSuccess('Settings saved! Refresh your landing page to see changes.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to save settings');
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }

        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${sanitizedName}`;
        const filePath = `${selectedType}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bella-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          if (uploadError.message.includes('not found')) {
            throw new Error('Storage bucket "bella-images" not found. Please create it in Supabase Dashboard first.');
          }
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('bella-images')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('admin_images')
          .insert({
            name: file.name,
            storage_path: filePath,
            public_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            image_type: selectedType,
            is_active: false,
            uploaded_by: user.id,
            alt_text: file.name.replace(/\.[^/.]+$/, ''),
          });

        if (dbError) throw dbError;
      }

      setSuccess(`Successfully uploaded ${files.length} image(s)`);
      await fetchImages();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (imageId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_images')
        .update({ is_active: !currentActive })
        .eq('id', imageId);

      if (error) throw error;

      setSuccess(`Image ${currentActive ? 'deactivated' : 'activated'}`);
      await fetchImages();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const archiveImage = async (imageId: string) => {
    if (!confirm('Archive this image?')) return;

    try {
      const { error } = await supabase
        .from('admin_images')
        .update({ is_archived: true, is_active: false })
        .eq('id', imageId);

      if (error) throw error;

      setSuccess('Image archived');
      await fetchImages();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteImage = async (imageId: string, storagePath: string) => {
    if (!confirm('Permanently delete this image?')) return;

    try {
      await supabase.storage.from('bella-images').remove([storagePath]);

      const { error: dbError } = await supabase
        .from('admin_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      setSuccess('Image deleted');
      await fetchImages();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const restoreImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('admin_images')
        .update({ is_archived: false })
        .eq('id', imageId);

      if (error) throw error;

      setSuccess('Image restored');
      await fetchImages();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin only.</p>
        </div>
      </div>
    );
  }

  const activeImages = images.filter(img => !img.is_archived);
  const archivedImages = images.filter(img => img.is_archived);

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚙️ Bella Wedding AI CMS</h1>
          <p className="text-gray-600">Manage your website without touching code</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'photos'
                  ? 'border-b-2 border-rose-500 text-rose-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              Photo Manager
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'colors'
                  ? 'border-b-2 border-rose-500 text-rose-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette className="w-5 h-5" />
              Colors & Fonts
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'settings'
                  ? 'border-b-2 border-rose-500 text-rose-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              Site Settings
            </button>
          </div>

          <div className="p-6">
            {/* PHOTO MANAGER TAB */}
            {activeTab === 'photos' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📸 Photo Manager</h2>

                {/* Image Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {imageTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value as ImageType)}
                        className={`p-3 rounded-lg border-2 transition ${
                          selectedType === type.value
                            ? 'border-rose-500 bg-rose-50 text-rose-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs font-medium text-center">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition mb-8 ${
                    dragActive ? 'border-rose-500 bg-rose-50' : 'border-gray-300'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-rose-500' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {dragActive ? 'Drop here' : 'Drag and drop images'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or</p>
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 text-white font-semibold rounded-lg cursor-pointer hover:from-champagne-500 hover:to-rose-500">
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-4">Max 5MB • PNG, JPG, WebP</p>
                </div>

                {uploading && (
                  <div className="text-center mb-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Uploading...</p>
                  </div>
                )}

                {/* Active Images */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">Active Images ({activeImages.length})</h3>
                {activeImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No images yet. Upload your first image above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {activeImages.map((image) => (
                      <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={image.public_url}
                            alt={image.alt_text || image.name}
                            className="w-full h-full object-cover"
                          />
                          {image.is_active && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                              <Check className="w-3 h-3 mr-1" />
                              ACTIVE
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 truncate mb-1">{image.name}</h3>
                          <p className="text-xs text-gray-500 mb-3">
                            {imageTypes.find(t => t.value === image.image_type)?.label}
                          </p>
                          <div className="text-xs text-gray-500 mb-4">
                            <p>{(image.file_size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleActive(image.id, image.is_active)}
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                                image.is_active
                                  ? 'bg-gray-200 text-gray-700'
                                  : 'bg-green-500 text-white'
                              }`}
                            >
                              {image.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => archiveImage(image.id)}
                              className="px-3 py-2 bg-yellow-500 text-white rounded text-sm"
                            >
                              Archive
                            </button>
                            <button
                              onClick={() => deleteImage(image.id, image.storage_path)}
                              className="px-3 py-2 bg-red-500 text-white rounded text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Archived Images */}
                {archivedImages.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Archived ({archivedImages.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {archivedImages.map((image) => (
                        <div key={image.id} className="border rounded-lg overflow-hidden opacity-60">
                          <div className="relative h-48 bg-gray-100">
                            <img
                              src={image.public_url}
                              alt={image.alt_text || image.name}
                              className="w-full h-full object-cover grayscale"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold truncate">{image.name}</h3>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => restoreImage(image.id)}
                                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => deleteImage(image.id, image.storage_path)}
                                className="px-3 py-2 bg-red-500 text-white rounded text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* COLORS & FONTS TAB */}
            {activeTab === 'colors' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 Brand Colors & Fonts</h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Colors */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color (Buttons, CTA)
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={settings.primary_color}
                            onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                            className="w-16 h-16 rounded border-2 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.primary_color}
                            onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                            className="flex-1 px-4 py-2 border rounded"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color (Champagne/Beige)
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={settings.secondary_color}
                            onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                            className="w-16 h-16 rounded border-2 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.secondary_color}
                            onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                            className="flex-1 px-4 py-2 border rounded"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={settings.accent_color}
                            onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                            className="w-16 h-16 rounded border-2 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.accent_color}
                            onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                            className="flex-1 px-4 py-2 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fonts */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Typography</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heading Font
                        </label>
                        <select
                          value={settings.font_heading}
                          onChange={(e) => setSettings({ ...settings, font_heading: e.target.value })}
                          className="w-full px-4 py-2 border rounded"
                        >
                          {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: settings.font_heading }}>
                          Preview: The Quick Brown Fox
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Body Font
                        </label>
                        <select
                          value={settings.font_body}
                          onChange={(e) => setSettings({ ...settings, font_body: e.target.value })}
                          className="w-full px-4 py-2 border rounded"
                        >
                          {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: settings.font_body }}>
                          Preview: The quick brown fox jumps over the lazy dog.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  className="mt-8 px-8 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 text-white font-semibold rounded-lg hover:from-champagne-500 hover:to-rose-500"
                >
                  Save Color & Font Settings
                </button>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Note:</strong> Color and font changes are saved locally. For full theme customization,
                    you'll need to update the Tailwind config. These settings give you a preview of your brand palette.
                  </p>
                </div>
              </div>
            )}

            {/* SITE SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Site Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      value={settings.logo_url}
                      onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                      placeholder="Upload logo to Photos tab, then paste URL here"
                      className="w-full px-4 py-2 border rounded"
                    />
                    {settings.logo_url && (
                      <img
                        src={settings.logo_url}
                        alt="Logo preview"
                        className="mt-3 max-h-20 object-contain"
                      />
                    )}
                  </div>

                  <button
                    onClick={saveSettings}
                    className="px-8 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 text-white font-semibold rounded-lg"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
