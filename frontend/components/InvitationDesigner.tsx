'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Download, Eye, Palette, Type, Image as ImageIcon, Trash2, Plus } from 'lucide-react';

interface InvitationTemplate {
  id: string;
  name: string;
  category: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
}

interface InvitationData {
  id?: string;
  wedding_id: string;
  template_id: string;
  bride_name: string;
  groom_name: string;
  ceremony_date: string;
  ceremony_time: string;
  ceremony_venue: string;
  ceremony_address: string;
  reception_venue: string;
  reception_address: string;
  rsvp_deadline: string;
  rsvp_contact: string;
  custom_message: string;
  custom_colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    text?: string;
    background?: string;
  };
  header_image_url?: string;
  is_finalized: boolean;
}

interface InvitationDesignerProps {
  weddingId: string;
  userRole: string;
}

const TEMPLATES: InvitationTemplate[] = [
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    category: 'Traditional',
    preview: '👑',
    colors: {
      primary: '#8B7355',
      secondary: '#F5E6D3',
      accent: '#DAA520',
      text: '#333333',
      background: '#FFFFFF',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lora',
      accent: 'Great Vibes',
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimalist',
    category: 'Contemporary',
    preview: '✨',
    colors: {
      primary: '#2C3E50',
      secondary: '#ECF0F1',
      accent: '#3498DB',
      text: '#2C3E50',
      background: '#FFFFFF',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Open Sans',
      accent: 'Raleway',
    },
  },
  {
    id: 'romantic-blush',
    name: 'Romantic Blush',
    category: 'Romantic',
    preview: '💕',
    colors: {
      primary: '#FFB6C1',
      secondary: '#FFF0F5',
      accent: '#FF69B4',
      text: '#5C5C5C',
      background: '#FFFAFA',
    },
    fonts: {
      heading: 'Satisfy',
      body: 'Crimson Text',
      accent: 'Dancing Script',
    },
  },
  {
    id: 'vintage-charm',
    name: 'Vintage Charm',
    category: 'Vintage',
    preview: '📖',
    colors: {
      primary: '#B76E79',
      secondary: '#FDF5E6',
      accent: '#8B7355',
      text: '#4A4A4A',
      background: '#FAEBD7',
    },
    fonts: {
      heading: 'Abril Fatface',
      body: 'Merriweather',
      accent: 'Pacifico',
    },
  },
  {
    id: 'garden-romance',
    name: 'Garden Romance',
    category: 'Floral',
    preview: '🌸',
    colors: {
      primary: '#98D8C8',
      secondary: '#F7FAF7',
      accent: '#FF6B9D',
      text: '#2D5F3F',
      background: '#FFFFFF',
    },
    fonts: {
      heading: 'Cormorant',
      body: 'Libre Baskerville',
      accent: 'Alex Brush',
    },
  },
  {
    id: 'coastal-breeze',
    name: 'Coastal Breeze',
    category: 'Beach',
    preview: '🌊',
    colors: {
      primary: '#5F9EA0',
      secondary: '#F0F8FF',
      accent: '#20B2AA',
      text: '#2F4F4F',
      background: '#F0FFFF',
    },
    fonts: {
      heading: 'Josefin Sans',
      body: 'Lato',
      accent: 'Allura',
    },
  },
  {
    id: 'rustic-love',
    name: 'Rustic Love',
    category: 'Rustic',
    preview: '🌾',
    colors: {
      primary: '#8B7355',
      secondary: '#FAF0E6',
      accent: '#D2691E',
      text: '#3E2723',
      background: '#FFF8DC',
    },
    fonts: {
      heading: 'Bebas Neue',
      body: 'PT Serif',
      accent: 'Yellowtail',
    },
  },
  {
    id: 'gold-glamour',
    name: 'Gold Glamour',
    category: 'Luxury',
    preview: '✨',
    colors: {
      primary: '#DAA520',
      secondary: '#FFFFF0',
      accent: '#FFD700',
      text: '#000000',
      background: '#FFFAF0',
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Crimson Pro',
      accent: 'Tangerine',
    },
  },
  {
    id: 'floral-dream',
    name: 'Floral Dream',
    category: 'Floral',
    preview: '🌺',
    colors: {
      primary: '#E91E63',
      secondary: '#FCE4EC',
      accent: '#F48FB1',
      text: '#880E4F',
      background: '#FFF0F5',
    },
    fonts: {
      heading: 'Italiana',
      body: 'Cardo',
      accent: 'Sacramento',
    },
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    category: 'Vintage',
    preview: '🎨',
    colors: {
      primary: '#1C1C1C',
      secondary: '#F5F5DC',
      accent: '#CD7F32',
      text: '#000000',
      background: '#FFFACD',
    },
    fonts: {
      heading: 'Poiret One',
      body: 'EB Garamond',
      accent: 'Rouge Script',
    },
  },
  {
    id: 'boho-chic',
    name: 'Boho Chic',
    category: 'Bohemian',
    preview: '🌻',
    colors: {
      primary: '#D4A574',
      secondary: '#FFF9F0',
      accent: '#E67E22',
      text: '#5D4037',
      background: '#FFFEF7',
    },
    fonts: {
      heading: 'Righteous',
      body: 'Nunito',
      accent: 'Kaushan Script',
    },
  },
  {
    id: 'winter-wonderland',
    name: 'Winter Wonderland',
    category: 'Seasonal',
    preview: '❄️',
    colors: {
      primary: '#4A90E2',
      secondary: '#F0F8FF',
      accent: '#87CEEB',
      text: '#1C3F6E',
      background: '#F0FFFF',
    },
    fonts: {
      heading: 'Glacial Indifference',
      body: 'Roboto',
      accent: 'Great Vibes',
    },
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    category: 'Beach',
    preview: '🌴',
    colors: {
      primary: '#00BCD4',
      secondary: '#E0F7FA',
      accent: '#FF6F00',
      text: '#004D40',
      background: '#E0F2F1',
    },
    fonts: {
      heading: 'Audiowide',
      body: 'Quicksand',
      accent: 'Pacifico',
    },
  },
  {
    id: 'timeless-traditional',
    name: 'Timeless Traditional',
    category: 'Traditional',
    preview: '🎩',
    colors: {
      primary: '#2C2C2C',
      secondary: '#F8F8F8',
      accent: '#8B0000',
      text: '#1A1A1A',
      background: '#FFFFFF',
    },
    fonts: {
      heading: 'Trajan Pro',
      body: 'Georgia',
      accent: 'Pinyon Script',
    },
  },
  {
    id: 'contemporary-bold',
    name: 'Contemporary Bold',
    category: 'Contemporary',
    preview: '⚡',
    colors: {
      primary: '#FF4081',
      secondary: '#F5F5F5',
      accent: '#7C4DFF',
      text: '#212121',
      background: '#FAFAFA',
    },
    fonts: {
      heading: 'Oswald',
      body: 'Roboto Slab',
      accent: 'Lobster',
    },
  },
];

export function InvitationDesigner({ weddingId, userRole }: InvitationDesignerProps) {
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationTemplate>(TEMPLATES[0]);
  const [currentInvitation, setCurrentInvitation] = useState<InvitationData>({
    wedding_id: weddingId,
    template_id: TEMPLATES[0].id,
    bride_name: '',
    groom_name: '',
    ceremony_date: '',
    ceremony_time: '',
    ceremony_venue: '',
    ceremony_address: '',
    reception_venue: '',
    reception_address: '',
    rsvp_deadline: '',
    rsvp_contact: '',
    custom_message: '',
    is_finalized: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'details' | 'customize'>('templates');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvitations();
  }, [weddingId]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invitations?wedding_id=${weddingId}`);
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const data = await response.json();
      setInvitations(data);

      if (data.length > 0) {
        const latest = data[0];
        setCurrentInvitation(latest);
        const template = TEMPLATES.find(t => t.id === latest.template_id) || TEMPLATES[0];
        setSelectedTemplate(template);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveInvitation = async () => {
    try {
      const method = currentInvitation.id ? 'PUT' : 'POST';
      const response = await fetch('/api/invitations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentInvitation),
      });

      if (!response.ok) throw new Error('Failed to save invitation');
      const saved = await response.json();
      setCurrentInvitation(saved);
      alert('Invitation saved successfully!');
      await fetchInvitations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTemplateSelect = (template: InvitationTemplate) => {
    setSelectedTemplate(template);
    setCurrentInvitation({
      ...currentInvitation,
      template_id: template.id,
    });
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setCurrentInvitation({
      ...currentInvitation,
      custom_colors: {
        ...currentInvitation.custom_colors,
        [colorKey]: value,
      },
    });
  };

  const getActiveColors = () => {
    return {
      ...selectedTemplate.colors,
      ...currentInvitation.custom_colors,
    };
  };

  const downloadInvitation = () => {
    // In production, this would generate a PDF or high-res image
    alert('Download functionality would export a high-resolution PDF or image file.');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading invitations...</p>
      </div>
    );
  }

  const activeColors = getActiveColors();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Invitation Designer</h2>
            <p className="text-gray-600 mt-1">Create beautiful wedding invitations with customizable templates</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={saveInvitation}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={downloadInvitation}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'templates'
                  ? 'text-champagne-600 border-b-2 border-champagne-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'details'
                  ? 'text-champagne-600 border-b-2 border-champagne-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'customize'
                  ? 'text-champagne-600 border-b-2 border-champagne-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Customize
            </button>
          </div>

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Choose a Template</h3>
              <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 border-2 rounded-xl text-left transition ${
                      selectedTemplate.id === template.id
                        ? 'border-champagne-500 bg-champagne-50'
                        : 'border-gray-200 hover:border-champagne-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{template.preview}</div>
                    <h4 className="font-bold text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500">{template.category}</p>
                    <div className="flex gap-1 mt-2">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: template.colors.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: template.colors.accent }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900">Invitation Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bride's Name</label>
                  <input
                    type="text"
                    value={currentInvitation.bride_name}
                    onChange={(e) => setCurrentInvitation({ ...currentInvitation, bride_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Groom's Name</label>
                  <input
                    type="text"
                    value={currentInvitation.groom_name}
                    onChange={(e) => setCurrentInvitation({ ...currentInvitation, groom_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ceremony Date</label>
                  <input
                    type="date"
                    value={currentInvitation.ceremony_date}
                    onChange={(e) => setCurrentInvitation({ ...currentInvitation, ceremony_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ceremony Time</label>
                  <input
                    type="time"
                    value={currentInvitation.ceremony_time}
                    onChange={(e) => setCurrentInvitation({ ...currentInvitation, ceremony_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ceremony Venue</label>
                <input
                  type="text"
                  value={currentInvitation.ceremony_venue}
                  onChange={(e) => setCurrentInvitation({ ...currentInvitation, ceremony_venue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ceremony Address</label>
                <input
                  type="text"
                  value={currentInvitation.ceremony_address}
                  onChange={(e) => setCurrentInvitation({ ...currentInvitation, ceremony_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reception Venue</label>
                <input
                  type="text"
                  value={currentInvitation.reception_venue}
                  onChange={(e) => setCurrentInvitation({ ...currentInvitation, reception_venue: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reception Address</label>
                <input
                  type="text"
                  value={currentInvitation.reception_address}
                  onChange={(e) => setCurrentInvitation({ ...currentInvitation, reception_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Deadline</label>
                  <input
                    type="date"
                    value={currentInvitation.rsvp_deadline}
                    onChange={(e) => setCurrentInvitation({ ...currentInvitation, rsvp_deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Contact</label>
                  <input
                    type="text"
                    value={currentInvitation.rsvp_contact}
                    onChange={(e) => setCurrentInvitation({ ...currentInvitation, rsvp_contact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Message</label>
                <textarea
                  value={currentInvitation.custom_message}
                  onChange={(e) => setCurrentInvitation({ ...currentInvitation, custom_message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  placeholder="Add a personal message..."
                />
              </div>
            </div>
          )}

          {/* Customize Tab */}
          {activeTab === 'customize' && (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900">Customize Colors</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Primary Color</label>
                  <input
                    type="color"
                    value={activeColors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Secondary Color</label>
                  <input
                    type="color"
                    value={activeColors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Accent Color</label>
                  <input
                    type="color"
                    value={activeColors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Text Color</label>
                  <input
                    type="color"
                    value={activeColors.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Background Color</label>
                  <input
                    type="color"
                    value={activeColors.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => setCurrentInvitation({ ...currentInvitation, custom_colors: {} })}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
              >
                Reset to Template Defaults
              </button>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
            <div
              ref={previewRef}
              className="w-full aspect-[8.5/11] border-2 border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center text-center overflow-auto"
              style={{
                backgroundColor: activeColors.background,
                color: activeColors.text,
              }}
            >
              {/* Invitation Content */}
              <div className="max-w-md space-y-8">
                {/* Header */}
                <div style={{ color: activeColors.accent }}>
                  <div className="text-sm tracking-widest uppercase mb-2">Together with their families</div>
                </div>

                {/* Names */}
                <div>
                  <h1 className="text-5xl font-bold mb-2" style={{ color: activeColors.primary }}>
                    {currentInvitation.bride_name || 'Bride Name'}
                  </h1>
                  <div className="text-3xl my-4" style={{ color: activeColors.accent }}>&</div>
                  <h1 className="text-5xl font-bold" style={{ color: activeColors.primary }}>
                    {currentInvitation.groom_name || 'Groom Name'}
                  </h1>
                </div>

                {/* Invitation Text */}
                <div className="text-lg">
                  <p>Request the honor of your presence</p>
                  <p>at the celebration of their marriage</p>
                </div>

                {/* Date & Time */}
                <div className="py-4 px-6 rounded-lg" style={{ backgroundColor: activeColors.secondary }}>
                  <div className="text-xl font-semibold" style={{ color: activeColors.primary }}>
                    {(() => {
                      if (!currentInvitation.ceremony_date) return 'Wedding Date';
                      const date = new Date(currentInvitation.ceremony_date);
                      if (isNaN(date.getTime())) return 'Wedding Date';
                      return date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    })()}
                  </div>
                  {currentInvitation.ceremony_time && (
                    <div className="mt-2">at {currentInvitation.ceremony_time}</div>
                  )}
                </div>

                {/* Venue */}
                <div>
                  <div className="font-semibold text-lg" style={{ color: activeColors.primary }}>
                    {currentInvitation.ceremony_venue || 'Ceremony Venue'}
                  </div>
                  <div className="text-sm mt-1">{currentInvitation.ceremony_address}</div>
                </div>

                {/* Reception */}
                {currentInvitation.reception_venue && (
                  <div>
                    <div className="text-sm tracking-widest uppercase mb-2" style={{ color: activeColors.accent }}>
                      Reception to follow
                    </div>
                    <div className="font-semibold" style={{ color: activeColors.primary }}>
                      {currentInvitation.reception_venue}
                    </div>
                    <div className="text-sm mt-1">{currentInvitation.reception_address}</div>
                  </div>
                )}

                {/* Custom Message */}
                {currentInvitation.custom_message && (
                  <div className="text-sm italic border-t pt-4" style={{ borderColor: activeColors.accent }}>
                    {currentInvitation.custom_message}
                  </div>
                )}

                {/* RSVP */}
                <div className="text-sm pt-4 border-t" style={{ borderColor: activeColors.accent }}>
                  <div>Kindly respond by {currentInvitation.rsvp_deadline || 'RSVP Date'}</div>
                  {currentInvitation.rsvp_contact && <div>to {currentInvitation.rsvp_contact}</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
