'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  Package,
  FileText,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Info,
  Settings,
  Bell,
  Calendar,
} from 'lucide-react';

interface Update {
  id: string;
  version: string;
  releaseDate: Date;
  type: 'major' | 'minor' | 'patch' | 'security';
  status: 'available' | 'installing' | 'installed' | 'failed';
  title: string;
  description: string;
  features: string[];
  bugFixes: string[];
  securityFixes: string[];
  size: string;
  estimatedTime: string;
  requiresDowntime: boolean;
}

interface UpdateHistory {
  id: string;
  version: string;
  installedDate: Date;
  installedBy: string;
  status: 'success' | 'failed' | 'rolled_back';
  notes?: string;
}

export default function UpdatesPage() {
  const router = useRouter();
  const [currentVersion, setCurrentVersion] = useState('2.1.5');
  const [availableUpdates, setAvailableUpdates] = useState<Update[]>([]);
  const [updateHistory, setUpdateHistory] = useState<UpdateHistory[]>([]);
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [updatesCheckedAt, setUpdatesCheckedAt] = useState<Date>(new Date());

  useEffect(() => {
    loadUpdates();
    loadUpdateHistory();
    loadSettings();
  }, []);

  const loadUpdates = () => {
    // In production, fetch from update server
    // For demo, use sample data
    const sampleUpdates: Update[] = [
      {
        id: 'update-3',
        version: '2.2.0',
        releaseDate: new Date('2025-01-20'),
        type: 'minor',
        status: 'available',
        title: 'Enhanced AI Assistant & Vendor Matching',
        description: 'Major improvements to AI capabilities, new vendor search features, and performance optimizations.',
        features: [
          'AI-powered vendor matching based on budget and style',
          'Guided onboarding questions for personalized responses',
          'Enhanced budget calculator with category breakdowns',
          'Improved vendor search filters and sorting',
        ],
        bugFixes: [
          'Fixed issue with RSVP tracker not saving guest notes',
          'Resolved mobile layout issues on vendor cards',
          'Fixed date picker timezone inconsistencies',
        ],
        securityFixes: [],
        size: '125 MB',
        estimatedTime: '5-10 minutes',
        requiresDowntime: false,
      },
      {
        id: 'update-2',
        version: '2.1.6',
        releaseDate: new Date('2025-01-18'),
        type: 'security',
        status: 'available',
        title: 'Security Patch - Critical',
        description: 'Important security updates to protect your data and prevent unauthorized access.',
        features: [],
        bugFixes: [],
        securityFixes: [
          'Patched XSS vulnerability in message editor',
          'Fixed SQL injection risk in user search',
          'Updated authentication token encryption',
          'Enhanced rate limiting on API endpoints',
        ],
        size: '45 MB',
        estimatedTime: '2-3 minutes',
        requiresDowntime: true,
      },
    ];

    setAvailableUpdates(sampleUpdates);
  };

  const loadUpdateHistory = () => {
    const history: UpdateHistory[] = [
      {
        id: 'hist-1',
        version: '2.1.5',
        installedDate: new Date('2025-01-15'),
        installedBy: 'bellaweddingai@gmail.com',
        status: 'success',
        notes: 'Admin dashboard enhancements and booking commission tracking',
      },
      {
        id: 'hist-2',
        version: '2.1.4',
        installedDate: new Date('2025-01-10'),
        installedBy: 'bellaweddingai@gmail.com',
        status: 'success',
        notes: 'Launch discount system and promo code management',
      },
      {
        id: 'hist-3',
        version: '2.1.3',
        installedDate: new Date('2025-01-05'),
        installedBy: 'bellaweddingai@gmail.com',
        status: 'success',
        notes: 'Stripe Connect integration for vendor payments',
      },
    ];

    setUpdateHistory(history);
  };

  const loadSettings = () => {
    const stored = localStorage.getItem('bella_auto_update_enabled');
    if (stored) {
      setAutoUpdateEnabled(JSON.parse(stored));
    }
  };

  const handleCheckForUpdates = () => {
    setUpdatesCheckedAt(new Date());
    loadUpdates();
    alert('Checked for updates successfully!');
  };

  const handleInstallUpdate = (updateId: string) => {
    const update = availableUpdates.find((u) => u.id === updateId);
    if (!update) return;

    if (update.requiresDowntime) {
      if (!confirm(`This update requires brief downtime (${update.estimatedTime}). Continue?`)) {
        return;
      }
    }

    // Mark as installing
    setAvailableUpdates(
      availableUpdates.map((u) => (u.id === updateId ? { ...u, status: 'installing' as const } : u))
    );

    // Simulate installation
    setTimeout(() => {
      setAvailableUpdates(
        availableUpdates.map((u) => (u.id === updateId ? { ...u, status: 'installed' as const } : u))
      );

      // Add to history
      const newHistory: UpdateHistory = {
        id: `hist-${Date.now()}`,
        version: update.version,
        installedDate: new Date(),
        installedBy: 'bellaweddingai@gmail.com',
        status: 'success',
        notes: update.title,
      };
      setUpdateHistory([newHistory, ...updateHistory]);

      // Update current version if this is the latest
      setCurrentVersion(update.version);

      alert(`Update ${update.version} installed successfully!`);
    }, 3000);
  };

  const handleToggleAutoUpdate = () => {
    const newValue = !autoUpdateEnabled;
    setAutoUpdateEnabled(newValue);
    localStorage.setItem('bella_auto_update_enabled', JSON.stringify(newValue));
  };

  const getUpdateTypeBadge = (type: string) => {
    if (type === 'major') return 'bg-purple-100 text-purple-700 border-purple-300';
    if (type === 'minor') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (type === 'patch') return 'bg-green-100 text-green-700 border-green-300';
    if (type === 'security') return 'bg-red-100 text-red-700 border-red-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getUpdateTypeIcon = (type: string) => {
    if (type === 'major') return <Package className="w-5 h-5" />;
    if (type === 'minor') return <Zap className="w-5 h-5" />;
    if (type === 'patch') return <RefreshCw className="w-5 h-5" />;
    if (type === 'security') return <Shield className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'available') return 'bg-blue-100 text-blue-700';
    if (status === 'installing') return 'bg-yellow-100 text-yellow-700 animate-pulse';
    if (status === 'installed') return 'bg-green-100 text-green-700';
    if (status === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getHistoryStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'failed') return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (status === 'rolled_back') return <RotateCcw className="w-5 h-5 text-yellow-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <RefreshCw className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-serif text-champagne-900 font-bold">Platform Updates</h1>
                <p className="text-champagne-600 mt-1">Keep your platform up to date with the latest features</p>
              </div>
            </div>

            <button
              onClick={handleCheckForUpdates}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Check for Updates
            </button>
          </div>

          {/* Current Version & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-sm text-purple-700">Current Version</div>
                  <div className="text-2xl font-bold text-purple-900">v{currentVersion}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <Download className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-blue-700">Available Updates</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {availableUpdates.filter((u) => u.status === 'available').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-sm text-green-700">Up to Date</div>
                  <div className="text-2xl font-bold text-green-900">
                    {updateHistory.filter((h) => h.status === 'success').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-sm text-yellow-700">Last Checked</div>
                  <div className="text-sm font-bold text-yellow-900">
                    {updatesCheckedAt.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-yellow-600">
                    {updatesCheckedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-champagne-900 mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-600" />
                Update Settings
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-champagne-50 rounded-xl border border-champagne-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-champagne-600" />
                      <span className="font-medium text-champagne-900">Auto-Update</span>
                    </div>
                    <button
                      onClick={handleToggleAutoUpdate}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoUpdateEnabled ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoUpdateEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-champagne-600">
                    Automatically install security updates and patches
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Update Types</h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li><strong>Major:</strong> New features, big changes</li>
                        <li><strong>Minor:</strong> Feature improvements</li>
                        <li><strong>Patch:</strong> Bug fixes</li>
                        <li><strong>Security:</strong> Critical fixes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900 mb-1">Best Practices</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Install security updates ASAP</li>
                        <li>• Test updates during low traffic</li>
                        <li>• Review changes before installing</li>
                        <li>• Keep automatic backups enabled</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Available Updates & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Updates */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-champagne-900 mb-6">Available Updates</h2>
              {availableUpdates.filter((u) => u.status === 'available' || u.status === 'installing').length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-champagne-900 mb-2">You're all up to date!</h3>
                  <p className="text-champagne-600">Your platform is running the latest version.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableUpdates
                    .filter((u) => u.status === 'available' || u.status === 'installing')
                    .map((update) => (
                      <div
                        key={update.id}
                        className="border-2 border-champagne-200 rounded-xl overflow-hidden hover:border-purple-300 transition"
                      >
                        {/* Update Header */}
                        <div className="p-6 bg-gradient-to-r from-champagne-50 to-white">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 ${getUpdateTypeBadge(update.type)}`}>
                                {getUpdateTypeIcon(update.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-xl font-bold text-champagne-900">v{update.version}</h3>
                                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getUpdateTypeBadge(update.type)}`}>
                                    {update.type.toUpperCase()}
                                  </div>
                                  {update.type === 'security' && (
                                    <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                      RECOMMENDED
                                    </div>
                                  )}
                                </div>
                                <p className="text-champagne-600 mb-2">{update.title}</p>
                                <div className="flex items-center gap-4 text-sm text-champagne-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {update.releaseDate.toLocaleDateString()}
                                  </div>
                                  <div>Size: {update.size}</div>
                                  <div>Time: {update.estimatedTime}</div>
                                  {update.requiresDowntime && (
                                    <div className="text-red-600 font-medium">Requires Downtime</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {update.status === 'available' ? (
                              <button
                                onClick={() => handleInstallUpdate(update.id)}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
                              >
                                <Play className="w-5 h-5" />
                                Install Now
                              </button>
                            ) : (
                              <div className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${getStatusBadge(update.status)}`}>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Installing...
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setExpandedUpdate(expandedUpdate === update.id ? null : update.id)}
                            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                          >
                            {expandedUpdate === update.id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Show Details
                              </>
                            )}
                          </button>
                        </div>

                        {/* Update Details (Expandable) */}
                        {expandedUpdate === update.id && (
                          <div className="p-6 border-t border-champagne-200 bg-white">
                            <p className="text-champagne-700 mb-4">{update.description}</p>

                            {update.features.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-bold text-champagne-900 mb-2 flex items-center gap-2">
                                  <Zap className="w-5 h-5 text-blue-600" />
                                  New Features
                                </h4>
                                <ul className="space-y-1 ml-7">
                                  {update.features.map((feature, index) => (
                                    <li key={index} className="text-sm text-champagne-600">
                                      • {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {update.bugFixes.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-bold text-champagne-900 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  Bug Fixes
                                </h4>
                                <ul className="space-y-1 ml-7">
                                  {update.bugFixes.map((fix, index) => (
                                    <li key={index} className="text-sm text-champagne-600">
                                      • {fix}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {update.securityFixes.length > 0 && (
                              <div>
                                <h4 className="font-bold text-champagne-900 mb-2 flex items-center gap-2">
                                  <Shield className="w-5 h-5 text-red-600" />
                                  Security Fixes
                                </h4>
                                <ul className="space-y-1 ml-7">
                                  {update.securityFixes.map((fix, index) => (
                                    <li key={index} className="text-sm text-champagne-600">
                                      • {fix}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Update History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-champagne-900 mb-6">Update History</h2>
              <div className="space-y-3">
                {updateHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-4 bg-champagne-50 rounded-xl border border-champagne-200"
                  >
                    <div className="flex items-center gap-4">
                      {getHistoryStatusIcon(history.status)}
                      <div>
                        <div className="font-bold text-champagne-900">v{history.version}</div>
                        <div className="text-sm text-champagne-600">{history.notes}</div>
                        <div className="text-xs text-champagne-500 mt-1">
                          Installed {history.installedDate.toLocaleDateString()} by {history.installedBy}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        history.status === 'success' ? 'bg-green-100 text-green-700' :
                        history.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {history.status.toUpperCase().replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
