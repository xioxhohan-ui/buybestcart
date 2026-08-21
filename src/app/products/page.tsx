import React from 'react';
import type { Metadata } from 'next';
import { Package, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Full Product Catalog & Verified Recommendations | Buy Best Cart',
  description: 'Browse our complete catalog of laboratory-tested tech, audio gear, laptops, and smart home hardware with direct Amazon shopping links.',
};

export default async function ProductsCatalogPage() {
  const supabase = createServerClient();

  const { data: products } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
    .in('status', ['active', 'featured'])
    .order('global_rank', { ascending: true })
    .order('created_at', { ascending: false });

  const productList = (products as Product[]) || [];

  const breadcrumbs = [
    { name: 'All Products', url: '/products' },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '3rem', maxWidth: '760px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Package size={13} />
          <span>Curated Recommendations</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>All Tested & Verified Products</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Explore our complete database of tested laptops, noise-cancelling headphones, gaming gear, and smart home essentials ranked by editorial benchmarks and live Amazon pricing.
        </p>
      </div>

      <ProductGrid products={productList} />
    </div>
  );
}
