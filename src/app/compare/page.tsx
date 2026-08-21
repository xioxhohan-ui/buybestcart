import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Scale, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CustomCompareEngine from '@/components/compare/CustomCompareEngine';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Custom Product Comparison Matrix (Up to 3 Products) | Buy Best Cart',
  description: 'Search and compare up to 3 products side-by-side. Technical specifications, noise cancellation, battery endurance, pros, cons, and verified Amazon pricing.',
  openGraph: {
    title: 'Custom Product Comparison Matrix | Buy Best Cart',
    description: 'Compare 2 or 3 products side-by-side with verified laboratory benchmarks and live Amazon pricing.',
    images: [{ url: 'https://buybestcart.shop/og-image.png', width: 1200, height: 630, alt: 'Buy Best Cart Comparison Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Product Comparison Matrix | Buy Best Cart',
    description: 'Compare 2 or 3 products side-by-side with verified laboratory benchmarks and live Amazon pricing.',
    images: ['https://buybestcart.shop/og-image.png'],
  },
};

interface ComparePageProps {
  searchParams: Promise<{ p1?: string; p2?: string; p3?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = createServerClient();

  // Fetch all active products with specifications, features, images, brand, and category
  const { data: products } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), specifications:product_specifications(*), features:product_features(*), images:product_images(*)')
    .in('status', ['active', 'featured'])
    .order('global_rank', { ascending: true, nullsFirst: false });

  const allProducts = (products as Product[]) || [];

  const initialSlugs: string[] = [];
  if (resolvedSearchParams.p1) initialSlugs.push(resolvedSearchParams.p1);
  if (resolvedSearchParams.p2) initialSlugs.push(resolvedSearchParams.p2);
  if (resolvedSearchParams.p3) initialSlugs.push(resolvedSearchParams.p3);

  // If no params given, default to top 2 or 3 products
  if (initialSlugs.length === 0 && allProducts.length >= 2) {
    initialSlugs.push(allProducts[0].slug);
    initialSlugs.push(allProducts[1].slug);
    if (allProducts.length >= 3) {
      initialSlugs.push(allProducts[2].slug);
    }
  }

  const breadcrumbs = [
    { name: 'Comparison Matrix', url: '/compare' },
  ];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem', maxWidth: '780px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Scale size={14} />
          <span>Interactive Head-to-Head Comparison</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>Custom Product Comparison Matrix</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Search and select any 2 or 3 products from our catalog to compare real laboratory benchmarks, key highlights, pros &amp; cons, technical specifications, and live Amazon pricing.
        </p>
      </div>

      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading Comparison Tool...</div>}>
        <CustomCompareEngine
          allProducts={allProducts}
          initialSelectedSlugs={initialSlugs}
        />
      </Suspense>
    </div>
  );
}
