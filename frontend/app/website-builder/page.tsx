'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import {
  Heart, Globe, Eye, Save, Share2, Lock, Palette, Type, Image as ImageIcon,
  MapPin, Calendar, Users, Gift, Plane, MessageCircle, CheckCircle, Sparkles
} from 'lucide-react';

interface WebsiteData {
  template: string;
  published: boolean;
  customDomain?: string;
  sections: {
    hero: {
      enabled: boolean;
      partnerOneName: string;
      partnerTwoName: string;
      weddingDate: string;
      backgroundImage?: string;
    };
    ourStory: {
      enabled: boolean;
      content: string;
    };
    details: {
      enabled: boolean;
      ceremonyTime: string;
      ceremonyLocation: string;
      receptionTime: string;
      receptionLocation: string;
    };
    gallery: {
      enabled: boolean;
      images: string[];
    };
    rsvp: {
      enabled: boolean;
    };
    registry: {
      enabled: boolean;
      registries: Array<{ name: string; url: string }>;
    };
    travel: {
      enabled: boolean;
      hotels: string;
      transportation: string;
    };
    faq: {
      enabled: boolean;
      questions: Array<{ question: string; answer: string }>;
    };
  };
  theme: {
    primaryColor: string;
    fontFamily: string;
  };
}

export default function WebsiteBuilderPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [userTier, setUserTier] = useState<'free' | 'standard' | 'premium'>('premium'); // Mock as premium for demo
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [currentSection, setCurrentSection] = useState<string>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [websiteData, setWebsiteData] = useState<WebsiteData>({
    template: 'elegant',
    published: false,
    sections: {
      hero: {
        enabled: true,
        partnerOneName: 'Sarah',
        partnerTwoName: 'Michael',
        weddingDate: '2025-06-15'
      },
      ourStory: {
        enabled: true,
        content: 'We met in college and have been inseparable ever since...'
      },
      details: {
        enabled: true,
        ceremonyTime: '4:00 PM',
        ceremonyLocation: 'St. Mary\'s Church, 123 Main St',
        receptionTime: '6:00 PM',
        receptionLocation: 'Grand Ballroom, Hilton Hotel'
      },
      gallery: {
        enabled: true,
        images: []
      },
      rsvp: {
        enabled: true
      },
      registry: {
        enabled: true,
        registries: [
          { name: 'Amazon', url: 'https://amazon.com/registry' },
          { name: 'Target', url: 'https://target.com/registry' }
        ]
      },
      travel: {
        enabled: true,
        hotels: 'Hilton Hotel - Book by May 1st for group rate',
        transportation: 'Shuttle service provided from hotel to venue'
      },
      faq: {
        enabled: true,
        questions: [
          { question: 'What is the dress code?', answer: 'Semi-formal attire' },
          { question: 'Are children welcome?', answer: 'Adult-only celebration' }
        ]
      }
    },
    theme: {
      primaryColor: '#D4A574',
      fontFamily: 'serif'
    }
  });

  const templates = [
    { id: 'elegant', name: 'Elegant Romance', preview: '🌹', description: 'Classic and timeless' },
    { id: 'modern', name: 'Modern Minimalist', preview: '✨', description: 'Clean and contemporary' },
    { id: 'rustic', name: 'Rustic Charm', preview: '🌾', description: 'Warm and inviting' },
    { id: 'boho', name: 'Boho Chic', preview: '🌿', description: 'Free-spirited and artistic' },
    { id: 'glamorous', name: 'Glamorous', preview: '💎', description: 'Luxurious and sophisticated' }
  ];

  const sections = [
    { id: 'hero', name: 'Header', icon: Heart, required: true },
    { id: 'ourStory', name: 'Our Story', icon: MessageCircle },
    { id: 'details', name: 'Wedding Details', icon: Calendar },
    { id: 'gallery', name: 'Photo Gallery', icon: ImageIcon },
    { id: 'rsvp', name: 'RSVP', icon: CheckCircle, premium: true },
    { id: 'registry', name: 'Registry', icon: Gift },
    { id: 'travel', name: 'Travel & Hotels', icon: Plane },
    { id: 'faq', name: 'Q&A', icon: MessageCircle }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // In real app, save to API
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem(`bella_website_${user?.id}`, JSON.stringify(websiteData));
    setIsSaving(false);
    alert('✅ Website saved!');
  };

  const handlePublish = async () => {
    await handleSave();
    setWebsiteData(prev => ({ ...prev, published: !prev.published }));
    alert(`✅ Website ${!websiteData.published ? 'published' : 'unpublished'}!`);
  };

  const updateSection = (section: string, field: string, value: any) => {
    setWebsiteData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section as keyof typeof prev.sections],
          [field]: value
        }
      }
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Wedding Website Builder"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Globe className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Create Your Wedding Website</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Build a beautiful website for your big day. Share details, collect RSVPs, and keep guests informed.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Palette className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Beautiful Templates</h3>
                <p className="text-sm text-champagne-600">Choose from 5 professional designs</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">RSVP Management</h3>
                <p className="text-sm text-champagne-600">Collect and track guest responses</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Globe className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Custom Domain</h3>
                <p className="text-sm text-champagne-600">Use your own domain name</p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  // Check Premium access
  if (userTier !== 'premium') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-serif text-champagne-900 mb-4">Premium Feature</h1>
          <p className="text-champagne-700 mb-6">
            The Wedding Website Builder is available exclusively for Premium subscribers.
          </p>
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-serif text-champagne-900 mb-4">Premium Includes:</h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Beautiful wedding website templates</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">RSVP collection and management</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Custom domain support</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Photo gallery, registry links & more</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-champagne-700">Plus all Standard features + unlimited everything</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Upgrade to Premium - $39.99/mo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-champagne-600" />
              <div>
                <h1 className="text-2xl font-serif text-champagne-900">Wedding Website Builder</h1>
                <p className="text-sm text-champagne-600">
                  {websiteData.published ? (
                    <span className="text-green-600 font-medium">● Published</span>
                  ) : (
                    <span className="text-gray-500">○ Draft</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-champagne-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'preview'
                    ? 'bg-champagne-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handlePublish}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  websiteData.published
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Share2 className="w-4 h-4" />
                {websiteData.published ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Sections */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <h3 className="font-semibold text-champagne-900 mb-4">Website Sections</h3>
                <div className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isEnabled = websiteData.sections[section.id as keyof typeof websiteData.sections]?.enabled;
                    const isPremium = section.premium;

                    return (
                      <button
                        key={section.id}
                        onClick={() => setCurrentSection(section.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          currentSection === section.id
                            ? 'bg-champagne-100 border-2 border-champagne-600'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${currentSection === section.id ? 'text-champagne-600' : 'text-gray-600'}`} />
                          <span className={`text-sm font-medium ${currentSection === section.id ? 'text-champagne-900' : 'text-gray-700'}`}>
                            {section.name}
                          </span>
                        </div>
                        {isPremium && <Sparkles className="w-4 h-4 text-purple-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Template Selector */}
                <div className="mt-8">
                  <h3 className="font-semibold text-champagne-900 mb-4">Template</h3>
                  <select
                    value={websiteData.template}
                    onChange={(e) => setWebsiteData(prev => ({ ...prev, template: e.target.value }))}
                    className="w-full px-3 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 text-sm"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.preview} {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Hero Section Editor */}
                {currentSection === 'hero' && (
                  <div>
                    <h2 className="text-2xl font-serif text-champagne-900 mb-6">Header Section</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-champagne-900 mb-2">Partner One Name</label>
                          <input
                            type="text"
                            value={websiteData.sections.hero.partnerOneName}
                            onChange={(e) => updateSection('hero', 'partnerOneName', e.target.value)}
                            className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-champagne-900 mb-2">Partner Two Name</label>
                          <input
                            type="text"
                            value={websiteData.sections.hero.partnerTwoName}
                            onChange={(e) => updateSection('hero', 'partnerTwoName', e.target.value)}
                            className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-champagne-900 mb-2">Wedding Date</label>
                        <input
                          type="date"
                          value={websiteData.sections.hero.weddingDate}
                          onChange={(e) => updateSection('hero', 'weddingDate', e.target.value)}
                          className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Our Story Editor */}
                {currentSection === 'ourStory' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-champagne-900">Our Story</h2>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={websiteData.sections.ourStory.enabled}
                          onChange={(e) => updateSection('ourStory', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-champagne-700">Show on website</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-champagne-900 mb-2">Your Love Story</label>
                      <textarea
                        value={websiteData.sections.ourStory.content}
                        onChange={(e) => updateSection('ourStory', 'content', e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                        placeholder="Share how you met, your journey together, and what makes your love special..."
                      />
                    </div>
                  </div>
                )}

                {/* Wedding Details Editor */}
                {currentSection === 'details' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-champagne-900">Wedding Details</h2>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={websiteData.sections.details.enabled}
                          onChange={(e) => updateSection('details', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-champagne-700">Show on website</span>
                      </label>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-champagne-900 mb-3">Ceremony</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Time</label>
                            <input
                              type="text"
                              value={websiteData.sections.details.ceremonyTime}
                              onChange={(e) => updateSection('details', 'ceremonyTime', e.target.value)}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                              placeholder="4:00 PM"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Location</label>
                            <input
                              type="text"
                              value={websiteData.sections.details.ceremonyLocation}
                              onChange={(e) => updateSection('details', 'ceremonyLocation', e.target.value)}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                              placeholder="St. Mary's Church, 123 Main St"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-champagne-900 mb-3">Reception</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Time</label>
                            <input
                              type="text"
                              value={websiteData.sections.details.receptionTime}
                              onChange={(e) => updateSection('details', 'receptionTime', e.target.value)}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                              placeholder="6:00 PM"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Location</label>
                            <input
                              type="text"
                              value={websiteData.sections.details.receptionLocation}
                              onChange={(e) => updateSection('details', 'receptionLocation', e.target.value)}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                              placeholder="Grand Ballroom, Hilton Hotel"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* RSVP Section */}
                {currentSection === 'rsvp' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-serif text-champagne-900">RSVP</h2>
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={websiteData.sections.rsvp.enabled}
                          onChange={(e) => updateSection('rsvp', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-champagne-700">Show on website</span>
                      </label>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <CheckCircle className="w-12 h-12 text-purple-600 mb-4" />
                      <h3 className="font-semibold text-purple-900 mb-2">RSVP Form Active</h3>
                      <p className="text-sm text-purple-700 mb-4">
                        Guests can RSVP directly on your website. Responses are automatically tracked in your dashboard.
                      </p>
                      <p className="text-xs text-purple-600">
                        RSVP tracking and management features coming soon!
                      </p>
                    </div>
                  </div>
                )}

                {/* Registry Section */}
                {currentSection === 'registry' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-champagne-900">Gift Registry</h2>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={websiteData.sections.registry.enabled}
                          onChange={(e) => updateSection('registry', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-champagne-700">Show on website</span>
                      </label>
                    </div>
                    <div className="space-y-4">
                      {websiteData.sections.registry.registries.map((registry, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Store Name</label>
                            <input
                              type="text"
                              value={registry.name}
                              onChange={(e) => {
                                const newRegistries = [...websiteData.sections.registry.registries];
                                newRegistries[idx].name = e.target.value;
                                updateSection('registry', 'registries', newRegistries);
                              }}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Registry URL</label>
                            <input
                              type="text"
                              value={registry.url}
                              onChange={(e) => {
                                const newRegistries = [...websiteData.sections.registry.registries];
                                newRegistries[idx].url = e.target.value;
                                updateSection('registry', 'registries', newRegistries);
                              }}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newRegistries = [...websiteData.sections.registry.registries, { name: '', url: '' }];
                          updateSection('registry', 'registries', newRegistries);
                        }}
                        className="px-4 py-2 bg-champagne-100 text-champagne-700 rounded-lg hover:bg-champagne-200 transition-colors text-sm font-medium"
                      >
                        + Add Registry
                      </button>
                    </div>
                  </div>
                )}

                {/* Travel Section */}
                {currentSection === 'travel' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-champagne-900">Travel & Accommodations</h2>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={websiteData.sections.travel.enabled}
                          onChange={(e) => updateSection('travel', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-champagne-700">Show on website</span>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-champagne-900 mb-2">Hotel Information</label>
                        <textarea
                          value={websiteData.sections.travel.hotels}
                          onChange={(e) => updateSection('travel', 'hotels', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                          placeholder="List recommended hotels with booking codes..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-champagne-900 mb-2">Transportation</label>
                        <textarea
                          value={websiteData.sections.travel.transportation}
                          onChange={(e) => updateSection('travel', 'transportation', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                          placeholder="Shuttle services, parking info, airport details..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                {currentSection === 'faq' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-champagne-900">Q&A / FAQ</h2>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={websiteData.sections.faq.enabled}
                          onChange={(e) => updateSection('faq', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-champagne-700">Show on website</span>
                      </label>
                    </div>
                    <div className="space-y-4">
                      {websiteData.sections.faq.questions.map((q, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Question</label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => {
                                const newQuestions = [...websiteData.sections.faq.questions];
                                newQuestions[idx].question = e.target.value;
                                updateSection('faq', 'questions', newQuestions);
                              }}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-champagne-900 mb-2">Answer</label>
                            <textarea
                              value={q.answer}
                              onChange={(e) => {
                                const newQuestions = [...websiteData.sections.faq.questions];
                                newQuestions[idx].answer = e.target.value;
                                updateSection('faq', 'questions', newQuestions);
                              }}
                              rows={2}
                              className="w-full px-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newQuestions = [...websiteData.sections.faq.questions, { question: '', answer: '' }];
                          updateSection('faq', 'questions', newQuestions);
                        }}
                        className="px-4 py-2 bg-champagne-100 text-champagne-700 rounded-lg hover:bg-champagne-200 transition-colors text-sm font-medium"
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>
                )}

                {/* Gallery Section */}
                {currentSection === 'gallery' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif text-champagne-900">Photo Gallery</h2>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={websiteData.sections.gallery.enabled}
                          onChange={(e) => updateSection('gallery', 'enabled', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-champagne-700">Show on website</span>
                      </label>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <ImageIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-blue-900 mb-2">Photo Upload Coming Soon</h3>
                      <p className="text-sm text-blue-700">
                        Upload engagement photos and couple photos to create a beautiful gallery on your website.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="py-8">
          <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
            {/* Preview Hero */}
            <div
              className="relative h-96 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${websiteData.theme.primaryColor}40, #f8f4f0)`
              }}
            >
              <div className="text-center z-10">
                <h1 className={`text-6xl mb-4 ${websiteData.theme.fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`} style={{ color: websiteData.theme.primaryColor }}>
                  {websiteData.sections.hero.partnerOneName} & {websiteData.sections.hero.partnerTwoName}
                </h1>
                <p className="text-2xl text-champagne-700">
                  {new Date(websiteData.sections.hero.weddingDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <Heart className="w-12 h-12 text-champagne-600 mx-auto mt-6" />
              </div>
            </div>

            {/* Preview Our Story */}
            {websiteData.sections.ourStory.enabled && (
              <div className="px-12 py-16 bg-white">
                <h2 className="text-4xl font-serif text-center text-champagne-900 mb-8">Our Story</h2>
                <p className="text-champagne-700 leading-relaxed max-w-2xl mx-auto text-center">
                  {websiteData.sections.ourStory.content}
                </p>
              </div>
            )}

            {/* Preview Wedding Details */}
            {websiteData.sections.details.enabled && (
              <div className="px-12 py-16 bg-champagne-50">
                <h2 className="text-4xl font-serif text-center text-champagne-900 mb-12">Wedding Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-champagne-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif text-champagne-900 mb-2">Ceremony</h3>
                    <p className="text-champagne-700 mb-1">{websiteData.sections.details.ceremonyTime}</p>
                    <p className="text-champagne-600 text-sm">{websiteData.sections.details.ceremonyLocation}</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-12 h-12 text-champagne-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-serif text-champagne-900 mb-2">Reception</h3>
                    <p className="text-champagne-700 mb-1">{websiteData.sections.details.receptionTime}</p>
                    <p className="text-champagne-600 text-sm">{websiteData.sections.details.receptionLocation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview RSVP */}
            {websiteData.sections.rsvp.enabled && (
              <div className="px-12 py-16 bg-white">
                <h2 className="text-4xl font-serif text-center text-champagne-900 mb-8">RSVP</h2>
                <div className="max-w-md mx-auto bg-champagne-50 rounded-lg p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-champagne-700 mb-4">Please RSVP by May 1st, 2025</p>
                  <button className="px-8 py-3 bg-champagne-600 text-white rounded-lg font-semibold hover:bg-champagne-700">
                    RSVP Now
                  </button>
                </div>
              </div>
            )}

            {/* Preview Registry */}
            {websiteData.sections.registry.enabled && websiteData.sections.registry.registries.length > 0 && (
              <div className="px-12 py-16 bg-champagne-50">
                <h2 className="text-4xl font-serif text-center text-champagne-900 mb-8">Gift Registry</h2>
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                  {websiteData.sections.registry.registries.map((registry, idx) => (
                    <a
                      key={idx}
                      href={registry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-white border-2 border-champagne-300 rounded-lg hover:border-champagne-600 transition-colors"
                    >
                      <Gift className="w-6 h-6 text-champagne-600 mx-auto mb-2" />
                      <span className="font-semibold text-champagne-900">{registry.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Preview FAQ */}
            {websiteData.sections.faq.enabled && websiteData.sections.faq.questions.length > 0 && (
              <div className="px-12 py-16 bg-white">
                <h2 className="text-4xl font-serif text-center text-champagne-900 mb-12">Frequently Asked Questions</h2>
                <div className="max-w-2xl mx-auto space-y-6">
                  {websiteData.sections.faq.questions.map((q, idx) => (
                    <div key={idx} className="bg-champagne-50 rounded-lg p-6">
                      <h3 className="font-semibold text-champagne-900 mb-2">{q.question}</h3>
                      <p className="text-champagne-700">{q.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
