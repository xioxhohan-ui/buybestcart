'use client';

import React from 'react';
import Link from 'next/link';
import { TopProductItem } from '@/types';
import PriceDisplay from '@/components/common/PriceDisplay';
import {
  Trophy,
  ExternalLink,
  Award,
  Star,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface TopTenRankingSectionProps {
  products?: TopProductItem[];
  title?: string;
  subtitle?: string;
}

export default function TopTenRankingSection({
  products = [],
  title = 'Top 10 Product Ranking: Final Verdict',
  subtitle = 'Our laboratory-tested final ranking and definitive score summary for every top pick.',
}: TopTenRankingSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Clone and sort products by score descending (if scores exist) or position ascending
  const sorted = [...products].sort((a, b) => {
    if (a.score !== undefined && b.score !== undefined) {
      return b.score - a.score;
    }
    return (a.rank || a.position || 0) - (b.rank || b.position || 0);
  });

  // Limit to top 10 products
  const top10 = sorted.slice(0, 10);
  const row1 = top10.slice(0, 5); // Products #1 to #5
  const row2 = top10.slice(5, 10); // Products #6 to #10

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) {
      return {
        bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        color: '#FFF',
        border: '1px solid #B45309',
        label: '#1 Best Pick',
      };
    }
    if (rank === 2) {
      return {
        bg: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)',
        color: '#FFF',
        border: '1px solid #475569',
        label: '#2 Runner Up',
      };
    }
    if (rank === 3) {
      return {
        bg: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
        color: '#FFF',
        border: '1px solid #78350F',
        label: '#3 Bronze',
      };
    }
    return {
      bg: 'var(--bg-subtle)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      label: `#${rank}`,
    };
  };

  const renderProductCard = (product: TopProductItem, index: number, actualRank: number) => {
    const buyUrl = product.affiliate_url || product.buy_url || '#';
    const ctaText = product.cta_text || 'Buy on Amazon';
    const rankStyle = getRankBadgeStyle(actualRank);

    // Calculate score display
    const displayScore = product.score !== undefined ? product.score : (9.9 - (actualRank - 1) * 0.2).toFixed(1);
    const awardText = product.custom_award_label || product.award_label || product.badge || (actualRank === 1 ? 'Best Overall' : actualRank === 2 ? 'Best Value' : actualRank === 3 ? 'Best Premium' : `Top Pick #${actualRank}`);
    const reasonText = product.ranking_reason || product.best_for || product.short_description || `High-scoring recommendation with standout performance in our lab tests.`;

    const cardId = `top-rank-${actualRank}-${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return (
      <div
        key={product.id || index}
        id={cardId}
        style={{
          background: actualRank === 1 ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-surface) 100%)' : 'var(--bg-surface)',
          border: actualRank === 1 ? '2px solid #F59E0B' : '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem',
          position: 'relative',
          boxShadow: actualRank === 1 ? '0 10px 25px -5px rgba(245, 158, 11, 0.2)' : 'var(--shadow-sm)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Top Badges: Rank & Score */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: rankStyle.bg,
              color: rankStyle.color,
              border: rankStyle.border,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              letterSpacing: '0.02em',
            }}
          >
            {actualRank === 1 && <Trophy size={11} />}
            <span>{rankStyle.label}</span>
          </div>

          <div
            style={{
              background: 'var(--green-light)',
              color: 'var(--green-deep)',
              border: '1px solid var(--green-border)',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.6875rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            <Star size={10} fill="currentColor" />
            <span>{displayScore}/10</span>
          </div>
        </div>

        {/* Product Thumbnail */}
        <div
          style={{
            width: '100%',
            height: '140px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            padding: '0.5rem',
          }}
        >
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transition: 'transform 0.25s ease',
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              No Image
            </div>
          )}
        </div>

        {/* Award Pill */}
        <div>
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.6875rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: actualRank === 1 ? '#B45309' : 'var(--green-deep)',
              background: actualRank === 1 ? '#FEF3C7' : 'var(--green-light)',
              border: actualRank === 1 ? '1px solid #FDE68A' : '1px solid var(--green-border)',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '0.4rem',
              lineHeight: 1.2,
            }}
          >
            {awardText}
          </div>

          {/* Product Title */}
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              lineHeight: 1.35,
              margin: '0 0 0.4rem 0',
              color: 'var(--text-primary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              minHeight: '2.4em',
            }}
          >
            <a
              href={`#review-${actualRank}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
              title={product.title}
            >
              {product.title}
            </a>
          </h3>

          {/* Ranking Reason */}
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              minHeight: '2.9em',
            }}
            title={reasonText}
          >
            {reasonText}
          </p>
        </div>

        {/* Amazon CTA Button */}
        <a
          href={buyUrl}
          target="_blank"
          rel="nofollow noopener sponsored"
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.45rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            borderRadius: 'var(--radius-xs)',
            textDecoration: 'none',
          }}
        >
          <span>{ctaText}</span>
          <ExternalLink size={11} />
        </a>
      </div>
    );
  };

  return (
    <section
      className="top-ten-ranking-box"
      style={{
        margin: '4.5rem 0',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-2xl)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #F59E0B 0%, var(--green-accent) 50%, #3B82F6 100%)',
        }}
      />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#B45309', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Trophy size={13} />
          <span>Definitive Scoreboard &amp; Ranking Matrix</span>
        </div>

        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '780px' }}>
          {subtitle}
        </p>
      </div>

      {/* Row 1: Products #1 to #5 */}
      {row1.length > 0 && (
        <div style={{ marginBottom: row2.length > 0 ? '1.5rem' : 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Top Tier Contenders (#1 – #{row1.length})
          </div>
          <div className="top-ten-grid-row">
            {row1.map((product, idx) => renderProductCard(product, idx, idx + 1))}
          </div>
        </div>
      )}

      {/* Row 2: Products #6 to #10 */}
      {row2.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Highly Rated Alternatives (#6 – #{top10.length})
          </div>
          <div className="top-ten-grid-row">
            {row2.map((product, idx) => renderProductCard(product, idx, idx + 6))}
          </div>
        </div>
      )}
    </section>
  );
}
