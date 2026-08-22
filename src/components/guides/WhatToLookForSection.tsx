'use client';

import React from 'react';
import { WhatToLookForData } from '@/types';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface WhatToLookForSectionProps {
  data?: WhatToLookForData;
  title?: string;
  subtitle?: string;
}

export default function WhatToLookForSection({
  data,
  title = "5. What to Look For: Buyer's Guide",
  subtitle = 'Critical technical and ergonomic factors to evaluate before making your purchase.',
}: WhatToLookForSectionProps) {
  if (!data || data.enabled === false) {
    return null;
  }

  const hasFactors = data.factors && data.factors.length > 0;
  const hasAdvice = Boolean(data.additional_advice || data.summary);

  if (!hasFactors && !hasAdvice) {
    return null;
  }

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
          background: 'linear-gradient(90deg, #F59E0B 0%, var(--green-accent) 100%)',
        }}
      />

      {/* Section Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#B45309', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Compass size={13} />
          <span>Buying Advice &amp; Decision Matrix</span>
        </div>

        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {data.title || title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '780px' }}>
          {data.summary || subtitle}
        </p>
      </div>

      {/* Factors Grid */}
      {hasFactors && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {data.factors?.map((factor, fIdx) => {
            const importance = factor.importance || 'important';
            const importanceColor =
              importance === 'critical'
                ? { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', label: 'Critical Factor' }
                : importance === 'important'
                ? { bg: 'var(--green-light)', text: 'var(--green-deep)', border: 'var(--green-border)', label: 'Important' }
                : { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: 'Nice to Have' };

            return (
              <div
                key={fIdx}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                    {factor.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-xs)',
                      background: importanceColor.bg,
                      color: importanceColor.text,
                      border: `1px solid ${importanceColor.border}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {importanceColor.label}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional Expert Advice Box */}
      {data.additional_advice && (
        <div
          style={{
            background: 'var(--green-light)',
            border: '1px solid var(--green-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#FFF',
              border: '1px solid var(--green-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--green-accent)',
              flexShrink: 0,
            }}
          >
            <Lightbulb size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--green-deep)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Lab Expert Recommendation &amp; Buying Strategy
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {data.additional_advice.split('\n').filter((p) => p.trim()).map((para, pIdx) => (
                <p key={pIdx} style={{ margin: pIdx === 0 ? 0 : '0.5rem 0 0 0' }}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
