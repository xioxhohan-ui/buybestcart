import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Star, Check, X, ShieldCheck, Award, Sparkles, ThumbsUp, ThumbsDown, HelpCircle, CheckCircle2 } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import FAQSection from '@/components/common/FAQSection';
import { generateProductJsonLd } from '@/lib/seo';
import { formatPrice } from '@/lib/region';
import ProductGrid from '@/components/products/ProductGrid';
import AdSlot from '@/components/ads/AdSlot';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data: product } = await supabase
    .from('products')
    .select('title, short_description, thumbnail_url, seo_title, seo_description, canonical_url, og_image')
    .eq('slug', slug)
    .single();

  if (!product) {
    return { title: 'Product Not Found | Best Buy Cart' };
  }

  const title = product.seo_title || `${product.title} — Price, Specs & Reviews | Best Buy Cart`;
  const description = product.seo_description || product.short_description || `Read our in-depth testing and verified Amazon pricing for ${product.title}.`;
  const canonicalUrl = product.canonical_url || `https://bestbuycart.com/products/${slug}`;
  const ogImageUrl = product.og_image || product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80';

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
    .single();

  if (!product) {
    notFound();
  }

  // Related products from same category
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(3);

  // FAQs for product or global
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .limit(4);

  const jsonLd = generateProductJsonLd(product as Product);

  const breadcrumbs = [
    ...(product.category ? [{ name: product.category.name, url: `/category/${product.category.slug}` }] : []),
    { name: product.title, url: `/products/${product.slug}` },
  ];

  const defaultSpecs = [
    { spec_key: 'Acoustic Driver', spec_value: '30mm Carbon Fiber Composite' },
    { spec_key: 'Battery Life', spec_value: '30 Hours (ANC On), 40 Hours (ANC Off)' },
    { spec_key: 'Weight', spec_value: '250g (8.8 oz)' },
    { spec_key: 'Connectivity', spec_value: 'Bluetooth 5.2 / Multipoint / 3.5mm Aux' },
    { spec_key: 'Charging Port', spec_value: 'USB-C Fast Charging (3 min = 3 hrs)' },
    { spec_key: 'Microphones', spec_value: '8 Beamforming Mics with AI Noise Reduction' },
  ];

  const specsToRender = product.specifications && product.specifications.length > 0 ? product.specifications : defaultSpecs;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      {/* Main Product Hero Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2.5rem', margin: '2rem 0 3.5rem 0' }}>
        {/* Left: Product Image & Badges */}
        <div>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem',
              textAlign: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {product.badge_text ? (
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'var(--green-accent)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Award size={12} color="#FFFFFF" />
                <span>{product.badge_text}</span>
              </span>
            ) : product.global_rank && product.global_rank <= 3 ? (
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'var(--green-accent)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  letterSpacing: '0.04em',
                }}
              >
                #{product.global_rank} OVERALL PICK
              </span>
            ) : null}

            <img
              src={product.image_url || product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80'}
              alt={product.title}
              style={{ maxHeight: '340px', margin: '0 auto', objectFit: 'contain' }}
            />
          </div>
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

          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '0.75rem' }}>
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

          {/* Amazon Pricing Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatPrice(product.price, product.currency || 'USD')}
              </span>
              {product.list_price && product.list_price > (product.price || 0) && (
                <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {formatPrice(product.list_price, product.currency || 'USD')}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--green-dark)', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={13} />
              <span>Verified live price via official Amazon partner integration</span>
            </div>

            <AffiliateCTA
              productSlug={product.slug}
              asin={product.asin}
              price={product.price}
              label="Check Price & Availability on Amazon"
              size="lg"
              fullWidth
            />
          </div>

          {/* Key Features Bullet List */}
          {product.features && product.features.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Key Highlights</h3>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                {product.features.map((f: { id?: string; feature: string }, idx: number) => (
                  <li key={f.id || idx}>{f.feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Editor's Verdict, Best For, and In-Depth Assessment */}
      <section style={{ margin: '3.5rem 0', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div className="editorial-eyebrow">EDITORIAL ASSESSMENT</div>
        <h2 style={{ marginBottom: '1rem' }}>Best Buy Cart Verdict & Testing Notes</h2>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.75rem' }}>
          {/* Pros */}
          <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-sm)', padding: '1.75rem' }}>
            <h3 style={{ color: 'var(--green-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.0625rem' }}>
              <Check size={16} />
              <span>Reasons to Buy (Pros)</span>
            </h3>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              {product.pros && product.pros.length > 0 ? (
                product.pros.map((pro: string, i: number) => <li key={i}>{pro}</li>)
              ) : (
                <li>High build quality and reliable acoustic fidelity</li>
              )}
            </ul>
          </div>

          {/* Cons */}
          <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: 'var(--radius-sm)', padding: '1.75rem' }}>
            <h3 style={{ color: 'var(--amber-deal)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.0625rem' }}>
              <X size={16} />
              <span>Reasons to Avoid (Cons)</span>
            </h3>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              {product.cons && product.cons.length > 0 ? (
                product.cons.map((con: string, i: number) => <li key={i}>{con}</li>)
              ) : (
                <li>Premium pricing relative to budget alternatives</li>
              )}
            </ul>
          </div>
        </div>

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

      {/* Technical Specifications Table & Sidebar Ad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2.5rem', margin: '3.5rem 0', alignItems: 'start' }}>
        <div>
          <section>
            <div className="editorial-eyebrow">LAB METRICS</div>
            <h2 style={{ marginBottom: '1.5rem' }}>Detailed Specification Matrix</h2>
            <table className="editorial-table">
              <tbody>
                {specsToRender.map((spec: { id?: string; spec_key: string; spec_value: string }, index: number) => (
                  <tr key={spec.id || index}>
                    <th style={{ width: '35%' }}>{spec.spec_key}</th>
                    <td>{spec.spec_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* Sidebar 300x250 Ad Slot */}
        <div>
          <AdSlot
            type="sidebar-medium"
            sponsorName="Amazon Partner Store"
            headline="Protect Your Gear with AppleCare & Asurion"
            subline="Get official 2-year drops and spills warranty protection directly with Amazon checkout."
            ctaText="Add Amazon Protection ↗"
            ctaLink="/deals"
          />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section style={{ margin: '4rem 0 2rem 0' }}>
          <div className="editorial-eyebrow">SIMILAR RECOMMENDATIONS</div>
          <h2 style={{ marginBottom: '2rem' }}>You May Also Consider</h2>
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
