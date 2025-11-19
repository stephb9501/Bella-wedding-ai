'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe, Eye, Type, Palette, Save, Upload, Trash2, Plus,
  GripVertical, Heart, Calendar, MapPin, Users, Hotel, Gift,
  MessageSquare, Image, HelpCircle, Mail, Clock, Check, X,
  ChevronDown, ChevronUp, Download, ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Theme presets
const THEMES = [
  { id: 'rose', name: 'Romantic Rose', primary: '#f43f5e', secondary: '#fecdd3', accent: '#be123c', bg: '#fff1f2' },
  { id: 'navy', name: 'Classic Navy', primary: '#1e3a8a', secondary: '#93c5fd', accent: '#fbbf24', bg: '#eff6ff' },
  { id: 'sage', name: 'Elegant Sage', primary: '#15803d', secondary: '#bbf7d0', accent: '#854d0e', bg: '#f0fdf4' },
  { id: 'lavender', name: 'Lavender Dream', primary: '#7c3aed', secondary: '#ddd6fe', accent: '#c026d3', bg: '#faf5ff' },
  { id: 'champagne', name: 'Champagne Gold', primary: '#d97706', secondary: '#fef3c7', accent: '#92400e', bg: '#fffbeb' },
  { id: 'blush', name: 'Blush Pink', primary: '#ec4899', secondary: '#fbcfe8', accent: '#be185d', bg: '#fdf2f8' },
];

// Section configuration with help text
const SECTION_CONFIG = {
  hero: {
    id: 'hero',
    label: 'Hero / Cover',
    icon: Heart,
    help: 'Create a stunning first impression with your names, photo, wedding date, and countdown timer.'
  },
  story: {
    id: 'story',
    label: 'Our Story',
    icon: Heart,
    help: 'Share your love story including how you met, the proposal, and relationship milestones.'
  },
  details: {
    id: 'details',
    label: 'Wedding Details',
    icon: MapPin,
    help: 'Provide essential details: date, time, venue address, map, and dress code.'
  },
  schedule: {
    id: 'schedule',
    label: 'Schedule of Events',
    icon: Clock,
    help: 'Timeline of the day including ceremony, cocktail hour, reception, and after-party.'
  },
  party: {
    id: 'party',
    label: 'Wedding Party',
    icon: Users,
    help: 'Introduce your bridesmaids and groomsmen with photos and short bios.'
  },
  travel: {
    id: 'travel',
    label: 'Travel & Accommodations',
    icon: Hotel,
    help: 'Hotel block information, directions to venue, parking details, and local tips.'
  },
  registry: {
    id: 'registry',
    label: 'Registry',
    icon: Gift,
    help: 'Share links to your registries (Amazon, Target, Zola, etc.) with a personal message.'
  },
  rsvp: {
    id: 'rsvp',
    label: 'RSVP',
    icon: MessageSquare,
    help: 'Allow guests to RSVP online with meal choices and dietary restrictions.'
  },
  photos: {
    id: 'photos',
    label: 'Photos',
    icon: Image,
    help: 'Showcase engagement photos and couple photos in a beautiful gallery.'
  },
  faq: {
    id: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    help: 'Answer common questions about the venue, dress code, kids, plus-ones, etc.'
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    icon: Mail,
    help: 'Provide a way for guests to reach you with questions or special requests.'
  },
};

interface WeddingWebsite {
  id?: number;
  subdomain?: string;
  published?: boolean;
  hero_photo?: string;
  couple_name_1?: string;
  couple_name_2?: string;
  wedding_date?: string;
  countdown_enabled?: boolean;
  our_story?: string;
  how_we_met?: string;
  proposal_story?: string;
  relationship_timeline?: Array<{ year: string; event: string }>;
  venue_name?: string;
  venue_address?: string;
  ceremony_time?: string;
  ceremony_location?: string;
  reception_time?: string;
  reception_location?: string;
  dress_code?: string;
  schedule_events?: Array<{ time: string; event: string; description: string }>;
  bridesmaids?: Array<{ name: string; role: string; bio: string; photo?: string }>;
  groomsmen?: Array<{ name: string; role: string; bio: string; photo?: string }>;
  hotel_blocks?: Array<{ name: string; address: string; phone: string; code: string; link?: string }>;
  directions?: string;
  parking_info?: string;
  registry_links?: Array<{ name: string; url: string }>;
  registry_message?: string;
  rsvp_enabled?: boolean;
  rsvp_deadline?: string;
  meal_options?: Array<string>;
  photos_json?: Array<{ url: string; caption?: string }>;
  engagement_photos?: Array<{ url: string; caption?: string }>;
  faq_json?: Array<{ question: string; answer: string }>;
  contact_email?: string;
  contact_phone?: string;
  contact_message?: string;
  theme_color?: string;
  sections_enabled?: Record<string, boolean>;
  sections_order?: string[];
}

export default function WebsiteBuilder() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('content');
  const [activeSection, setActiveSection] = useState('hero');
  const [data, setData] = useState<WeddingWebsite>({
    couple_name_1: '',
    couple_name_2: '',
    wedding_date: '',
    countdown_enabled: true,
    theme_color: 'rose',
    sections_enabled: {
      hero: true,
      story: true,
      details: true,
      schedule: true,
      party: true,
      travel: true,
      registry: true,
      rsvp: true,
      photos: true,
      faq: true,
      contact: true,
    },
    sections_order: ['hero', 'story', 'details', 'schedule', 'party', 'travel', 'registry', 'rsvp', 'photos', 'faq', 'contact'],
    relationship_timeline: [],
    schedule_events: [],
    bridesmaids: [],
    groomsmen: [],
    hotel_blocks: [],
    registry_links: [],
    meal_options: ['Chicken', 'Beef', 'Vegetarian'],
    photos_json: [],
    engagement_photos: [],
    faq_json: [],
  });

  const selectedTheme = THEMES.find(t => t.id === data.theme_color) || THEMES[0];

  useEffect(() => {
    loadWebsite();
  }, []);

  async function loadWebsite() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/website-builder', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const { website } = await response.json();
        if (website) {
          setData(website);
        }
      }
    } catch (error) {
      console.error('Error loading website:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveWebsite() {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to save');
        return;
      }

      const method = data.id ? 'PUT' : 'POST';
      const response = await fetch('/api/website-builder', {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const { website } = await response.json();
        setData(website);
        alert('Website saved successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save website');
      }
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Failed to save website');
    } finally {
      setSaving(false);
    }
  }

  async function publishWebsite() {
    if (!data.couple_name_1 || !data.couple_name_2 || !data.wedding_date) {
      alert('Please fill in couple names and wedding date before publishing');
      return;
    }

    const confirmed = confirm('Are you ready to publish your wedding website? Guests will be able to view it.');
    if (!confirmed) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to publish');
        return;
      }

      const response = await fetch('/api/website-builder', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, published: true }),
      });

      if (response.ok) {
        const { website } = await response.json();
        setData(website);
        alert(`Website published! View it at: ${website.subdomain}.bellaweddingai.com`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to publish website');
      }
    } catch (error) {
      console.error('Error publishing website:', error);
      alert('Failed to publish website');
    } finally {
      setSaving(false);
    }
  }

  function updateData(updates: Partial<WeddingWebsite>) {
    setData({ ...data, ...updates });
  }

  function toggleSection(sectionId: string) {
    updateData({
      sections_enabled: {
        ...data.sections_enabled,
        [sectionId]: !data.sections_enabled?.[sectionId],
      },
    });
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    const order = [...(data.sections_order || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;

    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    updateData({ sections_order: order });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p>Loading website builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-champagne-600" />
              <div>
                <h1 className="text-xl font-bold">Wedding Website Builder</h1>
                {data.subdomain && (
                  <p className="text-sm text-gray-500">
                    {data.subdomain}.bellaweddingai.com
                    {data.published && <span className="ml-2 text-green-600">Published</span>}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveWebsite}
                disabled={saving}
                className="px-4 py-2 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              {!data.published ? (
                <button
                  onClick={publishWebsite}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Publish Website
                </button>
              ) : (
                <a
                  href={`/w/${data.subdomain}`}
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Live
                </a>
              )}
              <button
                onClick={() => router.push('/dashboard')}
                className="text-champagne-600 hover:text-champagne-700"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border shadow-sm mb-6 flex">
          <button
            onClick={() => setTab('content')}
            className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 ${
              tab === 'content' ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-900' : 'text-gray-600'
            }`}
          >
            <Type className="w-5 h-5" />
            Content
          </button>
          <button
            onClick={() => setTab('design')}
            className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 ${
              tab === 'design' ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-900' : 'text-gray-600'
            }`}
          >
            <Palette className="w-5 h-5" />
            Design
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 ${
              tab === 'preview' ? 'bg-champagne-50 border-b-2 border-champagne-600 text-champagne-900' : 'text-gray-600'
            }`}
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>
        </div>

        {/* Content Tab */}
        {tab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section List */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-bold text-lg mb-4">Sections</h3>
              <div className="space-y-2">
                {(data.sections_order || []).map((sectionId, index) => {
                  const section = SECTION_CONFIG[sectionId as keyof typeof SECTION_CONFIG];
                  if (!section) return null;

                  const Icon = section.icon;
                  const enabled = data.sections_enabled?.[sectionId] ?? true;

                  return (
                    <div
                      key={sectionId}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        activeSection === sectionId
                          ? 'border-champagne-600 bg-champagne-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!enabled ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSection(sectionId)}
                          className="flex-shrink-0"
                        >
                          {enabled ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <button
                          onClick={() => setActiveSection(sectionId)}
                          className="flex-1 text-left font-medium text-sm"
                        >
                          {section.label}
                        </button>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveSection(index, 'up')}
                            disabled={index === 0}
                            className="disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveSection(index, 'down')}
                            disabled={index === (data.sections_order?.length || 0) - 1}
                            className="disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section Editor */}
            <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6">
              <SectionEditor
                sectionId={activeSection}
                data={data}
                updateData={updateData}
              />
            </div>
          </div>
        )}

        {/* Design Tab */}
        {tab === 'design' && (
          <div className="bg-white rounded-xl border shadow-sm p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Design & Theme</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Color Scheme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => updateData({ theme_color: theme.id })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        data.theme_color === theme.id
                          ? 'border-champagne-600 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{theme.name}</span>
                        {data.theme_color === theme.id && (
                          <Check className="w-5 h-5 text-champagne-600" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="w-12 h-12 rounded-lg shadow-inner"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-12 h-12 rounded-lg shadow-inner"
                          style={{ backgroundColor: theme.secondary }}
                        />
                        <div
                          className="w-12 h-12 rounded-lg shadow-inner"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {tab === 'preview' && (
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <LivePreview data={data} theme={selectedTheme} />
          </div>
        )}
      </div>
    </div>
  );
}

// Section Editor Component
function SectionEditor({
  sectionId,
  data,
  updateData,
}: {
  sectionId: string;
  data: WeddingWebsite;
  updateData: (updates: Partial<WeddingWebsite>) => void;
}) {
  const section = SECTION_CONFIG[sectionId as keyof typeof SECTION_CONFIG];
  if (!section) return null;

  const Icon = section.icon;

  return (
    <div>
      <div className="flex items-start gap-3 mb-4">
        <Icon className="w-6 h-6 text-champagne-600 mt-1" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">{section.label}</h2>
          <p className="text-gray-600 text-sm">{section.help}</p>
        </div>
      </div>

      <div className="space-y-4">
        {sectionId === 'hero' && <HeroEditor data={data} updateData={updateData} />}
        {sectionId === 'story' && <StoryEditor data={data} updateData={updateData} />}
        {sectionId === 'details' && <DetailsEditor data={data} updateData={updateData} />}
        {sectionId === 'schedule' && <ScheduleEditor data={data} updateData={updateData} />}
        {sectionId === 'party' && <PartyEditor data={data} updateData={updateData} />}
        {sectionId === 'travel' && <TravelEditor data={data} updateData={updateData} />}
        {sectionId === 'registry' && <RegistryEditor data={data} updateData={updateData} />}
        {sectionId === 'rsvp' && <RSVPEditor data={data} updateData={updateData} />}
        {sectionId === 'photos' && <PhotosEditor data={data} updateData={updateData} />}
        {sectionId === 'faq' && <FAQEditor data={data} updateData={updateData} />}
        {sectionId === 'contact' && <ContactEditor data={data} updateData={updateData} />}
      </div>
    </div>
  );
}

// Individual Section Editors
function HeroEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">First Name</label>
        <input
          type="text"
          value={data.couple_name_1 || ''}
          onChange={e => updateData({ couple_name_1: e.target.value })}
          placeholder="Alex"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Second Name</label>
        <input
          type="text"
          value={data.couple_name_2 || ''}
          onChange={e => updateData({ couple_name_2: e.target.value })}
          placeholder="Jordan"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Wedding Date</label>
        <input
          type="date"
          value={data.wedding_date || ''}
          onChange={e => updateData({ wedding_date: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="countdown"
          checked={data.countdown_enabled ?? true}
          onChange={e => updateData({ countdown_enabled: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="countdown" className="text-sm">Show countdown timer</label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Hero Photo URL</label>
        <input
          type="text"
          value={data.hero_photo || ''}
          onChange={e => updateData({ hero_photo: e.target.value })}
          placeholder="https://..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
        <p className="text-xs text-gray-500 mt-1">Upload a beautiful photo of you two</p>
      </div>
    </>
  );
}

function StoryEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">How We Met</label>
        <textarea
          value={data.how_we_met || ''}
          onChange={e => updateData({ how_we_met: e.target.value })}
          rows={4}
          placeholder="Tell the story of how you first met..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">The Proposal</label>
        <textarea
          value={data.proposal_story || ''}
          onChange={e => updateData({ proposal_story: e.target.value })}
          rows={4}
          placeholder="Share the magical proposal story..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Our Story</label>
        <textarea
          value={data.our_story || ''}
          onChange={e => updateData({ our_story: e.target.value })}
          rows={6}
          placeholder="Tell your complete love story..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
    </>
  );
}

function DetailsEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Venue Name</label>
        <input
          type="text"
          value={data.venue_name || ''}
          onChange={e => updateData({ venue_name: e.target.value })}
          placeholder="The Grand Ballroom"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Venue Address</label>
        <textarea
          value={data.venue_address || ''}
          onChange={e => updateData({ venue_address: e.target.value })}
          rows={2}
          placeholder="123 Main St, City, State ZIP"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ceremony Time</label>
          <input
            type="time"
            value={data.ceremony_time || ''}
            onChange={e => updateData({ ceremony_time: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Reception Time</label>
          <input
            type="time"
            value={data.reception_time || ''}
            onChange={e => updateData({ reception_time: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Dress Code</label>
        <select
          value={data.dress_code || ''}
          onChange={e => updateData({ dress_code: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        >
          <option value="">Select dress code</option>
          <option value="Casual">Casual</option>
          <option value="Semi-Formal">Semi-Formal</option>
          <option value="Cocktail">Cocktail Attire</option>
          <option value="Black Tie Optional">Black Tie Optional</option>
          <option value="Black Tie">Black Tie</option>
        </select>
      </div>
    </>
  );
}

function ScheduleEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  const events = data.schedule_events || [];

  function addEvent() {
    updateData({
      schedule_events: [...events, { time: '', event: '', description: '' }],
    });
  }

  function updateEvent(index: number, field: string, value: string) {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ schedule_events: updated });
  }

  function removeEvent(index: number) {
    updateData({
      schedule_events: events.filter((_, i) => i !== index),
    });
  }

  return (
    <>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="time"
                value={event.time || ''}
                onChange={e => updateEvent(index, 'time', e.target.value)}
                placeholder="Time"
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={event.event || ''}
                onChange={e => updateEvent(index, 'event', e.target.value)}
                placeholder="Event name"
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <textarea
              value={event.description || ''}
              onChange={e => updateEvent(index, 'description', e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <button
              onClick={() => removeEvent(index)}
              className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addEvent}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-champagne-400 hover:text-champagne-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Event
      </button>
    </>
  );
}

function PartyEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  const [activeTab, setActiveTab] = useState<'bridesmaids' | 'groomsmen'>('bridesmaids');

  const people = activeTab === 'bridesmaids' ? (data.bridesmaids || []) : (data.groomsmen || []);
  const key = activeTab === 'bridesmaids' ? 'bridesmaids' : 'groomsmen';

  function addPerson() {
    updateData({
      [key]: [...people, { name: '', role: '', bio: '', photo: '' }],
    });
  }

  function updatePerson(index: number, field: string, value: string) {
    const updated = [...people];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ [key]: updated });
  }

  function removePerson(index: number) {
    updateData({
      [key]: people.filter((_, i) => i !== index),
    });
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('bridesmaids')}
          className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'bridesmaids' ? 'bg-champagne-600 text-white' : 'bg-gray-100'}`}
        >
          Bridesmaids
        </button>
        <button
          onClick={() => setActiveTab('groomsmen')}
          className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'groomsmen' ? 'bg-champagne-600 text-white' : 'bg-gray-100'}`}
        >
          Groomsmen
        </button>
      </div>

      <div className="space-y-3">
        {people.map((person, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <input
                type="text"
                value={person.name || ''}
                onChange={e => updatePerson(index, 'name', e.target.value)}
                placeholder="Name"
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="text"
                value={person.role || ''}
                onChange={e => updatePerson(index, 'role', e.target.value)}
                placeholder="Role (e.g., Maid of Honor)"
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <input
              type="text"
              value={person.photo || ''}
              onChange={e => updatePerson(index, 'photo', e.target.value)}
              placeholder="Photo URL"
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <textarea
              value={person.bio || ''}
              onChange={e => updatePerson(index, 'bio', e.target.value)}
              placeholder="Short bio"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <button
              onClick={() => removePerson(index)}
              className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addPerson}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-champagne-400 hover:text-champagne-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add {activeTab === 'bridesmaids' ? 'Bridesmaid' : 'Groomsman'}
      </button>
    </>
  );
}

function TravelEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  const hotels = data.hotel_blocks || [];

  function addHotel() {
    updateData({
      hotel_blocks: [...hotels, { name: '', address: '', phone: '', code: '', link: '' }],
    });
  }

  function updateHotel(index: number, field: string, value: string) {
    const updated = [...hotels];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ hotel_blocks: updated });
  }

  function removeHotel(index: number) {
    updateData({
      hotel_blocks: hotels.filter((_, i) => i !== index),
    });
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Directions to Venue</label>
        <textarea
          value={data.directions || ''}
          onChange={e => updateData({ directions: e.target.value })}
          rows={3}
          placeholder="Provide directions or landmarks..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Parking Information</label>
        <textarea
          value={data.parking_info || ''}
          onChange={e => updateData({ parking_info: e.target.value })}
          rows={2}
          placeholder="Valet available, street parking, etc..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Hotel Blocks</label>
        <div className="space-y-3">
          {hotels.map((hotel, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <input
                type="text"
                value={hotel.name || ''}
                onChange={e => updateHotel(index, 'name', e.target.value)}
                placeholder="Hotel name"
                className="w-full px-3 py-2 border rounded-lg mb-2"
              />
              <input
                type="text"
                value={hotel.address || ''}
                onChange={e => updateHotel(index, 'address', e.target.value)}
                placeholder="Address"
                className="w-full px-3 py-2 border rounded-lg mb-2"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={hotel.phone || ''}
                  onChange={e => updateHotel(index, 'phone', e.target.value)}
                  placeholder="Phone"
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={hotel.code || ''}
                  onChange={e => updateHotel(index, 'code', e.target.value)}
                  placeholder="Booking code"
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <input
                type="text"
                value={hotel.link || ''}
                onChange={e => updateHotel(index, 'link', e.target.value)}
                placeholder="Booking link URL"
                className="w-full px-3 py-2 border rounded-lg mb-2"
              />
              <button
                onClick={() => removeHotel(index)}
                className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addHotel}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-champagne-400 hover:text-champagne-600 flex items-center justify-center gap-2 mt-3"
        >
          <Plus className="w-4 h-4" />
          Add Hotel
        </button>
      </div>
    </>
  );
}

function RegistryEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  const registries = data.registry_links || [];

  function addRegistry() {
    updateData({
      registry_links: [...registries, { name: '', url: '' }],
    });
  }

  function updateRegistry(index: number, field: string, value: string) {
    const updated = [...registries];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ registry_links: updated });
  }

  function removeRegistry(index: number) {
    updateData({
      registry_links: registries.filter((_, i) => i !== index),
    });
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Registry Message</label>
        <textarea
          value={data.registry_message || ''}
          onChange={e => updateData({ registry_message: e.target.value })}
          rows={3}
          placeholder="Your presence is the best present! If you wish to give a gift..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Registry Links</label>
        <div className="space-y-3">
          {registries.map((registry, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <input
                  type="text"
                  value={registry.name || ''}
                  onChange={e => updateRegistry(index, 'name', e.target.value)}
                  placeholder="Store name (e.g., Amazon)"
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={registry.url || ''}
                  onChange={e => updateRegistry(index, 'url', e.target.value)}
                  placeholder="Registry URL"
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={() => removeRegistry(index)}
                className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addRegistry}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-champagne-400 hover:text-champagne-600 flex items-center justify-center gap-2 mt-3"
        >
          <Plus className="w-4 h-4" />
          Add Registry
        </button>
      </div>
    </>
  );
}

function RSVPEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  const mealOptions = data.meal_options || [];

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="rsvp_enabled"
          checked={data.rsvp_enabled ?? true}
          onChange={e => updateData({ rsvp_enabled: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="rsvp_enabled" className="text-sm font-medium">Enable RSVP form</label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">RSVP Deadline</label>
        <input
          type="date"
          value={data.rsvp_deadline || ''}
          onChange={e => updateData({ rsvp_deadline: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Meal Options (one per line)</label>
        <textarea
          value={mealOptions.join('\n')}
          onChange={e => updateData({ meal_options: e.target.value.split('\n').filter(Boolean) })}
          rows={4}
          placeholder="Chicken&#10;Beef&#10;Vegetarian&#10;Vegan"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
    </>
  );
}

function PhotosEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  const [activeTab, setActiveTab] = useState<'engagement' | 'couple'>('engagement');

  const photos = activeTab === 'engagement' ? (data.engagement_photos || []) : (data.photos_json || []);
  const key = activeTab === 'engagement' ? 'engagement_photos' : 'photos_json';

  function addPhoto() {
    updateData({
      [key]: [...photos, { url: '', caption: '' }],
    });
  }

  function updatePhoto(index: number, field: string, value: string) {
    const updated = [...photos];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ [key]: updated });
  }

  function removePhoto(index: number) {
    updateData({
      [key]: photos.filter((_, i) => i !== index),
    });
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('engagement')}
          className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'engagement' ? 'bg-champagne-600 text-white' : 'bg-gray-100'}`}
        >
          Engagement Photos
        </button>
        <button
          onClick={() => setActiveTab('couple')}
          className={`flex-1 py-2 px-4 rounded-lg ${activeTab === 'couple' ? 'bg-champagne-600 text-white' : 'bg-gray-100'}`}
        >
          Couple Photos
        </button>
      </div>

      <div className="space-y-3">
        {photos.map((photo, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50">
            <input
              type="text"
              value={photo.url || ''}
              onChange={e => updatePhoto(index, 'url', e.target.value)}
              placeholder="Photo URL"
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <input
              type="text"
              value={photo.caption || ''}
              onChange={e => updatePhoto(index, 'caption', e.target.value)}
              placeholder="Caption (optional)"
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <button
              onClick={() => removePhoto(index)}
              className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addPhoto}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-champagne-400 hover:text-champagne-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Photo
      </button>
    </>
  );
}

function FAQEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  const faqs = data.faq_json || [];

  function addFAQ() {
    updateData({
      faq_json: [...faqs, { question: '', answer: '' }],
    });
  }

  function updateFAQ(index: number, field: string, value: string) {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ faq_json: updated });
  }

  function removeFAQ(index: number) {
    updateData({
      faq_json: faqs.filter((_, i) => i !== index),
    });
  }

  return (
    <>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50">
            <input
              type="text"
              value={faq.question || ''}
              onChange={e => updateFAQ(index, 'question', e.target.value)}
              placeholder="Question"
              className="w-full px-3 py-2 border rounded-lg mb-2 font-medium"
            />
            <textarea
              value={faq.answer || ''}
              onChange={e => updateFAQ(index, 'answer', e.target.value)}
              placeholder="Answer"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <button
              onClick={() => removeFAQ(index)}
              className="text-red-600 text-sm hover:text-red-700 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addFAQ}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-champagne-400 hover:text-champagne-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add FAQ
      </button>
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <p className="font-medium mb-1">Suggested questions:</p>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>What should I wear?</li>
          <li>Can I bring a plus-one?</li>
          <li>Are children welcome?</li>
          <li>Will there be parking?</li>
          <li>What time should I arrive?</li>
          <li>Is the venue indoors or outdoors?</li>
        </ul>
      </div>
    </>
  );
}

function ContactEditor({ data, updateData }: { data: WeddingWebsite; updateData: (updates: Partial<WeddingWebsite>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Contact Email</label>
        <input
          type="email"
          value={data.contact_email || ''}
          onChange={e => updateData({ contact_email: e.target.value })}
          placeholder="couple@example.com"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Contact Phone</label>
        <input
          type="tel"
          value={data.contact_phone || ''}
          onChange={e => updateData({ contact_phone: e.target.value })}
          placeholder="(555) 123-4567"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Contact Message</label>
        <textarea
          value={data.contact_message || ''}
          onChange={e => updateData({ contact_message: e.target.value })}
          rows={3}
          placeholder="Have questions? We'd love to hear from you!"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-champagne-500"
        />
      </div>
    </>
  );
}

// Live Preview Component
function LivePreview({ data, theme }: { data: WeddingWebsite; theme: typeof THEMES[0] }) {
  const sections = data.sections_order || [];
  const enabled = data.sections_enabled || {};

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Preview</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm border rounded-lg">Desktop</button>
          <button className="px-3 py-1 text-sm border rounded-lg">Mobile</button>
        </div>
      </div>

      <div className="border-4 border-gray-300 rounded-lg overflow-hidden shadow-2xl bg-white">
        <div style={{ backgroundColor: theme.bg }}>
          {sections.map(sectionId => {
            if (!enabled[sectionId]) return null;

            return (
              <div key={sectionId} className="border-b border-gray-200">
                <PreviewSection sectionId={sectionId} data={data} theme={theme} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ sectionId, data, theme }: { sectionId: string; data: WeddingWebsite; theme: typeof THEMES[0] }) {
  if (sectionId === 'hero') {
    return (
      <div
        className="min-h-96 p-12 text-center relative overflow-hidden"
        style={{
          background: data.hero_photo
            ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${data.hero_photo})`
            : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {data.couple_name_1 || 'First'} & {data.couple_name_2 || 'Second'}
          </h1>
          {data.wedding_date && (
            <div className="text-2xl mb-4">
              {new Date(data.wedding_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
          {data.venue_name && <div className="text-xl">{data.venue_name}</div>}
        </div>
      </div>
    );
  }

  if (sectionId === 'story' && (data.how_we_met || data.proposal_story || data.our_story)) {
    return (
      <div className="p-12">
        <h2 className="text-4xl font-bold text-center mb-8" style={{ color: theme.primary }}>
          Our Story
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {data.how_we_met && (
            <div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.accent }}>
                How We Met
              </h3>
              <p className="text-gray-700 leading-relaxed">{data.how_we_met}</p>
            </div>
          )}
          {data.proposal_story && (
            <div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.accent }}>
                The Proposal
              </h3>
              <p className="text-gray-700 leading-relaxed">{data.proposal_story}</p>
            </div>
          )}
          {data.our_story && (
            <div>
              <p className="text-gray-700 leading-relaxed">{data.our_story}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (sectionId === 'details' && (data.venue_name || data.ceremony_time)) {
    return (
      <div className="p-12" style={{ backgroundColor: theme.bg }}>
        <h2 className="text-4xl font-bold text-center mb-8" style={{ color: theme.primary }}>
          Wedding Details
        </h2>
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.ceremony_time && (
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
              <h3 className="font-semibold mb-2">Ceremony</h3>
              <p>{data.ceremony_time}</p>
            </div>
          )}
          {data.reception_time && (
            <div className="text-center p-6 bg-white rounded-lg shadow">
              <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
              <h3 className="font-semibold mb-2">Reception</h3>
              <p>{data.reception_time}</p>
            </div>
          )}
          {data.venue_name && (
            <div className="md:col-span-2 text-center p-6 bg-white rounded-lg shadow">
              <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
              <h3 className="font-semibold mb-2">{data.venue_name}</h3>
              {data.venue_address && <p className="text-gray-600">{data.venue_address}</p>}
            </div>
          )}
          {data.dress_code && (
            <div className="md:col-span-2 text-center p-6 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-2">Dress Code</h3>
              <p>{data.dress_code}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (sectionId === 'rsvp' && data.rsvp_enabled) {
    return (
      <div className="p-12">
        <h2 className="text-4xl font-bold text-center mb-8" style={{ color: theme.primary }}>
          RSVP
        </h2>
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border-2" style={{ borderColor: theme.secondary }}>
          <p className="text-center text-gray-600 mb-4">
            We can't wait to celebrate with you!
            {data.rsvp_deadline && (
              <span className="block mt-2 text-sm">
                Please RSVP by {new Date(data.rsvp_deadline).toLocaleDateString()}
              </span>
            )}
          </p>
          <div className="text-center">
            <button
              className="px-8 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: theme.primary }}
            >
              Submit RSVP
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sectionId === 'registry' && (data.registry_links?.length || 0) > 0) {
    return (
      <div className="p-12" style={{ backgroundColor: theme.bg }}>
        <h2 className="text-4xl font-bold text-center mb-8" style={{ color: theme.primary }}>
          Registry
        </h2>
        {data.registry_message && (
          <p className="text-center text-gray-700 mb-6 max-w-2xl mx-auto">
            {data.registry_message}
          </p>
        )}
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.registry_links?.map((registry, index) => (
            <a
              key={index}
              href={registry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center"
            >
              <Gift className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
              <span className="font-medium">{registry.name}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  // Return minimal placeholder for other sections
  return (
    <div className="p-12 text-center text-gray-400">
      <p>Section: {SECTION_CONFIG[sectionId as keyof typeof SECTION_CONFIG]?.label}</p>
      <p className="text-sm">Add content to see preview</p>
    </div>
  );
}
