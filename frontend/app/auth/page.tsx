'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/supabase';
import { validatePassword, getPasswordStrength } from '@/lib/password-validator';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');
  const [emailSignUp, setEmailSignUp] = useState('');
  const [passwordSignUp, setPasswordSignUp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'success', show: false });
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false);
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showMessage = (text: string, type: string) => {
    setMessage({ text, type, show: true });
    setTimeout(() => setMessage({ text: '', type: 'success', show: false }), 4000);
  };

  const handlePasswordChange = (password: string) => {
    setPasswordSignUp(password);
    if (password) {
      const validation = validatePassword(password);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailSignIn || !passwordSignIn) {
      showMessage('✗ Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const { user } = await signIn(emailSignIn, passwordSignIn);
      showMessage('✓ Sign in successful! Redirecting...', 'success');
      setEmailSignIn('');
      setPasswordSignIn('');

      // Check if user is a vendor
      const vendorCheck = await fetch(`/api/vendors?id=${user.id}`);
      const isVendor = vendorCheck.ok;

      // Get redirect URL from query params or default based on user type
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || (isVendor ? '/vendor-dashboard' : '/dashboard');

      // Redirect after 1 second
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed. Please check your credentials.';
      showMessage(`✗ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailSignUp || !passwordSignUp || !confirmPassword) {
      showMessage('✗ Please fill in all fields', 'error');
      return;
    }

    if (passwordSignUp !== confirmPassword) {
      showMessage('✗ Passwords do not match', 'error');
      return;
    }

    // Validate password strength
    const validation = validatePassword(passwordSignUp);
    if (!validation.isValid) {
      showMessage(`✗ ${validation.errors[0]}`, 'error');
      setPasswordErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      await signUp(emailSignUp, passwordSignUp);
      showMessage('✓ Account created successfully! Check your email to confirm.', 'success');
      setEmailSignUp('');
      setPasswordSignUp('');
      setConfirmPassword('');
      setPasswordErrors([]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Account creation failed. Please try again.';
      showMessage(`✗ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bella Wedding AI - Sign In</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Great+Vibes&display=swap" rel="stylesheet" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Playfair Display', serif;
            position: relative;
            margin: 0;
            color: #4a4a4a;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          /* Fading Background Photos */
          .photo-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }

          .photo-item {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: 0;
            animation: photoFade 15s ease-in-out infinite;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }

          .photo-item:nth-child(1) {
            animation-delay: 0s;
            background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 247, 250, 0.3)), url('/wedding-photos/deltalow-445.jpg');
          }

          .photo-item:nth-child(2) {
            animation-delay: 5s;
            background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 247, 250, 0.3)), url('/wedding-photos/deltalow-447.jpg');
          }

          .photo-item:nth-child(3) {
            animation-delay: 10s;
            background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 247, 250, 0.3)), url('/wedding-photos/deltalow-512.jpg');
          }

          @keyframes photoFade {
            0%, 100% { opacity: 0; }
            8%, 92% { opacity: 1; }
            50% { opacity: 1; }
          }

          /* White Overlay */
          .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.25);
            z-index: 1;
          }

          /* Main Container */
          .container {
            text-align: center;
            z-index: 10;
            position: relative;
            padding: 20px;
            max-width: 600px;
          }

          /* Title */
          .logo {
            font-family: 'Great Vibes', cursive;
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            color: #a64c74;
            margin-bottom: 0.5em;
            font-weight: 400;
            letter-spacing: 2px;
          }

          /* Tagline */
          .tagline {
            font-weight: 700;
            color: #444;
            font-size: clamp(1rem, 2vw, 1.3rem);
            margin-bottom: 0.8em;
            letter-spacing: 0.5px;
          }

          /* Subtext */
          .subtext {
            color: #666;
            margin-bottom: 2em;
            font-size: 1rem;
            letter-spacing: 0.3px;
          }

          /* Tabs */
          .tabs {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 30px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 15px;
          }

          .tab-btn {
            background: transparent;
            border: none;
            font-family: 'Playfair Display', serif;
            font-size: 1.1rem;
            font-weight: 600;
            color: #666;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 5px 0;
            border-bottom: 3px solid transparent;
          }

          .tab-btn.active {
            color: #a64c74;
            border-bottom-color: #a64c74;
          }

          /* Form Container */
          .form-content {
            display: none;
          }

          .form-content.active {
            display: block;
          }

          /* Form */
          form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 320px;
            margin: 0 auto;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-family: 'Playfair Display', serif;
            font-size: 0.9rem;
            font-weight: 600;
            color: #666;
            text-align: left;
          }

          input {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #ddd;
            font-family: 'Playfair Display', serif;
            font-size: 0.85rem;
            color: #666;
            background: rgba(255, 255, 255, 0.85);
            transition: all 0.3s ease;
          }

          input::placeholder {
            color: #bbb;
          }

          input:focus {
            outline: none;
            border-color: #a64c74;
            background: white;
            box-shadow: 0 0 0 4px rgba(166, 76, 116, 0.1);
          }

          /* Password wrapper for eye icon */
          .password-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .password-wrapper input {
            padding-right: 40px;
            width: 100%;
          }

          .eye-button {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            color: #999;
            font-size: 1.2rem;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .eye-button:hover {
            color: #666;
            background: none;
            transform: none;
            box-shadow: none;
          }

          /* Forgot password link */
          .forgot-password {
            text-align: right;
            margin-top: -4px;
          }

          .forgot-password a {
            color: #a64c74;
            text-decoration: none;
            font-size: 0.8rem;
            transition: color 0.3s ease;
          }

          .forgot-password a:hover {
            color: #b84b7a;
            text-decoration: underline;
          }

          /* Button */
          button {
            background-color: #b84b7a;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 700;
            font-family: 'Playfair Display', serif;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            margin-top: 8px;
          }

          button:hover:not(:disabled) {
            background-color: #a64c74;
            box-shadow: 0 6px 20px rgba(184, 75, 122, 0.3);
            transform: translateY(-2px);
          }

          button:active:not(:disabled) {
            transform: translateY(0);
          }

          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Note */
          .note {
            color: #999;
            font-size: 0.85rem;
            margin-top: 12px;
            font-style: italic;
          }

          /* Messages */
          .message {
            padding: 12px 14px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            text-align: center;
            display: none;
          }

          .message.show {
            display: block;
          }

          .message.error {
            background: #ffe0e0;
            color: #d9534f;
            border: 1px solid #f5c6c6;
          }

          .message.success {
            background: #e0f5e0;
            color: #5cb85c;
            border: 1px solid #c6f5c6;
          }

          /* Footer */
          footer {
            margin-top: 2.5em;
            color: #777;
            font-size: 0.9rem;
            letter-spacing: 0.3px;
          }

          @media (max-width: 600px) {
            .logo {
              font-size: 2rem;
            }

            .tagline {
              font-size: 1rem;
            }

            .container {
              padding: 20px;
            }

            .tabs {
              gap: 20px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="photo-bg">
          <div className="photo-item"></div>
          <div className="photo-item"></div>
          <div className="photo-item"></div>
        </div>

        <div className="overlay"></div>

        <div className="container">
          <h1 className="logo">Bella Wedding AI</h1>
          <p className="tagline">Your AI-powered wedding planner is coming soon!</p>
          <p className="subtext">Designed for brides, planners, and vendors – all in one elegant platform.</p>

          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
            <button 
              className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {message.show && (
            <div className={`message ${message.type} show`}>
              {message.text}
            </div>
          )}

          {activeTab === 'signin' && (
            <div className="form-content active">
              <form onSubmit={handleSignIn}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={emailSignIn}
                    onChange={(e) => setEmailSignIn(e.target.value)}
                    disabled={loading}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPasswordSignIn ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={passwordSignIn}
                      onChange={(e) => setPasswordSignIn(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => setShowPasswordSignIn(!showPasswordSignIn)}
                    >
                      {showPasswordSignIn ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <div className="forgot-password">
                    <a href="/auth/forgot-password">Forgot Password?</a>
                  </div>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <p className="note">(Connected to Supabase authentication)</p>
              </form>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="form-content active">
              <form onSubmit={handleSignUp}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={emailSignUp}
                    onChange={(e) => setEmailSignUp(e.target.value)}
                    disabled={loading}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPasswordSignUp ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={passwordSignUp}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
                    >
                      {showPasswordSignUp ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {passwordSignUp && (
                    <div style={{
                      fontSize: '0.75rem',
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: passwordErrors.length === 0 ? '#e0f5e0' : '#fff5e0',
                      borderRadius: '4px',
                      border: `1px solid ${passwordErrors.length === 0 ? '#c6f5c6' : '#ffe0b0'}`
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px', color: '#666' }}>
                        Password Requirements:
                      </div>
                      <ul style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
                        <li style={{ color: passwordSignUp.length >= 8 ? '#5cb85c' : '#d9534f' }}>
                          At least 8 characters {passwordSignUp.length >= 8 ? '✓' : '✗'}
                        </li>
                        <li style={{ color: /[A-Z]/.test(passwordSignUp) ? '#5cb85c' : '#d9534f' }}>
                          One uppercase letter {/[A-Z]/.test(passwordSignUp) ? '✓' : '✗'}
                        </li>
                        <li style={{ color: /[a-z]/.test(passwordSignUp) ? '#5cb85c' : '#d9534f' }}>
                          One lowercase letter {/[a-z]/.test(passwordSignUp) ? '✓' : '✗'}
                        </li>
                        <li style={{ color: /[0-9]/.test(passwordSignUp) ? '#5cb85c' : '#d9534f' }}>
                          One number {/[0-9]/.test(passwordSignUp) ? '✓' : '✗'}
                        </li>
                        <li style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordSignUp) ? '#5cb85c' : '#d9534f' }}>
                          One special character (!@#$%^&*) {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordSignUp) ? '✓' : '✗'}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                <p className="note">(Connected to Supabase authentication)</p>
              </form>
            </div>
          )}

          <footer>© 2025 Bella Wedding AI • All Rights Reserved</footer>
        </div>
      </body>
    </html>
  );
}
