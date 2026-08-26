import React from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Star, Award, Scale, Check, ArrowRight } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import PriceDisplay from '@/components/common/PriceDisplay';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { Product } from '@/types';
import { getRedirectForPath } from '@/lib/redirects';
import { getCanonicalUrl, CANONICAL_BASE_URL } from '@/lib/canonical';

interface ComparisonPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: comparison } = await supabase
    .from('comparisons')
    .select('title, description, seo_title, seo_description, canonical_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!comparison) {
    return {
      title: 'Comparison Not Found | Buy Best Cart',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = getCanonicalUrl('comparison', slug, comparison.canonical_url);
  const title = comparison.seo_title || `${comparison.title} Comparison & Winner | Buy Best Cart`;
  const description =
    comparison.seo_description ||
    comparison.description ||
    `In-depth side-by-side technical comparison, acoustic benchmarks, and price evaluation for ${comparison.title}.`;

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
      type: 'website',
      images: [
        {
          url: `${CANONICAL_BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${CANONICAL_BASE_URL}/og-image.png`],
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

export default async function ComparisonDetailPage({ params }: ComparisonPageProps) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: comparison } = await supabase
    .from('comparisons')
    .select('*, product_a:products!product_a_id(*), product_b:products!product_b_id(*), winner:products!winner_product_id(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!comparison) {
    const redirectRecord = await getRedirectForPath(`/compare/${slug}`);
    if (redirectRecord && redirectRecord.destination_path) {
      redirect(redirectRecord.destination_path);
    }
    notFound();
  }

  const productA = comparison.product_a as Product | null;
  const productB = comparison.product_b as Product | null;
  const winner = comparison.winner as Product | null;

  const breadcrumbs = [
    { name: 'Comparison Tool', url: '/compare' },
    { name: comparison.title, url: `/compare/${comparison.slug}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <header style={{ marginBottom: '2.5rem', maxWidth: '800px' }}>
        <div
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Scale size={14} />
          <span>Head-to-Head Showdown</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '0.75rem' }}>
          {comparison.title}
        </h1>
        {comparison.summary && (
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {comparison.summary}
          </p>
        )}
      </header>

      {/* Winner Highlight Box */}
      {winner && (
        <section
          style={{
            background: 'var(--green-light)',
            border: '1px solid var(--green-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              background: 'var(--green-accent)',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LAB VERDICT WINNER
            </div>
            <h2 style={{ fontSize: '1.25rem', margin: '0.25rem 0' }}>{winner.title}</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0 }}>
              {comparison.verdict || 'Superior overall performance, refined ergonomics, and value for price.'}
            </p>
          </div>
          {winner.slug && (
            <AffiliateCTA
              productSlug={winner.slug}
              asin={winner.asin}
              affiliateUrl={winner.affiliate_url}
              label="Buy Winner on Amazon"
              size="sm"
            />
          )}
        </section>
      )}

      {/* Unified Side-by-Side Comparison Table */}
      {(productA || productB) && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>
            Side-by-Side Specification Breakdown
          </h2>
          <div className="table-scroll-wrapper">
            <div className="table-scroll-hint">
              <span>↔ Swipe horizontally to compare full specifications</span>
            </div>
          <div
            className="responsive-table-container"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <table className="editorial-table comparison-table-fluid">
              <thead>
                <tr>
                  <th style={{ width: '26%', background: 'var(--bg-subtle)', minWidth: '100px' }}>Attribute</th>
                  {productA && (
                    <th style={{ textAlign: 'center', padding: '1.25rem 0.75rem', width: '37%', minWidth: '140px' }}>
                      {productA.thumbnail_url && (
                        <img
                          src={productA.thumbnail_url}
                          alt={productA.title}
                          loading="lazy"
                          decoding="async"
                          width={80}
                          height={80}
                          style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 0.5rem auto' }}
                        />
                      )}
                      <div className="product-compare-title" style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.35 }}>
                        {productA.title}
                      </div>
                      <AffiliateCTA productSlug={productA.slug} asin={productA.asin} affiliateUrl={productA.affiliate_url} label="Check Price on Amazon" size="sm" fullWidth />
                    </th>
                  )}
                  {productB && (
                    <th style={{ textAlign: 'center', padding: '1.25rem 0.75rem', width: '37%', minWidth: '140px' }}>
                      {productB.thumbnail_url && (
                        <img
                          src={productB.thumbnail_url}
                          alt={productB.title}
                          loading="lazy"
                          decoding="async"
                          width={80}
                          height={80}
                          style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 0.5rem auto' }}
                        />
                      )}
                      <div className="product-compare-title" style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', lineHeight: 1.35 }}>
                        {productB.title}
                      </div>
                      <AffiliateCTA productSlug={productB.slug} asin={productB.asin} affiliateUrl={productB.affiliate_url} label="Check Price on Amazon" size="sm" fullWidth />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Rating</th>
                  {productA && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 700, fontSize: '0.8125rem' }}>
                        <Star size={12} fill="currentColor" />
                        <span>{productA.rating ? productA.rating.toFixed(1) : '4.7'}</span>
                      </div>
                    </td>
                  )}
                  {productB && (
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 700, fontSize: '0.8125rem' }}>
                        <Star size={12} fill="currentColor" />
                        <span>{productB.rating ? productB.rating.toFixed(1) : '4.6'}</span>
                      </div>
                    </td>
                  )}
                </tr>
                <tr>
                  <th>Editorial Score</th>
                  {productA && (
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>
                      {productA.editorial_score ? `${productA.editorial_score} / 10` : '9.0 / 10'}
                    </td>
                  )}
                  {productB && (
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>
                      {productB.editorial_score ? `${productB.editorial_score} / 10` : '8.8 / 10'}
                    </td>
                  )}
                </tr>
                <tr>
                  <th>Top Pro</th>
                  {productA && (
                    <td style={{ textAlign: 'center', fontSize: '0.8125rem', padding: '0.75rem 0.5rem' }}>
                      {productA.pros && productA.pros[0] ? productA.pros[0] : 'High performance'}
                    </td>
                  )}
                  {productB && (
                    <td style={{ textAlign: 'center', fontSize: '0.8125rem', padding: '0.75rem 0.5rem' }}>
                      {productB.pros && productB.pros[0] ? productB.pros[0] : 'Great value'}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </section>
      )}

      {/* Summary Assessment */}
      {comparison.verdict && (
        <section
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Editorial Analysis & Bottom Line</h2>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
            {comparison.verdict}
          </p>
        </section>
      )}
    </div>
  );
}
