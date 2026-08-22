import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateArticleJsonLd } from '@/lib/seo';
import { Article } from '@/types';
import { BookOpen, Award, Sparkles, Clock, Calendar, User, ShieldCheck, ArrowRight, Share2 } from 'lucide-react';
import TopProductsSection from '@/components/guides/TopProductsSection';
import DetailedProductReviewsSection from '@/components/guides/DetailedProductReviewsSection';
import ArticleContentRenderer from '@/components/guides/ArticleContentRenderer';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, featured_image, seo_title, seo_description, canonical_url, og_image, status')
    .eq('slug', slug)
    .single();

  if (!article || article.status !== 'published') return { title: 'Guide Not Found | Buy Best Cart' };

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || `Read the complete buying guide and lab recommendations for ${article.title}.`;
  const siteUrl = 'https://buybestcart.shop';
  const rawCanonical = article.canonical_url ? article.canonical_url.replace(/https?:\/\/(www\.)?bestbuycart\.com/g, siteUrl) : null;
  const canonicalUrl = rawCanonical || `${siteUrl}/guides/${slug}`;
  const ogImageUrl = article.og_image || article.featured_image || `${siteUrl}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Buy Best Cart',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
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
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const supabase = createServerClient();

  const [{ data: article }, { data: relatedRaw }] = await Promise.all([
    supabase
      .from('articles')
      .select('*, category:categories(id, name, slug)')
      .eq('slug', slug)
      .single(),
    supabase
      .from('articles')
      .select('id, title, slug, excerpt, featured_image, created_at, reading_time_minutes, top_products, category:categories(name)')
      .eq('status', 'published')
      .neq('slug', slug)
      .limit(3),
  ]);

  if (!article || article.status !== 'published') {
    notFound();
  }

  const jsonLd = generateArticleJsonLd(article as Article);
  const relatedArticles = (relatedRaw as unknown as Article[]) || [];

  const breadcrumbs = [
    { name: 'Blog & Buying Guides', url: '/guides' },
    { name: article.title, url: `/guides/${article.slug}` },
  ];

  const publishDate = new Date(article.published_at || article.publish_date || article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const topProducts = article.top_products || [];

  return (
    <article className="container" style={{ paddingTop: '1.5rem', paddingBottom: '5rem', maxWidth: '880px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      {/* Article Header */}
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {article.category?.name || (article.content_type === 'buying_guide' ? 'Buying Guide' : 'In-Depth Review')}
          </span>

          {topProducts.length > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={11} />
              <span>Top {topProducts.length} Ranked Picks</span>
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.25, marginBottom: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
          {article.title}
        </h1>

        {article.excerpt && (
          <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {article.excerpt}
          </p>
        )}

        {/* Metadata Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-accent)', fontWeight: 800 }}>
              <User size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {article.author_name || 'Editorial Testing Staff'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {article.author_role || 'Senior Hardware & Lab Analyst'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={13} />
              <span>{publishDate}</span>
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={13} />
              <span>{article.reading_time_minutes || 7} min read</span>
            </span>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      {article.featured_image && (
        <div style={{ marginBottom: '3rem', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', background: '#0F172A' }}>
          <img
            src={article.featured_image}
            alt={article.title}
            loading="eager"
            decoding="async"
            style={{ width: '100%', height: 'auto', maxHeight: '460px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* 1. Introduction & 2026 Market Overview Section */}
      {article.introduction && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            1. Introduction &amp; 2026 Market Overview
          </h2>
          <div style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-primary)' }}>
            {article.introduction.split('\n').filter((p: string) => p.trim()).map((para: string, pIdx: number) => (
              <p key={pIdx} style={{ marginBottom: '1.25rem' }}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* 2. Top Products Summary & Jump Nav */}
      {topProducts.length > 0 && (
        <TopProductsSection products={topProducts} title="2. Our Top Picks" subtitle="Independently tested, ranked, and verified by our editorial lab staff." />
      )}

      {/* 3. Detailed Product Sections (Full Reviews, Specs, Galleries, Pros/Cons, Who It Is Best For) */}
      {topProducts.length > 0 && (
        <DetailedProductReviewsSection products={topProducts} title="3. In-Depth Product Reviews &amp; Lab Scores" subtitle="Detailed hardware analysis, customizable specifications, performance observations, pros/cons, and verified Amazon deals for each ranked pick." />
      )}

      {/* Rich Article Body Content */}
      <ArticleContentRenderer content={article.content || article.body} videos={article.videos} />

      {/* Tags Row */}
      {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Related Topics:
          </span>
          {(article.tags as string[]).map((tag: string, tIdx: number) => (
            <span
              key={tIdx}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio Box */}
      <div
        style={{
          marginTop: '3.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          display: 'flex',
          gap: '1.25rem',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--green-light)',
            border: '2px solid var(--green-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--green-accent)',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={28} />
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
            Buy Best Cart Editorial Standards
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Authored by {article.author_name || 'The Buy Best Cart Editorial Staff'}
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Every product recommended in our guides is benchmarked against real-world criteria including acoustics, battery endurance, thermal throttling, and build longevity. We maintain strict editorial independence from all merchants.
          </p>
        </div>
      </div>

      {/* Related Buying Guides Carousel / Grid */}
      {relatedArticles.length > 0 && (
        <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>
            More Recommended Guides &amp; Reviews
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                href={`/guides/${rel.slug}`}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                className="hover:shadow-md hover:-translate-y-1"
              >
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#0F172A' }}>
                  <img
                    src={rel.featured_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60'}
                    alt={rel.title}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    {rel.category?.name || 'Buying Guide'}
                  </div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    {rel.title}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {rel.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
