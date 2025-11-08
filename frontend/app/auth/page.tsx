'use client';

import { useState } from 'react';

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' as const | 'error' });

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      showMessage('✓ Signed in successfully!', 'success');
      setEmail('');
      setPassword('');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error signing in', 'error');
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
      showMessage('✓ Account created!', 'success');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error signing up', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 animate-fade-in-out opacity-0">
        <div
          className="absolute inset-0 animate-fade-in-out opacity-0"
          style={{
            background: 'linear-gradient(135deg, #f5d5e3, #e8b4d3, #d896c4, #c47ab5)',
            animation: 'photofade 15s ease-in-out infinite 0s'
          }}
        />
        <div
          className="absolute inset-0 animate-fade-in-out opacity-0"
          style={{
            background: 'linear-gradient(135deg, #e88ca6, #d65878, #c4284d, #b01e42)',
            animation: 'photofade 15s ease-in-out infinite 5s'
          }}
        />
        <div
          className="absolute inset-0 animate-fade-in-out opacity-0"
          style={{
            background: 'linear-gradient(135deg, #f0a8c0, #e68fa4, #dc7688, #d15d6c)',
            animation: 'photofade 15s ease-in-out infinite 10s'
          }}
        />
      </div>

      <div className="fixed inset-0 bg-white/72 z-[1]" />

      <div className="relative z-10 max-w-md w-full mx-auto px-6">
        <h1 className="font-serif text-4xl font-bold text-center text-[#a4556f] mb-8">
          Bella Wedding AI
        </h1>

        {message.text && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={isSignup ? handleSignUp : handleSignIn}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <label className="font-serif text-sm font-bold text-[#666] text-left">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-3 py-2 border border-[#ddd] rounded-lg text-sm focus:outline-none focus:border-[#a4556f]"
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
              className="px-3 py-2 border border-[#ddd] rounded-lg text-sm focus:outline-none focus:border-[#a4556f]"
              required
            />
          </div>

          {isSignup && (
            <div className="flex flex-col gap-2">
              <label className="font-serif text-sm font-bold text-[#666] text-left">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="px-3 py-2 border border-[#ddd] rounded-lg text-sm focus:outline-none focus:border-[#a4556f]"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#a4556f] text-white py-2 rounded-lg font-serif font-bold transition-all hover:bg-[#8b4558] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setMessage({ text: '', type: 'success' });
          }}
          className="mt-6 text-center w-full text-sm text-[#666] hover:text-[#a4556f] font-serif underline"
        >
          {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
        </button>
      </div>

      <style>{`
        @keyframes photofade {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}