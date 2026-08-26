'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Sparkles, CheckCircle2, AlertTriangle, AlertCircle, Copy, Check } from 'lucide-react';
import { generateCleanSlug, validateSlug, checkSlugCollision, SlugValidationResult } from '@/lib/urls';

interface SlugUrlAdvisorProps {
  slug: string;
  sourceTitle: string;
  routePrefix: '/products' | '/category' | '/guides' | '/compare';
  tableName: 'products' | 'categories' | 'articles' | 'comparisons';
  currentId?: string;
  onChange: (newSlug: string) => void;
}

export default function SlugUrlAdvisor({
  slug,
  sourceTitle,
  routePrefix,
  tableName,
  currentId,
  onChange,
}: SlugUrlAdvisorProps) {
  const [validation, setValidation] = useState<SlugValidationResult>(() =>
    validateSlug(slug, routePrefix)
  );
  const [isCheckingCollision, setIsCheckingCollision] = useState(false);
  const [collisionError, setCollisionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const res = validateSlug(slug, routePrefix);
    setValidation(res);

    if (res.isValid && slug) {
      const timer = setTimeout(async () => {
        setIsCheckingCollision(true);
        const { isAvailable, conflictMessage } = await checkSlugCollision(
          slug,
          tableName,
          currentId
        );
        setIsCheckingCollision(false);
        setCollisionError(isAvailable ? null : conflictMessage || 'Slug collision detected');
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setCollisionError(null);
    }
  }, [slug, routePrefix, tableName, currentId]);

  const handleAutoGenerate = () => {
    if (!sourceTitle) return;
    const clean = generateCleanSlug(sourceTitle);
    onChange(clean);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(validation.canonicalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasErrors = validation.errors.length > 0 || Boolean(collisionError);
  const hasWarnings = validation.warnings.length > 0;

  return (
    <div
      style={{
        marginTop: '0.5rem',
        marginBottom: '1rem',
        padding: '0.875rem 1rem',
        background: hasErrors ? 'rgba(239, 68, 68, 0.04)' : '#FAF9F6',
        border: `1px solid ${hasErrors ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <Globe size={13} color="var(--primary)" />
          <span>SEO Canonical URL Preview</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {sourceTitle && (
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                height: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              title="Generate clean lowercase SEO slug from title"
            >
              <Sparkles size={11} />
              <span>Auto-Slug</span>
            </button>
          )}

          {validation.isValid && !collisionError ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={13} />
              <span>Clean Canonical</span>
            </span>
          ) : hasErrors ? (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={13} />
              <span>Invalid URL</span>
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--amber-deal)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle size={13} />
              <span>Notice</span>
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '0.45rem 0.75rem',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          fontFamily: 'monospace',
          fontSize: '0.8125rem',
          color: 'var(--primary)',
          wordBreak: 'break-all',
          gap: '0.5rem',
        }}
      >
        <span>{validation.canonicalUrl}</span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.2rem',
            color: copied ? 'var(--green-accent)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          title="Copy Canonical URL"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Errors & Collision warnings */}
      {hasErrors && (
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#DC2626' }}>
          {collisionError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={12} style={{ flexShrink: 0 }} />
              <span>{collisionError}</span>
            </div>
          )}
          {validation.errors.map((err, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={12} style={{ flexShrink: 0 }} />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Soft Warnings */}
      {!hasErrors && hasWarnings && (
        <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--amber-deal)' }}>
          {validation.warnings.map((warn, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={12} style={{ flexShrink: 0 }} />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
