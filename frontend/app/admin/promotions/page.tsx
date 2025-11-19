'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Gift,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Percent,
  Calendar,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

interface PromotionalSpot {
  id: number;
  campaign_name: string;
  spot_type: 'free' | 'discount';
  total_spots: number;
  spots_remaining: number;
  discount_percentage: number | null;
  code: string | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Redemption {
  id: number;
  campaign_id: number;
  user_id: number | null;
  email: string;
  redeemed_at: string;
}

export default function PromotionsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [campaigns, setCampaigns] = useState<PromotionalSpot[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    campaign_name: '',
    spot_type: 'free' as 'free' | 'discount',
    total_spots: 100,
    discount_percentage: 20,
    code: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchCampaigns();
    fetchRedemptions();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_spots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const { data, error } = await supabase
        .from('spot_redemptions')
        .select('*')
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      setRedemptions(data || []);
    } catch (err: any) {
      console.error('Error fetching redemptions:', err);
    }
  };

  const createCampaign = async () => {
    try {
      setError(null);

      if (!formData.campaign_name || !formData.code) {
        setError('Campaign name and code are required');
        return;
      }

      const { data, error } = await supabase
        .from('promotional_spots')
        .insert([{
          campaign_name: formData.campaign_name,
          spot_type: formData.spot_type,
          total_spots: formData.total_spots,
          spots_remaining: formData.total_spots,
          discount_percentage: formData.spot_type === 'discount' ? formData.discount_percentage : null,
          code: formData.code.toUpperCase(),
          active: true,
          expires_at: formData.expires_at || null
        }])
        .select()
        .single();

      if (error) throw error;

      setSuccess('Campaign created successfully!');
      setShowCreateModal(false);
      fetchCampaigns();

      // Reset form
      setFormData({
        campaign_name: '',
        spot_type: 'free',
        total_spots: 100,
        discount_percentage: 20,
        code: '',
        expires_at: ''
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setError(err.message || 'Failed to create campaign');
    }
  };

  const toggleCampaign = async (id: number, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promotional_spots')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      setSuccess(`Campaign ${currentActive ? 'deactivated' : 'activated'}`);
      fetchCampaigns();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign');
    }
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('promotional_spots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Campaign deleted');
      fetchCampaigns();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete campaign');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCampaignRedemptions = (campaignId: number) => {
    return redemptions.filter(r => r.campaign_id === campaignId);
  };

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.active).length,
    totalRedemptions: redemptions.length,
    spotsRemaining: campaigns.filter(c => c.active).reduce((sum, c) => sum + c.spots_remaining, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Admin Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Gift className="w-10 h-10 text-purple-600" />
                Promotional Spots Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage free spots and discount campaigns
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Total Campaigns</div>
              <Gift className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Active Campaigns</div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.activeCampaigns}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Spots Remaining</div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.spotsRemaining}</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Total Redemptions</div>
              <Users className="w-8 h-8 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.totalRedemptions}</div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <h2 className="text-2xl font-bold">Active & Past Campaigns</h2>
            <p className="text-white/90 mt-1">Manage promotional codes and free spot offers</p>
          </div>

          <div className="p-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first promotional campaign</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const campaignRedemptions = getCampaignRedemptions(campaign.id);
                  const redemptionRate = campaign.total_spots > 0
                    ? ((campaign.total_spots - campaign.spots_remaining) / campaign.total_spots * 100).toFixed(1)
                    : 0;
                  const isExpired = campaign.expires_at && new Date(campaign.expires_at) < new Date();

                  return (
                    <div
                      key={campaign.id}
                      className={`border rounded-lg p-6 ${
                        campaign.active && !isExpired
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {campaign.campaign_name}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              campaign.active && !isExpired
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {campaign.active && !isExpired ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'INACTIVE'}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                              campaign.spot_type === 'free'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {campaign.spot_type === 'free' ? 'FREE SPOTS' : `${campaign.discount_percentage}% OFF`}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-gray-600">Code</div>
                              <div className="flex items-center gap-2">
                                <code className="text-lg font-bold text-purple-700">
                                  {campaign.code}
                                </code>
                                <button
                                  onClick={() => copyCode(campaign.code || '')}
                                  className="p-1 hover:bg-gray-200 rounded transition"
                                  title="Copy code"
                                >
                                  {copiedCode === campaign.code ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-600">Spots</div>
                              <div className="text-lg font-bold text-gray-900">
                                {campaign.spots_remaining} / {campaign.total_spots}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-600">Redemption Rate</div>
                              <div className="text-lg font-bold text-gray-900">
                                {redemptionRate}%
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-600">Expires</div>
                              <div className="text-sm font-medium text-gray-900">
                                {campaign.expires_at
                                  ? new Date(campaign.expires_at).toLocaleDateString()
                                  : 'Never'}
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${100 - (campaign.spots_remaining / campaign.total_spots * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600">
                            Redemptions: {campaignRedemptions.length}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleCampaign(campaign.id, campaign.active)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                              campaign.active
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {campaign.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteCampaign(campaign.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                    placeholder="e.g., Launch Promo - 100 Free Spots"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type
                  </label>
                  <select
                    value={formData.spot_type}
                    onChange={(e) => setFormData({ ...formData, spot_type: e.target.value as 'free' | 'discount' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="free">Free Spots</option>
                    <option value="discount">Discount Code</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Spots
                    </label>
                    <input
                      type="number"
                      value={formData.total_spots}
                      onChange={(e) => setFormData({ ...formData, total_spots: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {formData.spot_type === 'discount' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount %
                      </label>
                      <input
                        type="number"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., LAUNCH100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createCampaign}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How Promotional Spots Work</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Create campaigns with promo codes that users can redeem on signup</li>
                <li>• Set free spots (100% off) or discount percentages (e.g., 20% off)</li>
                <li>• Campaigns auto-disable when spots run out or expire</li>
                <li>• Display active campaigns on landing page to drive conversions</li>
                <li>• Track redemptions and see which campaigns perform best</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
