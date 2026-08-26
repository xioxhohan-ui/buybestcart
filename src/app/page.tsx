import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Microscope,
  Globe2,
  ShieldCheck,
  Tag,
  BookOpen,
  Flame,
} from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { getSiteConfiguration } from '@/lib/settings';
import { SITE_URL } from '@/lib/constants';
import { Product, Article, Category } from '@/types';
import AnimatedHero from '@/components/home/AnimatedHero';
import AnimatedStats from '@/components/home/AnimatedStats';
import AnimatedSection from '@/components/home/AnimatedSection';
import TrendingProductsSection from '@/components/home/TrendingProductsSection';
import ComparisonMatrixSection from '@/components/home/ComparisonMatrixSection';
import CategoryShowcaseGrid from '@/components/home/CategoryShowcaseGrid';
import NewsletterSection from '@/components/home/NewsletterSection';
import ProductGrid from '@/components/products/ProductGrid';
import FAQSection from '@/components/common/FAQSection';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfiguration();
  const siteUrl = SITE_URL;

  return {
    title: `${config.site_name} — ${config.tagline}`,
    description: config.brand_description || config.hero_description || 'Curated, laboratory-tested tech reviews, side-by-side specification matrices, and verified Amazon deals.',
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: `${config.site_name} — ${config.tagline}`,
      description: config.brand_description || config.hero_description,
      url: siteUrl,
      siteName: config.site_name,
      type: 'website',
      images: [
        {
          url: config.og_default_image || `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${config.site_name} — ${config.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.site_name} — ${config.tagline}`,
      description: config.brand_description || config.hero_description,
      images: [config.default_social_image || `${siteUrl}/og-image.png`],
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

export default async function HomePage() {
  const supabase = createServerClient();
  const config = await getSiteConfiguration();

  // Parallel data fetching for performance
  const [
    { data: featuredProducts },
    { data: dealsProducts },
    { data: categories },
    { data: articles },
    { data: dbFaqs },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
      .or('is_featured.eq.true,is_editor_choice.eq.true')
      .in('status', ['active', 'featured', 'published'])
      .order('editorial_score', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
      .or('show_in_deals.eq.true,is_deal.eq.true,deal_status.neq.none')
      .in('status', ['active', 'featured', 'published'])
      .order('updated_at', { ascending: false })
      .limit(4),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(9),
    supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(5),
  ]);

  const faqsToRender = (dbFaqs || []) as unknown as import('@/types').FAQ[];
  const featuredHeroProduct = featuredProducts && featuredProducts.length > 0 ? (featuredProducts[0] as Product) : null;

  const sectionMap: Record<string, React.ReactNode> = {
    hero: (
      <AnimatedHero
        key="sec-hero"
        heading={config.hero_heading}
        subheading={config.hero_subheading}
        description={config.hero_description}
        featuredProduct={featuredHeroProduct}
      />
    ),
    marquee: (
      <div key="sec-marquee" className="marquee-container">
        <div className="marquee-content">
          <span>{config.marquee_text}</span>
          <span>•</span>
          <span>{config.marquee_text}</span>
        </div>
      </div>
    ),
    stats: <AnimatedStats key="sec-stats" />,
    picks: (
      <AnimatedSection key="sec-picks" animationType="fade-up" delay={0.1}>
        <section className="container" id="featured-picks" style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="editorial-eyebrow">THE 2026 EDIT</div>
              <h2>Editors&apos; Top Selections</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                Hand-tested consumer hardware ranked by acoustics, build fidelity, and real-world value.
              </p>
            </div>
            <Link href="/category" className="btn btn-secondary btn-sm">
              All 9 Departments →
            </Link>
          </div>

          <ProductGrid products={(featuredProducts as Product[]) || []} />
        </section>
      </AnimatedSection>
    ),
    trending: <TrendingProductsSection key="sec-trending" products={(featuredProducts as Product[]) || []} />,
    comparison: <ComparisonMatrixSection key="sec-comparison" products={(featuredProducts as Product[]) || []} />,
    deals: dealsProducts && dealsProducts.length > 0 ? (
      <AnimatedSection key="sec-deals" animationType="fade-up">
        <section className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="editorial-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flame size={12} color="var(--amber-deal)" />
                <span>TIME-SENSITIVE VALUE</span>
              </div>
              <h2>Today&apos;s Highlighted Price Drops</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                Verified discounts compared against historical Amazon price tracker averages.
              </p>
            </div>
            <Link href="/deals" className="btn btn-secondary btn-sm">
              View All Today&apos;s Deals →
            </Link>
          </div>

          <ProductGrid products={(dealsProducts as Product[]) || []} columns={4} />
        </section>
      </AnimatedSection>
    ) : null,
    categories: <CategoryShowcaseGrid key="sec-categories" categories={(categories as Category[]) || []} />,
    guides: (
      <AnimatedSection key="sec-guides" animationType="fade-up">
        <section className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="editorial-eyebrow">EDITORIAL ARCHIVE</div>
              <h2>2026 In-Depth Buying Guides</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
                Long-form comparisons, acoustic measurements, and lab testing notes.
              </p>
            </div>
            <Link href="/guides" className="btn btn-secondary btn-sm">
              All Editorial Guides →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
            {(articles as Article[])?.map((art) => (
              <Link key={art.id} href={`/guides/${art.slug}`} className="guide-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="editorial-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BookOpen size={10} color="#FFFFFF" />
                    <span>BUYING GUIDE</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {art.reading_time_minutes ? `${art.reading_time_minutes} min read` : '7 min read'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                  {art.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {art.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-accent)' }}>
                  <span>Read Complete Review</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </AnimatedSection>
    ),
    standards: (
      <section key="sec-standards" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
            <div className="editorial-eyebrow" style={{ justifyContent: 'center' }}>OUR EDITORIAL STANDARD</div>
            <h2>Why Millions Trust Our Recommendations</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
              We adhere to strict testing protocols to ensure our ratings represent genuine real-world quality.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '2rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--green-accent)' }}>
                <Microscope size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Laboratory Benchmark Testing</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every headphone, laptop, and smart home sensor undergoes standardized measurement for frequency response, latency, and thermal endurance.
              </p>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--green-accent)' }}>
                <Globe2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>11 Global Amazon Storefronts</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Real-time regional currency conversion and geo-targeted product availability across US, UK, Canada, Germany, Japan, and Australia.
              </p>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--green-accent)' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Zero Sponsored Placements</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Editorial rankings cannot be purchased. Brands cannot pay for higher placement or favorable acoustic scores in our buying guides.
              </p>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#FAF9F6' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--green-accent)' }}>
                <Tag size={28} />
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Automated Price Validation</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We continuously compare current Amazon prices against 90-day historical averages to ensure deals represent authentic financial savings.
              </p>
            </div>
          </div>
        </div>
      </section>
    ),
    newsletter: <NewsletterSection key="sec-newsletter" />,
    faq: <FAQSection key="sec-faq" faqs={faqsToRender} />,
  };

  const configuredSections = (config.homepage_sections || [])
    .filter((sec) => sec.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div>
      {configuredSections.map((sec) => {
        const key = sec.type || sec.id.replace('sec-', '');
        return sectionMap[key] || null;
      })}
    </div>
  );
}
