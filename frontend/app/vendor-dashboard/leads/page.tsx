'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Filter, MessageCircle, Phone, Mail, Calendar, Check, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  vendor_id: string;
  bride_name: string;
  bride_email: string;
  bride_phone: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'declined';
  message: string;
  response: string | null;
  conversation_history: any[];
  converted: boolean;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

export default function LeadsManagement() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'quoted' | 'booked' | 'declined'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setVendorId(user.id);
    };
    initializePage();
  }, [router]);

  useEffect(() => {
    if (vendorId) {
      fetchLeads();
    }
  }, [vendorId]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredLeads(leads);
    } else {
      setFilteredLeads(leads.filter(lead => lead.status === filter));
    }
  }, [filter, leads]);

  const fetchLeads = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('vendor_leads')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('vendor_leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      await fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const submitResponse = async () => {
    if (!selectedLead || !responseText.trim()) return;

    setSubmitting(true);
    try {
      const conversationHistory = selectedLead.conversation_history || [];
      conversationHistory.push({
        timestamp: new Date().toISOString(),
        from: 'vendor',
        message: responseText
      });

      const { error } = await supabase
        .from('vendor_leads')
        .update({
          response: responseText,
          conversation_history: conversationHistory,
          status: 'contacted',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLead.id);

      if (error) throw error;

      setResponseText('');
      setSelectedLead(null);
      await fetchLeads();
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const markAsConverted = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_leads')
        .update({
          converted: true,
          status: 'booked',
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;
      await fetchLeads();
    } catch (error) {
      console.error('Error marking as converted:', error);
    }
  };

  const markAsLost = async (leadId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('vendor_leads')
        .update({
          converted: false,
          status: 'declined',
          lost_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;
      await fetchLeads();
    } catch (error) {
      console.error('Error marking as lost:', error);
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    quoted: leads.filter(l => l.status === 'quoted').length,
    booked: leads.filter(l => l.status === 'booked').length,
    declined: leads.filter(l => l.status === 'declined').length,
    conversionRate: leads.length > 0 ? (leads.filter(l => l.converted).length / leads.length * 100).toFixed(1) : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/vendor-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-serif font-bold text-gray-900">Leads Management</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
               onClick={() => setFilter('new')}>
            <div className="text-sm text-blue-600">New</div>
            <div className="text-2xl font-bold text-blue-900">{stats.new}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
               onClick={() => setFilter('contacted')}>
            <div className="text-sm text-yellow-600">Contacted</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.contacted}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
               onClick={() => setFilter('quoted')}>
            <div className="text-sm text-purple-600">Quoted</div>
            <div className="text-2xl font-bold text-purple-900">{stats.quoted}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
               onClick={() => setFilter('booked')}>
            <div className="text-sm text-green-600">Booked</div>
            <div className="text-2xl font-bold text-green-900">{stats.booked}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition"
               onClick={() => setFilter('declined')}>
            <div className="text-sm text-red-600">Declined</div>
            <div className="text-2xl font-bold text-red-900">{stats.declined}</div>
          </div>
          <div className="bg-champagne-50 rounded-lg shadow p-4">
            <div className="text-sm text-champagne-600">Conv. Rate</div>
            <div className="text-2xl font-bold text-champagne-900">{stats.conversionRate}%</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-500" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all' ? 'bg-champagne-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilter('contacted')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'contacted' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Contacted
            </button>
            <button
              onClick={() => setFilter('quoted')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'quoted' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Quoted
            </button>
            <button
              onClick={() => setFilter('booked')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'booked' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Booked
            </button>
            <button
              onClick={() => setFilter('declined')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'declined' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Declined
            </button>
          </div>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'When brides inquire about your services, their messages will appear here.'
                  : `No ${filter} leads at the moment.`
                }
              </p>
            </div>
          ) : (
            filteredLeads.map(lead => (
              <div key={lead.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{lead.bride_name}</h3>
                    <p className="text-sm text-gray-500">
                      Received {new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'quoted' ? 'bg-purple-100 text-purple-800' :
                      lead.status === 'booked' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                    {lead.converted && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-champagne-100 text-champagne-800">
                        Converted
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${lead.bride_email}`} className="hover:text-champagne-600">
                      {lead.bride_email}
                    </a>
                  </div>
                  {lead.bride_phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${lead.bride_phone}`} className="hover:text-champagne-600">
                        {lead.bride_phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Initial Message:</p>
                  <p className="text-gray-800">{lead.message}</p>
                </div>

                {/* Response */}
                {lead.response && (
                  <div className="bg-champagne-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-champagne-700 mb-2">Your Response:</p>
                    <p className="text-gray-800">{lead.response}</p>
                  </div>
                )}

                {/* Conversation History */}
                {lead.conversation_history && lead.conversation_history.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Conversation History:</p>
                    <div className="space-y-2">
                      {lead.conversation_history.map((msg: any, idx: number) => (
                        <div key={idx} className={`p-3 rounded-lg ${
                          msg.from === 'vendor' ? 'bg-champagne-50' : 'bg-gray-50'
                        }`}>
                          <p className="text-xs text-gray-500 mb-1">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                          <p className="text-gray-800">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Respond
                  </button>

                  {lead.status === 'new' && (
                    <button
                      onClick={() => updateLeadStatus(lead.id, 'contacted')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition"
                    >
                      Mark Contacted
                    </button>
                  )}

                  {lead.status === 'contacted' && (
                    <button
                      onClick={() => updateLeadStatus(lead.id, 'quoted')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                    >
                      Mark Quoted
                    </button>
                  )}

                  {!lead.converted && lead.status !== 'booked' && (
                    <button
                      onClick={() => markAsConverted(lead.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Mark Booked
                    </button>
                  )}

                  {!lead.converted && lead.status !== 'declined' && (
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for declining (optional):');
                        if (reason !== null) markAsLost(lead.id, reason);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Mark Declined
                    </button>
                  )}
                </div>

                {lead.lost_reason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>Declined Reason:</strong> {lead.lost_reason}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Respond to {selectedLead.bride_name}</h2>
                <button
                  onClick={() => {
                    setSelectedLead(null);
                    setResponseText('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Their Message:</p>
                <p className="text-gray-800">{selectedLead.message}</p>
              </div>

              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-500 focus:border-transparent"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitResponse}
                  disabled={!responseText.trim() || submitting}
                  className="flex-1 px-6 py-3 bg-champagne-600 hover:bg-champagne-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {submitting ? 'Sending...' : 'Send Response'}
                </button>
                <button
                  onClick={() => {
                    setSelectedLead(null);
                    setResponseText('');
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
