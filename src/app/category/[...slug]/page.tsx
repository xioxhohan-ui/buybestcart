import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { Category, Product } from '@/types';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ProductGrid from '@/components/products/ProductGrid';
import FAQSection from '@/components/common/FAQSection';
import CategorySortSelect from '@/components/category/CategorySortSelect';
import { generateBreadcrumbJsonLd, generateItemListJsonLd, generateFaqJsonLd } from '@/lib/seo';
import { getCanonicalUrl, CANONICAL_BASE_URL } from '@/lib/canonical';
import { SITE_URL } from '@/lib/constants';
import { getRedirectForPath } from '@/lib/redirects';

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ sort?: string; brand?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return {
      title: 'Category Not Found | Buy Best Cart',
      robots: { index: false, follow: false },
    };
  }
  const categorySlug = slug[slug.length - 1];
  const supabase = createServerClient();

  const { data: category } = await supabase
    .from('categories')
    .select('name, description, seo_title, seo_description, image_url, canonical_url, is_active')
    .eq('slug', categorySlug)
    .maybeSingle();
  let activeCategory: any = category;
  if (!activeCategory) {
    const searchTerms = categorySlug.split('-').filter((t) => t.length > 2);
    const primaryTerm = searchTerms[0] || categorySlug;
    const { data: matched } = await supabase
      .from('products')
      .select('id')
      .or(`title.ilike.%${primaryTerm}%,short_description.ilike.%${primaryTerm}%`)
      .in('status', ['active', 'featured', 'published'])
      .limit(1);

    if (!matched || matched.length === 0) {
      return {
        title: 'Category Not Found | Buy Best Cart',
        robots: { index: false, follow: false },
      };
    }
  }

  if (activeCategory && activeCategory.is_active === false) {
    return {
      title: 'Category Not Found | Buy Best Cart',
      robots: { index: false, follow: false },
    };
  }

  const titleWords = categorySlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const title = activeCategory?.seo_title || `Best ${activeCategory?.name || titleWords} of 2026 — Tested & Ranked | Buy Best Cart`;
  const description = activeCategory?.seo_description || activeCategory?.description || `Discover the highest-rated ${activeCategory?.name || titleWords} ranked by laboratory benchmarks with verified Amazon pricing.`;
  const canonicalUrl = getCanonicalUrl('category', categorySlug, activeCategory?.canonical_url);
  const ogImageUrl = activeCategory?.image_url || `${CANONICAL_BASE_URL}/og-image.png`;

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
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Best ${category?.name || titleWords}`,
        },
      ],
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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    notFound();
  }
  const resolvedSearchParams = await searchParams;
  const categorySlug = slug[slug.length - 1];
  const supabase = createServerClient();

  let { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .maybeSingle();

  let isVirtualCategory = false;

  // Graceful Fallback: If not an exact category slug, search catalog by keywords
  if (!category) {
    const searchTerms = categorySlug.split('-').filter(t => t.length > 2);
    const primaryTerm = searchTerms[0] || categorySlug;

    // Check if products match keyword
    const { data: matchedProducts } = await supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
      .or(`title.ilike.%${primaryTerm}%,short_description.ilike.%${primaryTerm}%`)
      .in('status', ['active', 'featured', 'published'])
      .limit(1);

    if (matchedProducts && matchedProducts.length > 0) {
      isVirtualCategory = true;
      const titleWords = categorySlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      category = {
        id: `virtual-${categorySlug}`,
        name: titleWords,
        slug: categorySlug,
        description: `Curated collection of top-rated ${titleWords} lab-tested and verified with authentic Amazon pricing.`,
        seo_title: `Best ${titleWords} of 2026 — Tested & Ranked | Buy Best Cart`,
        seo_description: `Discover the highest-rated ${titleWords} ranked by laboratory benchmarks with verified Amazon pricing.`,
        is_active: true,
        is_featured: false,
        display_order: 1,
        depth: 1,
        product_count: matchedProducts.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      const redirectRecord = await getRedirectForPath(`/category/${categorySlug}`);
      if (redirectRecord && redirectRecord.destination_path) {
        redirect(redirectRecord.destination_path);
      }
      notFound();
    }
  }

  // Fetch products in this category
  let query = supabase
    .from('products')
    .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
    .in('status', ['active', 'featured', 'published']);

  if (isVirtualCategory) {
    const searchTerms = categorySlug.split('-').filter(t => t.length > 2);
    const primaryTerm = searchTerms[0] || categorySlug;
    query = query.or(`title.ilike.%${primaryTerm}%,short_description.ilike.%${primaryTerm}%`);
  } else {
    query = query.eq('category_id', category.id);
  }

  if (resolvedSearchParams.sort === 'price_asc') {
    query = query.order('price', { ascending: true, nullsFirst: false });
  } else if (resolvedSearchParams.sort === 'price_desc') {
    query = query.order('price', { ascending: false, nullsFirst: false });
  } else if (resolvedSearchParams.sort === 'rating') {
    query = query.order('rating', { ascending: false, nullsFirst: false });
  } else {
    // Default rank order
    query = query.order('category_rank', { ascending: true, nullsFirst: false });
  }

  const [productsRes, subcategoriesRes, faqsRes] = await Promise.all([
    query,
    isVirtualCategory
      ? Promise.resolve({ data: [] })
      : supabase
          .from('categories')
          .select('*')
          .eq('parent_id', category.id)
          .eq('is_active', true),
    supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .limit(4),
  ]);

  const products = (productsRes.data as Product[]) || [];
  const subcategories = subcategoriesRes.data || [];
  const faqs = faqsRes.data || [];

  const breadcrumbs = [
    { name: 'Categories', url: '/category' },
    { name: category.name, url: `/category/${category.slug}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    `Top Ranked ${category.name}`,
    category.description || `Laboratory benchmarked recommendations for ${category.name}.`,
    products.map((p, idx) => ({
      name: p.title,
      url: `/products/${p.slug}`,
      image: p.thumbnail_url || undefined,
      position: idx + 1,
    }))
  );
  const faqJsonLd = faqs.length > 0 ? generateFaqJsonLd(faqs) : null;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <Breadcrumbs items={breadcrumbs} />

      {/* Category Header */}
      <div style={{ marginBottom: '2.5rem', maxWidth: '800px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
          {isVirtualCategory ? 'Curated Collection & Search Results' : 'Category Hub & Rankings'}
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>The Best {category.name}</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {category.description || `Hand-tested recommendations and verified Amazon deals for the top ${category.name}.`}
        </p>
      </div>

      {/* Subcategory Pills if any */}
      {subcategories && subcategories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {subcategories.map((sub: Category) => (
            <Link
              key={sub.id}
              href={`/category/${category.slug}/${sub.slug}`}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Product Listings with Ranking */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>
            Top Ranked {category.name} ({products ? products.length : 0} items)
          </h2>

          {/* Interactive URL-Synced Sort Selector */}
          <CategorySortSelect currentSort={resolvedSearchParams.sort} />
        </div>

        <ProductGrid products={products} ranked={true} />
      </section>

      {/* Category FAQs */}
      {faqs && faqs.length > 0 && <FAQSection faqs={faqs} title={`Buying Advice & FAQ: ${category.name}`} />}
    </div>
  );
}
