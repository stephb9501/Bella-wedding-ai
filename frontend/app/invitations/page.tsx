'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Download, Copy, Check } from 'lucide-react';

interface InvitationData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  ceremonyTime: string;
  venueName: string;
  venueAddress: string;
  receptionTime: string;
  rsvpDate: string;
  rsvpEmail: string;
  dressCode: string;
  additionalInfo: string;
}

const TEMPLATES = [
  { id: 'elegant', name: 'Elegant Rose' },
  { id: 'modern', name: 'Modern Minimal' },
  { id: 'rustic', name: 'Rustic Charm' },
  { id: 'garden', name: 'Garden Romance' },
  { id: 'classic', name: 'Classic Gold' },
  { id: 'beach', name: 'Beach Bliss' },
];

export default function InvitationCreator() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState('elegant');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<InvitationData>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    ceremonyTime: '',
    venueName: '',
    venueAddress: '',
    receptionTime: '',
    rsvpDate: '',
    rsvpEmail: '',
    dressCode: '',
    additionalInfo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDownload = () => {
    alert('Download PDF feature coming soon! Will integrate with jsPDF or similar library.');
  };

  const handleCopyText = () => {
    const invitationText = `
You are cordially invited to celebrate the wedding of
${formData.brideName} & ${formData.groomName}

Date: ${formData.weddingDate}
Ceremony: ${formData.ceremonyTime}
Venue: ${formData.venueName}
${formData.venueAddress}

Reception to follow at ${formData.receptionTime}

Please RSVP by ${formData.rsvpDate}
Email: ${formData.rsvpEmail}

${formData.dressCode ? `Dress Code: ${formData.dressCode}` : ''}
${formData.additionalInfo}
    `.trim();

    navigator.clipboard.writeText(invitationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTemplateStyles = () => {
    const templates: Record<string, any> = {
      elegant: {
        bg: 'bg-gradient-to-br from-rose-50 via-white to-champagne-50',
        border: 'border-4 border-rose-300',
        text: 'text-gray-800',
        accent: 'text-rose-600',
        font: 'font-serif',
      },
      modern: {
        bg: 'bg-white',
        border: 'border-2 border-gray-900',
        text: 'text-gray-900',
        accent: 'text-gray-900',
        font: 'font-sans',
      },
      rustic: {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
        border: 'border-4 border-amber-600',
        text: 'text-amber-900',
        accent: 'text-orange-700',
        font: 'font-serif',
      },
      garden: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-4 border-green-400',
        text: 'text-green-900',
        accent: 'text-emerald-600',
        font: 'font-serif',
      },
      classic: {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        border: 'border-4 border-yellow-600',
        text: 'text-gray-900',
        accent: 'text-yellow-700',
        font: 'font-serif',
      },
      beach: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-4 border-blue-400',
        text: 'text-blue-900',
        accent: 'text-cyan-600',
        font: 'font-sans',
      },
    };

    return templates[selectedTemplate] || templates.elegant;
  };

  const styles = getTemplateStyles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">Invitation Creator</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-champagne-600 hover:text-champagne-700 font-medium"
          >
            ê Back
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Invitation Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bride Name</label>
                    <input
                      type="text"
                      name="brideName"
                      value={formData.brideName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="Sarah"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Groom Name</label>
                    <input
                      type="text"
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="Michael"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Date</label>
                  <input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ceremony Time</label>
                  <input
                    type="time"
                    name="ceremonyTime"
                    value={formData.ceremonyTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                  <input
                    type="text"
                    name="venueName"
                    value={formData.venueName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="The Grand Ballroom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue Address</label>
                  <input
                    type="text"
                    name="venueAddress"
                    value={formData.venueAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="123 Main St, City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reception Time</label>
                  <input
                    type="time"
                    name="receptionTime"
                    value={formData.receptionTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RSVP By</label>
                    <input
                      type="date"
                      name="rsvpDate"
                      value={formData.rsvpDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Email</label>
                    <input
                      type="email"
                      name="rsvpEmail"
                      value={formData.rsvpEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                      placeholder="rsvp@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dress Code</label>
                  <input
                    type="text"
                    name="dressCode"
                    value={formData.dressCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Semi-Formal, Black Tie, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    placeholder="Hotel info, parking, etc."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Template</h3>
              <div className="grid grid-cols-3 gap-3">
                {TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-3 rounded-lg border-2 transition ${
                      selectedTemplate === template.id
                        ? 'border-champagne-600 bg-champagne-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyText}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>

              <div className={`${styles.bg} ${styles.border} ${styles.text} ${styles.font} p-12 rounded-lg shadow-xl min-h-[600px] flex flex-col justify-center text-center`}>
                <div className="space-y-6">
                  <div className="text-sm tracking-widest uppercase">You are cordially invited</div>

                  <div className={`text-5xl ${styles.accent} my-6`}>
                    {formData.brideName || 'Bride'} & {formData.groomName || 'Groom'}
                  </div>

                  {formData.weddingDate && (
                    <div className="text-xl font-medium">
                      {new Date(formData.weddingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}

                  {formData.ceremonyTime && (
                    <div className="text-lg">Ceremony at {formData.ceremonyTime}</div>
                  )}

                  {formData.venueName && (
                    <div className="mt-8">
                      <div className="text-xl font-semibold">{formData.venueName}</div>
                      {formData.venueAddress && (
                        <div className="text-sm mt-1">{formData.venueAddress}</div>
                      )}
                    </div>
                  )}

                  {formData.receptionTime && (
                    <div className="text-md italic">Reception at {formData.receptionTime}</div>
                  )}

                  {formData.rsvpDate && (
                    <div className="mt-8 pt-6 border-t border-current/20">
                      <div className="text-sm">RSVP by {new Date(formData.rsvpDate).toLocaleDateString()}</div>
                      {formData.rsvpEmail && (
                        <div className="text-sm mt-1">{formData.rsvpEmail}</div>
                      )}
                    </div>
                  )}

                  {formData.dressCode && (
                    <div className="text-sm italic">Dress Code: {formData.dressCode}</div>
                  )}

                  {formData.additionalInfo && (
                    <div className="text-sm mt-4 whitespace-pre-wrap">{formData.additionalInfo}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
