'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopProductItem, ProductSpecItem } from '@/types';
import {
  Award,
  Star,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Video,
  Layers,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import PriceDisplay from '@/components/common/PriceDisplay';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import { formatAvailability } from '@/lib/productTemplate';
import VideoEmbed from '@/components/common/VideoEmbed';

interface DetailedProductReviewsSectionProps {
  products: TopProductItem[];
  title?: string;
  subtitle?: string;
}

export default function DetailedProductReviewsSection({
  products = [],
  title = '3. Detailed In-Depth Product Reviews',
  subtitle = 'Comprehensive analysis, lab benchmark scores, specifications, pros & cons, and buyer considerations for every ranked model.',
}: DetailedProductReviewsSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const sortedProducts = [...products].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <section style={{ margin: '4rem 0' }}>
      {/* Section Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-light)', border: '1px solid var(--green-border)', color: 'var(--green-deep)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Layers size={13} />
          <span>In-Depth Lab Breakdowns</span>
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '750px' }}>
          {subtitle}
        </p>
      </div>

      {/* Product Detailed Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        {sortedProducts.map((p, idx) => {
          const rankNum = p.position || idx + 1;
          const isTopPick = rankNum === 1;

          const productLink = p.product_slug
            ? `/products/${p.product_slug}`
            : p.affiliate_url || (p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20');

          const isExternal = !p.product_slug;
          const allImages = [p.thumbnail_url, ...(p.gallery_images || [])].filter(Boolean) as string[];

          return (
            <div
              key={p.id || idx}
              id={`review-${rankNum}`}
              style={{
                background: 'var(--bg-surface)',
                border: isTopPick ? '2px solid var(--green-accent)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: isTopPick ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              {/* Product Header Bar */}
              <div
                style={{
                  background: isTopPick ? 'var(--green-accent)' : 'var(--bg-subtle)',
                  color: isTopPick ? '#FFF' : 'var(--text-primary)',
                  padding: '0.875rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isTopPick ? '#FFF' : 'var(--green-accent)',
                      color: isTopPick ? 'var(--green-deep)' : '#FFF',
                      fontSize: '0.875rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    #{rankNum}
                  </span>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {p.badge || (rankNum === 1 ? 'Best Overall Pick' : `Top Pick #${rankNum}`)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  {p.rating && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 800, color: isTopPick ? '#FFF' : 'var(--amber-deal)' }}>
                      <Star size={14} fill="currentColor" />
                      <span>{p.rating} / 5.0</span>
                      {p.review_count && (
                        <span style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 600 }}>
                          ({p.review_count.toLocaleString()} reviews)
                        </span>
                      )}
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700 }}>
                    ● {formatAvailability(p.availability)}
                  </span>
                </div>
              </div>

              {/* Review Content Body */}
              <div className="detailed-review-card-body" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Title, Gallery & Quick Price Bar */}
                <div className="detailed-review-grid" style={{ gap: '2rem', alignItems: 'start' }}>
                  {/* Left: Gallery & Images */}
                  <ProductImageGallery images={allImages} title={p.title} />

                  {/* Right: Overview & Quick Buy Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      {isExternal ? (
                        <a href={productLink} target="_blank" rel="nofollow sponsored noopener" style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }} className="hover:text-green-accent transition-colors">
                            {p.title}
                          </h3>
                        </a>
                      ) : (
                        <Link href={productLink} style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }} className="hover:text-green-accent transition-colors">
                            {p.title}
                          </h3>
                        </Link>
                      )}

                      {/* Verification Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--green-accent)', background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={12} />
                          <span>Verified Amazon Merchant</span>
                        </span>
                      </div>

                      {/* Short Verdict Quote */}
                      {p.short_description && (
                        <div style={{ borderLeft: '3px solid var(--green-accent)', background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: '0 var(--radius-xs) var(--radius-xs) 0', fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                          &ldquo;{p.short_description}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Important Feature Tags */}
                    {p.important_features && p.important_features.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {p.important_features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--green-deep)',
                              background: 'var(--green-light)',
                              border: '1px solid var(--green-border)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-xs)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Zap size={11} />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick CTA Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {p.product_slug ? (
                        <AffiliateCTA
                          productSlug={p.product_slug}
                          asin={p.asin}
                          affiliateUrl={p.affiliate_url}
                          label={p.cta_text || 'Check Price on Amazon'}
                          size="lg"
                        />
                      ) : (
                        <a
                          href={p.affiliate_url || (p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20')}
                          target="_blank"
                          rel="nofollow sponsored noopener"
                          className="btn btn-amazon"
                          style={{ padding: '0.65rem 1.25rem', fontSize: '0.9375rem' }}
                        >
                          <span>{p.cta_text || 'Check Price on Amazon'}</span>
                          <span style={{ fontSize: '0.8125rem' }}>↗</span>
                        </a>
                      )}

                      {p.product_slug && (
                        <Link href={`/products/${p.product_slug}`} className="btn btn-secondary">
                          View Full Lab Metrics
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* In-Depth Description Paragraphs */}
                {p.full_description && (
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                      Our Detailed Lab Assessment
                    </h4>
                    <div style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-primary)' }}>
                      {p.full_description.split('\n').filter((para) => para.trim()).map((para, paraIdx) => (
                        <p key={paraIdx} style={{ marginBottom: '1rem' }}>{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Highlights Bullet List */}
                {p.highlights && p.highlights.length > 0 && (
                  <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={14} color="var(--green-accent)" />
                      <span>Key Highlights &amp; Standout Features</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {p.highlights.map((h, hIdx) => (
                        <li key={hIdx} style={{ marginBottom: '0.35rem' }}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DYNAMIC CUSTOMIZABLE SPECIFICATIONS SECTION */}
                {p.specifications && p.specifications.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      <TableIcon size={16} color="var(--green-accent)" />
                      <span>Hardware Specifications &amp; Technical Details</span>
                    </div>

                    <div className="spec-table-container">
                      <table className="spec-matrix-table">
                        <tbody>
                          {p.specifications.map((spec, sIdx) => (
                            <tr key={sIdx}>
                              <th className="spec-key-cell">
                                {spec.name}
                              </th>
                              <td className="spec-value-cell">
                                {spec.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pros & Cons Comparison Cards */}
                {(p.pros?.length || p.cons?.length) ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
                    {p.pros && p.pros.length > 0 && (
                      <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--green-deep)', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Check size={14} /> <span>Why We Recommend It (Pros)</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {p.pros.map((pro, proIdx) => (
                            <li key={proIdx} style={{ marginBottom: '0.3rem' }}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {p.cons && p.cons.length > 0 && (
                      <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#9F1239', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <X size={14} /> <span>Tradeoffs &amp; Limitations (Cons)</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {p.cons.map((con, conIdx) => (
                            <li key={conIdx} style={{ marginBottom: '0.3rem' }}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* "WHO IT IS BEST FOR" vs "WHO SHOULD AVOID IT" */}
                {(p.best_for || p.avoid_if) && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
                    {p.best_for && (
                      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <UserCheck size={15} /> <span>Who It Is Best For</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                          {p.best_for}
                        </p>
                      </div>
                    )}

                    {p.avoid_if && (
                      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--amber-deal)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertTriangle size={15} /> <span>Who Should Avoid It</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                          {p.avoid_if}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Performance Benchmark Observations */}
                {p.performance_notes && (
                  <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Performance &amp; Battery Lab Benchmark Notes
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                      {p.performance_notes}
                    </p>
                  </div>
                )}

                {/* Product-Specific Video Embed */}
                {p.video_url && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Video size={14} color="var(--green-accent)" />
                      <span>{p.video_title || `${p.title} Video Review & Teardown`}</span>
                    </div>
                    <VideoEmbed url={p.video_url} title={p.video_title || p.title} />
                  </div>
                )}

                {/* Bottom Affiliate Action Strip */}
                <div
                  className="detailed-review-bottom-strip"
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Ready to order the {p.title}?
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Verified Amazon authentic stock with direct manufacturer return warranty.
                    </div>
                  </div>

                  <div>
                    <a
                      href={p.affiliate_url || (p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20')}
                      target="_blank"
                      rel="nofollow sponsored noopener"
                      className="btn btn-amazon"
                      style={{ padding: '0.65rem 1.5rem', fontSize: '0.9375rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span>{p.cta_text || 'Check Price on Amazon'}</span>
                      <span style={{ fontSize: '0.85rem' }}>↗</span>
                    </a>
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

// Subcomponent: Image Gallery with thumbnail switcher
function ProductImageGallery({ images = [], title = '' }: { images: string[]; title: string }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70'];
  }

  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        style={{
          background: '#FAF9F6',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
          overflow: 'hidden',
        }}
      >
        <img
          src={currentImage}
          alt={title}
          loading="lazy"
          decoding="async"
          style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.2s ease' }}
          className="hover:scale-105"
        />
      </div>

      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              style={{
                width: '56px',
                height: '56px',
                padding: '0.25rem',
                background: '#FAF9F6',
                border: activeImageIndex === idx ? '2px solid var(--green-accent)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src={img} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
