'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Sparkles, ChevronRight, ChevronLeft, Loader2, Edit3,
  Save, Download, Copy, Check, Lock, Crown, BookHeart, FileText
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AuthWall from '@/components/AuthWall';

interface VowFormData {
  partnerName: string;
  howMet: string;
  favoriteMemory: string;
  loveMost: string;
  promises: string;
  tone: 'romantic' | 'funny' | 'traditional' | 'modern';
  length: 'short' | 'medium' | 'long';
}

interface GeneratedVow {
  id: number;
  text: string;
  isEditing: boolean;
}

export default function VowWriter() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VowFormData>({
    partnerName: '',
    howMet: '',
    favoriteMemory: '',
    loveMost: '',
    promises: '',
    tone: 'romantic',
    length: 'medium',
  });

  const [generatedVows, setGeneratedVows] = useState<GeneratedVow[]>([]);
  const [selectedVowIndex, setSelectedVowIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedVowId, setSavedVowId] = useState<number | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'standard' | 'premium'>('standard');
  const [showPaywall, setShowPaywall] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fetch user tier
  useEffect(() => {
    const fetchUserTier = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/users?email=${user.email}`);
        if (response.ok) {
          const userData = await response.json();
          setUserTier(userData.subscription_tier || 'standard');

          // Show paywall if user is not premium
          if (userData.subscription_tier !== 'premium') {
            setShowPaywall(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user tier:', error);
      }
    };

    fetchUserTier();
  }, [user]);

  const handleInputChange = (field: keyof VowFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const generateVows = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/vows/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate vows');
      }

      const data = await response.json();

      if (data.vows && Array.isArray(data.vows)) {
        setGeneratedVows(
          data.vows.map((vow: string, index: number) => ({
            id: index,
            text: vow,
            isEditing: false,
          }))
        );
        setStep(3); // Move to results step
      }
    } catch (error) {
      console.error('Error generating vows:', error);
      alert('Failed to generate vows. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditVow = (index: number) => {
    setGeneratedVows(prev =>
      prev.map((vow, i) =>
        i === index ? { ...vow, isEditing: !vow.isEditing } : vow
      )
    );
  };

  const handleVowTextChange = (index: number, newText: string) => {
    setGeneratedVows(prev =>
      prev.map((vow, i) =>
        i === index ? { ...vow, text: newText } : vow
      )
    );
  };

  const handleSelectVow = (index: number) => {
    setSelectedVowIndex(index);
  };

  const handleCopyVow = (index: number) => {
    const vow = generatedVows[index];
    navigator.clipboard.writeText(vow.text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveVow = async () => {
    if (selectedVowIndex === null) {
      alert('Please select a vow to save');
      return;
    }

    setIsSaving(true);
    try {
      // Get user ID from database
      const userResponse = await fetch(`/api/users?email=${user?.email}`);
      if (!userResponse.ok) throw new Error('Failed to get user data');
      const userData = await userResponse.json();

      const selectedVow = generatedVows[selectedVowIndex];

      // Save to database via Supabase
      const { data, error } = await supabase
        .from('vows')
        .insert({
          user_id: userData.id,
          partner_name: formData.partnerName,
          how_met: formData.howMet,
          favorite_memory: formData.favoriteMemory,
          love_most: formData.loveMost,
          promises: formData.promises,
          tone: formData.tone,
          length: formData.length,
          generated_vow: selectedVow.text,
          edited_vow: selectedVow.text,
        })
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setSavedVowId(data[0].id);
        alert('Vows saved successfully!');
      }
    } catch (error) {
      console.error('Error saving vow:', error);
      alert('Failed to save vows. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (selectedVowIndex === null) {
      alert('Please select a vow to export');
      return;
    }

    const selectedVow = generatedVows[selectedVowIndex];

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedVow.text,
          title: `Wedding Vows for ${formData.partnerName}`,
          type: 'vows',
        }),
      });

      if (!response.ok) throw new Error('Failed to export PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-vows-${formData.partnerName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // Auth protection
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthWall featureName="AI Vow Writer" fullLock={true} />;
  }

  // Paywall for non-premium users
  if (showPaywall && userTier !== 'premium') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-rose-200">
          <div className="w-20 h-20 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Premium Feature
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            The AI-Powered Vow Writer is a premium feature that helps you craft perfect, personalized wedding vows using advanced AI.
          </p>
          <div className="bg-gradient-to-br from-champagne-50 to-rose-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Premium Features Include:</h3>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-champagne-600 flex-shrink-0 mt-0.5" />
                <span>AI-generated personalized vows in multiple styles</span>
              </li>
              <li className="flex items-start gap-2">
                <Edit3 className="w-5 h-5 text-champagne-600 flex-shrink-0 mt-0.5" />
                <span>Edit and refine your vows with our intuitive editor</span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="w-5 h-5 text-champagne-600 flex-shrink-0 mt-0.5" />
                <span>Export beautiful PDF versions of your vows</span>
              </li>
              <li className="flex items-start gap-2">
                <Save className="w-5 h-5 text-champagne-600 flex-shrink-0 mt-0.5" />
                <span>Save unlimited versions and revisions</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-gradient-to-r from-champagne-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-champagne-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
          >
            Upgrade to Premium - $29.99/month
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-gray-600 hover:text-gray-800 underline block w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-champagne-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-champagne-400 to-rose-400 rounded-full flex items-center justify-center">
              <BookHeart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gray-900">AI Vow Writer</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-gradient-to-r from-champagne-100 to-rose-100 rounded-2xl p-6 mb-8 border-2 border-champagne-200">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-champagne-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">
                How It Works
              </h2>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-champagne-600">1.</span>
                  <span>Share your love story and what makes your partner special</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-champagne-600">2.</span>
                  <span>Choose your preferred tone and length</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-champagne-600">3.</span>
                  <span>Review 3 AI-generated versions and select your favorite</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-champagne-600">4.</span>
                  <span>Edit, save, and export as a beautiful PDF</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      step >= stepNum
                        ? 'bg-gradient-to-br from-champagne-400 to-rose-400 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span className="text-sm mt-2 text-gray-600">
                    {stepNum === 1 ? 'Your Story' : stepNum === 2 ? 'Preferences' : 'Generate'}
                  </span>
                </div>
                {stepNum < 3 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 mb-6" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Love Story */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-champagne-100">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              Tell Your Love Story
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner's Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partnerName}
                  onChange={(e) => handleInputChange('partnerName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-400 focus:border-transparent"
                  placeholder="Your beloved's name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How You Met
                </label>
                <textarea
                  value={formData.howMet}
                  onChange={(e) => handleInputChange('howMet', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-400 focus:border-transparent h-24"
                  placeholder="Tell us about the moment you first met..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Memory Together
                </label>
                <textarea
                  value={formData.favoriteMemory}
                  onChange={(e) => handleInputChange('favoriteMemory', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-400 focus:border-transparent h-24"
                  placeholder="A special moment you cherish..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What You Love Most About Them
                </label>
                <textarea
                  value={formData.loveMost}
                  onChange={(e) => handleInputChange('loveMost', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-400 focus:border-transparent h-24"
                  placeholder="The qualities, traits, or moments that make you love them..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promises You Want to Make
                </label>
                <textarea
                  value={formData.promises}
                  onChange={(e) => handleInputChange('promises', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-400 focus:border-transparent h-24"
                  placeholder="The commitments you want to make to your partner..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={!formData.partnerName}
                className="bg-gradient-to-r from-champagne-500 to-rose-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-champagne-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next: Choose Style <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-champagne-100">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">
              Choose Your Style
            </h3>

            <div className="space-y-8">
              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Tone <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'romantic', label: 'Romantic', icon: '💕', description: 'Deeply poetic and heartfelt' },
                    { value: 'funny', label: 'Funny', icon: '😄', description: 'Warm with light-hearted moments' },
                    { value: 'traditional', label: 'Traditional', icon: '🎩', description: 'Classic and timeless' },
                    { value: 'modern', label: 'Modern', icon: '✨', description: 'Contemporary and personal' },
                  ].map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => handleInputChange('tone', tone.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.tone === tone.value
                          ? 'border-champagne-500 bg-champagne-50'
                          : 'border-gray-200 hover:border-champagne-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{tone.icon}</span>
                        <span className="font-semibold text-gray-900">{tone.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">{tone.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Length <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'short', label: 'Short', time: '1-2 min', icon: '⚡' },
                    { value: 'medium', label: 'Medium', time: '3-4 min', icon: '💫' },
                    { value: 'long', label: 'Long', time: '5+ min', icon: '📖' },
                  ].map((length) => (
                    <button
                      key={length.value}
                      onClick={() => handleInputChange('length', length.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.length === length.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{length.icon}</span>
                      <span className="font-semibold text-gray-900 block">{length.label}</span>
                      <span className="text-sm text-gray-600">{length.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePrevStep}
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-champagne-500 to-rose-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-champagne-600 hover:to-rose-600 transition-all flex items-center gap-2"
              >
                Next: Generate Vows <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generate & Review */}
        {step === 3 && (
          <div className="space-y-6">
            {generatedVows.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-champagne-100 text-center">
                <Heart className="w-16 h-16 text-champagne-400 mx-auto mb-4" />
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                  Ready to Create Your Vows?
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Click the button below to generate 3 unique versions of personalized wedding vows based on your love story.
                  Our AI will craft heartfelt vows in the {formData.tone} style with a {formData.length} length.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handlePrevStep}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition"
                  >
                    <ChevronLeft className="w-5 h-5 inline mr-2" /> Back
                  </button>
                  <button
                    onClick={generateVows}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-champagne-500 to-rose-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-champagne-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Your Vows...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Vows
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 text-center">
                  Your Personalized Vows
                </h3>
                <p className="text-center text-gray-600 mb-6">
                  Choose your favorite version, or edit any of them to make them perfect
                </p>

                {/* Vow Options */}
                <div className="grid grid-cols-1 gap-6">
                  {generatedVows.map((vow, index) => (
                    <div
                      key={vow.id}
                      className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all ${
                        selectedVowIndex === index
                          ? 'border-champagne-500 ring-2 ring-champagne-200'
                          : 'border-gray-200 hover:border-champagne-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-champagne-600" />
                          Version {index + 1}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyVow(index)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditVow(index)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Edit vow"
                          >
                            <Edit3 className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {vow.isEditing ? (
                        <textarea
                          value={vow.text}
                          onChange={(e) => handleVowTextChange(index, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-400 focus:border-transparent"
                          rows={12}
                        />
                      ) : (
                        <div className="prose max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {vow.text}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => handleSelectVow(index)}
                        className={`mt-4 w-full py-3 rounded-lg font-semibold transition-all ${
                          selectedVowIndex === index
                            ? 'bg-gradient-to-r from-champagne-500 to-rose-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedVowIndex === index ? (
                          <>
                            <Check className="w-5 h-5 inline mr-2" />
                            Selected
                          </>
                        ) : (
                          'Use This Version'
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-champagne-100">
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      onClick={generateVows}
                      disabled={isGenerating}
                      className="px-6 py-3 border-2 border-champagne-400 text-champagne-600 rounded-lg font-semibold hover:bg-champagne-50 transition disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Generate New Versions'}
                    </button>
                    <button
                      onClick={handleSaveVow}
                      disabled={selectedVowIndex === null || isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Saving...' : 'Save Vows'}
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={selectedVowIndex === null}
                      className="px-6 py-3 bg-gradient-to-r from-champagne-500 to-rose-500 text-white rounded-lg font-semibold hover:from-champagne-600 hover:to-rose-600 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Export as PDF
                    </button>
                  </div>
                  {savedVowId && (
                    <p className="text-center text-green-600 mt-4 font-medium">
                      Vows saved successfully!
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
