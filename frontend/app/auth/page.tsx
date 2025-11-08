'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClientComponentClient();

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showMessage('✓ Signed in successfully!', 'success');
      setTimeout(() => (window.location.href = '/dashboard'), 1500);
    } catch (err: any) {
      showMessage(err.message || 'Error signing in', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showMessage('✗ Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
      showMessage('✓ Check your email to confirm your account!', 'success');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showMessage(err.message || 'Error signing up', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fading Background Photos */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 animate-fade-in-out opacity-0" style={{
          background: 'linear-gradient(135deg, rgba(255, 247, 250, 0.4), rgba(249, 241, 247, 0.4)), radial-gradient(circle at 40% 50%, #f5e6d3 0%, #e8d9c8 50%, #f0e4d4 100%)',
          animation: 'photoFade 15s ease-in-out infinite 0s'
        }}></div>
        <div className="absolute inset-0 animate-fade-in-out opacity-0" style={{
          background: 'linear-gradient(135deg, rgba(255, 247, 250, 0.4), rgba(249, 241, 247, 0.4)), linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 50%, #e8e8e8 100%)',
          animation: 'photoFade 15s ease-in-out infinite 5s'
        }}></div>
        <div className="absolute inset-0 animate-fade-in-out opacity-0" style={{
          background: 'linear-gradient(135deg, rgba(255, 247, 250, 0.4), rgba(249, 241, 247, 0.4)), linear-gradient(135deg, #dce8f0 0%, #f0f8ff 50%, #dce8f0 100%)',
          animation: 'photoFade 15s ease-in-out infinite 10s'
        }}></div>
      </div>

      {/* White Overlay */}
      <div className="fixed inset-0 bg-white/72 z-[1]"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="font-[family-name:var(--font-great-vibes)] text-5xl text-[#a64c74] mb-4" style={{ fontStyle: 'italic' }}>
            Bella Wedding AI
          </h1>
          <p className="font-serif text-xl font-bold text-[#444] mb-3">
            Your AI-powered wedding planner is coming soon!
          </p>
          <p className="text-[#666] text-base mb-8">
            Designed for brides, planners, and vendors — all in one elegant platform.
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-8 mb-8 border-b-2 border-[#ddd] pb-4">
            <button
              onClick={() => {
                setIsSignUp(false);
                setMessage(null);
              }}
              className={`font-serif text-lg font-bold transition-all pb-1 border-b-4 ${
                !isSignUp
                  ? 'text-[#a64c74] border-b-[#a64c74]'
                  : 'text-[#bbb] border-b-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setMessage(null);
              }}
              className={`font-serif text-lg font-bold transition-all pb-1 border-b-4 ${
                isSignUp
                  ? 'text-[#a64c74] border-b-[#a64c74]'
                  : 'text-[#bbb] border-b-transparent'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Messages */}
          {message && (
            <div className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-[#e0f5e0] text-[#5cb85c] border border-[#c6f5c6]'
                : 'bg-[#ffe0e0] text-[#d9534f] border border-[#f5c6c6]'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form - Narrower */}
          <div className="max-w-sm mx-auto">
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="font-serif text-sm font-bold text-[#666] text-left">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-3 py-2 border border-[#ddd] rounded-md text-sm bg-white/85 focus:outline-none focus:border-[#a64c74] focus:ring-2 focus:ring-[#a64c74]/10"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-serif text-sm font-bold text-[#666] text-left">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="px-3 py-2 border border-[#ddd] rounded-md text-sm bg-white/85 focus:outline-none focus:border-[#a64c74] focus:ring-2 focus:ring-[#a64c74]/10"
                  required
                />
              </div>

              {isSignUp && (
                <div className="flex flex-col gap-2">
                  <label className="font-serif text-sm font-bold text-[#666] text-left">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="px-3 py-2 border border-[#ddd] rounded-md text-sm bg-white/85 focus:outline-none focus:border-[#a64c74] focus:ring-2 focus:ring-[#a64c74]/10"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#b84b7a] text-white px-5 py-2 rounded-md font-bold text-sm transition-all hover:bg-[#a64c74] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>

              <p className="text-[#999] text-xs italic mt-2">
                (Connected to Supabase authentication)
              </p>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-[#777] text-xs">
            <p className="mb-3">© 2025 Bella Wedding AI • All Rights Reserved</p>
            <p className="font-[family-name:var(--font-great-vibes)] text-lg text-[#a64c74]" style={{ fontStyle: 'italic' }}>
              Plan your perfect wedding with AI ✨
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes photoFade {
          0%, 100% { opacity: 0; }
          8%, 92% { opacity: 0.25; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}