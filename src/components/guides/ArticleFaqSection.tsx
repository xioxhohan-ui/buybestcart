'use client';

import React, { useState } from 'react';
import { ArticleFaqItem } from '@/types';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ArticleFaqSectionProps {
  faqs?: ArticleFaqItem[];
  title?: string;
  subtitle?: string;
}

export default function ArticleFaqSection({
  faqs = [],
  title = '6. Frequently Asked Questions',
  subtitle = 'Expert answers to the most common questions buyers ask when researching this category.',
}: ArticleFaqSectionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]); // Open first item by default

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <section
      style={{
        margin: '4.5rem 0',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-2xl)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #3B82F6 0%, var(--green-accent) 100%)',
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#2563EB', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <HelpCircle size={13} />
          <span>Buyer FAQ &amp; Guidance</span>
        </div>

        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '780px' }}>
          {subtitle}
        </p>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);

          return (
            <div
              key={idx}
              style={{
                border: isOpen ? '1px solid var(--green-accent)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: isOpen ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                overflow: 'hidden',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Question Header button */}
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                style={{
                  width: '100%',
                  padding: '1.125rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isOpen ? 'var(--green-accent)' : 'var(--border)',
                      color: isOpen ? '#FFF' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    Q{idx + 1}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    {faq.question}
                  </span>
                </div>

                <div style={{ color: isOpen ? 'var(--green-accent)' : 'var(--text-muted)', flexShrink: 0 }}>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {/* Answer Body */}
              {isOpen && (
                <div
                  style={{
                    padding: '0 1.5rem 1.25rem 3.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '-0.25rem',
                    paddingTop: '1rem',
                  }}
                >
                  <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
