import { SITE_URL } from '@/lib/constants';

export const CANONICAL_HOST = 'buybestcart.shop';
export const CANONICAL_PROTOCOL = 'https:';
export const CANONICAL_BASE_URL = 'https://buybestcart.shop';

export type CanonicalEntityType =
  | 'home'
  | 'product'
  | 'category'
  | 'brand'
  | 'collection'
  | 'deals'
  | 'guides'
  | 'guide'
  | 'compare'
  | 'comparison'
  | 'how-we-rank'
  | 'about'
  | 'contact'
  | 'affiliate-disclosure'
  | 'privacy-policy'
  | 'terms'
  | 'static';

/**
 * Normalizes any URL string or path into a pristine, lowercase path:
 * - Strips all hash fragments (#...)
 * - Strips all query parameters (?...)
 * - Strips scheme and hostname
 * - Resolves multiple slashes into a single slash
 * - Lowercases all path segments
 * - Strips trailing slash (except root '/')
 */
export function cleanPath(urlOrPath: string = ''): string {
  if (!urlOrPath) return '/';

  // 1. Strip hash and query strings
  let path = urlOrPath.split('#')[0].split('?')[0].trim();

  // 2. Remove scheme and authority if present
  path = path.replace(/^https?:\/\/[^\/]+/i, '');

  // 3. Normalize slashes and lowercase
  path = path.replace(/\/+/g, '/').toLowerCase();

  // 4. Ensure leading slash
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // 5. Strip trailing slash if longer than root '/'
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path;
}

/**
 * Generates the clean, permanent, self-referencing canonical URL for any entity or route.
 * Always returns an absolute URL with https://buybestcart.shop without queries or trailing slashes.
 */
export function getCanonicalUrl(
  entityType: CanonicalEntityType,
  slugOrPath?: string | string[],
  overrideUrl?: string | null
): string {
  // If an override is specified, validate and normalize it
  if (overrideUrl && typeof overrideUrl === 'string' && overrideUrl.trim()) {
    const trimmedOverride = overrideUrl.trim();
    // Validate override is an absolute URL or clean path
    if (trimmedOverride.startsWith('http://') || trimmedOverride.startsWith('https://')) {
      try {
        const parsed = new URL(trimmedOverride);
        // Only accept overrides on the canonical domain or valid secure paths
        if (parsed.hostname === CANONICAL_HOST || parsed.hostname === 'www.buybestcart.shop' || parsed.hostname === 'bestbuycart.com') {
          return `${CANONICAL_BASE_URL}${cleanPath(parsed.pathname)}`;
        }
      } catch {}
    } else if (trimmedOverride.startsWith('/')) {
      return `${CANONICAL_BASE_URL}${cleanPath(trimmedOverride)}`;
    }
  }

  // Extract clean slug
  let slug = '';
  if (Array.isArray(slugOrPath)) {
    slug = slugOrPath.filter(Boolean).map(s => cleanPath(s).replace(/^\//, '')).join('/');
  } else if (typeof slugOrPath === 'string') {
    slug = cleanPath(slugOrPath).replace(/^\//, '');
  }

  // Strip prefix if already included in slug
  if (entityType === 'product' && slug.startsWith('products/')) {
    slug = slug.replace(/^products\//, '');
  } else if (entityType === 'category' && slug.startsWith('category/')) {
    slug = slug.replace(/^category\//, '');
  } else if (entityType === 'guide' && slug.startsWith('guides/')) {
    slug = slug.replace(/^guides\//, '');
  } else if (entityType === 'comparison' && slug.startsWith('compare/')) {
    slug = slug.replace(/^compare\//, '');
  }

  switch (entityType) {
    case 'home':
      return CANONICAL_BASE_URL;

    case 'product':
      return slug ? `${CANONICAL_BASE_URL}/products/${slug}` : `${CANONICAL_BASE_URL}/products`;

    case 'category':
      return slug ? `${CANONICAL_BASE_URL}/category/${slug}` : `${CANONICAL_BASE_URL}/category`;

    case 'brand':
      return slug ? `${CANONICAL_BASE_URL}/products` : `${CANONICAL_BASE_URL}/products`;

    case 'collection':
      return slug ? `${CANONICAL_BASE_URL}/category/${slug}` : `${CANONICAL_BASE_URL}/category`;

    case 'deals':
      return `${CANONICAL_BASE_URL}/deals`;

    case 'guides':
      return `${CANONICAL_BASE_URL}/guides`;

    case 'guide':
      return slug ? `${CANONICAL_BASE_URL}/guides/${slug}` : `${CANONICAL_BASE_URL}/guides`;

    case 'compare':
      return `${CANONICAL_BASE_URL}/compare`;

    case 'comparison':
      return slug ? `${CANONICAL_BASE_URL}/compare/${slug}` : `${CANONICAL_BASE_URL}/compare`;

    case 'how-we-rank':
      return `${CANONICAL_BASE_URL}/how-we-rank`;

    case 'about':
      return `${CANONICAL_BASE_URL}/about`;

    case 'contact':
      return `${CANONICAL_BASE_URL}/contact`;

    case 'affiliate-disclosure':
      return `${CANONICAL_BASE_URL}/affiliate-disclosure`;

    case 'privacy-policy':
      return `${CANONICAL_BASE_URL}/privacy-policy`;

    case 'terms':
      return `${CANONICAL_BASE_URL}/terms`;

    case 'static':
    default:
      const p = cleanPath(slug);
      return p === '/' ? CANONICAL_BASE_URL : `${CANONICAL_BASE_URL}${p}`;
  }
}

export interface CanonicalValidation {
  isValid: boolean;
  canonicalUrl: string;
  isHttps: boolean;
  isCorrectHost: boolean;
  hasNoQueryParams: boolean;
  hasNoHashFragment: boolean;
  hasValidTrailingSlash: boolean;
  isSelfReferencing: boolean;
  errors: string[];
}

/**
 * Validates a canonical URL against all technical SEO standards
 */
export function validateCanonicalUrl(
  canonicalUrl: string,
  requestUrlOrPath?: string
): CanonicalValidation {
  const errors: string[] = [];

  if (!canonicalUrl) {
    errors.push('Canonical URL is missing.');
    return {
      isValid: false,
      canonicalUrl: '',
      isHttps: false,
      isCorrectHost: false,
      hasNoQueryParams: false,
      hasNoHashFragment: false,
      hasValidTrailingSlash: false,
      isSelfReferencing: false,
      errors,
    };
  }

  const isHttps = canonicalUrl.startsWith('https://');
  if (!isHttps) {
    errors.push('Canonical URL must use secure HTTPS protocol.');
  }

  let isCorrectHost = false;
  let hasNoQueryParams = true;
  let hasNoHashFragment = true;
  let hasValidTrailingSlash = true;

  try {
    const parsed = new URL(canonicalUrl);
    isCorrectHost = parsed.hostname === CANONICAL_HOST;
    if (!isCorrectHost) {
      errors.push(`Canonical host "${parsed.hostname}" does not match required canonical domain "${CANONICAL_HOST}".`);
    }

    if (parsed.search && parsed.search.length > 0) {
      hasNoQueryParams = false;
      errors.push(`Canonical URL contains query parameters "${parsed.search}". Canonical URLs must be clean.`);
    }

    if (parsed.hash && parsed.hash.length > 0) {
      hasNoHashFragment = false;
      errors.push(`Canonical URL contains hash fragment "${parsed.hash}". Hash fragments are forbidden in canonicals.`);
    }

    // Trailing slash check: '/' is allowed, but '/products/test/' is not
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      hasValidTrailingSlash = false;
      errors.push('Canonical URL has an invalid trailing slash.');
    }
  } catch (e: any) {
    errors.push(`Invalid canonical URL format: ${e.message}`);
  }

  let isSelfReferencing = true;
  if (requestUrlOrPath) {
    const expectedCanonical = getCanonicalUrl('static', cleanPath(requestUrlOrPath));
    isSelfReferencing = canonicalUrl === expectedCanonical;
  }

  return {
    isValid: errors.length === 0,
    canonicalUrl,
    isHttps,
    isCorrectHost,
    hasNoQueryParams,
    hasNoHashFragment,
    hasValidTrailingSlash,
    isSelfReferencing,
    errors,
  };
}
