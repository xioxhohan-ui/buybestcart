import React from 'react';
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
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>No products found in this selection.</p>
      </div>
    );
  }

  const gridStyle = columns ? { gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))` } : undefined;

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
