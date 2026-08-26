'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/auth', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            const returnUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('returnUrl') : null;
            const validReturn = returnUrl && returnUrl.startsWith('/shohan') && returnUrl !== '/shohan' ? returnUrl : '/shohan/dashboard';
            router.replace(validReturn);
            return;
          }
        }
      } catch {
        // Continue to login screen
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('bbc_admin_auth', data.token);
        }
        const returnUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('returnUrl') : null;
        const validReturn = returnUrl && returnUrl.startsWith('/shohan') && returnUrl !== '/shohan' ? returnUrl : '/shohan/dashboard';
        router.push(validReturn);
      } else {
        setError(data.error || 'Invalid administrator credentials.');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
        }}
      >
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0B0F17',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#131B2A',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          padding: '2.5rem 2rem',
          border: '1px solid #1E293B',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
            }}
          >
            <ShieldCheck size={26} color="#FFFFFF" />
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '0.35rem',
              letterSpacing: '-0.02em',
            }}
          >
            Buy Best Cart
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.8125rem', margin: 0 }}>
            Editorial Administration System
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#CBD5E1',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              Security Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  display: 'flex',
                }}
              >
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'opacity 0.15s ease',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.6875rem', color: '#475569' }}>
          Authorized Personnel Only • IP &amp; Session Activity Logged
        </div>
      </div>
    </div>
  );
}
