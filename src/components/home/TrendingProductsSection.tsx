import React from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { Product } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';

interface TrendingProductsSectionProps {
  products: Product[];
}

export default function TrendingProductsSection({ products }: TrendingProductsSectionProps) {
  // Take top 4 trending products
  const trendingList = products.slice(0, 4);

  if (trendingList.length === 0) return null;

  return (
    <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="editorial-eyebrow" style={{ color: 'var(--green-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={13} />
              <span>HIGH VELOCITY PICKS</span>
            </div>
            <h2>Trending Flagship Picks</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              The most researched and top-rated electronics, audio gear, and productivity tools this week.
            </p>
          </div>
          <Link href="/deals" className="btn btn-secondary btn-sm">
            View All Trending Gear →
          </Link>
        </div>

        <ProductGrid products={trendingList} />
      </div>
    </section>
  );
}
