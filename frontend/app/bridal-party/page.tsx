'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Plus, Edit2, Trash2, X, Save, Upload, DollarSign,
  Users, Check, AlertCircle, Mail, Phone, User, Camera,
  CheckCircle, XCircle, Download
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface BridalPartyMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  category: string;
  relationship: string;
  dress_size: string;
  suit_size: string;
  photo_url: string;
  needs_hair: boolean;
  needs_makeup: boolean;
  needs_alterations: boolean;
  needs_transportation: boolean;
  hair_cost: number;
  makeup_cost: number;
  alterations_cost: number;
  transportation_cost: number;
  hair_paid: boolean;
  makeup_paid: boolean;
  alterations_paid: boolean;
  transportation_paid: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

type Category = 'Bridesmaids' | 'Groomsmen' | 'Flower Girls' | 'Ring Bearers' | 'Ushers' | 'Parents' | 'Officiant';

const CATEGORIES: Category[] = ['Bridesmaids', 'Groomsmen', 'Flower Girls', 'Ring Bearers', 'Ushers', 'Parents', 'Officiant'];

const ROLE_OPTIONS: Record<Category, string[]> = {
  'Bridesmaids': ['Maid of Honor', 'Matron of Honor', 'Bridesmaid', 'Junior Bridesmaid'],
  'Groomsmen': ['Best Man', 'Groomsman', 'Junior Groomsman'],
  'Flower Girls': ['Flower Girl'],
  'Ring Bearers': ['Ring Bearer'],
  'Ushers': ['Usher', 'Head Usher'],
  'Parents': ['Mother of the Bride', 'Father of the Bride', 'Mother of the Groom', 'Father of the Groom'],
  'Officiant': ['Officiant', 'Celebrant', 'Minister', 'Priest', 'Rabbi']
};

const emptyMember: Partial<BridalPartyMember> = {
  name: '',
  email: '',
  phone: '',
  role: '',
  category: 'Bridesmaids',
  relationship: '',
  dress_size: '',
  suit_size: '',
  photo_url: '',
  needs_hair: false,
  needs_makeup: false,
  needs_alterations: false,
  needs_transportation: false,
  hair_cost: 0,
  makeup_cost: 0,
  alterations_cost: 0,
  transportation_cost: 0,
  hair_paid: false,
  makeup_paid: false,
  alterations_paid: false,
  transportation_paid: false,
  notes: ''
};

export default function BridalPartyPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const supabase = createClientComponentClient();

  const [activeCategory, setActiveCategory] = useState<Category>('Bridesmaids');
  const [members, setMembers] = useState<BridalPartyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<BridalPartyMember> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Fetch user ID from database
  useEffect(() => {
    const fetchUserId = async () => {
      if (!user?.email) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (error) throw error;
        if (data) {
          setUserId(data.id);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, [user, supabase]);

  // Fetch bridal party members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('bridal_party_members')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching bridal party members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [userId, supabase]);

  // Handle add/edit member
  const handleSaveMember = async () => {
    if (!editingMember || !userId) return;

    try {
      if (isEditing && editingMember.id) {
        // Update existing member
        const { error } = await supabase
          .from('bridal_party_members')
          .update({
            ...editingMember,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMember.id);

        if (error) throw error;

        setMembers(members.map(m => m.id === editingMember.id ? { ...m, ...editingMember } as BridalPartyMember : m));
      } else {
        // Add new member
        const { data, error } = await supabase
          .from('bridal_party_members')
          .insert([{ ...editingMember, user_id: userId }])
          .select()
          .single();

        if (error) throw error;
        setMembers([data, ...members]);
      }

      setShowModal(false);
      setEditingMember(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  // Handle delete member
  const handleDeleteMember = async (id: number) => {
    if (!confirm('Are you sure you want to remove this member from your bridal party?')) return;

    try {
      const { error } = await supabase
        .from('bridal_party_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member. Please try again.');
    }
  };

  // Open modal for adding new member
  const handleAddMember = () => {
    setEditingMember({ ...emptyMember, category: activeCategory });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open modal for editing member
  const handleEditMember = (member: BridalPartyMember) => {
    setEditingMember(member);
    setIsEditing(true);
    setShowModal(true);
  };

  // Bulk action: Select all bridesmaids for hair/makeup
  const handleBulkSelectServices = async (category: Category, service: 'hair' | 'makeup') => {
    if (!userId) return;

    const categoryMembers = members.filter(m => m.category === category);
    const field = service === 'hair' ? 'needs_hair' : 'needs_makeup';

    try {
      for (const member of categoryMembers) {
        await supabase
          .from('bridal_party_members')
          .update({ [field]: true })
          .eq('id', member.id);
      }

      // Refresh data
      setMembers(members.map(m =>
        m.category === category ? { ...m, [field]: true } : m
      ));
    } catch (error) {
      console.error('Error updating services:', error);
      alert('Failed to update services. Please try again.');
    }
  };

  // Export as PDF (simple implementation)
  const handleExportPDF = () => {
    alert('PDF export functionality coming soon! For now, you can print this page (Ctrl+P / Cmd+P).');
    window.print();
  };

  // Calculate summary statistics
  const getCategoryMembers = (category: Category) => members.filter(m => m.category === category);
  const currentMembers = getCategoryMembers(activeCategory);

  const totalMembers = members.length;
  const needsHair = members.filter(m => m.needs_hair).length;
  const needsMakeup = members.filter(m => m.needs_makeup).length;

  const totalCosts = members.reduce((sum, m) =>
    sum + m.hair_cost + m.makeup_cost + m.alterations_cost + m.transportation_cost, 0
  );

  const paidCosts = members.reduce((sum, m) =>
    sum +
    (m.hair_paid ? m.hair_cost : 0) +
    (m.makeup_paid ? m.makeup_cost : 0) +
    (m.alterations_paid ? m.alterations_cost : 0) +
    (m.transportation_paid ? m.transportation_cost : 0), 0
  );

  // Auth protection
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthWall featureName="Bridal Party Management" fullLock={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Bella Wedding</h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Bridal Party Management
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your bridal party, track services, and coordinate details
          </p>
        </div>

        {/* Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-champagne-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Members</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{totalMembers}</div>
            <p className="text-xs text-gray-500 mt-2">across all categories</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-rose-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Need Hair</h3>
              <User className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-3xl font-bold text-rose-600">{needsHair}</div>
            <p className="text-xs text-gray-500 mt-2">members need hair services</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-pink-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Need Makeup</h3>
              <User className="w-5 h-5 text-pink-600" />
            </div>
            <div className="text-3xl font-bold text-pink-600">{needsMakeup}</div>
            <p className="text-xs text-gray-500 mt-2">members need makeup services</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Service Costs</h3>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              ${paidCosts.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              of ${totalCosts.toFixed(0)} paid ({totalCosts > 0 ? Math.round((paidCosts / totalCosts) * 100) : 0}%)
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition ${
                    activeCategory === category
                      ? 'border-b-2 border-rose-600 text-rose-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {getCategoryMembers(category).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3">
            <button
              onClick={handleAddMember}
              className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>

            {(activeCategory === 'Bridesmaids' || activeCategory === 'Groomsmen') && (
              <>
                <button
                  onClick={() => handleBulkSelectServices(activeCategory, 'hair')}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  <Check className="w-4 h-4" />
                  All Need Hair
                </button>
                <button
                  onClick={() => handleBulkSelectServices(activeCategory, 'makeup')}
                  className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                >
                  <Check className="w-4 h-4" />
                  All Need Makeup
                </button>
              </>
            )}

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition ml-auto"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Members Grid */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-champagne-600 animate-pulse mx-auto" />
                <p className="text-gray-600 mt-4">Loading members...</p>
              </div>
            ) : currentMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No members in this category yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start building your {activeCategory.toLowerCase()} list
                </p>
                <button
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Add First Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onEdit={handleEditMember}
                    onDelete={handleDeleteMember}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && editingMember && (
        <MemberModal
          member={editingMember}
          isEditing={isEditing}
          onSave={handleSaveMember}
          onClose={() => {
            setShowModal(false);
            setEditingMember(null);
            setIsEditing(false);
          }}
          onChange={setEditingMember}
        />
      )}
    </div>
  );
}

// Member Card Component
function MemberCard({
  member,
  onEdit,
  onDelete
}: {
  member: BridalPartyMember;
  onEdit: (member: BridalPartyMember) => void;
  onDelete: (id: number) => void;
}) {
  const totalCost = member.hair_cost + member.makeup_cost + member.alterations_cost + member.transportation_cost;
  const paidCost =
    (member.hair_paid ? member.hair_cost : 0) +
    (member.makeup_paid ? member.makeup_cost : 0) +
    (member.alterations_paid ? member.alterations_cost : 0) +
    (member.transportation_paid ? member.transportation_cost : 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
      {/* Photo */}
      <div className="relative h-48 bg-gradient-to-br from-champagne-100 to-rose-100">
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={() => onEdit(member)}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="p-2 bg-white rounded-lg shadow hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
        <p className="text-sm text-rose-600 font-medium mb-3">{member.role}</p>

        {/* Contact */}
        <div className="space-y-2 mb-4">
          {member.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.relationship && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{member.relationship}</span>
            </div>
          )}
        </div>

        {/* Sizes */}
        {(member.dress_size || member.suit_size) && (
          <div className="mb-4 text-sm">
            <span className="font-medium text-gray-700">Size: </span>
            <span className="text-gray-600">{member.dress_size || member.suit_size}</span>
          </div>
        )}

        {/* Services */}
        <div className="border-t border-gray-200 pt-3 mb-3">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Services</p>
          <div className="grid grid-cols-2 gap-2">
            {member.needs_hair && (
              <div className="flex items-center gap-1 text-xs">
                {member.hair_paid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-600">Hair ${member.hair_cost}</span>
              </div>
            )}
            {member.needs_makeup && (
              <div className="flex items-center gap-1 text-xs">
                {member.makeup_paid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-600">Makeup ${member.makeup_cost}</span>
              </div>
            )}
            {member.needs_alterations && (
              <div className="flex items-center gap-1 text-xs">
                {member.alterations_paid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-600">Alterations ${member.alterations_cost}</span>
              </div>
            )}
            {member.needs_transportation && (
              <div className="flex items-center gap-1 text-xs">
                {member.transportation_paid ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-gray-600">Transport ${member.transportation_cost}</span>
              </div>
            )}
          </div>
        </div>

        {/* Cost Summary */}
        {totalCost > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Total:</span>
              <span className="text-gray-900 font-bold">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
              <span>Paid:</span>
              <span className={paidCost === totalCost ? 'text-green-600 font-semibold' : ''}>
                ${paidCost.toFixed(2)}
              </span>
            </div>
            {paidCost < totalCost && (
              <div className="flex justify-between items-center text-xs text-red-600 mt-1">
                <span>Remaining:</span>
                <span className="font-semibold">${(totalCost - paidCost).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {member.notes && (
          <div className="mt-3 text-xs text-gray-600 italic border-t border-gray-200 pt-3">
            {member.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// Member Modal Component
function MemberModal({
  member,
  isEditing,
  onSave,
  onClose,
  onChange
}: {
  member: Partial<BridalPartyMember>;
  isEditing: boolean;
  onSave: () => void;
  onClose: () => void;
  onChange: (member: Partial<BridalPartyMember>) => void;
}) {
  const handleChange = (field: keyof BridalPartyMember, value: any) => {
    onChange({ ...member, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            {isEditing ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={member.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={member.category || 'Bridesmaids'}
                  onChange={(e) => {
                    handleChange('category', e.target.value);
                    handleChange('role', ''); // Reset role when category changes
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={member.role || ''}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  required
                >
                  <option value="">Select role...</option>
                  {member.category && ROLE_OPTIONS[member.category as Category].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  value={member.relationship || ''}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  placeholder="e.g., Best Friend, Sister"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={member.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={member.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Sizing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sizing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dress Size
                </label>
                <input
                  type="text"
                  value={member.dress_size || ''}
                  onChange={(e) => handleChange('dress_size', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  placeholder="e.g., 6, 8, 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suit Size
                </label>
                <input
                  type="text"
                  value={member.suit_size || ''}
                  onChange={(e) => handleChange('suit_size', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                  placeholder="e.g., 40R, 42L"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Needed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hair */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.needs_hair || false}
                      onChange={(e) => handleChange('needs_hair', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
                    />
                    <span className="font-medium text-gray-900">Hair</span>
                  </label>
                </div>
                {member.needs_hair && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cost</label>
                      <input
                        type="number"
                        value={member.hair_cost || 0}
                        onChange={(e) => handleChange('hair_cost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.hair_paid || false}
                        onChange={(e) => handleChange('hair_paid', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                      />
                      <span className="text-sm text-gray-700">Paid</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Makeup */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.needs_makeup || false}
                      onChange={(e) => handleChange('needs_makeup', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
                    />
                    <span className="font-medium text-gray-900">Makeup</span>
                  </label>
                </div>
                {member.needs_makeup && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cost</label>
                      <input
                        type="number"
                        value={member.makeup_cost || 0}
                        onChange={(e) => handleChange('makeup_cost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.makeup_paid || false}
                        onChange={(e) => handleChange('makeup_paid', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                      />
                      <span className="text-sm text-gray-700">Paid</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Alterations */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.needs_alterations || false}
                      onChange={(e) => handleChange('needs_alterations', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
                    />
                    <span className="font-medium text-gray-900">Alterations</span>
                  </label>
                </div>
                {member.needs_alterations && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cost</label>
                      <input
                        type="number"
                        value={member.alterations_cost || 0}
                        onChange={(e) => handleChange('alterations_cost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.alterations_paid || false}
                        onChange={(e) => handleChange('alterations_paid', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                      />
                      <span className="text-sm text-gray-700">Paid</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Transportation */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.needs_transportation || false}
                      onChange={(e) => handleChange('needs_transportation', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
                    />
                    <span className="font-medium text-gray-900">Transportation</span>
                  </label>
                </div>
                {member.needs_transportation && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cost</label>
                      <input
                        type="number"
                        value={member.transportation_cost || 0}
                        onChange={(e) => handleChange('transportation_cost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={member.transportation_paid || false}
                        onChange={(e) => handleChange('transportation_paid', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                      />
                      <span className="text-sm text-gray-700">Paid</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL
              </label>
              <input
                type="url"
                value={member.photo_url || ''}
                onChange={(e) => handleChange('photo_url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL to a photo (image upload coming soon)
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            <textarea
              value={member.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:border-transparent"
              rows={4}
              placeholder="Any additional notes or special considerations..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!member.name || !member.role}
            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Update' : 'Add'} Member
          </button>
        </div>
      </div>
    </div>
  );
}
