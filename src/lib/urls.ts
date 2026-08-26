import { supabase } from '@/lib/supabase/client';
import { cleanPath, getCanonicalUrl, CANONICAL_BASE_URL, CANONICAL_HOST } from '@/lib/canonical';

export const CANONICAL_DOMAIN = CANONICAL_BASE_URL;

// Reserved top-level route segments that cannot be used as solitary slugs
export const RESERVED_SLUGS = new Set([
  'admin',
  'shohan',
  'api',
  'go',
  'search',
  'auth',
  'login',
  'signup',
  'dashboard',
  'products',
  'product',
  'category',
  'categories',
  'guides',
  'guide',
  'articles',
  'article',
  'compare',
  'comparison',
  'deals',
  'deal',
  'about',
  'contact',
  'privacy-policy',
  'terms',
  'how-we-rank',
  'affiliate-disclosure',
  'sitemap.xml',
  'robots.txt',
  'manifest.webmanifest',
  'favicon.ico',
  'opengraph-image',
  'twitter-image',
]);

/**
 * Converts any raw title or text into an ultra-clean, SEO-friendly, lowercase, hyphenated slug
 */
export function generateCleanSlug(input: string, maxLength: number = 75): string {
  if (!input) return '';

  let slug = input
    .toLowerCase()
    // Normalize unicode characters and remove diacritics / accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace common symbols with words when meaningful
    .replace(/&/g, '-and-')
    .replace(/\+/g, '-plus-')
    .replace(/%/g, '-percent-')
    .replace(/(\s)@(\s)/g, '$1at$2')
    // Replace all remaining non-alphanumeric characters with single hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Trim leading and trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Truncate to maxLength without cutting a word in half
  if (slug.length > maxLength) {
    const truncated = slug.slice(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    slug = lastHyphen > maxLength * 0.6 ? truncated.slice(0, lastHyphen) : truncated;
    slug = slug.replace(/-+$/, '');
  }

  return slug;
}

/**
 * Normalizes any relative or absolute URL to the clean canonical URL format:
 * - HTTPS
 * - Canonical domain
 * - No trailing slash (except root '/')
 * - No hash fragments
 * - No query parameters
 * - Lowercase path
 */
export function formatCanonicalUrl(urlOrPath: string, routePrefix: string = ''): string {
  if (!urlOrPath) return CANONICAL_DOMAIN;
  let p = cleanPath(urlOrPath);
  if (routePrefix && !p.startsWith(routePrefix)) {
    p = `${routePrefix}${p}`.replace(/\/+/g, '/');
  }
  return p === '/' ? CANONICAL_DOMAIN : `${CANONICAL_DOMAIN}${p}`;
}

export interface SlugValidationResult {
  isValid: boolean;
  slug: string;
  canonicalUrl: string;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a slug against SEO standards and security rules
 */
export function validateSlug(
  rawSlug: string,
  routePrefix: '/products' | '/category' | '/guides' | '/compare' | string = '/products'
): SlugValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const slug = (rawSlug || '').trim();

  if (!slug) {
    errors.push('Slug cannot be empty.');
    return {
      isValid: false,
      slug: '',
      canonicalUrl: `${CANONICAL_DOMAIN}${routePrefix}`,
      errors,
      warnings,
    };
  }

  // Length checks
  if (slug.length < 2) {
    errors.push('Slug is too short (minimum 2 characters).');
  }
  if (slug.length > 90) {
    warnings.push('Slug is very long (over 90 characters). Shorter slugs rank better.');
  }

  // Character checks
  if (/[A-Z]/.test(slug)) {
    errors.push('Slug must not contain uppercase letters.');
  }
  if (/\s/.test(slug)) {
    errors.push('Slug must not contain spaces (use hyphens instead).');
  }
  if (/[_]/.test(slug)) {
    warnings.push('Underscores should be replaced with hyphens for optimal SEO.');
  }
  if (/[^a-z0-9\-_]/.test(slug)) {
    errors.push('Slug contains invalid characters (only lowercase letters, numbers, and hyphens allowed).');
  }
  if (/^-|-$/.test(slug)) {
    errors.push('Slug must not start or end with a hyphen.');
  }
  if (/--/.test(slug)) {
    warnings.push('Slug contains consecutive hyphens (e.g. "--").');
  }

  // Reserved slug checks
  if (RESERVED_SLUGS.has(slug)) {
    errors.push(`"${slug}" is a reserved system URL keyword and cannot be used.`);
  }

  const cleanPath = `${routePrefix}/${slug}`.replace(/\/+/g, '/');
  const canonicalUrl = `${CANONICAL_DOMAIN}${cleanPath}`;

  return {
    isValid: errors.length === 0,
    slug,
    canonicalUrl,
    errors,
    warnings,
  };
}

/**
 * Checks whether a slug is already taken by another record in a Supabase table
 */
export async function checkSlugCollision(
  slug: string,
  table: 'products' | 'categories' | 'articles' | 'comparisons',
  excludeId?: string
): Promise<{ isAvailable: boolean; conflictMessage?: string }> {
  try {
    if (!slug) return { isAvailable: false, conflictMessage: 'Empty slug' };

    let query = supabase.from(table).select('id, slug').eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { isAvailable: true };
    }

    if (data) {
      return {
        isAvailable: false,
        conflictMessage: `Slug "${slug}" is already in use by another ${table.slice(0, -1)}.`,
      };
    }

    return { isAvailable: true };
  } catch {
    return { isAvailable: true };
  }
}

export interface IndexableUrlValidationResult {
  isIndexable: boolean;
  canonicalUrl: string;
  issues: string[];
}

/**
 * Strict validator for Google Indexable URLs
 * Enforces HTTPS, canonical domain, no hash fragments, no query parameters,
 * no private/admin/affiliate routes, lowercase paths, and proper formatting.
 */
export function validateIndexableUrl(urlOrPath: string): IndexableUrlValidationResult {
  const issues: string[] = [];
  if (!urlOrPath || typeof urlOrPath !== 'string') {
    return {
      isIndexable: false,
      canonicalUrl: CANONICAL_DOMAIN,
      issues: ['URL is empty or invalid.'],
    };
  }

  const trimmed = urlOrPath.trim();

  // 1. Check for dangerous or invalid protocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return {
      isIndexable: false,
      canonicalUrl: CANONICAL_DOMAIN,
      issues: ['URL contains invalid or forbidden scheme.'],
    };
  }

  // 2. Check for hash fragments (#...)
  if (trimmed.includes('#')) {
    issues.push('URL contains a #hash fragment. Hash fragments must never be used for Google indexing.');
  }

  // 3. Check for query parameters (?...)
  if (trimmed.includes('?')) {
    issues.push('URL contains query parameters. Indexable URLs must be clean canonical paths without parameters.');
  }

  // 4. Hostname check for absolute URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:') {
        issues.push('Insecure HTTP protocol. All indexable URLs must use HTTPS.');
      }
      if (parsed.hostname !== CANONICAL_HOST && parsed.hostname !== `www.${CANONICAL_HOST}`) {
        issues.push(`Invalid host "${parsed.hostname}". Only "${CANONICAL_HOST}" is eligible for indexing.`);
      }
    } catch {
      issues.push('Malformed absolute URL.');
    }
  }

  // 5. Check path segments
  const pathPart = cleanPath(trimmed);

  if (/[A-Z]/.test(pathPart)) {
    issues.push('URL path contains uppercase characters.');
  }

  if (
    pathPart.startsWith('/shohan') ||
    pathPart.startsWith('/admin') ||
    pathPart.startsWith('/api') ||
    pathPart.startsWith('/go') ||
    pathPart.startsWith('/search') ||
    pathPart.startsWith('/auth')
  ) {
    issues.push(`Path "${pathPart}" is a non-indexable private, admin, affiliate redirect, or search route.`);
  }

  const canonicalUrl = pathPart === '/' ? CANONICAL_DOMAIN : `${CANONICAL_DOMAIN}${pathPart}`;

  return {
    isIndexable: issues.length === 0,
    canonicalUrl,
    issues,
  };
}
