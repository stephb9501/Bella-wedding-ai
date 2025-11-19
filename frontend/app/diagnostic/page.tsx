'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  const [clientInfo, setClientInfo] = useState<any>({});

  useEffect(() => {
    setClientInfo({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      hasAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'MISSING',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>🔍 Deployment Diagnostic</h1>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#666', marginBottom: '15px' }}>Environment Variables</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {clientInfo.supabaseUrl}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {clientInfo.hasAnonKey}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#666', marginBottom: '15px' }}>Deployment Info</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Timestamp:</strong> {clientInfo.timestamp}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>User Agent:</strong> {clientInfo.userAgent}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#666', marginBottom: '15px' }}>Test Cases</h2>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#444', fontSize: '16px', marginBottom: '10px' }}>Button Color Test:</h3>
          <button
            style={{
              background: 'linear-gradient(to right, #d4b895, #f4a5a5)',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            This Should Be Champagne/Blush Gradient
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#444', fontSize: '16px', marginBottom: '10px' }}>Tailwind Button Test:</h3>
          <button className="px-6 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 text-white font-bold rounded-lg">
            Tailwind Gradient Button
          </button>
        </div>

        <div>
          <h3 style={{ color: '#444', fontSize: '16px', marginBottom: '10px' }}>Icon Test (Lucide):</h3>
          <p>If you see text below, lucide-react is NOT loading:</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
            {typeof window !== 'undefined' && (
              <>
                <span>👁️ Eye icon should appear here</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginTop: '20px', border: '1px solid #ffc107' }}>
        <h3 style={{ color: '#856404', marginBottom: '10px' }}>⚠️ Expected Results:</h3>
        <ul style={{ color: '#856404', lineHeight: '1.8' }}>
          <li><strong>NEXT_PUBLIC_SUPABASE_URL</strong> should be: https://cksukpgjkuarktbohseh.supabase.co</li>
          <li><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> should show YES (length: ~300+)</li>
          <li><strong>Both buttons</strong> should show champagne/blush gradient (peachy-pink)</li>
          <li><strong>Timestamp</strong> should match current time</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #bee5eb' }}>
        <p style={{ color: '#0c5460', margin: 0 }}>
          <strong>Instructions:</strong> Take a screenshot of this page and share what you see. This will help diagnose if it's an env var issue, CSS issue, or deployment issue.
        </p>
      </div>
    </div>
  );
}
