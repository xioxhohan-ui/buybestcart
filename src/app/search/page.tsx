import React from 'react';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SearchBar from '@/components/common/SearchBar';
import { Product } from '@/types';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search Results for "${q}" | Best Buy Cart` : 'Search Products | Best Buy Cart',
    description: `Browse product reviews, comparisons, and verified Amazon deals for ${q || 'consumer electronics'}.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const supabase = createServerClient();

  let products: Product[] = [];

  if (q.trim()) {
    const cleanQ = q.replace(/[,()"%_\\]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanQ) {
      const { data } = await supabase
        .from('products')
        .select('*, brand:brands(*), category:categories(*)')
        .or(`title.ilike.%${cleanQ}%,short_description.ilike.%${cleanQ}%`)
        .in('status', ['active', 'featured'])
        .limit(24);

      products = (data as Product[]) || [];
    }
  }

  const breadcrumbs = [
    { name: 'Search', url: '/search' },
    ...(q ? [{ name: `"${q}"`, url: `/search?q=${encodeURIComponent(q)}` }] : []),
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ maxWidth: '640px', margin: '1rem auto 3rem auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
          {q ? `Search results for "${q}"` : 'Search Best Buy Cart'}
        </h1>
        <SearchBar />
      </div>

      {q.trim() && products.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Search size={36} color="var(--text-muted)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No direct matches found for &ldquo;{q}&rdquo;</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            Try checking for typos or explore our top categories:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a href="/category/audio-headphones" className="btn btn-secondary btn-sm">Audio & Headphones</a>
            <a href="/category/computers-laptops" className="btn btn-secondary btn-sm">Laptops & PCs</a>
            <a href="/deals" className="btn btn-primary btn-sm">View Today&apos;s Deals</a>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Showing {products.length} {products.length === 1 ? 'result' : 'results'} for &ldquo;<strong>{q}</strong>&rdquo;
          </div>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
