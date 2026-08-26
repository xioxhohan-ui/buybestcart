'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: 'Editorial Correction', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit message. Please try again.');
      }
    } catch {
      setErrorMessage('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ background: 'var(--success-light)', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <CheckCircle2 size={48} color="var(--success)" />
        </div>
        <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Message Received!</h2>
        <p style={{ color: '#166534', fontSize: '0.9375rem' }}>
          Thank you for reaching out. Our editorial team will review your inquiry and respond to <strong>{form.email}</strong> within 1-2 business days.
        </p>
      </div>
    );
  }

  return (
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
      {errorMessage && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

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
            fontSize: '0.875rem',
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
            fontSize: '0.875rem',
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
            fontSize: '0.875rem',
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
            fontSize: '0.875rem',
            resize: 'vertical',
          }}
          placeholder="How can we help you?"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center', gap: '0.5rem' }}>
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
