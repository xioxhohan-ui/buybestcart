import { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import { Product, Category, Article, Comparison } from '@/types';
import { getCanonicalUrl, CANONICAL_BASE_URL } from '@/lib/canonical';

export const BRAND_NAME = 'Buy Best Cart';
export const CANONICAL_BASE = CANONICAL_BASE_URL;

export interface MetadataHealthScore {
  titleStatus: 'good' | 'too_short' | 'too_long' | 'missing';
  titleLength: number;
  titleFeedback: string;
  descStatus: 'good' | 'too_short' | 'too_long' | 'missing';
  descLength: number;
  descFeedback: string;
  isOptimal: boolean;
  score: number; // 0 to 100
}

/**
 * 1. Product Metadata Generator
 */
export function generateProductMetadata(product: Partial<Product>): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
} {
  const brand = product.brand?.name || product.manufacturer || '';
  const titleWords = (product.title || 'Product').trim();

  // Construct distinct, concise title (Target: 50-60 chars)
  let cleanTitle = product.seo_title?.trim();
  if (!cleanTitle) {
    cleanTitle = `${titleWords} Review & Lab Test | ${BRAND_NAME}`;
    if (cleanTitle.length > 60) {
      cleanTitle = `${titleWords} Review | ${BRAND_NAME}`;
    }
    if (cleanTitle.length > 60) {
      cleanTitle = `${titleWords.slice(0, 42).trim()}... | ${BRAND_NAME}`;
    }
  }

  // Construct natural, non-fluff description (Target: 130-160 chars)
  let cleanDesc = product.seo_description?.trim() || product.short_description?.trim();
  if (!cleanDesc) {
    const highlights = product.key_highlights && product.key_highlights.length > 0 ? ` featuring ${product.key_highlights.slice(0, 2).join(' and ')}` : '';
    const bestForText = product.best_for ? ` Best for ${product.best_for.toLowerCase()}.` : '';
    cleanDesc = `In-depth lab testing and acoustic/performance review of the ${titleWords}${highlights}.${bestForText} Verified Amazon pricing.`;
  }

  // Trim description gracefully if over 160 characters
  if (cleanDesc.length > 160) {
    const cut = cleanDesc.slice(0, 157);
    const lastSpace = cut.lastIndexOf(' ');
    cleanDesc = (lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim() + '...';
  }

  const slug = product.slug || '';
  const canonicalUrl = getCanonicalUrl('product', slug, product.canonical_url);
  const ogImage = product.og_image || product.thumbnail_url || `${CANONICAL_BASE}/og-image.png`;

  return {
    title: cleanTitle,
    description: cleanDesc,
    canonicalUrl,
    ogImage,
  };
}

/**
 * 2. Category Metadata Generator
 */
export function generateCategoryMetadata(category: Partial<Category>): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
} {
  const catName = (category.name || 'Category').trim();
  const slug = category.slug || 'category';

  let cleanTitle = category.seo_title?.trim();
  if (!cleanTitle) {
    cleanTitle = `Best ${catName} of 2026 — Tested & Ranked | ${BRAND_NAME}`;
    if (cleanTitle.length > 60) {
      cleanTitle = `Best ${catName} (2026) | ${BRAND_NAME}`;
    }
  }

  let cleanDesc = category.seo_description?.trim() || category.description?.trim();
  if (!cleanDesc) {
    cleanDesc = `Explore our independent laboratory benchmarks and ranked recommendations for the best ${catName.toLowerCase()}. Verified Amazon discounts and specs.`;
  }

  if (cleanDesc.length > 160) {
    const cut = cleanDesc.slice(0, 157);
    const lastSpace = cut.lastIndexOf(' ');
    cleanDesc = (lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim() + '...';
  }

  const canonicalUrl = getCanonicalUrl('category', slug, category.canonical_url);
  const ogImage = category.og_image || category.image_url || `${CANONICAL_BASE}/og-image.png`;

  return {
    title: cleanTitle,
    description: cleanDesc,
    canonicalUrl,
    ogImage,
  };
}

/**
 * 3. Buying Guide & Article Metadata Generator
 */
export function generateArticleMetadata(article: Partial<Article>): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
} {
  const artTitle = (article.title || 'Buying Guide').trim();
  const slug = article.slug || 'guide';

  let cleanTitle = article.seo_title?.trim();
  if (!cleanTitle) {
    cleanTitle = `${artTitle} | ${BRAND_NAME}`;
    if (cleanTitle.length > 60) {
      cleanTitle = artTitle;
    }
    if (cleanTitle.length > 60) {
      cleanTitle = `${artTitle.slice(0, 42).trim()}... | ${BRAND_NAME}`;
    }
  }

  let cleanDesc = article.seo_description?.trim() || article.excerpt?.trim();
  if (!cleanDesc) {
    cleanDesc = `Read the comprehensive lab test scores, detailed buying advice, and top recommendations for ${artTitle.toLowerCase()} from our editorial staff.`;
  }

  if (cleanDesc.length > 160) {
    const cut = cleanDesc.slice(0, 157);
    const lastSpace = cut.lastIndexOf(' ');
    cleanDesc = (lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim() + '...';
  }

  const canonicalUrl = getCanonicalUrl('guide', slug, article.canonical_url);
  const ogImage = article.og_image || article.featured_image || `${CANONICAL_BASE}/og-image.png`;

  return {
    title: cleanTitle,
    description: cleanDesc,
    canonicalUrl,
    ogImage,
  };
}

/**
 * 4. Comparison Showdown Metadata Generator
 */
export function generateComparisonMetadata(
  comparison: Partial<Comparison>,
  prodAName?: string,
  prodBName?: string
): {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
} {
  const titleA = prodAName || 'Product A';
  const titleB = prodBName || 'Product B';
  const compTitle = comparison.title?.trim() || `${titleA} vs ${titleB}`;
  const slug = comparison.slug || 'comparison';

  let cleanTitle = comparison.seo_title?.trim();
  if (!cleanTitle) {
    cleanTitle = `${titleA} vs ${titleB} Showdown | ${BRAND_NAME}`;
    if (cleanTitle.length > 60) {
      cleanTitle = `${compTitle.slice(0, 42).trim()}... | ${BRAND_NAME}`;
    }
  }

  let cleanDesc = comparison.seo_description?.trim() || comparison.summary?.trim();
  if (!cleanDesc) {
    cleanDesc = `Direct head-to-head comparison between ${titleA} and ${titleB}. Tested on sound fidelity, build quality, battery life, and price-to-performance value.`;
  }

  if (cleanDesc.length > 160) {
    const cut = cleanDesc.slice(0, 157);
    const lastSpace = cut.lastIndexOf(' ');
    cleanDesc = (lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim() + '...';
  }

  const canonicalUrl = getCanonicalUrl('comparison', slug, (comparison as any).canonical_url);
  const ogImage = `${CANONICAL_BASE}/og-image.png`;

  return {
    title: cleanTitle,
    description: cleanDesc,
    canonicalUrl,
    ogImage,
  };
}

/**
 * Evaluates SEO Title & Description Health against Google SERP Snippet Bounds
 */
export function evaluateMetadataHealth(title: string = '', description: string = ''): MetadataHealthScore {
  const t = title.trim();
  const d = description.trim();

  let titleStatus: MetadataHealthScore['titleStatus'] = 'good';
  let titleFeedback = '';

  if (t.length === 0) {
    titleStatus = 'missing';
    titleFeedback = 'SEO Title is missing. Search engines will generate an arbitrary fallback.';
  } else if (t.length < 30) {
    titleStatus = 'too_short';
    titleFeedback = `Title is ${t.length} chars (Short). Ideal length is 40–60 characters.`;
  } else if (t.length > 60) {
    titleStatus = 'too_long';
    titleFeedback = `Title is ${t.length} chars (Too Long). Google truncates titles over 60 characters in SERP.`;
  } else {
    titleStatus = 'good';
    titleFeedback = `Title is ${t.length} chars (Optimal). Fits within Google desktop & mobile snippet window.`;
  }

  let descStatus: MetadataHealthScore['descStatus'] = 'good';
  let descFeedback = '';

  if (d.length === 0) {
    descStatus = 'missing';
    descFeedback = 'Meta description is missing. Google will pull random body text for snippets.';
  } else if (d.length < 80) {
    descStatus = 'too_short';
    descFeedback = `Description is ${d.length} chars (Short). Ideal length is 120–160 characters.`;
  } else if (d.length > 165) {
    descStatus = 'too_long';
    descFeedback = `Description is ${d.length} chars (Too Long). Snippets will be truncated with ellipsis (...).`;
  } else {
    descStatus = 'good';
    descFeedback = `Description is ${d.length} chars (Optimal). Perfect density for Google search snippets.`;
  }

  let score = 100;
  if (titleStatus === 'missing') score -= 50;
  else if (titleStatus !== 'good') score -= 15;

  if (descStatus === 'missing') score -= 50;
  else if (descStatus !== 'good') score -= 15;

  score = Math.max(0, Math.min(100, score));

  return {
    titleStatus,
    titleLength: t.length,
    titleFeedback,
    descStatus,
    descLength: d.length,
    descFeedback,
    isOptimal: titleStatus === 'good' && descStatus === 'good',
    score,
  };
}

/**
 * Checks for duplicate titles or meta descriptions across database tables
 */
export async function checkDuplicateMetadata(
  title: string,
  description: string,
  table: 'products' | 'categories' | 'articles' | 'comparisons',
  excludeId?: string
): Promise<{
  titleDuplicate: { isDuplicate: boolean; conflictTitle?: string; conflictId?: string };
  descDuplicate: { isDuplicate: boolean; conflictId?: string };
}> {
  const result = {
    titleDuplicate: { isDuplicate: false as boolean, conflictTitle: undefined as string | undefined, conflictId: undefined as string | undefined },
    descDuplicate: { isDuplicate: false as boolean, conflictId: undefined as string | undefined },
  };

  try {
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();

    if (cleanTitle) {
      let query = supabase.from(table).select('id, title, seo_title').or(`title.eq."${cleanTitle}",seo_title.eq."${cleanTitle}"`);
      if (excludeId) query = query.neq('id', excludeId);
      const { data } = await query.limit(1).maybeSingle();
      if (data) {
        result.titleDuplicate = {
          isDuplicate: true,
          conflictTitle: (data as any).title || (data as any).seo_title,
          conflictId: (data as any).id,
        };
      }
    }

    if (cleanDesc && cleanDesc.length > 20) {
      let query = supabase.from(table).select('id, seo_description').eq('seo_description', cleanDesc);
      if (excludeId) query = query.neq('id', excludeId);
      const { data } = await query.limit(1).maybeSingle();
      if (data) {
        result.descDuplicate = {
          isDuplicate: true,
          conflictId: (data as any).id,
        };
      }
    }
  } catch {}

  return result;
}

/**
 * Helper to construct standard Next.js Metadata object
 */
export function buildPageMetadata({
  title,
  description,
  canonicalUrl,
  ogImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex = false,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}): Metadata {
  const image = ogImage || `${CANONICAL_BASE}/og-image.png`;

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
      siteName: BRAND_NAME,
      type,
      publishedTime: publishedTime ? new Date(publishedTime).toISOString() : undefined,
      modifiedTime: modifiedTime ? new Date(modifiedTime).toISOString() : undefined,
      images: [
        {
          url: image,
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
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
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
