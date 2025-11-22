'use client';

import { useState, useEffect } from 'react';
import { Upload, Eye, Save, Globe, Lock, Image, Users, Calendar, MapPin, Heart } from 'lucide-react';

interface Website {
  id: string;
  wedding_id: string;
  site_name: string;
  site_slug: string;
  theme: string;
  bride_name: string;
  groom_name: string;
  ceremony_date: string;
  ceremony_location: string;
  reception_date: string;
  reception_location: string;
  is_published: boolean;
  is_password_protected: boolean;
  custom_domain?: string;
  design_settings: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  meta_description?: string;
  meta_image?: string;
  enable_rsvp: boolean;
}

interface WeddingPartyMember {
  id?: string;
  member_type: string;
  name: string;
  relationship: string;
  bio: string;
  photo_url: string;
  display_order: number;
}

interface WebsitePhoto {
  id?: string;
  photo_category: string;
  photo_url: string;
  caption: string;
  display_order: number;
}

interface Section {
  id?: string;
  section_type: string;
  title: string;
  content: string;
  is_visible: boolean;
  display_order: number;
}

const THEMES = [
  { id: 'classic', name: 'Classic Elegance', preview: '🎩', colors: { primary: '#8B4513', secondary: '#F5F5DC' } },
  { id: 'modern', name: 'Modern Minimalist', preview: '✨', colors: { primary: '#2C3E50', secondary: '#ECF0F1' } },
  { id: 'romantic', name: 'Romantic Blush', preview: '💕', colors: { primary: '#FFB6C1', secondary: '#FFF0F5' } },
  { id: 'elegant', name: 'Elegant Gold', preview: '👑', colors: { primary: '#DAA520', secondary: '#FFFFF0' } },
  { id: 'rustic', name: 'Rustic Charm', preview: '🌾', colors: { primary: '#8B7355', secondary: '#FAF0E6' } },
  { id: 'garden', name: 'Garden Fresh', preview: '🌸', colors: { primary: '#98D8C8', secondary: '#F7FAF7' } },
  { id: 'coastal', name: 'Coastal Breeze', preview: '🌊', colors: { primary: '#5F9EA0', secondary: '#F0F8FF' } },
  { id: 'vintage', name: 'Vintage Romance', preview: '📖', colors: { primary: '#B76E79', secondary: '#FDF5E6' } },
];

export function PremiumWebsiteBuilder({ weddingId }: { weddingId: string }) {
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    site_name: '',
    bride_name: '',
    groom_name: '',
    theme: 'classic',
    ceremony_date: '',
    ceremony_location: '',
    reception_date: '',
    reception_location: '',
    our_story: '',
    password: '',
    custom_domain: '',
    primaryColor: '#8B4513',
    secondaryColor: '#F5F5DC',
  });

  const [weddingParty, setWeddingParty] = useState<WeddingPartyMember[]>([]);
  const [photos, setPhotos] = useState<WebsitePhoto[]>([]);
  const [sections, setSections] = useState<Section[]>([
    { section_type: 'hero', title: 'Welcome', content: '', is_visible: true, display_order: 0 },
    { section_type: 'our_story', title: 'Our Story', content: '', is_visible: true, display_order: 1 },
    { section_type: 'wedding_party', title: 'Wedding Party', content: '', is_visible: true, display_order: 2 },
    { section_type: 'event_details', title: 'Event Details', content: '', is_visible: true, display_order: 3 },
    { section_type: 'photos', title: 'Photos', content: '', is_visible: true, display_order: 4 },
    { section_type: 'rsvp', title: 'RSVP', content: '', is_visible: true, display_order: 5 },
  ]);

  useEffect(() => {
    loadWebsite();
  }, [weddingId]);

  const loadWebsite = async () => {
    try {
      const response = await fetch(`/api/website-builder?wedding_id=${weddingId}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setWebsite(data);
          setFormData({
            site_name: data.site_name || '',
            bride_name: data.bride_name || '',
            groom_name: data.groom_name || '',
            theme: data.theme || 'classic',
            ceremony_date: data.ceremony_date || '',
            ceremony_location: data.ceremony_location || '',
            reception_date: data.reception_date || '',
            reception_location: data.reception_location || '',
            our_story: '',
            password: '',
            custom_domain: data.custom_domain || '',
            primaryColor: data.design_settings?.primaryColor || '#8B4513',
            secondaryColor: data.design_settings?.secondaryColor || '#F5F5DC',
          });
        }
      }
    } catch (err) {
      console.error('Error loading website:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update colors when theme changes
    if (name === 'theme') {
      const theme = THEMES.find(t => t.id === value);
      if (theme) {
        setFormData(prev => ({
          ...prev,
          primaryColor: theme.colors.primary,
          secondaryColor: theme.colors.secondary,
        }));
      }
    }
  };

  const handleCreateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedding_id: weddingId,
          ...formData,
          design_settings: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            fontFamily: 'Playfair Display',
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create website');

      const newWebsite = await response.json();
      setWebsite(newWebsite);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!website) return;

    setLoading(true);
    try {
      const response = await fetch('/api/website-builder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: website.id,
          ...formData,
          design_settings: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setWebsite(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!website) return;

    setLoading(true);
    try {
      const response = await fetch('/api/website-builder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: website.id,
          is_published: true,
          published_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to publish');

      const updated = await response.json();
      setWebsite(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addWeddingPartyMember = () => {
    setWeddingParty([...weddingParty, {
      member_type: 'bridesmaid',
      name: '',
      relationship: '',
      bio: '',
      photo_url: '',
      display_order: weddingParty.length,
    }]);
  };

  const addPhoto = (category: string) => {
    setPhotos([...photos, {
      photo_category: category,
      photo_url: '',
      caption: '',
      display_order: photos.filter(p => p.photo_category === category).length,
    }]);
  };

  if (!website) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-champagne-50 to-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Globe className="w-16 h-16 mx-auto mb-4 text-champagne-600" />
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Your Wedding Website</h2>
            <p className="text-gray-600">A beautiful, personalized website for your special day</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateWebsite} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
                <input
                  type="text"
                  name="site_name"
                  placeholder="Sarah & John's Wedding"
                  value={formData.site_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Theme</label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                >
                  {THEMES.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.preview} {theme.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bride's Name</label>
                <input
                  type="text"
                  name="bride_name"
                  placeholder="Sarah"
                  value={formData.bride_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Groom's Name</label>
                <input
                  type="text"
                  name="groom_name"
                  placeholder="John"
                  value={formData.groom_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ceremony Date</label>
                <input
                  type="date"
                  name="ceremony_date"
                  value={formData.ceremony_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ceremony Location</label>
                <input
                  type="text"
                  name="ceremony_location"
                  placeholder="St. Mary's Church"
                  value={formData.ceremony_location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-champagne-600 hover:bg-champagne-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? 'Creating...' : (
                <>
                  <Globe className="w-5 h-5" />
                  Create My Wedding Website
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne-600 to-champagne-700 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{website.site_name}</h2>
            <p className="text-champagne-100">bellaweddingai.com/{website.site_slug}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-champagne-700 rounded-lg hover:bg-champagne-50 transition"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-800 text-white rounded-lg hover:bg-champagne-900 transition"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handlePublish}
              disabled={loading || website.is_published}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              <Globe className="w-4 h-4" />
              {website.is_published ? 'Published' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['basic', 'party', 'photos', 'sections', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-champagne-600 text-champagne-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'basic' && <Heart className="w-4 h-4 inline mr-2" />}
                {tab === 'party' && <Users className="w-4 h-4 inline mr-2" />}
                {tab === 'photos' && <Image className="w-4 h-4 inline mr-2" />}
                {tab === 'sections' && <Calendar className="w-4 h-4 inline mr-2" />}
                {tab === 'settings' && <Globe className="w-4 h-4 inline mr-2" />}
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
                  <input
                    type="text"
                    name="site_name"
                    value={formData.site_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  >
                    {THEMES.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.preview} {theme.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Our Story</label>
                  <textarea
                    name="our_story"
                    value={formData.our_story}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell your love story..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wedding Party Tab */}
          {activeTab === 'party' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Wedding Party</h3>
                <button
                  onClick={addWeddingPartyMember}
                  className="px-4 py-2 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition"
                >
                  + Add Member
                </button>
              </div>
              {weddingParty.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No wedding party members added yet. Click "Add Member" to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {weddingParty.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <select
                        value={member.member_type}
                        onChange={(e) => {
                          const updated = [...weddingParty];
                          updated[index].member_type = e.target.value;
                          setWeddingParty(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="bridesmaid">Bridesmaid</option>
                        <option value="groomsman">Groomsman</option>
                        <option value="maid_of_honor">Maid of Honor</option>
                        <option value="best_man">Best Man</option>
                        <option value="flower_girl">Flower Girl</option>
                        <option value="ring_bearer">Ring Bearer</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...weddingParty];
                          updated[index].name = e.target.value;
                          setWeddingParty(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Photo URL"
                        value={member.photo_url}
                        onChange={(e) => {
                          const updated = [...weddingParty];
                          updated[index].photo_url = e.target.value;
                          setWeddingParty(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        placeholder="Bio"
                        value={member.bio}
                        onChange={(e) => {
                          const updated = [...weddingParty];
                          updated[index].bio = e.target.value;
                          setWeddingParty(updated);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Photo Galleries</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['engagement', 'venue', 'couple'].map((category) => (
                  <button
                    key={category}
                    onClick={() => addPhoto(category)}
                    className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-champagne-500 transition text-center"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 capitalize">Add {category} Photo</p>
                  </button>
                ))}
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 capitalize">{photo.photo_category}</p>
                      <input
                        type="text"
                        placeholder="Photo URL"
                        value={photo.photo_url}
                        onChange={(e) => {
                          const updated = [...photos];
                          updated[index].photo_url = e.target.value;
                          setPhotos(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Caption"
                        value={photo.caption}
                        onChange={(e) => {
                          const updated = [...photos];
                          updated[index].caption = e.target.value;
                          setPhotos(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Advanced Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password Protection
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Leave empty for public access"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Custom Domain
                  </label>
                  <input
                    type="text"
                    name="custom_domain"
                    placeholder="yourdomain.com"
                    value={formData.custom_domain}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="w-full h-12 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <input
                    type="color"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    className="w-full h-12 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
