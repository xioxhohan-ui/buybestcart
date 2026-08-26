import { AMAZON_SUPPORTED_COUNTRIES, AVAILABLE_CURRENCIES, AmazonMarketplaceConfig } from './geo';

const REGION_STORAGE_KEY = 'bestbuycart_user_region';
const CURRENCY_STORAGE_KEY = 'bestbuycart_user_currency';
const AUTO_DETECTED_KEY = 'bestbuycart_auto_detected';

export const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 154.5,
  SEK: 10.45,
  PLN: 3.96,
  MXN: 17.2,
  BRL: 5.25,
  INR: 83.4,
  AED: 3.67,
  SAR: 3.75,
  SGD: 1.35,
};

export function getStoredRegion(): string {
  if (typeof window === 'undefined') return 'US';
  try {
    const saved = localStorage.getItem(REGION_STORAGE_KEY);
    if (saved && AMAZON_SUPPORTED_COUNTRIES[saved.toUpperCase()]) {
      return saved.toUpperCase();
    }
  } catch {
    // LocalStorage unavailable
  }
  return 'US';
}

export function setStoredRegion(countryCode: string): void {
  if (typeof window === 'undefined') return;
  try {
    const upper = countryCode.toUpperCase();
    if (AMAZON_SUPPORTED_COUNTRIES[upper]) {
      localStorage.setItem(REGION_STORAGE_KEY, upper);
      document.cookie = `bestbuycart_region=${upper};path=/;max-age=31536000;SameSite=Lax`;
    }
  } catch {
    // LocalStorage unavailable
  }
}

export function getStoredCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved && AVAILABLE_CURRENCIES.some((c) => c.code === saved.toUpperCase())) {
      return saved.toUpperCase();
    }
  } catch {
    // LocalStorage unavailable
  }
  return 'USD';
}

export function setStoredCurrency(currencyCode: string): void {
  if (typeof window === 'undefined') return;
  try {
    const upper = currencyCode.toUpperCase();
    localStorage.setItem(CURRENCY_STORAGE_KEY, upper);
    localStorage.setItem(AUTO_DETECTED_KEY, 'manual');
    document.cookie = `buybestcart_currency=${upper};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    // LocalStorage unavailable
  }
}

export function isUserSelectionManual(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(AUTO_DETECTED_KEY) === 'manual';
  } catch {
    return false;
  }
}

export function setAutoDetectedFlag(country: string, currency: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGION_STORAGE_KEY, country.toUpperCase());
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency.toUpperCase());
    localStorage.setItem(AUTO_DETECTED_KEY, 'auto');
    document.cookie = `bestbuycart_region=${country.toUpperCase()};path=/;max-age=31536000;SameSite=Lax`;
    document.cookie = `buybestcart_currency=${currency.toUpperCase()};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    // LocalStorage unavailable
  }
}

export interface CurrencyDisplayConfig {
  symbol: string;
  prefix: boolean;
  decimals: number;
}

export const CURRENCY_FORMATS: Record<string, CurrencyDisplayConfig> = {
  USD: { symbol: '$', prefix: true, decimals: 2 },
  EUR: { symbol: '€', prefix: true, decimals: 2 },
  GBP: { symbol: '£', prefix: true, decimals: 2 },
  CAD: { symbol: 'CA$', prefix: true, decimals: 2 },
  AUD: { symbol: 'A$', prefix: true, decimals: 2 },
  JPY: { symbol: '¥', prefix: true, decimals: 0 },
  SEK: { symbol: ' kr', prefix: false, decimals: 2 },
  PLN: { symbol: ' zł', prefix: false, decimals: 2 },
  MXN: { symbol: 'MX$', prefix: true, decimals: 2 },
  BRL: { symbol: 'R$', prefix: true, decimals: 2 },
  INR: { symbol: '₹', prefix: true, decimals: 2 },
  AED: { symbol: 'AED ', prefix: true, decimals: 2 },
  SAR: { symbol: 'SAR ', prefix: true, decimals: 2 },
  SGD: { symbol: 'S$', prefix: true, decimals: 2 },
};

/**
 * Formats a USD base amount to the target currency applying exchange rate and currency symbol
 */
export function formatPrice(
  amount?: number,
  targetCurrency: string = 'USD',
  rates: Record<string, number> = FALLBACK_EXCHANGE_RATES,
  fromCurrency: string = 'USD'
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Check Amazon';
  }

  const from = fromCurrency.toUpperCase();
  const to = targetCurrency.toUpperCase();
  const config = CURRENCY_FORMATS[to] || CURRENCY_FORMATS.USD;

  const fromRate = rates[from] || FALLBACK_EXCHANGE_RATES[from] || 1.0;
  const toRate = rates[to] || FALLBACK_EXCHANGE_RATES[to] || 1.0;

  // Normalize to USD base, then convert to target
  const amountUsd = from === 'USD' ? amount : amount / fromRate;
  const converted = to === 'USD' ? amountUsd : amountUsd * toRate;

  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return config.prefix ? `${config.symbol}${formatted}` : `${formatted}${config.symbol}`;
}
