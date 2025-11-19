'use client';

import { useState } from 'react';
import { X, Send, Lightbulb, Bug, Sparkles } from 'lucide-react';

interface Props {
  vendorId: string;
  vendorEmail?: string;
  vendorName?: string;
  onClose: () => void;
}

export function VendorSuggestionModal({ vendorId, vendorEmail, vendorName, onClose }: Props) {
  const [category, setCategory] = useState<'feature_request' | 'bug_report' | 'improvement' | 'other'>('feature_request');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/vendor-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          vendor_email: vendorEmail,
          vendor_name: vendorName,
          category,
          title,
          description,
          priority
        })
      });

      if (!response.ok) throw new Error('Failed to submit suggestion');

      setSubmitted(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Failed to submit suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'text-blue-600' },
    { value: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
    { value: 'improvement', label: 'Improvement', icon: Sparkles, color: 'text-purple-600' },
    { value: 'other', label: 'Other', icon: Send, color: 'text-gray-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Send Us Feedback</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Help us improve Bella Wedding by sharing your ideas
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to share?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categoryOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCategory(option.value as any)}
                        className={`p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                          category === option.value
                            ? 'border-champagne-600 bg-champagne-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${option.color}`} />
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                >
                  <option value="low">Low - Nice to have</option>
                  <option value="medium">Medium - Would be helpful</option>
                  <option value="high">High - Really need this</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your suggestion..."
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about your suggestion or the issue you're experiencing..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-champagne-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-champagne-600 to-rose-600 hover:from-champagne-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              Your feedback has been submitted. We'll review it and get back to you soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
