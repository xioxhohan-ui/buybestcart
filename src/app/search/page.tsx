import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, BookOpen, Scale, ArrowRight } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SearchBar from '@/components/common/SearchBar';
import { Product, Article } from '@/types';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search Results for "${q}" | Buy Best Cart` : 'Search Products & Guides | Buy Best Cart',
    description: `Browse product reviews, comparisons, and verified Amazon deals for ${q || 'consumer electronics'}.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const supabase = createServerClient();

  let products: Product[] = [];
  let articles: Article[] = [];
  let comparisons: Array<{ id: string; title: string; slug: string; description?: string; summary?: string }> = [];

  if (q.trim()) {
    const cleanQ = q.replace(/[,()"%_\\]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanQ) {
      const tokens = cleanQ.split(' ').filter(t => t.length > 2);
      const primaryToken = tokens[0] || cleanQ;

      // 1. Search products
      let productQuery = supabase
        .from('products')
        .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
        .in('status', ['active', 'featured']);

      if (cleanQ.includes(' ') && tokens.length > 1) {
        productQuery = productQuery.or(`title.ilike.%${cleanQ}%,short_description.ilike.%${cleanQ}%,title.ilike.%${primaryToken}%,asin.ilike.%${cleanQ}%`);
      } else {
        productQuery = productQuery.or(`title.ilike.%${cleanQ}%,short_description.ilike.%${cleanQ}%,asin.ilike.%${cleanQ}%`);
      }

      const { data: pData } = await productQuery.limit(24);
      products = (pData as Product[]) || [];

      // 2. Search published buying guides
      const { data: aData } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${cleanQ}%,excerpt.ilike.%${cleanQ}%,slug.ilike.%${cleanQ}%`)
        .limit(4);
      articles = (aData as Article[]) || [];

      // 3. Search published comparisons
      const { data: cData } = await supabase
        .from('comparisons')
        .select('id, title, slug, description, summary')
        .eq('status', 'published')
        .or(`title.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%,slug.ilike.%${cleanQ}%`)
        .limit(4);
      comparisons = cData || [];
    }
  }

  const breadcrumbs = [
    { name: 'Search', url: '/search' },
    ...(q ? [{ name: `"${q}"`, url: `/search?q=${encodeURIComponent(q)}` }] : []),
  ];

  const hasAnyResults = products.length > 0 || articles.length > 0 || comparisons.length > 0;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ maxWidth: '640px', margin: '1rem auto 3rem auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
          {q ? `Search results for "${q}"` : 'Search Buy Best Cart'}
        </h1>
        <SearchBar />
      </div>

      {q.trim() && !hasAnyResults ? (
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
            Try checking for typos or explore our top categories and guides:
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/category/audio-headphones" className="btn btn-secondary btn-sm">Audio &amp; Headphones</Link>
            <Link href="/category/computers-laptops" className="btn btn-secondary btn-sm">Laptops &amp; PCs</Link>
            <Link href="/guides" className="btn btn-secondary btn-sm">Buying Guides</Link>
            <Link href="/deals" className="btn btn-primary btn-sm">View Today&apos;s Deals</Link>
          </div>
        </div>
      ) : (
        <div>
          {/* Matching Editorial Guides & Comparison Showdowns */}
          {(articles.length > 0 || comparisons.length > 0) && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.04em' }}>
                Matching Editorial Guides &amp; Comparisons
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
                {articles.map(art => (
                  <Link
                    key={art.id}
                    href={`/guides/${art.slug}`}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      <BookOpen size={12} />
                      <span>Buying Guide</span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                      {art.title}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem', flex: 1 }}>
                      {art.excerpt}
                    </p>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      Read Guide <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}

                {comparisons.map(comp => (
                  <Link
                    key={comp.id}
                    href={`/compare/${comp.slug}`}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      <Scale size={12} />
                      <span>Comparison Showdown</span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                      {comp.title}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem', flex: 1 }}>
                      {comp.summary || comp.description}
                    </p>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      View Full Comparison <ArrowRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matching Products */}
          {products.length > 0 && (
            <div>
              <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Showing {products.length} matching {products.length === 1 ? 'product' : 'products'} for &ldquo;<strong>{q}</strong>&rdquo;
              </div>
              <ProductGrid products={products} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
