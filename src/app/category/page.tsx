import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateBreadcrumbJsonLd, generateItemListJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { Category } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Departments & Categories | Buy Best Cart',
  description: 'Browse all shopping departments and categories on Buy Best Cart.',
  alternates: {
    canonical: `${SITE_URL}/category`,
  },
  openGraph: {
    title: 'Departments & Categories | Buy Best Cart',
    description: 'Browse all shopping departments and categories on Buy Best Cart.',
    url: `${SITE_URL}/category`,
    siteName: 'Buy Best Cart',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Departments & Categories | Buy Best Cart',
    description: 'Browse all shopping departments and categories on Buy Best Cart.',
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

  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, display_order, is_active')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const allCategories = (data as Category[]) || [];
  const departments = allCategories.filter((c) => !c.parent_id);

  const breadcrumbs = [
    { name: 'Categories', url: '/category' },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    'Departments & Categories',
    'Shopping departments and categories',
    allCategories.map((cat, idx) => ({
      name: cat.name,
      url: `/category/${cat.slug}`,
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

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          Departments
        </h1>
      </div>

      {departments.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
          {departments.map((dept) => {
            const subcategories = allCategories.filter((c) => c.parent_id === dept.id);
            return (
              <div
                key={dept.id || dept.slug}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <Link
                  href={`/category/${dept.slug}`}
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-display)',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '0.5rem',
                  }}
                >
                  {dept.name}
                </Link>

                {subcategories.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id || sub.slug}
                        href={`/category/${sub.slug}`}
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontWeight: 500,
                          padding: '0.2rem 0',
                          transition: 'color 0.15s ease',
                        }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={`/category/${dept.slug}`}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                    }}
                  >
                    Browse {dept.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9375rem' }}>
            No departments available yet.
          </p>
        </div>
      )}
    </div>
  );
}
