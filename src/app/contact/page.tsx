'use client';

import React, { useState } from 'react';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      setSubmitted(true);
    }
  };

  const breadcrumbs = [{ name: 'Contact', url: '/contact' }];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem', maxWidth: '680px' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Contact Best Buy Cart</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
          Have a product question, editorial correction, or partnership inquiry? Reach out to our team.
        </p>
      </div>

      {submitted ? (
        <div style={{ background: 'var(--success-light)', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Message Received!</h2>
          <p style={{ color: '#166534' }}>
            Thank you for reaching out. Our editorial team will review your inquiry and respond to <strong>{form.email}</strong> within 1-2 business days.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              Your Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-main)',
              }}
              placeholder="Alex Smith"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-main)',
              }}
              placeholder="alex@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              Subject *
            </label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-main)',
              }}
            >
              <option value="Editorial Correction">Editorial Feedback or Correction</option>
              <option value="Product Suggestion">Suggest a Product to Review</option>
              <option value="Affiliate Question">Affiliate / Partnership Inquiry</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              Message *
            </label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-strong)',
                background: 'var(--bg-main)',
                resize: 'vertical',
              }}
              placeholder="How can we help you?"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
