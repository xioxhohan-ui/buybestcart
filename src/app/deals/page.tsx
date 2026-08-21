import React from 'react';
import type { Metadata } from 'next';
import { Flame } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/products/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Product } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Today's Best Tech Deals & Price Drops | Best Buy Cart",
  description: 'Verified hardware price drops, seasonal discounts, and curated tech savings evaluated by our editorial staff.',
};

export default async function DealsPage() {
  const supabase = createServerClient();

  const { data: dealsProducts } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
    .neq('deal_status', 'none')
    .in('status', ['active', 'featured'])
    .order('updated_at', { ascending: false });

  const breadcrumbs = [
    { name: "Today's Deals", url: '/deals' },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '3rem', maxWidth: '720px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--amber-deal)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Flame size={13} />
          <span>Hand-Curated Savings</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>Today&apos;s Best Tech Deals & Price Drops</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          We continuously track price drops on top-ranked laptops, noise-canceling headphones, and gaming gear. All prices are verified in real time.
        </p>
      </div>

      <ProductGrid products={(dealsProducts as Product[]) || []} />
    </div>
  );
}
