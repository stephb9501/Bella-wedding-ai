'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, FileText, CheckSquare, Users, Calendar, DollarSign, Map, Phone, Clock, Printer } from 'lucide-react';

interface BinderSection {
  id: string;
  title: string;
  icon: any;
  included: boolean;
}

interface WeddingDayBinderProps {
  weddingId: string;
}

export function WeddingDayBinder({ weddingId }: WeddingDayBinderProps) {
  const [weddingData, setWeddingData] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [sections, setSections] = useState<BinderSection[]>([
    { id: 'overview', title: 'Wedding Overview', icon: FileText, included: true },
    { id: 'timeline', title: 'Day-of Timeline', icon: Clock, included: true },
    { id: 'contacts', title: 'Emergency Contacts', icon: Phone, included: true },
    { id: 'vendors', title: 'Vendor Information', icon: Users, included: true },
    { id: 'checklist', title: 'Final Checklist', icon: CheckSquare, included: true },
    { id: 'guests', title: 'Guest List & Seating', icon: Users, included: true },
    { id: 'budget', title: 'Budget Summary', icon: DollarSign, included: false },
    { id: 'directions', title: 'Venue Directions', icon: Map, included: true },
  ]);

  useEffect(() => {
    fetchAllData();
  }, [weddingId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel for better performance
      const [
        weddingRes,
        timelineRes,
        checklistRes,
        guestsRes,
        vendorsRes,
        budgetRes
      ] = await Promise.all([
        fetch(`/api/weddings?id=${weddingId}`),
        fetch(`/api/timeline?wedding_id=${weddingId}`),
        fetch(`/api/checklist?wedding_id=${weddingId}`),
        fetch(`/api/guests?wedding_id=${weddingId}`),
        fetch(`/api/vendor-collaborations?wedding_id=${weddingId}`),
        fetch(`/api/budget?wedding_id=${weddingId}`)
      ]);

      // Process wedding data
      if (weddingRes.ok) {
        const weddingData = await weddingRes.json();
        setWeddingData(weddingData);
      }

      // Process timeline events
      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        setTimelineEvents(timelineData.filter((e: any) => e.approval_status === 'approved'));
      }

      // Process checklist items
      if (checklistRes.ok) {
        const checklistData = await checklistRes.json();
        setChecklistItems(checklistData.filter((i: any) => i.approval_status === 'approved'));
      }

      // Process guests
      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(guestsData);
      }

      // Process vendors
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData);
      }

      // Process budget items
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setBudgetItems(budgetData.filter((i: any) => i.approval_status === 'approved'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, included: !s.included } : s
    ));
  };

  const generatePDF = async () => {
    setGenerating(true);

    // In production, use a library like jsPDF or react-pdf
    // For now, we'll use browser print
    setTimeout(() => {
      window.print();
      setGenerating(false);
    }, 500);
  };

  const exportData = () => {
    const binderData = {
      wedding: weddingData,
      timeline: timelineEvents,
      checklist: checklistItems,
      guests,
      vendors,
      budget: budgetItems,
      sections: sections.filter(s => s.included),
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(binderData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding-day-binder-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-champagne-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading wedding data...</p>
      </div>
    );
  }

  const includedSections = sections.filter(s => s.included);
  const attendingGuests = guests.filter(g => g.rsvp_status === 'attending');
  const totalBudget = budgetItems.reduce((sum, item) => sum + (item.actual_cost || item.estimated_cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl shadow-md p-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Wedding Day Binder</h2>
            <p className="text-gray-600 mt-1">Create a comprehensive day-of coordination document</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={generatePDF}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
            >
              <Printer className="w-4 h-4" />
              {generating ? 'Generating...' : 'Print/PDF'}
            </button>
          </div>
        </div>

        {/* Section Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                  section.included
                    ? 'border-champagne-500 bg-champagne-50 text-champagne-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 print:hidden">
          {error}
        </div>
      )}

      {/* Binder Content */}
      <div ref={printRef} className="bg-white rounded-2xl shadow-md p-8 print:shadow-none print:rounded-none">
        {/* Cover Page */}
        <div className="text-center mb-12 pb-12 border-b-4 border-champagne-500 print:break-after-page">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Wedding Day Binder</h1>
          {weddingData && (
            <>
              <h2 className="text-3xl text-champagne-700 mb-2">
                {weddingData.bride_name} & {weddingData.groom_name}
              </h2>
              <p className="text-xl text-gray-600">
                {new Date(weddingData.wedding_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </>
          )}
          <div className="mt-8 text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Overview Section */}
        {includedSections.some(s => s.id === 'overview') && weddingData && (
          <div className="mb-12 print:break-after-page">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Wedding Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Ceremony</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Date:</strong> {new Date(weddingData.wedding_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {weddingData.ceremony_time || 'TBD'}</p>
                  <p><strong>Venue:</strong> {weddingData.ceremony_venue || 'TBD'}</p>
                  <p><strong>Location:</strong> {weddingData.ceremony_location || 'TBD'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Reception</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Time:</strong> {weddingData.reception_time || 'TBD'}</p>
                  <p><strong>Venue:</strong> {weddingData.reception_venue || 'TBD'}</p>
                  <p><strong>Location:</strong> {weddingData.reception_location || 'TBD'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Guest Count</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Total Invited:</strong> {guests.length}</p>
                  <p><strong>Attending:</strong> {attendingGuests.length}</p>
                  <p><strong>Declined:</strong> {guests.filter(g => g.rsvp_status === 'declined').length}</p>
                  <p><strong>Pending:</strong> {guests.filter(g => g.rsvp_status === 'pending').length}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Key Details</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Theme:</strong> {weddingData.theme || 'Not specified'}</p>
                  <p><strong>Colors:</strong> {weddingData.color_scheme || 'Not specified'}</p>
                  <p><strong>Vendors:</strong> {vendors.length} confirmed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        {includedSections.some(s => s.id === 'timeline') && timelineEvents.length > 0 && (
          <div className="mb-12 print:break-after-page">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Day-of Timeline
            </h2>
            <div className="space-y-4">
              {timelineEvents
                .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())
                .map((event) => (
                  <div key={event.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-bold text-champagne-700 min-w-[100px]">
                      {new Date(event.event_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Emergency Contacts Section */}
        {includedSections.some(s => s.id === 'contacts') && (
          <div className="mb-12 print:break-after-page">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Emergency Contacts
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <h3 className="font-bold text-red-900 mb-2">Emergency Services</h3>
                <p className="text-red-800">911 - Police, Fire, Medical</p>
              </div>
              {weddingData && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Bride</h3>
                    <p><strong>Name:</strong> {weddingData.bride_name}</p>
                    <p><strong>Phone:</strong> {weddingData.bride_phone || 'Not provided'}</p>
                    <p><strong>Email:</strong> {weddingData.bride_email || 'Not provided'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">Groom</h3>
                    <p><strong>Name:</strong> {weddingData.groom_name}</p>
                    <p><strong>Phone:</strong> {weddingData.groom_phone || 'Not provided'}</p>
                    <p><strong>Email:</strong> {weddingData.groom_email || 'Not provided'}</p>
                  </div>
                </>
              )}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Wedding Coordinator</h3>
                <p>Contact your day-of coordinator for assistance</p>
              </div>
            </div>
          </div>
        )}

        {/* Vendors Section */}
        {includedSections.some(s => s.id === 'vendors') && vendors.length > 0 && (
          <div className="mb-12 print:break-after-page">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Vendor Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-gray-900">{vendor.vendor_type || 'Vendor'}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p><strong>Business:</strong> {vendor.vendor_business_name || 'N/A'}</p>
                    <p><strong>Contact:</strong> {vendor.vendor_name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {vendor.vendor_phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {vendor.vendor_email || 'N/A'}</p>
                    <p><strong>Status:</strong> {vendor.status || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Section */}
        {includedSections.some(s => s.id === 'checklist') && checklistItems.length > 0 && (
          <div className="mb-12 print:break-after-page">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Final Day Checklist
            </h2>
            <div className="space-y-2">
              {checklistItems
                .filter(item => !item.completed)
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
                         (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
                })
                .map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.priority} priority
                        </span>
                        {item.due_date && (
                          <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Guest List Section */}
        {includedSections.some(s => s.id === 'guests') && guests.length > 0 && (
          <div className="mb-12 print:break-after-page">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Guest List & Seating
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left font-bold">Name</th>
                    <th className="p-2 text-left font-bold">Group</th>
                    <th className="p-2 text-left font-bold">RSVP</th>
                    <th className="p-2 text-left font-bold">Table</th>
                    <th className="p-2 text-left font-bold">Dietary</th>
                  </tr>
                </thead>
                <tbody>
                  {attendingGuests.map((guest) => (
                    <tr key={guest.id} className="border-b">
                      <td className="p-2">{guest.name}</td>
                      <td className="p-2">{guest.group_name || '-'}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Attending
                        </span>
                      </td>
                      <td className="p-2">{guest.table_number || 'Unassigned'}</td>
                      <td className="p-2 text-xs">{guest.dietary_restrictions || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Budget Summary Section */}
        {includedSections.some(s => s.id === 'budget') && budgetItems.length > 0 && (
          <div className="mb-12 print:break-after-page">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Budget Summary
            </h2>
            <div className="mb-6 p-4 bg-champagne-50 rounded-lg">
              <div className="text-2xl font-bold text-champagne-900">
                Total Budget: ${totalBudget.toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              {budgetItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      ${(item.actual_cost || item.estimated_cost || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.payment_status || 'pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Venue Directions Section */}
        {includedSections.some(s => s.id === 'directions') && weddingData && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-champagne-500">
              Venue Directions
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Ceremony Venue</h3>
                <p className="text-gray-700 mb-2">{weddingData.ceremony_venue || 'Not specified'}</p>
                <p className="text-gray-600">{weddingData.ceremony_location || 'Address not provided'}</p>
                <p className="text-sm text-blue-600 mt-2">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(weddingData.ceremony_location || '')}`} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps →
                  </a>
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-3">Reception Venue</h3>
                <p className="text-gray-700 mb-2">{weddingData.reception_venue || 'Not specified'}</p>
                <p className="text-gray-600">{weddingData.reception_location || 'Address not provided'}</p>
                <p className="text-sm text-blue-600 mt-2">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(weddingData.reception_location || '')}`} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps →
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
