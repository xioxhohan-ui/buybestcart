import { Product, Article, FAQ } from '@/types';

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
      name: product.brand?.name || product.manufacturer || 'Best Buy Cart Selected',
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
      name: article.author?.full_name || 'Best Buy Cart Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Best Buy Cart',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    description: article.excerpt,
  };
}

export function generateFaqJsonLd(faqs: FAQ[]) {
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
    name: 'Best Buy Cart',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
