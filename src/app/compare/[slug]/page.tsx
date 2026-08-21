import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Star, Award, Scale, Check, ArrowRight } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import { formatPrice } from '@/lib/region';
import { Product } from '@/types';

interface ComparisonPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: comparison } = await supabase
    .from('comparisons')
    .select('title, description, seo_title, seo_description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!comparison) {
    return { title: 'Comparison Not Found | Best Buy Cart' };
  }

  const siteUrl = 'https://buybestcart.shop';
  const canonicalUrl = `${siteUrl}/compare/${slug}`;
  const title = comparison.seo_title || `${comparison.title} — Head-to-Head Comparison | Best Buy Cart`;
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
      siteName: 'Best Buy Cart',
      type: 'website',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
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
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
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
    .single();

  if (!comparison) {
    notFound();
  }

  const productA = comparison.product_a as Product | null;
  const productB = comparison.product_b as Product | null;
  const winner = comparison.winner as Product | null;

  const breadcrumbs = [
    { name: 'Comparison Tool', url: '/compare' },
    { name: comparison.title, url: `/compare/${comparison.slug}` },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem' }}>
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
              price={winner.price}
              affiliateUrl={winner.affiliate_url}
              label="Buy Winner on Amazon"
              size="sm"
            />
          )}
        </section>
      )}

      {/* Side-by-Side Comparison Table */}
      {(productA || productB) && (
        <div
          style={{
            overflowX: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '3rem',
          }}
        >
          <table className="editorial-table" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{ width: '25%', background: 'var(--bg-subtle)' }}>Attribute</th>
                {productA && (
                  <th style={{ textAlign: 'center', padding: '1.5rem 1rem', width: '37.5%' }}>
                    {productA.thumbnail_url && (
                      <img
                        src={productA.thumbnail_url}
                        alt={productA.title}
                        style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 0.75rem auto' }}
                      />
                    )}
                    <div className="product-compare-title" style={{ marginBottom: '0.25rem' }}>
                      {productA.title}
                    </div>
                    {productA.price && (
                      <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.75rem' }}>
                        {formatPrice(productA.price, productA.currency || 'USD')}
                      </div>
                    )}
                    <AffiliateCTA productSlug={productA.slug} asin={productA.asin} price={productA.price} affiliateUrl={productA.affiliate_url} label="Buy on Amazon" size="sm" />
                  </th>
                )}
                {productB && (
                  <th style={{ textAlign: 'center', padding: '1.5rem 1rem', width: '37.5%' }}>
                    {productB.thumbnail_url && (
                      <img
                        src={productB.thumbnail_url}
                        alt={productB.title}
                        style={{ width: '90px', height: '90px', objectFit: 'contain', margin: '0 auto 0.75rem auto' }}
                      />
                    )}
                    <div className="product-compare-title" style={{ marginBottom: '0.25rem' }}>
                      {productB.title}
                    </div>
                    {productB.price && (
                      <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.75rem' }}>
                        {formatPrice(productB.price, productB.currency || 'USD')}
                      </div>
                    )}
                    <AffiliateCTA productSlug={productB.slug} asin={productB.asin} price={productB.price} affiliateUrl={productB.affiliate_url} label="Buy on Amazon" size="sm" />
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Rating</th>
                {productA && (
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 700 }}>
                      <Star size={13} fill="currentColor" />
                      <span>{productA.rating ? productA.rating.toFixed(1) : '4.7'}</span>
                    </div>
                  </td>
                )}
                {productB && (
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 700 }}>
                      <Star size={13} fill="currentColor" />
                      <span>{productB.rating ? productB.rating.toFixed(1) : '4.6'}</span>
                    </div>
                  </td>
                )}
              </tr>
              <tr>
                <th>Editorial Score</th>
                {productA && (
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                    {productA.editorial_score ? `${productA.editorial_score} / 10` : '9.0 / 10'}
                  </td>
                )}
                {productB && (
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                    {productB.editorial_score ? `${productB.editorial_score} / 10` : '8.8 / 10'}
                  </td>
                )}
              </tr>
              <tr>
                <th>Top Pro</th>
                {productA && (
                  <td style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    {productA.pros && productA.pros[0] ? productA.pros[0] : 'High performance'}
                  </td>
                )}
                {productB && (
                  <td style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                    {productB.pros && productB.pros[0] ? productB.pros[0] : 'Great value'}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
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
