import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Product Categories & Shopping Departments | Best Buy Cart',
  description: 'Explore all verified tech, computing, audio, gaming, smart home, and lifestyle product categories curated by experts.',
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

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              <span>View Top Picks</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
