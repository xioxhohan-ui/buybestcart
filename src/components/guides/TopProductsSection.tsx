'use client';

import React from 'react';
import Link from 'next/link';
import { TopProductItem } from '@/types';
import { Award, Star, Check, X, ShieldCheck, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import PriceDisplay from '@/components/common/PriceDisplay';
import AffiliateCTA from '@/components/products/AffiliateCTA';

interface TopProductsSectionProps {
  products: TopProductItem[];
  title?: string;
  subtitle?: string;
}

export default function TopProductsSection({
  products = [],
  title = '2. Our Top Recommended Picks for 2026',
  subtitle = 'Independently tested, ranked, and verified by our editorial lab staff.',
}: TopProductsSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Sort by position (1, 2, 3...)
  const sortedProducts = [...products].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <section style={{ margin: '3.5rem 0' }}>
      {/* Section Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-light)', border: '1px solid var(--green-border)', color: 'var(--green-deep)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Sparkles size={12} />
          <span>Top {sortedProducts.length} Ranked Picks</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '720px' }}>
          {subtitle}
        </p>
      </div>

      {/* Quick Summary Navigation Bar (For Quick Jump & Scan) */}
      {sortedProducts.length >= 3 && (
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Quick Comparison &amp; Jump Navigation
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {sortedProducts.map((item, idx) => (
              <a
                key={item.id || idx}
                href={`#top-pick-${item.position || idx + 1}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                }}
                className="hover:border-green-accent hover:shadow-sm"
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: (item.position || idx + 1) === 1 ? 'var(--green-accent)' : 'var(--bg-subtle)',
                    color: (item.position || idx + 1) === 1 ? '#FFF' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  #{item.position || idx + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--green-accent)', fontWeight: 800 }}>
                    {item.badge || 'Top Pick'}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Numbered Product Review Cards (#1, #2, #3...) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
        {sortedProducts.map((p, idx) => {
          const rankNum = p.position || idx + 1;
          const isTopPick = rankNum === 1;

          const productLink = p.product_slug
            ? `/products/${p.product_slug}`
            : p.affiliate_url || (p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20');

          const isExternal = !p.product_slug;

          return (
            <div
              key={p.id || idx}
              id={`top-pick-${rankNum}`}
              style={{
                background: 'var(--bg-surface)',
                border: isTopPick ? '2px solid var(--green-accent)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: isTopPick ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Top Banner Ribbon */}
              <div
                style={{
                  background: isTopPick ? 'var(--green-accent)' : 'var(--bg-subtle)',
                  color: isTopPick ? '#FFF' : 'var(--text-primary)',
                  padding: '0.6rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isTopPick ? '#FFF' : 'var(--green-accent)',
                      color: isTopPick ? 'var(--green-deep)' : '#FFF',
                      fontSize: '0.8125rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    #{rankNum}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {p.badge || (rankNum === 1 ? 'Best Overall' : rankNum === 2 ? 'Top Runner-Up' : rankNum === 3 ? 'Best Budget' : `Top Pick #${rankNum}`)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {p.rating && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 800, color: isTopPick ? '#FFF' : 'var(--amber-deal)' }}>
                      <Star size={13} fill="currentColor" />
                      <span>{p.rating} / 5.0</span>
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>
                    Editorial Lab Tested
                  </span>
                </div>
              </div>

              {/* Main Product Card Body */}
              <div className="top-product-card-body" style={{ padding: '1.5rem', gap: '1.75rem', alignItems: 'start' }}>
                {/* Product Thumbnail & Quick Actions */}
                <div style={{ textAlign: 'center' }}>
                  {isExternal ? (
                    <a
                      href={productLink}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div
                        style={{
                          background: '#FAF9F6',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '180px',
                        }}
                      >
                        <img
                          src={p.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70'}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          width={180}
                          height={180}
                          style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </a>
                  ) : (
                    <Link href={productLink} style={{ textDecoration: 'none', display: 'block' }}>
                      <div
                        style={{
                          background: '#FAF9F6',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '180px',
                        }}
                      >
                        <img
                          src={p.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70'}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          width={180}
                          height={180}
                          style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </Link>
                  )}

                  {p.product_slug && (
                    <Link
                      href={`/products/${p.product_slug}`}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>Read Lab Review</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>

                {/* Content & Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    {/* CLICKABLE PRODUCT NAME */}
                    {isExternal ? (
                      <a
                        href={productLink}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        style={{ textDecoration: 'none' }}
                      >
                        <h3
                          style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3, cursor: 'pointer' }}
                          className="hover:text-green-accent transition-colors"
                        >
                          {p.title}
                        </h3>
                      </a>
                    ) : (
                      <Link href={productLink} style={{ textDecoration: 'none' }}>
                        <h3
                          style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3, cursor: 'pointer' }}
                          className="hover:text-green-accent transition-colors"
                        >
                          {p.title}
                        </h3>
                      </Link>
                    )}

                    {/* Verification Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--green-accent)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldCheck size={13} />
                        <span>Verified Amazon Merchant</span>
                      </span>
                    </div>

                    {/* Editorial Description */}
                    {p.short_description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {p.short_description}
                      </p>
                    )}
                  </div>

                  {/* Highlights Bullet List */}
                  {p.highlights && p.highlights.length > 0 && (
                    <div style={{ background: 'var(--bg-subtle)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        Key Performance Highlights
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {p.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pros & Cons */}
                  {(p.pros?.length || p.cons?.length) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      {p.pros && p.pros.length > 0 && (
                        <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-xs)', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-deep)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Check size={12} /> <span>Why We Love It</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {p.pros.map((pro, proIdx) => (
                              <li key={proIdx}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {p.cons && p.cons.length > 0 && (
                        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 'var(--radius-xs)', padding: '0.75rem' }}>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#9F1239', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <X size={12} /> <span>Things to Keep in Mind</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {p.cons.map((con, conIdx) => (
                              <li key={conIdx}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* CTA Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {p.product_slug ? (
                      <AffiliateCTA
                        productSlug={p.product_slug}
                        asin={p.asin}
                        affiliateUrl={p.affiliate_url}
                        label={p.cta_text || 'Buy on Amazon'}
                        size="md"
                      />
                    ) : (
                      <a
                        href={p.affiliate_url || (p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20')}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        className="btn btn-amazon"
                      >
                        <span>{p.cta_text || 'Check Price on Amazon'}</span>
                        <span style={{ fontSize: '0.85rem' }}>↗</span>
                      </a>
                    )}

                    {p.product_slug && (
                      <Link href={`/products/${p.product_slug}`} className="btn btn-secondary btn-sm">
                        Full Product Breakdown
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
