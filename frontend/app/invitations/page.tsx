'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Download, Save, Heart, Calendar, MapPin,
  Palette, Type, Image as ImageIcon, Send, ChevronLeft,
  Mail, Copy, CheckCircle, Wand2
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';

// Template designs
const TEMPLATES = [
  {
    id: 'elegant',
    name: 'Elegant',
    colors: { primary: '#F4E4D7', secondary: '#C9A07B', text: '#4A4A4A' },
    font: 'Playfair Display, serif',
  },
  {
    id: 'modern',
    name: 'Modern',
    colors: { primary: '#E8D5C4', secondary: '#A67F5D', text: '#2C2C2C' },
    font: 'Montserrat, sans-serif',
  },
  {
    id: 'rustic',
    name: 'Rustic',
    colors: { primary: '#F5E6D3', secondary: '#8B7355', text: '#5D4E37' },
    font: 'Georgia, serif',
  },
  {
    id: 'floral',
    name: 'Floral',
    colors: { primary: '#FFF0F5', secondary: '#DDA0B3', text: '#4A4A4A' },
    font: 'Lora, serif',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    colors: { primary: '#FFFFFF', secondary: '#C7A17A', text: '#000000' },
    font: 'Helvetica, sans-serif',
  },
];

interface InvitationData {
  coupleName1: string;
  coupleName2: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  customMessage: string;
  rsvpLink: string;
}

export default function InvitationsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // UI State
  const [activeTab, setActiveTab] = useState<'canva' | 'builtin'>('canva');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Invitation Data
  const [invitationData, setInvitationData] = useState<InvitationData>({
    coupleName1: '',
    coupleName2: '',
    weddingDate: '',
    weddingTime: '',
    venueName: '',
    venueAddress: '',
    customMessage: 'Together with our families, we invite you to celebrate our wedding',
    rsvpLink: '',
  });

  // Canva Integration
  const [canvaDesignUrl, setCanvaDesignUrl] = useState('');

  useEffect(() => {
    // Load user data
    const loadUserData = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/users?email=${user.email}`);
        if (response.ok) {
          const userData = await response.json();
          setInvitationData(prev => ({
            ...prev,
            coupleName1: userData.full_name || '',
            coupleName2: userData.partner_name || '',
            weddingDate: userData.wedding_date || '',
            venueName: userData.wedding_location || '',
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  // Open Canva Design Button
  const openCanvaDesigner = () => {
    // Canva Design Button integration
    // In production, you would initialize the Canva SDK
    // For now, we'll simulate with a placeholder
    const canvaUrl = `https://www.canva.com/design/create?type=invitation&search=wedding`;
    window.open(canvaUrl, '_blank');
  };

  // Generate preview on canvas
  useEffect(() => {
    if (activeTab !== 'builtin' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 800;

    // Clear canvas
    ctx.fillStyle = selectedTemplate.colors.primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = selectedTemplate.colors.secondary;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Set text styles
    ctx.fillStyle = selectedTemplate.colors.text;
    ctx.textAlign = 'center';

    // Draw decorative elements
    ctx.fillStyle = selectedTemplate.colors.secondary;
    ctx.font = '60px serif';
    ctx.fillText('♥', canvas.width / 2, 100);

    // Draw invitation text
    ctx.fillStyle = selectedTemplate.colors.text;
    ctx.font = `24px ${selectedTemplate.font}`;
    ctx.fillText(invitationData.customMessage, canvas.width / 2, 180);

    // Draw couple names
    ctx.font = `bold 40px ${selectedTemplate.font}`;
    ctx.fillText(invitationData.coupleName1, canvas.width / 2, 280);

    ctx.font = '30px serif';
    ctx.fillText('&', canvas.width / 2, 330);

    ctx.font = `bold 40px ${selectedTemplate.font}`;
    ctx.fillText(invitationData.coupleName2, canvas.width / 2, 380);

    // Draw wedding details
    ctx.font = `20px ${selectedTemplate.font}`;
    if (invitationData.weddingDate) {
      const formattedDate = new Date(invitationData.weddingDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      ctx.fillText(formattedDate, canvas.width / 2, 460);
    }

    if (invitationData.weddingTime) {
      ctx.fillText(invitationData.weddingTime, canvas.width / 2, 490);
    }

    if (invitationData.venueName) {
      ctx.font = `italic 22px ${selectedTemplate.font}`;
      ctx.fillText(invitationData.venueName, canvas.width / 2, 550);
    }

    if (invitationData.venueAddress) {
      ctx.font = `18px ${selectedTemplate.font}`;
      ctx.fillText(invitationData.venueAddress, canvas.width / 2, 580);
    }

    // Draw RSVP info
    ctx.font = `16px ${selectedTemplate.font}`;
    ctx.fillText('Please RSVP at:', canvas.width / 2, 680);
    ctx.fillText(invitationData.rsvpLink || 'yourdomain.com/rsvp', canvas.width / 2, 710);

  }, [invitationData, selectedTemplate, activeTab]);

  // Download invitation as image
  const downloadInvitation = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = 'wedding-invitation.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Save invitation to database
  const saveInvitation = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch('/api/users?email=' + user.email);
      const userData = await response.json();

      const invitationPayload = {
        user_id: userData.id,
        design_type: activeTab,
        canva_design_url: activeTab === 'canva' ? canvaDesignUrl : null,
        template_name: activeTab === 'builtin' ? selectedTemplate.name : null,
        couple_name_1: invitationData.coupleName1,
        couple_name_2: invitationData.coupleName2,
        wedding_date: invitationData.weddingDate,
        wedding_time: invitationData.weddingTime,
        venue_name: invitationData.venueName,
        venue_address: invitationData.venueAddress,
        custom_message: invitationData.customMessage,
        color_scheme: selectedTemplate.id,
        font_style: selectedTemplate.font,
      };

      const saveResponse = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitationPayload),
      });

      if (saveResponse.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving invitation:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWall featureName="Invitations Designer" fullLock={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-serif font-bold text-gray-900">
                    Invitation Designer
                  </h1>
                  <p className="text-sm text-gray-600">Create beautiful wedding invitations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/invitations/text-rsvp')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="w-4 h-4" />
                Text RSVP
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Design Method Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-champagne-100 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('canva')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'canva'
                  ? 'bg-champagne-50 text-champagne-700 border-b-2 border-champagne-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Canva Designer</span>
                <span className="text-xs bg-champagne-600 text-white px-2 py-1 rounded">Premium</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('builtin')}
              className={`flex-1 px-6 py-4 font-medium transition ${
                activeTab === 'builtin'
                  ? 'bg-champagne-50 text-champagne-700 border-b-2 border-champagne-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wand2 className="w-5 h-5" />
                <span>Quick Designer</span>
              </div>
            </button>
          </div>

          <div className="p-8">
            {/* Canva Tab */}
            {activeTab === 'canva' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    Design with Canva
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Access thousands of professional wedding invitation templates
                  </p>

                  <button
                    onClick={openCanvaDesigner}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium text-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Open Canva Designer
                  </button>
                </div>

                <div className="bg-champagne-50 rounded-lg p-6 mt-8">
                  <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
                  <ol className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="bg-champagne-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                      <span>Click &quot;Open Canva Designer&quot; to access their professional editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-champagne-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                      <span>Choose from thousands of wedding invitation templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-champagne-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                      <span>Customize with your details, colors, and photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-champagne-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                      <span>Download or share your design</span>
                    </li>
                  </ol>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your Canva design URL (optional)
                  </label>
                  <input
                    type="url"
                    value={canvaDesignUrl}
                    onChange={(e) => setCanvaDesignUrl(e.target.value)}
                    placeholder="https://www.canva.com/design/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Built-in Designer Tab */}
            {activeTab === 'builtin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Form */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Choose Template
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={`p-4 rounded-lg border-2 transition ${
                            selectedTemplate.id === template.id
                              ? 'border-champagne-600 bg-champagne-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="w-full h-12 rounded mb-2"
                            style={{ backgroundColor: template.colors.secondary }}
                          />
                          <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner 1 Name
                      </label>
                      <input
                        type="text"
                        value={invitationData.coupleName1}
                        onChange={(e) =>
                          setInvitationData({ ...invitationData, coupleName1: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partner 2 Name
                      </label>
                      <input
                        type="text"
                        value={invitationData.coupleName2}
                        onChange={(e) =>
                          setInvitationData({ ...invitationData, coupleName2: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wedding Date
                      </label>
                      <input
                        type="date"
                        value={invitationData.weddingDate}
                        onChange={(e) =>
                          setInvitationData({ ...invitationData, weddingDate: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wedding Time
                      </label>
                      <input
                        type="time"
                        value={invitationData.weddingTime}
                        onChange={(e) =>
                          setInvitationData({ ...invitationData, weddingTime: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={invitationData.venueName}
                      onChange={(e) =>
                        setInvitationData({ ...invitationData, venueName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Address
                    </label>
                    <input
                      type="text"
                      value={invitationData.venueAddress}
                      onChange={(e) =>
                        setInvitationData({ ...invitationData, venueAddress: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Message
                    </label>
                    <textarea
                      value={invitationData.customMessage}
                      onChange={(e) =>
                        setInvitationData({ ...invitationData, customMessage: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RSVP Link
                    </label>
                    <input
                      type="text"
                      value={invitationData.rsvpLink}
                      onChange={(e) =>
                        setInvitationData({ ...invitationData, rsvpLink: e.target.value })
                      }
                      placeholder="yourdomain.com/rsvp"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <canvas
                      ref={canvasRef}
                      className="w-full rounded-lg shadow-inner"
                      style={{ maxHeight: '600px', objectFit: 'contain' }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={downloadInvitation}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button
                      onClick={saveInvitation}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium disabled:opacity-50"
                    >
                      {saved ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          {saving ? 'Saving...' : 'Save'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
