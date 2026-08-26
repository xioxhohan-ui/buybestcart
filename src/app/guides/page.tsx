import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Award, Sparkles, Clock, Calendar, User, ArrowRight, Video, Flame } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Article } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog & Buying Guides (2026) | Buy Best Cart',
  description: 'In-depth tech buying guides, ranked top product roundups, lab test scores, and shopping recommendations curated by Buy Best Cart editorial analysts.',
  keywords: [
    'best laptops for remote work',
    'work from home laptop 2026',
    'macbook air vs dell xps',
    'best anc headphones 2026',
    'sony xm5 vs bose qc45',
    'how does noise cancellation work',
    'how to find amazon deals',
    'how to spot fake reviews',
    'buy best cart buying guides',
    'tech buying guides 2026',
  ],
  alternates: {
    canonical: 'https://buybestcart.shop/guides',
  },
  openGraph: {
    title: 'Blog & Buying Guides (2026) | Buy Best Cart',
    description: 'In-depth tech buying guides, ranked top product roundups, lab test scores, and shopping recommendations.',
    url: 'https://buybestcart.shop/guides',
    siteName: 'Buy Best Cart',
    images: [{ url: 'https://buybestcart.shop/og-image.png', width: 1200, height: 630, alt: 'Buy Best Cart Blog & Buying Guides' }],
  },
};

export default async function GuidesIndexPage() {
  const supabase = createServerClient();
  const { data: rawArticles } = await supabase
    .from('articles')
    .select('*, category:categories(id, name, slug)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const articles = (rawArticles as Article[]) || [];
  const featuredArticle = articles[0] || null;
  const secondaryArticles = articles.slice(1);

  const breadcrumbs = [
    { name: 'Blog & Buying Guides', url: '/guides' },
  ];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
      <Breadcrumbs items={breadcrumbs} />

      {/* Header Banner */}
      <div style={{ marginBottom: '3rem', maxWidth: '780px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.06em' }}>
          <BookOpen size={14} />
          <span>EDITORIAL LAB &amp; BUYING GUIDES</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.2 }}>
          The Buy Best Cart Blog &amp; Buying Guides
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Independent hardware test scores, numbered Top Picks rankings, and expert advice to help you shop smarter on Amazon with zero marketing bias.
        </p>
      </div>

      {articles && articles.length > 0 ? (
        <>
          {/* Featured Lead Story (Hero Showcase) */}
          {featuredArticle && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '3.5rem',
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr',
                gap: 0,
              }}
              className="featured-guide-hero"
            >
              <div style={{ position: 'relative', minHeight: '320px', background: '#0F172A', overflow: 'hidden' }}>
                <img
                  src={featuredArticle.featured_image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80'}
                  alt={featuredArticle.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {featuredArticle.top_products && featuredArticle.top_products.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFF',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <Sparkles size={12} color="var(--amber-deal)" />
                    <span>Top {featuredArticle.top_products.length} Products Ranked</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--green-light)', color: 'var(--green-deep)', border: '1px solid var(--green-border)', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)' }}>
                    {featuredArticle.category?.name || 'Featured Guide'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    <span>{featuredArticle.reading_time_minutes || 6} min read</span>
                  </span>
                </div>

                <Link href={`/guides/${featuredArticle.slug}`} style={{ textDecoration: 'none' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>
                    {featuredArticle.title}
                  </h2>
                </Link>

                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {featuredArticle.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    By <strong>{featuredArticle.author_name || 'Editorial Staff'}</strong>
                  </div>

                  <Link href={`/guides/${featuredArticle.slug}`} className="btn btn-primary btn-sm">
                    Read Complete Guide →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Secondary Guides & Articles */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
              All Articles &amp; Product Showdowns
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.75rem' }}>
            {(secondaryArticles.length > 0 ? secondaryArticles : articles).map((article) => {
              const topCount = article.top_products?.length || 0;

              return (
                <article
                  key={article.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  className="blog-card hover:shadow-md hover:-translate-y-1"
                >
                  {/* Thumbnail Container */}
                  <Link href={`/guides/${article.slug}`} style={{ position: 'relative', display: 'block', aspectRatio: '16/9', overflow: 'hidden', background: '#0F172A' }}>
                    <img
                      src={article.featured_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=70'}
                      alt={article.title}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      className="hover:scale-105"
                    />

                    {topCount > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.75rem',
                          left: '0.75rem',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(6px)',
                          color: '#FFF',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Award size={11} color="var(--amber-deal)" />
                        <span>Top {topCount} Reviewed</span>
                      </div>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {article.category?.name || 'Buying Guide'}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} />
                        <span>{article.reading_time_minutes || 5} min</span>
                      </span>
                    </div>

                    <Link href={`/guides/${article.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.65rem', lineHeight: 1.35, fontFamily: 'var(--font-display)' }}>
                        {article.title}
                      </h3>
                    </Link>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.excerpt}
                    </p>

                    {/* Footer */}
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        By {article.author_name || 'Editorial Team'}
                      </div>

                      <Link href={`/guides/${article.slug}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                        Read Guide →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
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
            <BookOpen size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Buying Guides Published Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.9375rem' }}>
            Our editorial staff is preparing new product reviews and buying guides. Check back soon!
          </p>
          <Link href="/products" className="btn btn-primary">
            <span>Browse Products Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
