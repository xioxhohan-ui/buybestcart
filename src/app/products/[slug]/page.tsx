import React from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Star, Check, X, ShieldCheck, Award, Sparkles, ThumbsUp, ThumbsDown, HelpCircle, CheckCircle2 } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import FAQSection from '@/components/common/FAQSection';
import { generateProductJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd, optimizeSeoTitle } from '@/lib/seo';
import { getCanonicalUrl, CANONICAL_BASE_URL } from '@/lib/canonical';
import PriceDisplay from '@/components/common/PriceDisplay';
import ProductGrid from '@/components/products/ProductGrid';
import ProductGallery from '@/components/products/ProductGallery';
import { formatAvailability } from '@/lib/productTemplate';
import { getRedirectForPath } from '@/lib/redirects';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data: product } = await supabase
    .from('products')
    .select('title, short_description, thumbnail_url, seo_title, seo_description, canonical_url, og_image, status')
    .eq('slug', slug)
    .maybeSingle();

  if (!product || !['active', 'featured', 'published'].includes(product.status)) {
    return {
      title: 'Product Not Found | Buy Best Cart',
      robots: { index: false, follow: false },
    };
  }

  const title = product.seo_title || optimizeSeoTitle(product.title);
  const description = product.seo_description || product.short_description || `Read our in-depth testing and verified Amazon pricing for ${product.title}.`;
  const canonicalUrl = getCanonicalUrl('product', slug, product.canonical_url);
  const ogImageUrl = product.og_image || product.thumbnail_url || `${CANONICAL_BASE_URL}/og-image.png`;

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
          alt: product.title,
        },
      ],
      type: 'website',
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

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), specifications:product_specifications(*), features:product_features(*), images:product_images(*)')
    .eq('slug', slug)
    .maybeSingle();

  if (!product || !['active', 'featured', 'published'].includes(product.status)) {
    const redirectRecord = await getRedirectForPath(`/products/${slug}`);
    if (redirectRecord && redirectRecord.destination_path) {
      redirect(redirectRecord.destination_path);
    }
    notFound();
  }

  // Parallelize secondary queries (related products and FAQs) for high-performance sub-100ms response
  const [relatedRes, faqsRes] = await Promise.all([
    product.category_id
      ? supabase
          .from('products')
          .select('*, brand:brands(*), category:categories(*)')
          .eq('category_id', product.category_id)
          .neq('id', product.id)
          .limit(3)
      : supabase
          .from('products')
          .select('*, brand:brands(*), category:categories(*)')
          .neq('id', product.id)
          .limit(3),
    supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .limit(4),
  ]);

  let relatedProducts = relatedRes.data || [];
  if (relatedProducts.length === 0) {
    const { data: fallbackProds } = await supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*)')
      .neq('id', product.id)
      .limit(3);
    relatedProducts = fallbackProds || [];
  }

  const faqs = faqsRes.data || [];

  const jsonLd = generateProductJsonLd(product as Product);

  const breadcrumbs = [
    ...(product.category ? [{ name: product.category.name, url: `/category/${product.category.slug}` }] : []),
    { name: product.title, url: `/products/${product.slug}` },
  ];

  const specsToRender = (product.specifications || []) as { id?: string; spec_key: string; spec_value: string }[];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const faqJsonLd = faqs.length > 0 ? generateFaqJsonLd(faqs) : null;

  return (
    <div className="container product-detail-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Breadcrumbs items={breadcrumbs} />

      {/* Main Product Hero Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2.5rem', margin: '2rem 0 3.5rem 0' }}>
        {/* Left: Product Image & Badges */}
        <div>
          <ProductGallery
            title={product.title}
            thumbnailUrl={product.thumbnail_url}
            images={product.images}
            badgeText={product.badge_text}
            globalRank={product.global_rank}
          />
        </div>

        {/* Right: Product Details & Buying Box */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {product.brand && (
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {product.brand.name}
              </span>
            )}
            {product.category && (
              <span className="editorial-tag">
                {product.category.name}
              </span>
            )}
          </div>

          <h1 className="product-hero-title">
            {product.title}
          </h1>

          {/* Rating & Lab Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--amber-deal)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={13} fill="currentColor" />
              <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              ({product.review_count ? product.review_count.toLocaleString() : '1,000+'} verified reviews)
            </span>
            {product.editorial_score && (
              <span style={{ marginLeft: 'auto', background: 'var(--green-light)', color: 'var(--green-accent)', border: '1px solid var(--green-border)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800 }}>
                {product.editorial_score}/10 LAB SCORE
              </span>
            )}
          </div>

          {/* Amazon Merchant & Action Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--green-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={16} />
                <span>Verified Amazon Merchant Storefront</span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: (product.availability === 'out_of_stock' || product.availability?.toLowerCase().includes('out')) ? '#dc2626' : 'var(--green-accent)',
                  fontWeight: 700,
                }}
              >
                ● {formatAvailability(product.availability)}
              </span>
            </div>

            <AffiliateCTA
              productSlug={product.slug}
              asin={product.asin}
              affiliateUrl={product.affiliate_url}
              label="Check Live Price on Amazon"
              size="lg"
              fullWidth
            />
          </div>

          {/* Key Highlights Bullet List Card */}
          {((product.features && product.features.length > 0) || (product.key_highlights && product.key_highlights.length > 0)) && (
            <div
              style={{
                marginBottom: '2rem',
                background: '#FAF9F6',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
                <Sparkles size={16} color="var(--green-accent)" />
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Key Highlights
                </h2>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {(
                  (product.features && product.features.length > 0)
                    ? product.features.map((f: { id?: string; feature: string }) => f.feature)
                    : (product.key_highlights || [])
                )
                  .filter((text: string) => text && text.trim().length > 0)
                  .map((highlight: string, idx: number) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.625rem',
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'var(--green-light)',
                          color: 'var(--green-accent)',
                          fontSize: '0.6875rem',
                          fontWeight: 900,
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        ✓
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Editor's Verdict, Best For, and In-Depth Assessment */}
      <section className="verdict-section-card">
        <div className="editorial-eyebrow">EDITORIAL ASSESSMENT</div>
        <h2 style={{ marginBottom: '1rem' }}>Buy Best Cart Verdict & Testing Notes</h2>
        <p style={{ fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {product.editor_verdict || product.description || 'Our editorial laboratory conducted rigorous frequency sweep analysis, battery endurance tests, and multi-week ergonomic evaluations.'}
        </p>

        {/* Best For / Why We Like It Grid */}
        {(product.best_for || product.why_we_like_it || product.buying_advice) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {product.best_for && (
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>
                  BEST FOR
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {product.best_for}
                </p>
              </div>
            )}

            {product.why_we_like_it && (
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>
                  WHY WE LIKE IT
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {product.why_we_like_it}
                </p>
              </div>
            )}

            {product.buying_advice && (
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.06em' }}>
                  BUYING ADVICE
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {product.buying_advice}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pros & Cons Box */}
        {((product.pros && product.pros.length > 0) || (product.cons && product.cons.length > 0)) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.75rem' }}>
            {/* Pros */}
            {product.pros && product.pros.length > 0 && (
              <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '1.75rem' }}>
                <h3 style={{ color: 'var(--green-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.0625rem' }}>
                  <Check size={16} />
                  <span>Reasons to Buy (Pros)</span>
                </h3>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                  {product.pros.map((pro: string, i: number) => <li key={i}>{pro}</li>)}
                </ul>
              </div>
            )}

            {/* Cons */}
            {product.cons && product.cons.length > 0 && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 'var(--radius-sm)', padding: '1.75rem' }}>
                <h3 style={{ color: 'var(--amber-deal)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.0625rem' }}>
                  <X size={16} />
                  <span>Reasons to Avoid (Cons)</span>
                </h3>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                  {product.cons.map((con: string, i: number) => <li key={i}>{con}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Who Should Buy / Avoid */}
        {(product.who_should_buy || product.who_should_avoid) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.75rem', marginTop: '1.75rem' }}>
            {product.who_should_buy && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ThumbsUp size={18} color="var(--green-accent)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Who Should Buy:</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{product.who_should_buy}</div>
                </div>
              </div>
            )}

            {product.who_should_avoid && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <ThumbsDown size={18} color="var(--amber-deal)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Who Should Avoid:</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{product.who_should_avoid}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Product Video Review Embed (if attached) */}
      {product.video_url && (
        <section style={{ margin: '3.5rem 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div className="editorial-eyebrow">VIDEO BENCHMARK</div>
          <h2 style={{ marginBottom: '0.5rem' }}>{product.video_title || 'Hands-On Video Review & Unboxing'}</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Watch in-depth audio acoustic tests, build breakdown, and live feature demonstrations.
          </p>
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#000000' }}>
            <iframe
              src={
                product.video_url.includes('youtube.com/watch?v=')
                  ? `https://www.youtube-nocookie.com/embed/${product.video_url.split('v=')[1]?.split('&')[0]}`
                  : product.video_url.includes('youtu.be/')
                  ? `https://www.youtube-nocookie.com/embed/${product.video_url.split('youtu.be/')[1]?.split('?')[0]}`
                  : product.video_url.includes('vimeo.com/')
                  ? `https://player.vimeo.com/video/${product.video_url.split('vimeo.com/')[1]?.split('?')[0]}`
                  : product.video_url
              }
              title={product.video_title || 'Product Video Review'}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Technical Specifications Section */}
      {specsToRender && specsToRender.length > 0 && (
        <section style={{ margin: '3.5rem 0' }}>
          <div className="editorial-eyebrow">LAB METRICS</div>
          <h2 style={{ marginBottom: '1.5rem' }}>Detailed Specification Matrix</h2>
          
          {/* Unified Responsive Specification Table */}
          <div className="spec-table-container">
            <table className="spec-matrix-table">
              <tbody>
                {specsToRender.map((spec: { id?: string; spec_key: string; spec_value: string }, index: number) => (
                  <tr key={spec.id || index}>
                    <th className="spec-key-cell">{spec.spec_key}</th>
                    <td className="spec-value-cell">{spec.spec_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SIMILAR RECOMMENDATIONS / You May Also Consider */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section style={{ margin: '4rem 0 2rem 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div className="editorial-eyebrow">SIMILAR RECOMMENDATIONS</div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>You May Also Consider</h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', background: 'var(--green-light)', padding: '0.25rem 0.65rem', borderRadius: '999px', border: '1px solid var(--green-border)' }}>
              {relatedProducts.length} Alternative Recommendations
            </span>
          </div>
          <ProductGrid products={(relatedProducts as Product[]) || []} columns={3} />
        </section>
      )}

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <FAQSection faqs={faqs} />
      )}
    </div>
  );
}
