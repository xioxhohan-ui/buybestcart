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
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/guides/${article.slug}`,
    },
    headline: article.seo_title || article.title,
    image: article.featured_image ? [article.featured_image] : [],
    datePublished: article.published_at || article.publish_date || article.created_at,
    dateModified: article.modified_date || article.updated_at || article.created_at,
    author: {
      '@type': 'Person',
      name: article.author_name || article.author?.full_name || 'Buy Best Cart Editorial Team',
      jobTitle: article.author_role || 'Senior Hardware & Testing Analyst',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Buy Best Cart',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    description: article.seo_description || article.excerpt || article.title,
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : undefined,
  };
}

export function generateGuideProductsJsonLd(article: Article) {
  const topProducts = article.top_products || [];
  if (topProducts.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${article.title} - Ranked Product Picks`,
    description: article.excerpt || `Top ranked products selected in ${article.title}.`,
    itemListElement: topProducts.map((p, idx) => ({
      '@type': 'ListItem',
      position: p.rank || idx + 1,
      name: p.custom_award_label ? `${p.custom_award_label}: ${p.title}` : p.title,
      item: {
        '@type': 'Product',
        name: p.title,
        image: p.gallery_images && p.gallery_images.length > 0 ? p.gallery_images : (p.thumbnail_url ? [p.thumbnail_url] : []),
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
              url: p.affiliate_url || p.buy_url || `${SITE_URL}/guides/${article.slug}`,
              seller: {
                '@type': 'Organization',
                name: 'Amazon',
              },
            }
          : undefined,
      },
    })),
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
