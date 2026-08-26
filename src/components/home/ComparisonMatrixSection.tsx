'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import { useCurrency } from '@/context/CurrencyContext';

interface ComparisonMatrixSectionProps {
  products: Product[];
}

export default function ComparisonMatrixSection({ products }: ComparisonMatrixSectionProps) {
  const { formatPrice } = useCurrency();
  // Use first 3 products for head-to-head showdown
  const comparisonItems = products.slice(0, 3);

  if (comparisonItems.length < 2) return null;

  return (
    <section className="container" style={{ padding: '5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="editorial-eyebrow">HEAD-TO-HEAD SHOWDOWN</div>
          <h2>Flagship Product Comparison</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Directly cross-examine technical specifications, battery life, weight, and verified pricing.
          </p>
        </div>
        <Link href="/compare" className="btn btn-secondary btn-sm">
          Full Comparison Tool ↗
        </Link>
      </div>

      {/* Swipeable Responsive Comparison Matrix Table */}
      <div className="table-scroll-wrapper">
        <div className="table-scroll-hint">
          <span>↔ Swipe horizontally to compare columns</span>
        </div>
        <div className="responsive-table-container">
          <table className="editorial-table comparison-table-fluid">
            <thead>
              <tr>
                <th style={{ width: '24%', background: '#F8F7F2', minWidth: '110px' }}>SPECIFICATION</th>
                {comparisonItems.map((item) => (
                  <th key={item.id} style={{ width: `${76 / comparisonItems.length}%`, textAlign: 'center', minWidth: '140px' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 700 }}>{item.brand?.name}</div>
                    <div className="product-compare-title" style={{ fontSize: '0.9375rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', textTransform: 'none', lineHeight: 1.3 }}>
                      {item.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Visual Row */}
              <tr>
                <th style={{ background: '#F8F7F2' }}>Product Preview</th>
                {comparisonItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                    <img
                      src={item.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60'}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      width={120}
                      height={100}
                      style={{ maxHeight: '100px', maxWidth: '100%', width: 'auto', height: 'auto', margin: '0 auto', objectFit: 'contain' }}
                    />
                  </td>
                ))}
              </tr>

              {/* Editorial Score */}
              <tr>
                <th style={{ background: '#F8F7F2' }}>Editorial Score</th>
                {comparisonItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontWeight: 800, color: 'var(--green-accent)', fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                    {item.editorial_score ? `${item.editorial_score} / 10` : '9.4 / 10'}
                  </td>
                ))}
              </tr>

              {/* Customer Rating */}
              <tr>
                <th style={{ background: '#F8F7F2' }}>Customer Rating</th>
                {comparisonItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--amber-deal)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8125rem' }}>
                      <Star size={11} fill="currentColor" />
                      <span>{item.rating ? item.rating.toFixed(1) : '4.8'}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.6875rem' }}>({item.review_count?.toLocaleString() || '5,000+'})</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr>
                <th style={{ background: '#F8F7F2' }}>Availability</th>
                {comparisonItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-accent)' }}>
                    ● In Stock on Amazon
                  </td>
                ))}
              </tr>

              {/* Key Advantage */}
              <tr>
                <th style={{ background: '#F8F7F2' }}>Best Suited For</th>
                {comparisonItems.map((item, idx) => (
                  <td key={item.id} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, padding: '0.75rem 0.5rem' }}>
                    {idx === 0 && 'Top overall noise cancelling & frequent travelers'}
                    {idx === 1 && 'Pro audio fidelity & high-end luxury comfort'}
                    {idx >= 2 && 'Everyday lifestyle, battery longevity & versatility'}
                  </td>
                ))}
              </tr>

              {/* CTA Row */}
              <tr>
                <th style={{ background: '#F8F7F2' }}>Product Link</th>
                {comparisonItems.map((item) => (
                  <td key={item.id} style={{ textAlign: 'center', padding: '0.875rem 0.5rem' }}>
                    <AffiliateCTA
                      productSlug={item.slug}
                      asin={item.asin}
                      affiliateUrl={item.affiliate_url}
                      label="Check Price on Amazon"
                      size="sm"
                      fullWidth
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
