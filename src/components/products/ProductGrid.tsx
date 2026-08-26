import React from 'react';
import { Package } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  ranked?: boolean;
  columns?: number;
}

export default function ProductGrid({ products, ranked = false, columns }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          <Package size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Products in Catalog Yet</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
          Products will appear here once added and published in the management dashboard.
        </p>
      </div>
    );
  }

  const gridStyle = columns ? { gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, 280px), 1fr))` } : undefined;

  return (
    <div className="grid-products" style={gridStyle}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          rank={ranked ? index + 1 : undefined}
        />
      ))}
    </div>
  );
}
