import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoryShowcaseGridProps {
  categories: Category[];
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  'computers-laptops': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  gaming: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
  'smart-home': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  'health-wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  outdoors: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
};

export default function CategoryShowcaseGrid({ categories }: CategoryShowcaseGridProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const items = categories.slice(0, 6);

  return (
    <section className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="editorial-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={11} />
            <span>CURATED HUBS</span>
          </div>
          <h2>Explore by Department</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Comprehensive testing archives organized by hardware and lifestyle categories.
          </p>
        </div>
        <Link href="/category" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>All 9 Department Archives</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="category-showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
        {items.map((cat) => {
          const imgUrl =
            cat.image_url ||
            DEFAULT_CATEGORY_IMAGES[cat.slug] ||
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

          return (
            <Link
              key={cat.id || cat.slug}
              href={`/category/${cat.slug}`}
              className="category-showcase-card"
            >
              <div className="category-showcase-image-wrap">
                <img
                  src={imgUrl}
                  alt={cat.name}
                  className="category-showcase-img"
                  loading="lazy"
                  decoding="async"
                  width={340}
                  height={180}
                />
              </div>
              <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', margin: 0 }}>
                    {cat.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--green-accent)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {cat.product_count ? `${cat.product_count} Tested Models` : 'Verified Picks'}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                  {cat.description || 'Independent lab reviews, buyer guides, and verified performance benchmarks.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-accent)', fontFamily: 'var(--font-display)' }}>
                  <span>Browse Archive</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
