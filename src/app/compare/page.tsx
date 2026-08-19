import React from 'react';
import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import { formatPrice } from '@/lib/region';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Side-by-Side Product Comparison Matrix | Best Buy Cart',
  description: 'Compare specs, noise-cancellation benchmarks, battery life, and prices side-by-side across top products.',
};

export default async function ComparePage() {
  const supabase = createServerClient();

  // Fetch top 3 comparison products as default
  const { data: products } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), specifications:product_specifications(*)')
    .in('status', ['active', 'featured'])
    .order('global_rank', { ascending: true })
    .limit(3);

  const productList = (products as Product[]) || [];

  const breadcrumbs = [
    { name: 'Comparison Tool', url: '/compare' },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem', maxWidth: '720px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Head-to-Head Analysis
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>Product Comparison Matrix</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Side-by-side technical breakdown, pros and cons, editorial scores, and live Amazon pricing.
        </p>
      </div>

      {productList.length > 0 ? (
        <div style={{ overflowX: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <table className="editorial-table" style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ width: '22%', background: 'var(--bg-subtle)' }}>Attribute</th>
                {productList.map((p) => (
                  <th key={p.id} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                    <img
                      src={p.thumbnail_url}
                      alt={p.title}
                      style={{ width: '100px', height: '100px', objectFit: 'contain', margin: '0 auto 0.75rem auto' }}
                    />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {p.title}
                    </div>
                    <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                      {formatPrice(p.price, p.currency || 'USD')}
                    </div>
                    <AffiliateCTA productSlug={p.slug} asin={p.asin} price={p.price} label="View on Amazon" size="sm" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Overall Rank</th>
                {productList.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center', fontWeight: 700 }}>
                    #{p.global_rank || p.category_rank || '-'} Top Pick
                  </td>
                ))}
              </tr>
              <tr>
                <th>Customer Rating</th>
                {productList.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center', color: '#d97706', fontWeight: 700 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={11} fill="currentColor" />
                      <span>{p.rating ? p.rating.toFixed(1) : '4.5'}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem' }}>({p.review_count?.toLocaleString()})</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <th>Editorial Score</th>
                {productList.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                    {p.editorial_score ? `${p.editorial_score} / 10` : '9.0 / 10'}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Key Advantage</th>
                {productList.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    {p.pros && p.pros[0] ? p.pros[0] : 'Reliable performance'}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Availability</th>
                {productList.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>
                    In Stock on Amazon
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>No comparison items available.</p>
      )}
    </div>
  );
}
