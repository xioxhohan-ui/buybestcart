import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Today's Best Tech Deals & Price Drops | Buy Best Cart",
  description: 'Verified hardware price drops, seasonal discounts, and curated tech savings evaluated by our editorial staff.',
  openGraph: {
    title: "Today's Best Tech Deals & Price Drops | Buy Best Cart",
    description: 'Verified hardware price drops, seasonal discounts, and curated tech savings evaluated by our editorial staff.',
    images: [{ url: 'https://buybestcart.shop/og-image.png', width: 1200, height: 630, alt: "Today's Best Deals" }],
  },
};

export default async function DealsPage() {
  const supabase = createServerClient();

  // Fetch only products explicitly marked with is_deal = true
  const { data: dealsProducts } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
    .eq('is_deal', true)
    .in('status', ['active', 'featured'])
    .order('updated_at', { ascending: false });

  const productsList = (dealsProducts as Product[]) || [];

  const breadcrumbs = [
    { name: "Today's Deals", url: '/deals' },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '4rem 1.5rem',
            maxWidth: '680px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: 'var(--amber-deal)',
            }}
          >
            <Flame size={28} />
          </div>

          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Active Deals Right Now
          </h2>

          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Our editorial lab is constantly monitoring merchant price fluctuations. When verified price drops and exclusive promotions are unlocked by our staff, they will appear right here.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link href="/products" className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <span>Browse All Verified Products</span>
              <ArrowRight size={15} />
            </Link>
            <Link href="/compare" className="btn btn-secondary" style={{ gap: '0.4rem' }}>
              <Sparkles size={15} color="var(--green-accent)" />
              <span>Compare Top Models</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
