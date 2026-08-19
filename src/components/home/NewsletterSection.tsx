'use client';

import React, { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="container" style={{ margin: '4rem auto' }}>
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '3.5rem 3rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(280px, 1fr)',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="editorial-eyebrow">THE WEEKLY DISPATCH</div>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
            Get The Best Buy Cart Edit.
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
              }}
            >
              ✓ Thank you! You&apos;re subscribed to The Weekly Shopping Edit.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '0.85rem 1.25rem',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FAF9F6',
                    fontSize: '0.9375rem',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="btn btn-primary btn-lg">
                  Subscribe →
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
