import { Product, Article, FAQ, ArticleFaqItem } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buybestcart.shop';

export function generateProductJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.thumbnail_url ? [product.thumbnail_url] : [],
    description: product.short_description || product.description,
    sku: product.asin,
    mpn: product.asin,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || product.manufacturer || 'Buy Best Cart Selected',
    },
    offers: product.price
      ? {
          '@type': 'Offer',
          url: `${SITE_URL}/products/${product.slug}`,
          priceCurrency: product.currency || 'USD',
          price: product.price,
          availability:
            product.availability === 'in_stock'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/LimitedAvailability',
          seller: {
            '@type': 'Organization',
            name: 'Amazon',
          },
        }
      : undefined,
    aggregateRating: product.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.review_count || 10,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
  };
}

export function generateArticleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': article.schema_type || 'Article',
    headline: article.title,
    image: article.featured_image ? [article.featured_image] : [],
    datePublished: article.publish_date || article.created_at,
    dateModified: article.modified_date || article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author?.full_name || 'Buy Best Cart Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Buy Best Cart',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    description: article.excerpt,
  };
}

export function generateFaqJsonLd(faqs: (FAQ | ArticleFaqItem)[]) {
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

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buy Best Cart',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
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
