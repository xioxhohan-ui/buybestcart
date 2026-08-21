import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Award } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Article } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Expert Buying Guides & In-Depth Reviews | Buy Best Cart',
  description: 'Detailed analysis, buying considerations, and recommendations across laptops, headphones, monitors, and gaming gear.',
};

export default async function GuidesIndexPage() {
  const supabase = createServerClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const breadcrumbs = [
    { name: 'Buying Guides', url: '/guides' },
  ];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '3rem', maxWidth: '720px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <BookOpen size={13} />
          <span>Independent Technical Research</span>
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>2026 Buying Guides & Reviews</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Comprehensive analysis, benchmarks, and comparison breakdowns to help you make informed purchase decisions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
        {(articles as Article[] || []).map((article) => (
          <div
            key={article.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {article.content_type === 'buying_guide' ? (
                <>
                  <BookOpen size={12} />
                  <span>Buying Guide</span>
                </>
              ) : (
                <>
                  <Award size={12} />
                  <span>Expert Review</span>
                </>
              )}
            </span>
            <Link href={`/guides/${article.slug}`}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                {article.title}
              </h2>
            </Link>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {article.excerpt}
            </p>
            <Link
              href={`/guides/${article.slug}`}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
            >
              Read Full Guide →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
