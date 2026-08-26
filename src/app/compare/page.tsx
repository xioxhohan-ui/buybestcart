import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Scale, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import CustomCompareEngine from '@/components/compare/CustomCompareEngine';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Side-by-Side Product Comparison Matrix | Buy Best Cart',
  description: 'Search and compare up to 3 products side-by-side. Benchmark lab testing, acoustic measurements, battery endurance, and Amazon pricing.',
  alternates: {
    canonical: `${SITE_URL}/compare`,
  },
  openGraph: {
    title: 'Side-by-Side Product Comparison Matrix | Buy Best Cart',
    description: 'Compare 2 or 3 products side-by-side with verified laboratory benchmarks and live Amazon pricing.',
    url: `${SITE_URL}/compare`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Buy Best Cart Comparison Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Product Comparison Matrix | Buy Best Cart',
    description: 'Compare 2 or 3 products side-by-side with verified laboratory benchmarks and live Amazon pricing.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
    .in('status', ['active', 'featured', 'published'])
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

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div style={{ marginBottom: '2.5rem', maxWidth: '780px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.06em' }}>
          <Scale size={14} />
          <span>Interactive Head-to-Head Testing</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>Custom Side-by-Side Product Comparison</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Select any 2 or 3 products from our catalog to compare real-world acoustic performance, battery longevity, physical dimensions, and verified Amazon live pricing side-by-side.
        </p>
      </div>

      <Suspense fallback={<div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading comparison engine...</div>}>
        <CustomCompareEngine allProducts={allProducts} initialSelectedSlugs={initialSlugs} />
      </Suspense>
    </div>
  );
}
