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

/**
 * Internal tracking redirect generator
 * Uses /go/[slug] or direct URL depending on settings
 */
export function getProductRedirectUrl(productSlug: string, countryCode: string = 'US', ctaType: string = 'view_price'): string {
  return `/go/${productSlug}?region=${countryCode}&cta=${ctaType}`;
}
