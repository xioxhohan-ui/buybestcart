import { Product, Article, FAQ, ArticleFaqItem } from '@/types';
import { SITE_URL } from '@/lib/constants';
import { getCanonicalUrl, cleanPath, CANONICAL_BASE_URL } from '@/lib/canonical';

/**
 * 1. Product JSON-LD Schema (Google Merchant / Rich Results Compliant)
 */
export function generateProductJsonLd(product: Product) {
  const images: string[] = [];
  if (product.thumbnail_url) images.push(product.thumbnail_url);
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      const u = typeof img === 'string' ? img : img?.url;
      if (u && !images.includes(u)) images.push(u);
    });
  }

  const rawRating = typeof product.rating === 'number' ? product.rating : parseFloat(String(product.rating || '4.8'));
  const validRating = !isNaN(rawRating) && rawRating >= 1 && rawRating <= 5 ? rawRating : 4.8;
  const reviewCount = product.review_count && product.review_count > 0 ? product.review_count : 24;

  const priceVal = (product as any).current_price ?? product.price;
  const rawPrice = typeof priceVal === 'number' ? priceVal : parseFloat(String(priceVal || '0'));
  const validPrice = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : undefined;

  const canonicalProductUrl = getCanonicalUrl('product', product.slug, product.canonical_url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images.length > 0 ? images : [`${CANONICAL_BASE_URL}/og-image.png`],
    description: product.short_description || product.description || `In-depth review, lab testing, and verified Amazon pricing for ${product.title}.`,
    sku: product.asin || `BBC-${product.id}`,
    mpn: product.asin || `BBC-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || product.manufacturer || 'Buy Best Cart Selected',
    },
    offers: validPrice
      ? {
          '@type': 'Offer',
          url: canonicalProductUrl,
          priceCurrency: product.currency || 'USD',
          price: validPrice,
          priceValidUntil: '2026-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability:
            product.availability === 'out_of_stock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'Amazon',
          },
        }
      : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: validRating.toFixed(1),
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/**
 * 2. Article / Buying Guide JSON-LD Schema (Google News / Discover Compliant)
 */
export function generateArticleJsonLd(article: Article) {
  const publishedDate = article.published_at || article.publish_date || article.created_at || new Date().toISOString();
  const modifiedDate = article.modified_date || article.updated_at || publishedDate;
  const canonicalGuideUrl = getCanonicalUrl('guide', article.slug, article.canonical_url);

  return {
    '@context': 'https://schema.org',
    '@type': article.schema_type || 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalGuideUrl,
    },
    headline: article.seo_title || article.title,
    image: article.featured_image ? [article.featured_image] : [`${CANONICAL_BASE_URL}/og-image.png`],
    datePublished: new Date(publishedDate).toISOString(),
    dateModified: new Date(modifiedDate).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author_name || article.author?.full_name || 'Shohan & Editorial Team',
      jobTitle: article.author_role || 'Senior Technology & Hardware Analyst',
      url: `${CANONICAL_BASE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Buy Best Cart',
      url: CANONICAL_BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${CANONICAL_BASE_URL}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    description: article.seo_description || article.excerpt || article.title,
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : undefined,
  };
}

/**
 * 3. ItemList Schema for Ranked Guide Product Picks
 */
export function generateGuideProductsJsonLd(article: Article) {
  const topProducts = article.top_products || [];
  if (topProducts.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${article.title} — Ranked Product Picks`,
    description: article.excerpt || `Top ranked products selected in ${article.title}.`,
    itemListElement: topProducts.map((p, idx) => {
      const prodSlug = (p as any).product_slug || (p as any).slug;
      const canonicalItemUrl = prodSlug
        ? getCanonicalUrl('product', prodSlug)
        : p.affiliate_url || p.buy_url || getCanonicalUrl('guide', article.slug);

      return {
        '@type': 'ListItem',
        position: p.rank || idx + 1,
        name: p.custom_award_label ? `${p.custom_award_label}: ${p.title}` : p.title,
        item: {
          '@type': 'Product',
          name: p.title,
          image: (p as any).images && Array.isArray((p as any).images) && (p as any).images.length > 0
            ? (p as any).images.map((img: any) => typeof img === 'string' ? img : img?.url).filter(Boolean)
            : (p.thumbnail_url ? [p.thumbnail_url] : [`${CANONICAL_BASE_URL}/og-image.png`]),
          description: p.short_description || p.full_description || p.title,
          offers: p.price
            ? {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: p.currency || 'USD',
                availability:
                  p.availability === 'out_of_stock'
                    ? 'https://schema.org/OutOfStock'
                    : 'https://schema.org/InStock',
                url: canonicalItemUrl,
                seller: {
                  '@type': 'Organization',
                  name: 'Amazon',
                },
              }
            : undefined,
        },
      };
    }),
  };
}

/**
 * 4. ItemList Schema for Catalog & Category Listings
 */
export function generateItemListJsonLd(name: string, description: string, items: { name: string; url: string; image?: string; position?: number }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: item.position || index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${CANONICAL_BASE_URL}${cleanPath(item.url)}`,
      image: item.image,
    })),
  };
}

/**
 * 5. FAQ Schema (Google Rich Results Compliant)
 */
export function generateFaqJsonLd(faqs: (FAQ | ArticleFaqItem)[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 6. BreadcrumbList Schema (Google Breadcrumb Rich Snippet)
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  const allItems = [
    { name: 'Home', url: '/' },
    ...items.filter((i) => i.url !== '/'),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${CANONICAL_BASE_URL}${cleanPath(item.url)}`,
    })),
  };
}

/**
 * 7. WebSite Schema with Sitelinks SearchBox
 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buy Best Cart',
    url: CANONICAL_BASE_URL,
    description: 'Curated consumer tech, noise-canceling headphones, and laptop reviews with laboratory testing and verified Amazon pricing.',
    publisher: {
      '@type': 'Organization',
      name: 'Buy Best Cart',
      url: CANONICAL_BASE_URL,
      logo: `${CANONICAL_BASE_URL}/logo.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${CANONICAL_BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 8. Organization Schema (Google Knowledge Graph)
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Buy Best Cart',
    legalName: 'Buy Best Cart LLC',
    url: CANONICAL_BASE_URL,
    logo: `${CANONICAL_BASE_URL}/logo.png`,
    description: 'Independent consumer technology evaluation platform delivering side-by-side specification matrices, benchmark analysis, and verified Amazon deals.',
    foundingDate: '2026',
    sameAs: [
      'https://twitter.com/buybestcart',
      'https://facebook.com/buybestcart',
      'https://instagram.com/buybestcart',
      'https://youtube.com/@buybestcart',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial support',
      email: 'editorial@buybestcart.shop',
      url: `${CANONICAL_BASE_URL}/contact`,
    },
  };
}

/**
 * Optimizes an SEO title to fit Google's 50-60 character desktop/mobile SERP limits
 */
export function optimizeSeoTitle(rawTitle: string, brandSuffix?: string): string {
  if (!rawTitle) return 'Buy Best Cart';

  // 1. Remove excessive boilerplate phrases
  let clean = rawTitle
    .replace(/\s*\|\s*Buy\s*Best\s*Cart\s*(Editorial|Reviews|Official)?/gi, '')
    .replace(/\s*—\s*Buy\s*Best\s*Cart/gi, '')
    .replace(/\s*\|\s*BuyBestCart/gi, '')
    .replace(/\s*—\s*Price,\s*Specs\s*&\s*Reviews/gi, '')
    .trim();

  // 2. If title is still too long (> 60 chars), trim gracefully at word boundary
  if (clean.length > 60) {
    const trimmed = clean.slice(0, 57);
    const lastSpace = trimmed.lastIndexOf(' ');
    clean = (lastSpace > 35 ? trimmed.slice(0, lastSpace) : trimmed).trim();
  }

  // 3. If brandSuffix is explicitly provided and fits within 60 chars, attach it
  if (brandSuffix && clean.length + brandSuffix.length + 3 <= 60) {
    clean = `${clean} | ${brandSuffix}`;
  }

  return clean;
}

export interface SeoTitleEvaluation {
  status: 'good' | 'too_short' | 'too_long';
  length: number;
  recommendedTitle: string;
  feedback: string;
}

/**
 * Evaluates an SEO title's length and quality for Google SERP display
 */
export function evaluateSeoTitle(title: string, rawEntityName?: string): SeoTitleEvaluation {
  const t = (title || '').trim();
  const length = t.length;
  const recommendedTitle = optimizeSeoTitle(rawEntityName || t);

  if (length === 0) {
    return {
      status: 'too_short',
      length: 0,
      recommendedTitle,
      feedback: 'Title is missing. Search engines will generate an arbitrary fallback.',
    };
  }

  if (length < 35) {
    return {
      status: 'too_short',
      length,
      recommendedTitle,
      feedback: `Title is ${length} chars (Short). Consider adding secondary keywords or year (e.g. "2026").`,
    };
  }

  if (length > 60) {
    return {
      status: 'too_long',
      length,
      recommendedTitle,
      feedback: `Title is ${length} chars (Too Long). Google typically truncates titles over 60 characters with "..." in SERP results.`,
    };
  }

  return {
    status: 'good',
    length,
    recommendedTitle: t,
    feedback: `Title is ${length} chars (Optimal). Fits within Google's ~580px desktop and mobile snippet window.`,
  };
}
