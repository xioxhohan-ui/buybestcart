'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  Smartphone,
  Monitor,
  Share2,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import {
  evaluateMetadataHealth,
  checkDuplicateMetadata,
  MetadataHealthScore,
  CANONICAL_BASE,
} from '@/lib/metadata';
import { validateCanonicalUrl, getCanonicalUrl, cleanPath } from '@/lib/canonical';

interface SeoMetadataEditorProps {
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (val: string) => void;
  canonicalUrl?: string;
  onCanonicalUrlChange?: (val: string) => void;
  ogImage?: string;
  onOgImageChange?: (val: string) => void;
  rawEntityTitle: string;
  slug: string;
  pathPrefix: 'products' | 'category' | 'guides' | 'compare';
  tableName: 'products' | 'categories' | 'articles' | 'comparisons';
  currentId?: string;
  onAutoGenerate?: () => void;
}

export default function SeoMetadataEditor({
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  canonicalUrl = '',
  onCanonicalUrlChange,
  ogImage = '',
  onOgImageChange,
  rawEntityTitle,
  slug,
  pathPrefix,
  tableName,
  currentId,
  onAutoGenerate,
}: SeoMetadataEditorProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewTab, setActivePreviewTab] = useState<'serp' | 'social'>('serp');
  const [health, setHealth] = useState<MetadataHealthScore>(() =>
    evaluateMetadataHealth(seoTitle || rawEntityTitle, seoDescription)
  );
  const [isCheckingDup, setIsCheckingDup] = useState(false);
  const [duplicateTitleWarning, setDuplicateTitleWarning] = useState<string | null>(null);
  const [duplicateDescWarning, setDuplicateDescWarning] = useState<string | null>(null);
  const [canonicalWarning, setCanonicalWarning] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const displayTitle = (seoTitle || rawEntityTitle || 'Untitled Document').trim();
  const displayDesc =
    (seoDescription || 'Discover in-depth laboratory benchmarks, tested specifications, and verified Amazon pricing on Buy Best Cart.').trim();
  const targetCanonical = canonicalUrl || getCanonicalUrl(pathPrefix === 'guides' ? 'guide' : pathPrefix === 'products' ? 'product' : pathPrefix === 'category' ? 'category' : 'comparison', slug || 'example-slug');

  // Evaluate health and check duplicate on change
  useEffect(() => {
    const h = evaluateMetadataHealth(displayTitle, displayDesc);
    setHealth(h);

    if (canonicalUrl) {
      const validation = validateCanonicalUrl(canonicalUrl);
      if (!validation.isValid) {
        setCanonicalWarning(validation.errors[0]);
      } else {
        setCanonicalWarning(null);
      }
    } else {
      setCanonicalWarning(null);
    }

    const timer = setTimeout(async () => {
      if (displayTitle.length > 5) {
        setIsCheckingDup(true);
        const dupResult = await checkDuplicateMetadata(displayTitle, displayDesc, tableName, currentId);
        setIsCheckingDup(false);
        setDuplicateTitleWarning(dupResult.titleDuplicate.isDuplicate ? `Exact title already in use by item ID ${dupResult.titleDuplicate.conflictId?.slice(0, 8)}...` : null);
        setDuplicateDescWarning(dupResult.descDuplicate.isDuplicate ? `Exact description already in use by another ${tableName.slice(0, -1)}.` : null);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [seoTitle, rawEntityTitle, seoDescription, canonicalUrl, tableName, currentId]);

  const getStatusColor = (status: 'good' | 'too_short' | 'too_long' | 'missing') => {
    switch (status) {
      case 'good':
        return 'var(--green-accent)';
      case 'too_short':
        return 'var(--amber-deal)';
      case 'too_long':
      case 'missing':
        return '#DC2626';
    }
  };

  const copyCanonical = () => {
    navigator.clipboard.writeText(targetCanonical);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--green-accent)" />
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Unique SEO Metadata &amp; SERP Studio
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time Google search snippet &amp; OpenGraph social card optimizer
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onAutoGenerate && (
            <button
              type="button"
              onClick={onAutoGenerate}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              title="Automatically synthesize optimized title and description from actual item data"
            >
              <RefreshCw size={12} />
              <span>Auto-Synthesize</span>
            </button>
          )}

          <div style={{ display: 'inline-flex', background: 'var(--bg-main)', padding: '0.15rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setActivePreviewTab('serp')}
              style={{
                background: activePreviewTab === 'serp' ? 'var(--bg-surface)' : 'none',
                border: 'none',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: activePreviewTab === 'serp' ? 700 : 500,
                borderRadius: '3px',
                cursor: 'pointer',
                color: activePreviewTab === 'serp' ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Globe size={12} />
              <span>Google SERP</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab('social')}
              style={{
                background: activePreviewTab === 'social' ? 'var(--bg-surface)' : 'none',
                border: 'none',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: activePreviewTab === 'social' ? 700 : 500,
                borderRadius: '3px',
                cursor: 'pointer',
                color: activePreviewTab === 'social' ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Share2 size={12} />
              <span>Social Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Warnings */}
      {(duplicateTitleWarning || duplicateDescWarning) && (
        <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', color: '#DC2626', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {duplicateTitleWarning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              <span><strong>Duplicate Title Warning:</strong> {duplicateTitleWarning}</span>
            </div>
          )}
          {duplicateDescWarning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              <span><strong>Duplicate Description Warning:</strong> {duplicateDescWarning}</span>
            </div>
          )}
        </div>
      )}

      {/* Live Preview Box */}
      <div
        style={{
          background: activePreviewTab === 'serp' ? '#FFFFFF' : '#111827',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}
      >
        {activePreviewTab === 'serp' ? (
          <div>
            {/* Device Switcher */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
              <div style={{ display: 'inline-flex', background: '#F3F4F6', padding: '0.15rem', borderRadius: '4px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    background: previewDevice === 'desktop' ? '#FFFFFF' : 'none',
                    border: 'none',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.7rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: previewDevice === 'desktop' ? '#111827' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Monitor size={11} />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    background: previewDevice === 'mobile' ? '#FFFFFF' : 'none',
                    border: 'none',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.7rem',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: previewDevice === 'mobile' ? '#111827' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <Smartphone size={11} />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Google SERP Card */}
            <div style={{ maxWidth: previewDevice === 'mobile' ? '380px' : '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#202124', marginBottom: '0.2rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--green-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: '9px', fontWeight: 800 }}>
                  B
                </div>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 600 }}>Buy Best Cart</span>
                  <span style={{ color: '#5f6368', margin: '0 4px' }}>›</span>
                  <span style={{ color: '#5f6368' }}>{pathPrefix} › {slug || 'item'}</span>
                </div>
              </div>

              <h4
                style={{
                  fontSize: previewDevice === 'mobile' ? '1rem' : '1.1875rem',
                  lineHeight: 1.3,
                  fontWeight: 400,
                  color: '#1a0dab',
                  margin: '0 0 0.3rem 0',
                  fontFamily: 'arial, sans-serif',
                  cursor: 'pointer',
                }}
              >
                {displayTitle}
              </h4>

              <p
                style={{
                  fontSize: '0.8125rem',
                  lineHeight: 1.55,
                  color: '#4d5156',
                  margin: 0,
                  fontFamily: 'arial, sans-serif',
                }}
              >
                {displayDesc}
              </p>
            </div>
          </div>
        ) : (
          /* Social Open Graph Card */
          <div style={{ maxWidth: '480px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #374151', background: '#1F2937' }}>
            <div style={{ height: '180px', background: '#111827', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {ogImage ? (
                <img src={ogImage} alt="OG Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                  <ImageIcon size={28} />
                  <span>Default Social Share Image (1200 x 630)</span>
                </div>
              )}
            </div>
            <div style={{ padding: '0.875rem 1rem' }}>
              <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
                buybestcart.shop
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F9FAFB', lineHeight: 1.3, marginBottom: '0.35rem' }}>
                {displayTitle}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D1D5DB', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {displayDesc}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* SEO Title Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Custom SEO Title Tag
            </label>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getStatusColor(health.titleStatus) }}>
              {health.titleLength} / 60 chars ({health.titleStatus.replace('_', ' ')})
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder={rawEntityTitle ? `${rawEntityTitle} Review | Buy Best Cart` : 'Enter custom SEO title...'}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${health.titleStatus === 'good' ? 'var(--green-border)' : health.titleStatus === 'too_long' ? '#DC2626' : 'var(--border-strong)'}`,
              fontSize: '0.875rem',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
            {health.titleFeedback}
          </span>
        </div>

        {/* Meta Description Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Meta Description (Search Snippet)
            </label>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getStatusColor(health.descStatus) }}>
              {health.descLength} / 160 chars ({health.descStatus.replace('_', ' ')})
            </span>
          </div>
          <textarea
            rows={3}
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            placeholder="Enter informative, non-keyword-stuffed description based on actual product specs and review findings..."
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${health.descStatus === 'good' ? 'var(--green-border)' : health.descStatus === 'too_long' ? '#DC2626' : 'var(--border-strong)'}`,
              fontSize: '0.8125rem',
              lineHeight: 1.45,
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
            {health.descFeedback}
          </span>
        </div>

        {/* Canonical Override & Social Image */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {onCanonicalUrlChange && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Canonical URL (Default: Clean Permanent URL)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => onCanonicalUrlChange(e.target.value)}
                  placeholder={targetCanonical}
                  style={{
                    width: '100%',
                    padding: '0.45rem 2.2rem 0.45rem 0.65rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border)',
                  }}
                />
                <button
                  type="button"
                  onClick={copyCanonical}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedUrl ? 'var(--green-accent)' : 'var(--text-muted)',
                    padding: '2px',
                  }}
                  title="Copy Canonical URL"
                >
                  {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
              {canonicalWarning ? (
                <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} /> {canonicalWarning}
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Auto-defaults to clean HTTPS permanent URL without query parameters.
                </span>
              )}
            </div>
          )}

          {onOgImageChange && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Social Share Image (OG:Image Override)
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => onOgImageChange(e.target.value)}
                placeholder="https://images.unsplash.com/... or /og-image.png"
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
