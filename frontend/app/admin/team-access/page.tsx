'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Trash2,
  Shield,
  Key,
  Mail,
  Copy,
  Check,
  AlertCircle,
  Edit,
  Eye,
  Settings,
  BarChart3,
  FileText,
  DollarSign,
  MessageCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'marketing' | 'support' | 'viewer';
  accessCode: string;
  dateAdded: Date;
  lastActive?: Date;
  status: 'active' | 'suspended';
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'admin' | 'content' | 'analytics' | 'support' | 'marketing';
  enabled: boolean;
}

const rolePermissions: Record<string, Permission[]> = {
  owner: [
    { id: 'all', name: 'Full Access', description: 'Complete platform control', category: 'admin', enabled: true },
  ],
  admin: [
    { id: 'manage_users', name: 'Manage Users', description: 'View and manage user accounts', category: 'admin', enabled: true },
    { id: 'manage_subscriptions', name: 'Manage Subscriptions', description: 'Handle billing and plans', category: 'admin', enabled: true },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access reports and metrics', category: 'analytics', enabled: true },
    { id: 'manage_content', name: 'Manage Content', description: 'Edit site content and photos', category: 'content', enabled: true },
    { id: 'manage_team', name: 'Manage Team', description: 'Add/remove team members', category: 'admin', enabled: true },
  ],
  marketing: [
    { id: 'view_analytics', name: 'View Analytics', description: 'Access marketing metrics', category: 'analytics', enabled: true },
    { id: 'manage_content', name: 'Manage Content', description: 'Edit marketing materials', category: 'content', enabled: true },
    { id: 'manage_photos', name: 'Manage Photos', description: 'Upload and edit site photos', category: 'content', enabled: true },
    { id: 'view_users', name: 'View Users', description: 'See user statistics', category: 'analytics', enabled: true },
  ],
  support: [
    { id: 'view_users', name: 'View Users', description: 'See user accounts', category: 'support', enabled: true },
    { id: 'manage_messages', name: 'Manage Messages', description: 'Handle customer support', category: 'support', enabled: true },
    { id: 'view_basic_analytics', name: 'View Basic Analytics', description: 'Access support metrics', category: 'analytics', enabled: true },
  ],
  viewer: [
    { id: 'view_analytics', name: 'View Analytics', description: 'Read-only access to reports', category: 'analytics', enabled: true },
    { id: 'view_users', name: 'View Users', description: 'Read-only user list', category: 'analytics', enabled: true },
  ],
};

export default function TeamAccessPage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'marketing' | 'support' | 'viewer'>('viewer');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = () => {
    // In production, fetch from Supabase
    // For demo, use localStorage
    const stored = localStorage.getItem('bella_team_members');
    if (stored) {
      const parsed = JSON.parse(stored);
      setTeamMembers(
        parsed.map((member: any) => ({
          ...member,
          dateAdded: new Date(member.dateAdded),
          lastActive: member.lastActive ? new Date(member.lastActive) : undefined,
        }))
      );
    } else {
      // Sample data
      const sampleMembers: TeamMember[] = [
        {
          id: '1',
          name: 'You (Owner)',
          email: 'bellaweddingai@gmail.com',
          role: 'owner',
          accessCode: 'OWNER-ACCESS',
          dateAdded: new Date('2025-01-01'),
          lastActive: new Date(),
          status: 'active',
          permissions: rolePermissions.owner,
        },
      ];
      setTeamMembers(sampleMembers);
    }
  };

  const saveTeamMembers = (members: TeamMember[]) => {
    localStorage.setItem('bella_team_members', JSON.stringify(members));
    setTeamMembers(members);
  };

  const generateAccessCode = () => {
    return `TEAM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  };

  const handleAddMember = () => {
    if (!newMemberName || !newMemberEmail) {
      alert('Please fill in all fields');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      accessCode: generateAccessCode(),
      dateAdded: new Date(),
      status: 'active',
      permissions: rolePermissions[newMemberRole],
    };

    saveTeamMembers([...teamMembers, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('viewer');
    setShowAddModal(false);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      saveTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = teamMembers.map((m) =>
      m.id === id ? { ...m, status: m.status === 'active' ? ('suspended' as const) : ('active' as const) } : m
    );
    saveTeamMembers(updated);
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sendInviteEmail = (member: TeamMember) => {
    const subject = encodeURIComponent('Invitation to Bella Wedding AI Team');
    const body = encodeURIComponent(
      `Hi ${member.name},\n\nYou've been invited to join the Bella Wedding AI team as a ${member.role}.\n\nYour access code: ${member.accessCode}\n\nSign in at: https://bellaweddingai.com/team-login\n\nBest,\nBella Wedding AI Team`
    );
    window.open(`mailto:${member.email}?subject=${subject}&body=${body}`);
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'owner') return 'bg-purple-100 text-purple-700 border-purple-300';
    if (role === 'admin') return 'bg-red-100 text-red-700 border-red-300';
    if (role === 'marketing') return 'bg-blue-100 text-blue-700 border-blue-300';
    if (role === 'support') return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getRoleIcon = (role: string) => {
    if (role === 'owner') return <Shield className="w-5 h-5" />;
    if (role === 'admin') return <Settings className="w-5 h-5" />;
    if (role === 'marketing') return <BarChart3 className="w-5 h-5" />;
    if (role === 'support') return <MessageCircle className="w-5 h-5" />;
    return <Eye className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-serif text-champagne-900 font-bold">Team Access Management</h1>
                <p className="text-champagne-600 mt-1">Give family and team members access to help manage your platform</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Team Member
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-sm text-purple-700">Total Members</div>
                  <div className="text-2xl font-bold text-purple-900">{teamMembers.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <Check className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-sm text-green-700">Active</div>
                  <div className="text-2xl font-bold text-green-900">
                    {teamMembers.filter((m) => m.status === 'active').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-sm text-blue-700">Admins</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {teamMembers.filter((m) => m.role === 'admin' || m.role === 'owner').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-sm text-yellow-700">Marketing</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {teamMembers.filter((m) => m.role === 'marketing').length}
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
          {/* Left Column - Role Descriptions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-champagne-900 mb-4 flex items-center gap-2">
                <Key className="w-6 h-6 text-purple-600" />
                Role Permissions
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-purple-900">Owner</h3>
                  </div>
                  <p className="text-sm text-purple-700">Full access to everything. Cannot be removed.</p>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-900">Admin</h3>
                  </div>
                  <p className="text-sm text-red-700 mb-2">Can manage users, subscriptions, content, and team members.</p>
                  <ul className="text-xs text-red-600 space-y-1">
                    <li>• Manage users & subscriptions</li>
                    <li>• View all analytics</li>
                    <li>• Edit site content</li>
                    <li>• Add/remove team members</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Marketing</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Can view metrics and edit marketing materials.</p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• View marketing analytics</li>
                    <li>• Manage site content & photos</li>
                    <li>• View user statistics</li>
                    <li>• No billing access</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-green-900">Support</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-2">Can handle customer support and messages.</p>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• View user accounts</li>
                    <li>• Manage support messages</li>
                    <li>• View support metrics</li>
                    <li>• No admin or billing access</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900">Viewer</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Read-only access to reports and analytics.</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• View analytics & reports</li>
                    <li>• View user lists</li>
                    <li>• No editing permissions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Team Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-champagne-900 mb-6">Team Members</h2>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-6 rounded-xl border-2 transition ${
                      member.status === 'active'
                        ? 'bg-white border-champagne-200 hover:border-purple-300'
                        : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                          {getRoleIcon(member.role)}
                        </div>
                        <div>
                          <div className="font-bold text-champagne-900 text-lg">{member.name}</div>
                          <div className="text-sm text-champagne-600">{member.email}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(member.role)}`}>
                              {member.role.toUpperCase()}
                            </div>
                            {member.status === 'suspended' && (
                              <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                SUSPENDED
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {member.role !== 'owner' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(member.id)}
                            className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                              member.status === 'active'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {member.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Access Code */}
                    <div className="bg-champagne-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-champagne-600 mb-1">Access Code</div>
                          <div className="font-mono font-bold text-champagne-900">{member.accessCode}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyAccessCode(member.accessCode)}
                            className="px-4 py-2 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 transition flex items-center gap-2 text-sm"
                          >
                            {copiedCode === member.accessCode ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => sendInviteEmail(member)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <div className="text-sm font-bold text-champagne-900 mb-2">Permissions:</div>
                      <div className="flex flex-wrap gap-2">
                        {member.permissions.map((perm) => (
                          <div
                            key={perm.id}
                            className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            title={perm.description}
                          >
                            {perm.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="mt-4 text-xs text-champagne-600">
                      Added {member.dateAdded.toLocaleDateString()}
                      {member.lastActive && (
                        <> • Last active {member.lastActive.toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Add Team Member</h2>
                  <p className="text-purple-100 text-sm">Give family or team access to help manage the platform</p>
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
                <label className="block text-sm font-bold text-champagne-900 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="e.g., Jane Smith"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-champagne-900 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-champagne-900 mb-2">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                >
                  <option value="viewer">Viewer - Read-only access</option>
                  <option value="support">Support - Customer service</option>
                  <option value="marketing">Marketing - Content & analytics</option>
                  <option value="admin">Admin - Full management access</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Note:</strong> After adding, you'll receive an access code to share with them. They can use it to sign in and access their assigned areas.
                  </div>
                </div>
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
                onClick={handleAddMember}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Add Team Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
