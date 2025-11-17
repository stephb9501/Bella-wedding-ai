'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Eye, Type, Palette } from 'lucide-react';

export default function WebsiteBuilder() {
  const router = useRouter();
  const [tab, setTab] = useState('content');
  const [data, setData] = useState({
    bride: '',
    groom: '',
    date: '',
    venue: '',
    story: '',
    color: 'rose',
  });

  const colors = [
    { id: 'rose', name: 'Rose', bg: '#f9a8d4', accent: '#fef3c7' },
    { id: 'navy', name: 'Navy', bg: '#1e3a8a', accent: '#fbbf24' },
  ];

  const selected = colors.find(c => c.id === data.color) || colors[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-champagne-600" />
            <h1 className="text-xl font-bold">Website Builder</h1>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-champagne-600">← Back</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border mb-6 flex">
          <button onClick={() => setTab('content')} className={`flex-1 py-4 ${tab === 'content' ? 'bg-champagne-50 border-b-2 border-champagne-600' : ''}`}>
            <Type className="w-5 h-5 inline mr-2" />Content
          </button>
          <button onClick={() => setTab('design')} className={`flex-1 py-4 ${tab === 'design' ? 'bg-champagne-50 border-b-2 border-champagne-600' : ''}`}>
            <Palette className="w-5 h-5 inline mr-2" />Design
          </button>
          <button onClick={() => setTab('preview')} className={`flex-1 py-4 ${tab === 'preview' ? 'bg-champagne-50 border-b-2 border-champagne-600' : ''}`}>
            <Eye className="w-5 h-5 inline mr-2" />Preview
          </button>
        </div>

        {tab === 'content' && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Website Content</h2>
            <input
              placeholder="Bride Name"
              value={data.bride}
              onChange={e => setData({...data, bride: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              placeholder="Groom Name"
              value={data.groom}
              onChange={e => setData({...data, groom: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={data.date}
              onChange={e => setData({...data, date: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              placeholder="Venue"
              value={data.venue}
              onChange={e => setData({...data, venue: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <textarea
              placeholder="Your love story..."
              value={data.story}
              onChange={e => setData({...data, story: e.target.value})}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        )}

        {tab === 'design' && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-xl font-bold mb-4">Color Scheme</h3>
            {colors.map(c => (
              <button
                key={c.id}
                onClick={() => setData({...data, color: c.id})}
                className={`w-full p-4 mb-3 border-2 rounded-lg flex justify-between ${data.color === c.id ? 'border-champagne-600' : 'border-gray-200'}`}
              >
                {c.name}
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full" style={{backgroundColor: c.bg}} />
                  <div className="w-8 h-8 rounded-full" style={{backgroundColor: c.accent}} />
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'preview' && (
          <div className="bg-white rounded-xl border p-6">
            <div style={{background: `linear-gradient(135deg, ${selected.bg}, ${selected.accent})`}} className="min-h-96 p-12 text-white text-center rounded-lg">
              <h1 className="text-5xl mb-4">{data.bride || 'Bride'} & {data.groom || 'Groom'}</h1>
              {data.date && <div className="text-2xl mb-4">{new Date(data.date).toLocaleDateString()}</div>}
              {data.venue && <div className="text-xl mb-8">{data.venue}</div>}
              {data.story && <p className="max-w-2xl mx-auto text-lg">{data.story}</p>}
            </div>
            <button
              onClick={() => alert('Publishing coming soon!')}
              className="mt-6 w-full px-6 py-3 bg-champagne-600 text-white rounded-lg"
            >
              Publish Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}