import { AffiliateMarketplace, Product } from '@/types';

// Default Fallback Marketplaces Dictionary
export const MARKETPLACES: Record<string, Partial<AffiliateMarketplace>> = {
  US: {
    country: 'United States',
    country_code: 'US',
    domain: 'amazon.com',
    currency: 'USD',
    partner_tag: process.env.NEXT_PUBLIC_AMAZON_TAG_US || 'bestbuycart-20',
    flag_emoji: '🇺🇸',
  },
  GB: {
    country: 'United Kingdom',
    country_code: 'GB',
    domain: 'amazon.co.uk',
    currency: 'GBP',
    partner_tag: process.env.NEXT_PUBLIC_AMAZON_TAG_UK || 'bestbuycartuk-21',
    flag_emoji: '🇬🇧',
  },
  CA: {
    country: 'Canada',
    country_code: 'CA',
    domain: 'amazon.ca',
    currency: 'CAD',
    partner_tag: process.env.NEXT_PUBLIC_AMAZON_TAG_CA || 'bestbuycartca-20',
    flag_emoji: '🇨🇦',
  },
  DE: {
    country: 'Germany',
    country_code: 'DE',
    domain: 'amazon.de',
    currency: 'EUR',
    partner_tag: process.env.NEXT_PUBLIC_AMAZON_TAG_DE || 'bestbuycartde-21',
    flag_emoji: '🇩🇪',
  },
  FR: {
    country: 'France',
    country_code: 'FR',
    domain: 'amazon.fr',
    currency: 'EUR',
    partner_tag: 'bestbuycartfr-21',
    flag_emoji: '🇫🇷',
  },
  IT: {
    country: 'Italy',
    country_code: 'IT',
    domain: 'amazon.it',
    currency: 'EUR',
    partner_tag: 'bestbuycartit-21',
    flag_emoji: '🇮🇹',
  },
  ES: {
    country: 'Spain',
    country_code: 'ES',
    domain: 'amazon.es',
    currency: 'EUR',
    partner_tag: 'bestbuycartes-21',
    flag_emoji: '🇪🇸',
  },
  NL: {
    country: 'Netherlands',
    country_code: 'NL',
    domain: 'amazon.nl',
    currency: 'EUR',
    partner_tag: 'bestbuycartnl-21',
    flag_emoji: '🇳🇱',
  },
  SE: {
    country: 'Sweden',
    country_code: 'SE',
    domain: 'amazon.se',
    currency: 'SEK',
    partner_tag: 'bestbuycartse-21',
    flag_emoji: '🇸🇪',
  },
  PL: {
    country: 'Poland',
    country_code: 'PL',
    domain: 'amazon.pl',
    currency: 'PLN',
    partner_tag: 'bestbuycartpl-21',
    flag_emoji: '🇵🇱',
  },
  AU: {
    country: 'Australia',
    country_code: 'AU',
    domain: 'amazon.com.au',
    currency: 'AUD',
    partner_tag: 'bestbuycartau-22',
    flag_emoji: '🇦🇺',
  },
  JP: {
    country: 'Japan',
    country_code: 'JP',
    domain: 'amazon.co.jp',
    currency: 'JPY',
    partner_tag: 'bestbuycartjp-22',
    flag_emoji: '🇯🇵',
  },
  IN: {
    country: 'India',
    country_code: 'IN',
    domain: 'amazon.in',
    currency: 'INR',
    partner_tag: 'bestbuycartin-21',
    flag_emoji: '🇮🇳',
  },
  UK: {
    country: 'United Kingdom',
    country_code: 'GB',
    domain: 'amazon.co.uk',
    currency: 'GBP',
    partner_tag: process.env.NEXT_PUBLIC_AMAZON_TAG_UK || 'bestbuycartuk-21',
    flag_emoji: '🇬🇧',
  },
};

/**
 * Builds a direct, verified Amazon Affiliate URL with required tracking parameters
 */
export function buildAmazonAffiliateUrl(params: {
  asin?: string;
  url?: string;
  countryCode?: string;
  customTag?: string;
  searchTerm?: string;
}): string {
  const { asin, url, countryCode = 'US', customTag, searchTerm } = params;
  const marketplace = MARKETPLACES[countryCode.toUpperCase()] || MARKETPLACES.US;
  const domain = marketplace.domain || 'amazon.com';
  const tag = customTag || marketplace.partner_tag || 'bestbuycart-20';

  if (asin) {
    return `https://www.${domain}/dp/${asin}?tag=${encodeURIComponent(tag)}&linkCode=ogi&th=1&psc=1`;
  }

  if (searchTerm) {
    return `https://www.${domain}/s?k=${encodeURIComponent(searchTerm)}&tag=${encodeURIComponent(tag)}`;
  }

  if (url && url.includes('amazon.')) {
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.set('tag', tag);
      return parsedUrl.toString();
    } catch {
      // Fallback
    }
  }

  return `https://www.${domain}?tag=${encodeURIComponent(tag)}`;
}

export const PROHIBITED_URL_SHORTENERS = [
  'bit.ly',
  'bitly.com',
  'tinyurl.com',
  'short.io',
  'ow.ly',
  't.co',
  'goo.gl',
  'is.gd',
  'buff.ly',
  'adf.ly',
  'shorte.st',
  'cutt.ly',
  'rebrand.ly',
  'linktr.ee',
  'snip.ly',
  'trib.al',
  'ift.tt',
  'bl.ink',
  'soo.gd',
  'tiny.cc',
  'shorturl.at',
  's.id',
  'v.gd',
  'qr.ae',
  'clck.ru',
  'hyperurl.co',
  'smarturl.it',
  'chilp.it',
  'bc.vc',
  'u.to',
  'cutt.us',
  'lnkd.in',
  'db.tt',
  'cur.lv',
  'shortcm.li',
  'rb.gy',
  'dub.sh',
  'tiny.one',
  'short.gy',
  't.ly',
  'cleanuri.com',
  'shortlink.to',
  'surl.li',
];

/**
 * Checks whether a given URL is a prohibited third-party URL shortener
 */
export function isUrlShortener(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.toLowerCase().trim();
  return PROHIBITED_URL_SHORTENERS.some((s) => clean.includes(s));
}

/**
 * Verifies that a given URL is a compliant direct Amazon link or approved transparent redirect.
 * Strictly blocks all third-party URL shorteners.
 */
export function isCompliantAmazonUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.toLowerCase().trim();

  // Prohibited shorteners check (Rule #7)
  if (isUrlShortener(clean)) {
    return false;
  }

  // Must be amazon domain or relative transparent redirect
  if (clean.startsWith('/go/') || clean.startsWith('/api/affiliate-redirect')) {
    return true;
  }

  return clean.includes('amazon.') || clean.includes('amzn.to');
}

/**
 * Extracts 10-character Amazon Standard Identification Number (ASIN) from any Amazon URL or embed string
 */
export function extractAsinFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();

  // Pattern 1: /dp/B0XXXXXXXX or /gp/product/B0XXXXXXXX or /d/B0XXXXXXXX
  const dpMatch = clean.match(/\/(?:dp|gp\/product|d|product)\/([A-Z0-9]{10})(?:[/?&#]|$)/i);
  if (dpMatch && dpMatch[1]) {
    return dpMatch[1].toUpperCase();
  }

  // Pattern 2: Query param ?asin=B0XXXXXXXX or &a=B0XXXXXXXX
  const paramMatch = clean.match(/[?&](?:asin|a|ASIN)=([A-Z0-9]{10})(?:[&#]|$)/i);
  if (paramMatch && paramMatch[1]) {
    return paramMatch[1].toUpperCase();
  }

  return null;
}

/**
 * Internal tracking redirect generator
 * Uses /go/[slug] or direct URL depending on settings
 */
export function getProductRedirectUrl(productSlug: string, countryCode: string = 'US', ctaType: string = 'view_price'): string {
  return `/go/${productSlug}?region=${countryCode}&cta=${ctaType}`;
}
