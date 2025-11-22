'use client';

import { useState, useEffect } from 'react';
import { WeddingPreferences } from '@/lib/recommendation-engine';

interface WeddingPreferencesFormProps {
  weddingId: string;
  onSave?: (preferences: WeddingPreferences) => void;
}

const WEDDING_STYLES = [
  'Rustic',
  'Modern',
  'Traditional',
  'Bohemian',
  'Vintage',
  'Romantic',
  'Glamorous',
  'Beach',
  'Garden',
  'Industrial',
  'Classic',
  'Whimsical',
];

const FORMALITY_LEVELS = [
  { value: 'casual', label: 'Casual' },
  { value: 'semi_formal', label: 'Semi-Formal' },
  { value: 'formal', label: 'Formal' },
  { value: 'black_tie', label: 'Black Tie' },
];

const BUDGET_FLEXIBILITY = [
  { value: 'strict', label: 'Strict - Must stay within budget' },
  { value: 'flexible', label: 'Flexible - Can go slightly over' },
  { value: 'very_flexible', label: 'Very Flexible - Open to higher quality options' },
];

const OUTDOOR_INDOOR = [
  { value: 'outdoor', label: 'Outdoor Only' },
  { value: 'indoor', label: 'Indoor Only' },
  { value: 'both', label: 'Either Indoor or Outdoor' },
  { value: 'no_preference', label: 'No Preference' },
];

export default function WeddingPreferencesForm({
  weddingId,
  onSave,
}: WeddingPreferencesFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [preferences, setPreferences] = useState<Partial<WeddingPreferences>>({
    budget_flexibility: 'flexible',
    wedding_style: [],
    color_scheme: [],
    formality_level: 'semi_formal',
    preferred_cities: [],
    max_distance_miles: 50,
    outdoor_indoor: 'no_preference',
    venue_priority: 5,
    photographer_priority: 4,
    caterer_priority: 4,
    florist_priority: 3,
    dj_priority: 3,
    dietary_restrictions: [],
    must_haves: [],
    deal_breakers: [],
  });

  useEffect(() => {
    fetchPreferences();
  }, [weddingId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/preferences?wedding_id=${weddingId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setPreferences(data);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wedding_id: weddingId,
          ...preferences,
        }),
      });

      if (!res.ok) throw new Error('Failed to save preferences');

      const data = await res.json();
      setMessage('Preferences saved successfully!');
      onSave?.(data);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleStyle = (style: string) => {
    const current = preferences.wedding_style || [];
    const updated = current.includes(style)
      ? current.filter(s => s !== style)
      : [...current, style];
    setPreferences({ ...preferences, wedding_style: updated });
  };

  const addToArray = (field: keyof WeddingPreferences, value: string) => {
    if (!value.trim()) return;
    const current = (preferences[field] as string[]) || [];
    if (!current.includes(value.trim())) {
      setPreferences({
        ...preferences,
        [field]: [...current, value.trim()],
      });
    }
  };

  const removeFromArray = (field: keyof WeddingPreferences, value: string) => {
    const current = (preferences[field] as string[]) || [];
    setPreferences({
      ...preferences,
      [field]: current.filter(item => item !== value),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Wedding Preferences
        </h2>
        <p className="text-gray-600">
          Tell us about your dream wedding to get personalized vendor recommendations
        </p>
      </div>

      {/* Budget Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Wedding Budget ($)
          </label>
          <input
            type="number"
            value={preferences.total_budget || ''}
            onChange={e => setPreferences({
              ...preferences,
              total_budget: parseFloat(e.target.value) || undefined
            })}
            placeholder="e.g., 30000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Flexibility
          </label>
          <div className="space-y-2">
            {BUDGET_FLEXIBILITY.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="budget_flexibility"
                  value={option.value}
                  checked={preferences.budget_flexibility === option.value}
                  onChange={e => setPreferences({
                    ...preferences,
                    budget_flexibility: e.target.value as any
                  })}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Style Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Wedding Style</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Style(s) - Choose all that apply
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {WEDDING_STYLES.map(style => (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preferences.wedding_style?.includes(style)
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formality Level
          </label>
          <select
            value={preferences.formality_level || ''}
            onChange={e => setPreferences({
              ...preferences,
              formality_level: e.target.value as any
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            {FORMALITY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Location Preferences</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Cities (press Enter to add)
          </label>
          <input
            type="text"
            placeholder="Type city name and press Enter"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addToArray('preferred_cities', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {preferences.preferred_cities?.map(city => (
              <span
                key={city}
                className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm"
              >
                {city}
                <button
                  type="button"
                  onClick={() => removeFromArray('preferred_cities', city)}
                  className="hover:text-rose-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Distance from You (miles)
          </label>
          <input
            type="number"
            value={preferences.max_distance_miles || ''}
            onChange={e => setPreferences({
              ...preferences,
              max_distance_miles: parseInt(e.target.value) || undefined
            })}
            placeholder="e.g., 50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outdoor or Indoor?
          </label>
          <select
            value={preferences.outdoor_indoor || ''}
            onChange={e => setPreferences({
              ...preferences,
              outdoor_indoor: e.target.value as any
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            {OUTDOOR_INDOOR.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Priorities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Vendor Priorities</h3>
        <p className="text-sm text-gray-600">
          Rate how important each vendor type is (1=Low, 5=Critical)
        </p>

        {[
          { key: 'venue_priority', label: 'Venue' },
          { key: 'photographer_priority', label: 'Photographer' },
          { key: 'caterer_priority', label: 'Caterer' },
          { key: 'florist_priority', label: 'Florist' },
          { key: 'dj_priority', label: 'DJ/Band' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <span className="text-sm text-gray-600">
                {preferences[key as keyof WeddingPreferences] || 3}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={preferences[key as keyof WeddingPreferences] as number || 3}
              onChange={e => setPreferences({
                ...preferences,
                [key]: parseInt(e.target.value)
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Critical</span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Guest Count
          </label>
          <input
            type="number"
            value={preferences.guest_count || ''}
            onChange={e => setPreferences({
              ...preferences,
              guest_count: parseInt(e.target.value) || undefined
            })}
            placeholder="e.g., 150"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requirements or Notes
          </label>
          <textarea
            value={preferences.special_requirements || ''}
            onChange={e => setPreferences({
              ...preferences,
              special_requirements: e.target.value
            })}
            placeholder="Any special needs, accessibility requirements, cultural traditions, etc."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-6 border-t">
        {message && (
          <p className={`text-sm ${
            message.includes('success') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto px-6 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
