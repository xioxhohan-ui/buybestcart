'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import { formatPrice } from '@/lib/region';

interface ComparisonMatrixSectionProps {
  products: Product[];
}

export default function ComparisonMatrixSection({ products }: ComparisonMatrixSectionProps) {
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

      {/* Comparison Matrix Table */}
      <div style={{ overflowX: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th style={{ width: '22%', background: '#F8F7F2' }}>SPECIFICATION</th>
              {comparisonItems.map((item) => (
                <th key={item.id} style={{ width: `${78 / comparisonItems.length}%`, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{item.brand?.name}</div>
                  <div style={{ fontSize: '1.0625rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', textTransform: 'none' }}>
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
                <td key={item.id} style={{ textAlign: 'center', padding: '1.5rem' }}>
                  <img
                    src={item.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60'}
                    alt={item.title}
                    style={{ maxHeight: '120px', margin: '0 auto', objectFit: 'contain' }}
                  />
                </td>
              ))}
            </tr>

            {/* Editorial Score */}
            <tr>
              <th style={{ background: '#F8F7F2' }}>Editorial Score</th>
              {comparisonItems.map((item) => (
                <td key={item.id} style={{ textAlign: 'center', fontWeight: 800, color: 'var(--green-accent)', fontSize: '1.125rem', fontFamily: 'var(--font-display)' }}>
                  {item.editorial_score ? `${item.editorial_score} / 10` : '9.4 / 10'}
                </td>
              ))}
            </tr>

            {/* Customer Rating */}
            <tr>
              <th style={{ background: '#F8F7F2' }}>Customer Rating</th>
              {comparisonItems.map((item) => (
                <td key={item.id} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--amber-deal)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={11} fill="currentColor" />
                    <span>{item.rating ? item.rating.toFixed(1) : '4.8'}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem' }}>({item.review_count?.toLocaleString() || '5,000+'})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Price */}
            <tr>
              <th style={{ background: '#F8F7F2' }}>Verified Price</th>
              {comparisonItems.map((item) => (
                <td key={item.id} style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {formatPrice(item.price, item.currency || 'USD')}
                </td>
              ))}
            </tr>

            {/* Key Advantage */}
            <tr>
              <th style={{ background: '#F8F7F2' }}>Best Suited For</th>
              {comparisonItems.map((item, idx) => (
                <td key={item.id} style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
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
                <td key={item.id} style={{ textAlign: 'center', padding: '1.25rem' }}>
                  <AffiliateCTA
                    productSlug={item.slug}
                    asin={item.asin}
                    price={item.price}
                    affiliateUrl={item.affiliate_url}
                    label="Buy on Amazon"
                    size="sm"
                    fullWidth
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
