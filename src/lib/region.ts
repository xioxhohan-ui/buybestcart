import { MARKETPLACES } from './affiliate';

const REGION_STORAGE_KEY = 'bestbuycart_user_region';

export function getStoredRegion(): string {
  if (typeof window === 'undefined') return 'US';
  try {
    const saved = localStorage.getItem(REGION_STORAGE_KEY);
    if (saved && MARKETPLACES[saved]) {
      return saved;
    }
  } catch {
    // LocalStorage unavailable
  }
  return 'US';
}

export function setStoredRegion(countryCode: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (MARKETPLACES[countryCode]) {
      localStorage.setItem(REGION_STORAGE_KEY, countryCode);
      document.cookie = `bestbuycart_region=${countryCode};path=/;max-age=31536000;SameSite=Lax`;
    }
  } catch {
    // LocalStorage unavailable
  }
}

export function formatPrice(amount?: number, currency: string = 'USD'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Check Amazon';
  }

  const currencyMap: Record<string, { symbol: string; prefix: boolean }> = {
    USD: { symbol: '$', prefix: true },
    GBP: { symbol: '£', prefix: true },
    CAD: { symbol: 'CA$', prefix: true },
    EUR: { symbol: '€', prefix: true },
    SEK: { symbol: ' kr', prefix: false },
    PLN: { symbol: ' zł', prefix: false },
    AUD: { symbol: 'A$', prefix: true },
  };

  const config = currencyMap[currency.toUpperCase()] || { symbol: '$', prefix: true };
  const formatted = amount.toFixed(2);

  return config.prefix ? `${config.symbol}${formatted}` : `${formatted}${config.symbol}`;
}
