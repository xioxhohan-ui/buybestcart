import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateArticleJsonLd } from '@/lib/seo';
import { Article } from '@/types';
import { BookOpen, Award } from 'lucide-react';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, featured_image, seo_title, seo_description, canonical_url, og_image, status')
    .eq('slug', slug)
    .single();

  if (!article || article.status !== 'published') return { title: 'Guide Not Found | Best Buy Cart' };

  const title = article.seo_title || `${article.title} | Best Buy Cart Editorial`;
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
      siteName: 'Best Buy Cart',
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

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article || article.status !== 'published') {
    notFound();
  }

  const jsonLd = generateArticleJsonLd(article as Article);

  const breadcrumbs = [
    { name: 'Guides', url: '/guides' },
    { name: article.title, url: `/guides/${article.slug}` },
  ];

  return (
    <article className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem', maxWidth: '840px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {article.type === 'guide' ? (
            <>
              <BookOpen size={13} />
              <span>Editorial Buying Guide</span>
            </>
          ) : (
            <>
              <Award size={13} />
              <span>In-Depth Review</span>
            </>
          )}
        </div>
        <h1 style={{ fontSize: '2.25rem', lineHeight: 1.25, marginBottom: '1rem' }}>
          {article.title}
        </h1>
        {article.excerpt && (
          <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {article.excerpt}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span>By Editorial Testing Staff</span>
          <span>•</span>
          <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>{article.reading_time_minutes || 7} min read</span>
        </div>
      </header>

      {article.featured_image && (
        <div style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.featured_image}
            alt={article.title}
            style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Guide Body */}
      <div
        className="editorial-body"
        style={{
          fontSize: '1.0625rem',
          lineHeight: 1.8,
          color: 'var(--text-primary)',
        }}
      >
        <p>{article.content || article.body}</p>
      </div>
    </article>
  );
}
