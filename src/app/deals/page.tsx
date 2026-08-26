import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Best Tech Deals & Verified Price Drops (2026) | Buy Best Cart',
  description: 'Verified hardware price drops, seasonal discounts, and curated tech savings evaluated by our editorial staff with 120-day price tracking.',
  keywords: ['amazon price history tracker', 'how to find amazon deals', 'best time to buy electronics on amazon', 'tech deals 2026', 'verified price drops', 'buy best cart deals'],
  alternates: {
    canonical: `${SITE_URL}/deals`,
  },
  openGraph: {
    title: 'Best Tech Deals & Verified Price Drops (2026) | Buy Best Cart',
    description: 'Verified hardware price drops, seasonal discounts, and curated tech savings evaluated by our editorial staff.',
    url: `${SITE_URL}/deals`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Today's Best Tech Deals & Amazon Price Drops" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Today's Best Tech Deals & Amazon Price Drops (2026) | Buy Best Cart",
    description: 'Verified hardware price drops, seasonal discounts, and curated tech savings.',
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

export default async function DealsPage() {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  // Fetch verified active deals from dedicated deals table and products table in parallel
  const [dealsRes, productsRes] = await Promise.all([
    supabase
      .from('deals')
      .select('*, product:products(*, brand:brands(*), category:categories(*), images:product_images(*))')
      .eq('status', 'active')
      .order('priority', { ascending: true }),
    supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
      .or('show_in_deals.eq.true,is_deal.eq.true,deal_status.neq.none')
      .in('status', ['active', 'featured', 'published'])
      .order('updated_at', { ascending: false }),
  ]);

  // Merge dedicated deals with catalog deal products
  const mergedMap = new Map<string, Product>();

  // 1. Add dedicated promotions first
  if (dealsRes.data) {
    dealsRes.data.forEach((d: any) => {
      // Check expiration date
      if (d.end_date && new Date(d.end_date) < new Date()) return;
      if (d.start_date && new Date(d.start_date) > new Date()) return;

      if (d.product) {
        const prod = { ...d.product };
        if (d.deal_price) prod.price = d.deal_price;
        if (d.original_price) prod.list_price = d.original_price;
        if (d.badge) prod.badge_text = d.badge;
        prod.is_deal = true;
        mergedMap.set(prod.id, prod);
      }
    });
  }

  // 2. Add products flagged for deals
  if (productsRes.data) {
    productsRes.data.forEach((p: any) => {
      if (!mergedMap.has(p.id)) {
        mergedMap.set(p.id, p as Product);
      }
    });
  }

  const productsList = Array.from(mergedMap.values());

  const breadcrumbs = [
    { name: "Today's Deals", url: '/deals' },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    "Today's Best Tech Deals & Price Drops",
    'Curated collection of verified Amazon price drops and hardware discounts.',
    productsList.map((p, idx) => ({
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

      <div style={{ marginBottom: '2.5rem', maxWidth: '720px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--amber-deal)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Flame size={14} />
          <span>Hand-Curated Savings</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>Today&apos;s Best Tech Deals &amp; Price Drops</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          We continuously track price drops on top-ranked laptops, noise-canceling headphones, and gaming gear. Only products verified and marked with active promotions are featured here.
        </p>
      </div>

      {productsList.length > 0 ? (
        <ProductGrid products={productsList} />
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <Flame size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Flash Deals Right Now</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9375rem' }}>
            Our pricing bots scan Amazon multiple times per day. Explore our full catalog to view everyday top-ranked recommendations.
          </p>
          <Link href="/products" className="btn btn-primary">
            <span>Browse Full Product Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
