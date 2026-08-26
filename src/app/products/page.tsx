import React from 'react';
import type { Metadata } from 'next';
import { Package, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Full Product Catalog & Verified Recommendations | Buy Best Cart',
  description: 'Browse our complete catalog of laboratory-tested tech, audio gear, laptops, and smart home hardware with direct Amazon shopping links.',
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
  openGraph: {
    title: 'Full Product Catalog & Verified Recommendations | Buy Best Cart',
    description: 'Browse our complete catalog of laboratory-tested tech, audio gear, laptops, and smart home hardware.',
    url: `${SITE_URL}/products`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Buy Best Cart Full Product Catalog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Full Product Catalog & Verified Recommendations | Buy Best Cart',
    description: 'Browse our complete catalog of laboratory-tested tech, audio gear, laptops, and smart home hardware.',
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

export default async function ProductsCatalogPage() {
  const supabase = createServerClient();

  const { data: products } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
    .in('status', ['active', 'featured', 'published'])
    .order('global_rank', { ascending: true })
    .order('created_at', { ascending: false });

  const productList = (products as Product[]) || [];

  const breadcrumbs = [
    { name: 'All Products', url: '/products' },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    'All Tested & Verified Products',
    'Curated collection of laboratory-tested laptops, headphones, and consumer hardware.',
    productList.map((p, idx) => ({
      name: p.title,
      url: `/products/${p.slug}`,
      image: p.thumbnail_url || undefined,
      position: idx + 1,
    }))
  );

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '3rem', maxWidth: '760px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Package size={13} />
          <span>Curated Recommendations</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>All Tested &amp; Verified Products</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Explore our complete database of tested laptops, noise-cancelling headphones, gaming gear, and smart home essentials ranked by editorial benchmarks and live Amazon pricing.
        </p>
      </div>

      <ProductGrid products={productList} />
    </div>
  );
}
