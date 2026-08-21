'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage_newsletter_box' }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
      } else {
        setErrorMsg(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container" style={{ margin: '4rem auto' }}>
      <div
        className="newsletter-grid"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3.5rem 3rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="editorial-eyebrow">THE WEEKLY DISPATCH</div>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
            Get The Buy Best Cart Edit.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65 }}>
            Join 45,000+ smart shoppers. We curate the week&apos;s best tech discounts, newly benchmarked gear, and honest buying advice every Thursday morning.
          </p>
        </div>

        <div>
          {subscribed ? (
            <div
              style={{
                background: 'var(--green-light)',
                border: '1px solid var(--green-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.5rem',
                color: 'var(--green-accent)',
                fontWeight: 700,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={20} />
              <span>✓ Thank you! You&apos;re subscribed to The Weekly Shopping Edit.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    minWidth: '0',
                    padding: '0.85rem 1.25rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FAF9F6',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : null}
                  <span>{loading ? 'Subscribing...' : 'Subscribe →'}</span>
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No spam, ever. Unsubscribe at any time with one click.
              </span>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
