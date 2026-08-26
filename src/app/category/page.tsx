import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Product Categories & Shopping Departments | Buy Best Cart',
  description: 'Explore all verified tech, computing, audio, gaming, smart home, and lifestyle product categories curated by Buy Best Cart experts.',
  alternates: {
    canonical: `${SITE_URL}/category`,
  },
  openGraph: {
    title: 'Product Categories & Shopping Departments | Buy Best Cart',
    description: 'Explore all verified tech, computing, audio, gaming, smart home, and lifestyle product categories curated by Buy Best Cart experts.',
    url: `${SITE_URL}/category`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Buy Best Cart Shopping Categories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Product Categories & Shopping Departments | Buy Best Cart',
    description: 'Explore all verified tech, computing, audio, gaming, smart home, and lifestyle product categories.',
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

export default async function CategoriesIndexPage() {
  const supabase = createServerClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const categoryList = categories || [];

  const breadcrumbs = [
    { name: 'Categories', url: '/category' },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    'All Product Categories & Departments',
    'Curated departments for consumer electronics, computing, audio, and smart home hardware.',
    categoryList.map((cat, idx) => ({
      name: cat.name,
      url: `/category/${cat.slug}`,
      image: cat.image_url || undefined,
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
          <Layers size={13} />
          <span>Curated Departments</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>All Product Categories</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Browse our independent testing coverage across consumer tech, computing, smart home, audio, gaming, and lifestyle essentials.
        </p>
      </div>

      {categoryList.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          {categoryList.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {cat.name}
                </h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {cat.description || 'Explore the highest-rated recommendations, buying guides, and live Amazon price comparisons.'}
                </p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--green-accent)', fontWeight: 600, fontSize: '0.875rem' }}>
                <span>View Top Picks</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
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
            <Layers size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Categories Published Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9375rem' }}>
            Product categories will appear here once configured in the management dashboard.
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
