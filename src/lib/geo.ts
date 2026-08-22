/**
 * Buy Best Cart — Geo-Detection & Amazon-Supported Currency Registry
 * 
 * Rules:
 * 1. If detected country is in the Amazon-supported list -> display its official Amazon currency.
 * 2. If country is NOT supported by Amazon -> ALWAYS default to USD ($).
 * 3. Never expose client IP address in public UI or response payloads.
 * 4. User manual currency selection takes precedence over automatic detection.
 */

export interface AmazonMarketplaceConfig {
  country_code: string;
  country_name: string;
  currency: string;
  currency_symbol: string;
  domain: string;
  flag_emoji: string;
  symbol_position: 'prefix' | 'suffix';
  decimals?: number;
}

// Configurable Registry of Official Amazon-Supported Marketplaces
export const AMAZON_SUPPORTED_COUNTRIES: Record<string, AmazonMarketplaceConfig> = {
  US: {
    country_code: 'US',
    country_name: 'United States',
    currency: 'USD',
    currency_symbol: '$',
    domain: 'amazon.com',
    flag_emoji: '🇺🇸',
    symbol_position: 'prefix',
    decimals: 2,
  },
  GB: {
    country_code: 'GB',
    country_name: 'United Kingdom',
    currency: 'GBP',
    currency_symbol: '£',
    domain: 'amazon.co.uk',
    flag_emoji: '🇬🇧',
    symbol_position: 'prefix',
    decimals: 2,
  },
  CA: {
    country_code: 'CA',
    country_name: 'Canada',
    currency: 'CAD',
    currency_symbol: 'CA$',
    domain: 'amazon.ca',
    flag_emoji: '🇨🇦',
    symbol_position: 'prefix',
    decimals: 2,
  },
  DE: {
    country_code: 'DE',
    country_name: 'Germany',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.de',
    flag_emoji: '🇩🇪',
    symbol_position: 'prefix',
    decimals: 2,
  },
  FR: {
    country_code: 'FR',
    country_name: 'France',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.fr',
    flag_emoji: '🇫🇷',
    symbol_position: 'prefix',
    decimals: 2,
  },
  IT: {
    country_code: 'IT',
    country_name: 'Italy',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.it',
    flag_emoji: '🇮🇹',
    symbol_position: 'prefix',
    decimals: 2,
  },
  ES: {
    country_code: 'ES',
    country_name: 'Spain',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.es',
    flag_emoji: '🇪🇸',
    symbol_position: 'prefix',
    decimals: 2,
  },
  NL: {
    country_code: 'NL',
    country_name: 'Netherlands',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.nl',
    flag_emoji: '🇳🇱',
    symbol_position: 'prefix',
    decimals: 2,
  },
  SE: {
    country_code: 'SE',
    country_name: 'Sweden',
    currency: 'SEK',
    currency_symbol: ' kr',
    domain: 'amazon.se',
    flag_emoji: '🇸🇪',
    symbol_position: 'suffix',
    decimals: 2,
  },
  PL: {
    country_code: 'PL',
    country_name: 'Poland',
    currency: 'PLN',
    currency_symbol: ' zł',
    domain: 'amazon.pl',
    flag_emoji: '🇵🇱',
    symbol_position: 'suffix',
    decimals: 2,
  },
  AU: {
    country_code: 'AU',
    country_name: 'Australia',
    currency: 'AUD',
    currency_symbol: 'A$',
    domain: 'amazon.com.au',
    flag_emoji: '🇦🇺',
    symbol_position: 'prefix',
    decimals: 2,
  },
  JP: {
    country_code: 'JP',
    country_name: 'Japan',
    currency: 'JPY',
    currency_symbol: '¥',
    domain: 'amazon.co.jp',
    flag_emoji: '🇯🇵',
    symbol_position: 'prefix',
    decimals: 0,
  },
  MX: {
    country_code: 'MX',
    country_name: 'Mexico',
    currency: 'MXN',
    currency_symbol: 'MX$',
    domain: 'amazon.com.mx',
    flag_emoji: '🇲🇽',
    symbol_position: 'prefix',
    decimals: 2,
  },
  BR: {
    country_code: 'BR',
    country_name: 'Brazil',
    currency: 'BRL',
    currency_symbol: 'R$',
    domain: 'amazon.com.br',
    flag_emoji: '🇧🇷',
    symbol_position: 'prefix',
    decimals: 2,
  },
  IN: {
    country_code: 'IN',
    country_name: 'India',
    currency: 'INR',
    currency_symbol: '₹',
    domain: 'amazon.in',
    flag_emoji: '🇮🇳',
    symbol_position: 'prefix',
    decimals: 2,
  },
  AE: {
    country_code: 'AE',
    country_name: 'United Arab Emirates',
    currency: 'AED',
    currency_symbol: 'AED ',
    domain: 'amazon.ae',
    flag_emoji: '🇦🇪',
    symbol_position: 'prefix',
    decimals: 2,
  },
  SA: {
    country_code: 'SA',
    country_name: 'Saudi Arabia',
    currency: 'SAR',
    currency_symbol: 'SAR ',
    domain: 'amazon.sa',
    flag_emoji: '🇸🇦',
    symbol_position: 'prefix',
    decimals: 2,
  },
  SG: {
    country_code: 'SG',
    country_name: 'Singapore',
    currency: 'SGD',
    currency_symbol: 'S$',
    domain: 'amazon.sg',
    flag_emoji: '🇸🇬',
    symbol_position: 'prefix',
    decimals: 2,
  },
  BE: {
    country_code: 'BE',
    country_name: 'Belgium',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.com.be',
    flag_emoji: '🇧🇪',
    symbol_position: 'prefix',
    decimals: 2,
  },
  AT: {
    country_code: 'AT',
    country_name: 'Austria',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.de',
    flag_emoji: '🇦🇹',
    symbol_position: 'prefix',
    decimals: 2,
  },
  IE: {
    country_code: 'IE',
    country_name: 'Ireland',
    currency: 'EUR',
    currency_symbol: '€',
    domain: 'amazon.co.uk',
    flag_emoji: '🇮🇪',
    symbol_position: 'prefix',
    decimals: 2,
  },
};

// Aliases (e.g. UK -> GB)
const COUNTRY_ALIASES: Record<string, string> = {
  UK: 'GB',
  USA: 'US',
};

// Fallback Default (USD for non-Amazon countries)
export const DEFAULT_FALLBACK_MARKETPLACE: AmazonMarketplaceConfig = AMAZON_SUPPORTED_COUNTRIES.US;

/**
 * Checks if a given 2-letter ISO country code is supported by Amazon.
 * Returns the matching AmazonMarketplaceConfig if supported, or null if unsupported.
 */
export function getAmazonMarketplace(countryCode?: string | null): AmazonMarketplaceConfig | null {
  if (!countryCode) return null;
  const upper = countryCode.trim().toUpperCase();
  const normalized = COUNTRY_ALIASES[upper] || upper;
  return AMAZON_SUPPORTED_COUNTRIES[normalized] || null;
}

/**
 * Resolves effective country and currency.
 * If country is NOT supported by Amazon, always defaults to USD ($).
 */
export function resolveLocationCurrency(countryCode?: string | null): {
  countryCode: string;
  currency: string;
  isAmazonSupported: boolean;
  marketplace: AmazonMarketplaceConfig;
} {
  const match = getAmazonMarketplace(countryCode);
  if (match) {
    return {
      countryCode: match.country_code,
      currency: match.currency,
      isAmazonSupported: true,
      marketplace: match,
    };
  }

  // Non-Amazon country fallback -> strictly USD
  return {
    countryCode: 'US',
    currency: 'USD',
    isAmazonSupported: false,
    marketplace: DEFAULT_FALLBACK_MARKETPLACE,
  };
}

/**
 * Returns all selectable currency options for the UI selector
 */
export const AVAILABLE_CURRENCIES: Array<{
  code: string;
  name: string;
  symbol: string;
  flag: string;
  countryCode: string;
  isAmazonDirect: boolean;
}> = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', countryCode: 'US', isAmazonDirect: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', countryCode: 'DE', isAmazonDirect: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', countryCode: 'GB', isAmazonDirect: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', countryCode: 'CA', isAmazonDirect: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', countryCode: 'AU', isAmazonDirect: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', countryCode: 'JP', isAmazonDirect: true },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', countryCode: 'SE', isAmazonDirect: true },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', countryCode: 'PL', isAmazonDirect: true },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', flag: '🇲🇽', countryCode: 'MX', isAmazonDirect: true },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', countryCode: 'BR', isAmazonDirect: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', countryCode: 'IN', isAmazonDirect: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪', countryCode: 'AE', isAmazonDirect: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦', countryCode: 'SA', isAmazonDirect: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', countryCode: 'SG', isAmazonDirect: true },
];
