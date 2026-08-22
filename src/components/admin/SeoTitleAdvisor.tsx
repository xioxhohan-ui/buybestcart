'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Eye, Smartphone, Monitor } from 'lucide-react';
import { evaluateSeoTitle, optimizeSeoTitle } from '@/lib/seo';

interface SeoTitleAdvisorProps {
  title: string;
  onChange: (newTitle: string) => void;
  rawEntityTitle?: string;
  slug?: string;
  pathPrefix?: string;
  description?: string;
  onDescriptionChange?: (newDesc: string) => void;
}

export default function SeoTitleAdvisor({
  title,
  onChange,
  rawEntityTitle = '',
  slug = '',
  pathPrefix = 'guides',
  description = '',
  onDescriptionChange,
}: SeoTitleAdvisorProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const evaluation = evaluateSeoTitle(title, rawEntityTitle);
  const recommended = optimizeSeoTitle(rawEntityTitle || title);

  const previewUrl = `https://buybestcart.shop/${pathPrefix ? `${pathPrefix}/` : ''}${slug || 'example-slug'}`;
  const displayTitle = title.trim() || rawEntityTitle.trim() || 'Untitled Page';
  const displayDescription =
    description.trim() ||
    'Discover in-depth editorial analysis, verified technical specifications, laboratory benchmarks, and real-time Amazon pricing on Buy Best Cart.';

  const descLength = description.length;
  const descStatus = descLength >= 120 && descLength <= 160 ? 'good' : descLength > 160 ? 'too_long' : 'short';

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginTop: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--green-accent)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            SEO Title &amp; Google SERP Optimizer
          </h3>
        </div>

        {/* Live Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {evaluation.status === 'good' ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(27, 67, 50, 0.1)',
                color: 'var(--green-accent)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid var(--green-border)',
              }}
            >
              <CheckCircle2 size={12} />
              <span>Good ({evaluation.length} / 60 chars)</span>
            </span>
          ) : evaluation.status === 'too_long' ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(220, 38, 38, 0.1)',
                color: '#DC2626',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(220, 38, 38, 0.3)',
              }}
            >
              <AlertCircle size={12} />
              <span>Too Long ({evaluation.length} / 60 chars)</span>
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(217, 119, 6, 0.1)',
                color: '#D97706',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(217, 119, 6, 0.3)',
              }}
            >
              <AlertTriangle size={12} />
              <span>Short ({evaluation.length} / 60 chars)</span>
            </span>
          )}
        </div>
      </div>

      {/* SEO Title Input Field */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Custom SEO Title Tag
          </label>
          <span style={{ fontSize: '0.75rem', color: evaluation.status === 'too_long' ? '#DC2626' : 'var(--text-muted)' }}>
            {title.length} characters (Ideal: 45–60)
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder={recommended || 'Enter search-engine title tag...'}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            fontSize: '0.875rem',
            border: `1px solid ${evaluation.status === 'too_long' ? '#DC2626' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
          {evaluation.feedback}
        </p>
      </div>

      {/* AI / Smart Recommendation Banner */}
      {recommended && recommended !== title && (
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-accent)', marginBottom: '0.2rem' }}>
              Recommended Optimal Title ({recommended.length} chars)
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {recommended}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(recommended)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={12} />
            <span>Apply Recommendation</span>
          </button>
        </div>
      )}

      {/* Optional Meta Description Editor */}
      {onDescriptionChange !== undefined && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Meta Description (Search Snippet)
            </label>
            <span style={{ fontSize: '0.75rem', color: descStatus === 'too_long' ? '#DC2626' : 'var(--text-muted)' }}>
              {descLength} characters (Ideal: 140–160)
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={2}
            placeholder="Compelling 140-160 character summary for search engine snippet..."
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              fontSize: '0.8125rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>
      )}

      {/* Live Google SERP Search Result Preview Box */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Eye size={12} />
            <span>Live Google Search Result Preview</span>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              style={{
                background: previewDevice === 'desktop' ? 'var(--bg-subtle)' : 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.2rem 0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.6875rem',
                color: 'var(--text-primary)',
              }}
            >
              <Monitor size={11} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              style={{
                background: previewDevice === 'mobile' ? 'var(--bg-subtle)' : 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.2rem 0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.6875rem',
                color: 'var(--text-primary)',
              }}
            >
              <Smartphone size={11} />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Real Google SERP Mockup Box */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '1.25rem',
            maxWidth: previewDevice === 'mobile' ? '380px' : '600px',
            fontFamily: 'arial, sans-serif',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          {/* Site Origin & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#1B4332',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              B
            </div>
            <div style={{ fontSize: '12px', color: '#202124', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600 }}>Buy Best Cart</div>
              <div style={{ fontSize: '11px', color: '#4D5156', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                {previewUrl}
              </div>
            </div>
          </div>

          {/* Blue SERP Clickable Headline */}
          <div
            style={{
              fontSize: previewDevice === 'mobile' ? '17px' : '19px',
              lineHeight: 1.3,
              color: '#1A0DAB',
              fontWeight: 400,
              cursor: 'pointer',
              marginBottom: '0.35rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {displayTitle}
          </div>

          {/* Gray Snippet */}
          <div
            style={{
              fontSize: '13px',
              lineHeight: 1.45,
              color: '#4D5156',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: previewDevice === 'mobile' ? 3 : 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {displayDescription}
          </div>
        </div>
      </div>
    </div>
  );
}
