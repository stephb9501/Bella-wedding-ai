'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import {
  Mail,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  Share2,
  Heart,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Database,
  AlertCircle,
  CheckCircle,
  FileText,
  Palette,
  Clock,
} from 'lucide-react';

interface Invitation {
  id: string;
  name: string;
  type: 'canva' | 'template' | 'uploaded';
  canvaUrl?: string;
  thumbnailUrl?: string;
  dateCreated: Date;
  dateModified: Date;
  status: 'draft' | 'finalized' | 'sent';
  recipientsSent?: number;
}

interface InvitationTemplate {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  style: string;
  colors: string[];
}

export default function InvitationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [templates, setTemplates] = useState<InvitationTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [canvaUrl, setCanvaUrl] = useState('');
  const [invitationName, setInvitationName] = useState('');
  const [selectedTab, setSelectedTab] = useState<'my-designs' | 'templates'>('my-designs');

  // Storage limits by tier
  const storageLimits = {
    free: 1,
    standard: 3,
    premium: 10,
  };

  const [userTier, setUserTier] = useState<'free' | 'standard' | 'premium'>('standard');
  const storageLimit = storageLimits[userTier];
  const storageUsed = invitations.length;

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadInvitations();
      loadTemplates();
      // Load user tier from subscription
      // For demo, using standard tier
      setUserTier('standard');
    }
  }, [isAuthenticated, user]);

  const loadInvitations = () => {
    // In production, fetch from Supabase
    // For demo, use localStorage
    const stored = localStorage.getItem(`bella_invitations_${user?.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setInvitations(parsed.map((inv: any) => ({
        ...inv,
        dateCreated: new Date(inv.dateCreated),
        dateModified: new Date(inv.dateModified),
      })));
    }
  };

  const loadTemplates = () => {
    // Sample templates
    const sampleTemplates: InvitationTemplate[] = [
      {
        id: 't1',
        name: 'Elegant Garden',
        category: 'Formal',
        thumbnailUrl: '/templates/garden.png',
        style: 'Classic with floral accents',
        colors: ['#F8F4F0', '#E8D5C4', '#7D8471'],
      },
      {
        id: 't2',
        name: 'Modern Minimalist',
        category: 'Contemporary',
        thumbnailUrl: '/templates/modern.png',
        style: 'Clean lines, simple typography',
        colors: ['#FFFFFF', '#000000', '#D4AF37'],
      },
      {
        id: 't3',
        name: 'Rustic Romance',
        category: 'Rustic',
        thumbnailUrl: '/templates/rustic.png',
        style: 'Kraft paper, hand-drawn elements',
        colors: ['#D4A574', '#8B4513', '#FFFFFF'],
      },
      {
        id: 't4',
        name: 'Vintage Lace',
        category: 'Vintage',
        thumbnailUrl: '/templates/vintage.png',
        style: 'Ornate borders, vintage fonts',
        colors: ['#F5E6D3', '#C9A689', '#8B7355'],
      },
      {
        id: 't5',
        name: 'Beach Breeze',
        category: 'Destination',
        thumbnailUrl: '/templates/beach.png',
        style: 'Watercolor waves, coastal theme',
        colors: ['#B8D4E0', '#F4E9D8', '#6B8E9F'],
      },
      {
        id: 't6',
        name: 'Boho Wildflower',
        category: 'Bohemian',
        thumbnailUrl: '/templates/boho.png',
        style: 'Watercolor florals, organic shapes',
        colors: ['#E8C5B5', '#A8906B', '#D4A574'],
      },
      {
        id: 't7',
        name: 'Black Tie Elegance',
        category: 'Formal',
        thumbnailUrl: '/templates/blacktie.png',
        style: 'Formal typography, gold foil accents',
        colors: ['#000000', '#FFFFFF', '#D4AF37'],
      },
      {
        id: 't8',
        name: 'Garden Party',
        category: 'Casual',
        thumbnailUrl: '/templates/gardenparty.png',
        style: 'Bright florals, playful fonts',
        colors: ['#FFE5E5', '#B8E6B8', '#FFD700'],
      },
    ];
    setTemplates(sampleTemplates);
  };

  const saveInvitations = (updated: Invitation[]) => {
    localStorage.setItem(`bella_invitations_${user?.id}`, JSON.stringify(updated));
    setInvitations(updated);
  };

  const handleAddCanvaDesign = () => {
    if (!canvaUrl || !invitationName) {
      alert('Please provide both a name and Canva URL');
      return;
    }

    if (storageUsed >= storageLimit) {
      alert(`You've reached your storage limit (${storageLimit} invitations). Delete an existing invitation or upgrade your plan.`);
      return;
    }

    // Validate Canva URL
    if (!canvaUrl.includes('canva.com')) {
      alert('Please enter a valid Canva design URL');
      return;
    }

    const newInvitation: Invitation = {
      id: Date.now().toString(),
      name: invitationName,
      type: 'canva',
      canvaUrl: canvaUrl,
      dateCreated: new Date(),
      dateModified: new Date(),
      status: 'draft',
    };

    saveInvitations([...invitations, newInvitation]);
    setCanvaUrl('');
    setInvitationName('');
    setShowAddModal(false);
  };

  const handleUseTemplate = (templateId: string) => {
    if (storageUsed >= storageLimit) {
      alert(`You've reached your storage limit (${storageLimit} invitations). Delete an existing invitation or upgrade your plan.`);
      return;
    }

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const newInvitation: Invitation = {
      id: Date.now().toString(),
      name: `${template.name} Invitation`,
      type: 'template',
      thumbnailUrl: template.thumbnailUrl,
      dateCreated: new Date(),
      dateModified: new Date(),
      status: 'draft',
    };

    saveInvitations([...invitations, newInvitation]);
    setShowTemplateLibrary(false);
  };

  const handleDeleteInvitation = (id: string) => {
    if (confirm('Are you sure you want to delete this invitation?')) {
      saveInvitations(invitations.filter((inv) => inv.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'draft') return 'bg-gray-100 text-gray-700';
    if (status === 'finalized') return 'bg-green-100 text-green-700';
    if (status === 'sent') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStorageColor = () => {
    const percentage = (storageUsed / storageLimit) * 100;
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 70) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Wedding Invitations"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Mail className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Design Beautiful Invitations</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Create stunning wedding invitations with our templates or import your Canva designs.
              </p>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Mail className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-serif text-champagne-900 font-bold">Wedding Invitations</h1>
                <p className="text-champagne-600 mt-1">Design, manage, and send your invitations</p>
              </div>
            </div>

            {/* Storage Indicator */}
            <div className="bg-champagne-50 rounded-xl p-4 border-2 border-champagne-200">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-champagne-600" />
                <div>
                  <div className="text-sm text-champagne-600">Storage Used</div>
                  <div className="font-bold text-champagne-900">
                    {storageUsed} / {storageLimit} invitations
                  </div>
                </div>
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStorageColor()} transition-all`}
                  style={{ width: `${(storageUsed / storageLimit) * 100}%` }}
                />
              </div>
              {storageUsed >= storageLimit && (
                <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Storage full
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={storageUsed >= storageLimit}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LinkIcon className="w-5 h-5" />
              Link Canva Design
            </button>
            <button
              onClick={() => setShowTemplateLibrary(true)}
              disabled={storageUsed >= storageLimit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Palette className="w-5 h-5" />
              Use Template
            </button>
            {storageUsed >= storageLimit && (
              <button
                onClick={() => router.push('/pricing')}
                className="ml-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-medium flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Upgrade for More Storage
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Canva Integration Info */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <LinkIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">How to Link Your Canva Design</h2>
              <div className="space-y-2 text-purple-100">
                <p className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Create your invitation design in Canva</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Click "Share" and set to "Anyone with the link can view"</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Copy the share link and paste it here</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>Your design will be saved and you can access it anytime!</span>
                </p>
              </div>
              <a
                href="https://www.canva.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Open Canva
              </a>
            </div>
          </div>
        </div>

        {/* My Invitations */}
        {invitations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Mail className="w-16 h-16 text-champagne-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-champagne-900 mb-2">No invitations yet</h3>
            <p className="text-champagne-600 mb-6">
              Get started by linking a Canva design or choosing a template
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Link Canva Design
              </button>
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Browse Templates
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300 overflow-hidden"
              >
                {/* Invitation Preview */}
                <div className="h-64 bg-gradient-to-br from-champagne-100 to-purple-100 flex items-center justify-center relative">
                  {invitation.type === 'canva' ? (
                    <div className="text-center p-6">
                      <LinkIcon className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                      <p className="text-sm text-champagne-600">Canva Design</p>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <FileText className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                      <p className="text-sm text-champagne-600">Template Design</p>
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(invitation.status)}`}>
                    {invitation.status.toUpperCase()}
                  </div>
                </div>

                {/* Invitation Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-champagne-900 mb-2">{invitation.name}</h3>
                  <div className="space-y-2 text-sm text-champagne-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Created {invitation.dateCreated.toLocaleDateString()}
                    </div>
                    {invitation.type === 'canva' && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Linked from Canva
                      </div>
                    )}
                    {invitation.recipientsSent && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Sent to {invitation.recipientsSent} guests
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {invitation.type === 'canva' && invitation.canvaUrl && (
                      <a
                        href={invitation.canvaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in Canva
                      </a>
                    )}
                    {invitation.type === 'template' && (
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                        Edit Design
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Canva Design Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Link Canva Design</h2>
                  <p className="text-purple-100 text-sm">Import your Canva invitation design</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-champagne-900 mb-2">
                  Invitation Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Save the Date, Main Invitation, RSVP Card"
                  value={invitationName}
                  onChange={(e) => setInvitationName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-champagne-900 mb-2">
                  Canva Design URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.canva.com/design/..."
                  value={canvaUrl}
                  onChange={(e) => setCanvaUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                />
                <p className="text-xs text-champagne-600 mt-1">
                  Paste the share link from your Canva design
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Note:</strong> Make sure your Canva design is set to "Anyone with the link can view" so we can access it.
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg hover:bg-champagne-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCanvaDesign}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Link Design
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Invitation Templates</h2>
                  <p className="text-blue-100 text-sm">Choose a template to customize</p>
                </div>
                <button
                  onClick={() => setShowTemplateLibrary(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300 overflow-hidden cursor-pointer group"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <div className="h-48 bg-gradient-to-br from-champagne-100 to-blue-100 flex items-center justify-center">
                      <div className="text-center p-4">
                        <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs text-champagne-600">{template.category}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-champagne-900 mb-2">{template.name}</h3>
                      <p className="text-xs text-champagne-600 mb-3">{template.style}</p>
                      <div className="flex gap-1 mb-3">
                        {template.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition text-sm font-medium">
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
