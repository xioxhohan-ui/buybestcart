import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { Category, Product } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ProductGrid from '@/components/products/ProductGrid';
import FAQSection from '@/components/common/FAQSection';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ sort?: string; brand?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categorySlug = slug[slug.length - 1];
  const supabase = createServerClient();

  const { data: category } = await supabase
    .from('categories')
    .select('name, description, seo_title, seo_description')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    return { title: 'Category Not Found | Best Buy Cart' };
  }

  return {
    title: category.seo_title || `Best ${category.name} of 2026 — Top Picks & Buying Guide | Best Buy Cart`,
    description: category.seo_description || category.description || `Discover the highest-rated ${category.name} ranked by experts with verified Amazon pricing.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const categorySlug = slug[slug.length - 1];
  const supabase = createServerClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();

  if (!category) {
    notFound();
  }

  // Fetch products in this category
  let query = supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*)')
    .eq('category_id', category.id)
    .in('status', ['active', 'featured']);

  if (resolvedSearchParams.sort === 'price_asc') {
    query = query.order('price', { ascending: true, nullsFirst: false });
  } else if (resolvedSearchParams.sort === 'price_desc') {
    query = query.order('price', { ascending: false, nullsFirst: false });
  } else if (resolvedSearchParams.sort === 'rating') {
    query = query.order('rating', { ascending: false, nullsFirst: false });
  } else {
    // Default rank order
    query = query.order('category_rank', { ascending: true, nullsFirst: false });
  }

  const { data: products } = await query;

  // Subcategories
  const { data: subcategories } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', category.id)
    .eq('is_active', true);

  // FAQs
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .limit(4);

  const breadcrumbs = [
    { name: 'Categories', url: '/' },
    { name: category.name, url: `/category/${category.slug}` },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      {/* Category Header */}
      <div style={{ marginBottom: '2.5rem', maxWidth: '800px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
          Category Hub & Rankings
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>The Best {category.name}</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {category.description || `Hand-tested recommendations and verified Amazon deals for the top ${category.name}.`}
        </p>
      </div>

      {/* Subcategory Pills if any */}
      {subcategories && subcategories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {subcategories.map((sub: Category) => (
            <a
              key={sub.id}
              href={`/category/${category.slug}/${sub.slug}`}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {sub.name}
            </a>
          ))}
        </div>
      )}

      {/* Product Listings with Ranking */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>
            Top Ranked {category.name} ({products ? products.length : 0} items)
          </h2>

          {/* Simple Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                fontSize: '0.875rem',
              }}
              defaultValue={resolvedSearchParams.sort || 'rank'}
            >
              <option value="rank">Recommended Rank</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <ProductGrid products={(products as Product[]) || []} ranked={true} />
      </section>

      {/* Category FAQs */}
      {faqs && <FAQSection faqs={faqs} title={`Buying Advice & FAQ: ${category.name}`} />}
    </div>
  );
}
