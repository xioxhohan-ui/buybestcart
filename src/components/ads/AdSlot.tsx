'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Clock, ShieldCheck } from 'lucide-react';

export type AdSlotType =
  | 'leaderboard'
  | 'billboard'
  | 'sidebar-medium'
  | 'sidebar-halfpage'
  | 'mobile-banner'
  | 'mobile-large'
  | 'inline'
  | 'between-content';

interface AdSlotProps {
  type: AdSlotType;
  sponsorName?: string;
  headline?: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSlot({
  type,
  sponsorName = 'Featured Partner',
  headline = 'Curated Editorial Spotlight',
  subline = 'Explore certified merchant deals verified with authentic buyer ratings.',
  ctaText = 'Learn More ↗',
  ctaLink = '/deals',
  className = '',
  style = {},
}: AdSlotProps) {
  const AdLabel = () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.35rem 0.85rem',
        background: '#F5F3EC',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.625rem',
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}
    >
      <span>ADVERTISEMENT</span>
      <span>SPONSORED BY {sponsorName.toUpperCase()}</span>
    </div>
  );

  // 1. Leaderboard & Billboard
  if (type === 'leaderboard' || type === 'billboard') {
    return (
      <div
        className={`ad-slot-leaderboard ${className}`}
        style={{
          width: '100%',
          maxWidth: type === 'billboard' ? '970px' : 'var(--max-width)',
          margin: '2.5rem auto',
          ...style,
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <AdLabel />
          <div
            style={{
              padding: type === 'billboard' ? '2rem 2.5rem' : '1.25rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              background: 'linear-gradient(135deg, #FAF9F5 0%, #F5F3EC 100%)',
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <Sparkles size={11} color="var(--green-accent)" />
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  SEASONAL PROMOTION
                </span>
              </div>
              <h4 style={{ fontSize: type === 'billboard' ? '1.5rem' : '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {headline}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {subline}
              </p>
            </div>
            <div>
              <Link href={ctaLink} className="btn btn-amazon btn-sm" style={{ padding: '0.65rem 1.25rem' }}>
                {ctaText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Sidebar Medium (300x250)
  if (type === 'sidebar-medium') {
    return (
      <div
        className={`ad-slot-sidebar-medium ${className}`}
        style={{
          width: '100%',
          maxWidth: '320px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          margin: '1.5rem 0',
          ...style,
        }}
      >
        <AdLabel />
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Clock size={11} color="var(--amber-deal)" />
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--amber-deal)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              LIMITED TIME
            </span>
          </div>
          <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {headline}
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {subline}
          </p>
          <Link href={ctaLink} className="btn btn-amazon btn-sm" style={{ width: '100%' }}>
            {ctaText}
          </Link>
        </div>
      </div>
    );
  }

  // 3. Sidebar Halfpage (300x600)
  if (type === 'sidebar-halfpage') {
    return (
      <div
        className={`ad-slot-sidebar-halfpage ${className}`}
        style={{
          width: '100%',
          maxWidth: '320px',
          minHeight: '480px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          margin: '1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          ...style,
        }}
      >
        <AdLabel />
        <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', textAlign: 'center', background: 'linear-gradient(180deg, #FAF9F5 0%, #F5F3EC 100%)' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={12} color="var(--green-accent)" />
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                CERTIFIED STORE
              </span>
            </div>
            <h4 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {headline}
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {subline}
            </p>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Link href={ctaLink} className="btn btn-amazon" style={{ width: '100%' }}>
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default: Between Content Responsive Banner
  return (
    <div
      className={`ad-slot-between-content ${className}`}
      style={{
        width: '100%',
        maxWidth: 'var(--max-width)',
        margin: '3.5rem auto',
        padding: '0 1.5rem',
        ...style,
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <AdLabel />
        <div
          style={{
            padding: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1.4fr) minmax(200px, 0.6fr)',
            gap: '2rem',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #FAF9F5 0%, #F5F3EC 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={12} color="var(--green-accent)" />
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                VERIFIED MERCHANT PROMOTION
              </span>
            </div>
            <h3 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {headline}
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {subline}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Link href={ctaLink} className="btn btn-amazon btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
