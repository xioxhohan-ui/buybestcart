// Currency Exchange Rate Service using ExchangeRate-API (Free Open Tier)
import { fetchWithCache } from './manager';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  last_updated: string;
}

const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 154.5,
  CHF: 0.91,
  INR: 83.4,
};

export async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const data = await fetchWithCache<ExchangeRates>(
      'exchange_rates_usd',
      async () => {
        const res = await fetch('https://open.er-api.com/v6/latest/USD', {
          next: { revalidate: 86400 }, // 24-hour Next.js cache
        });
        if (!res.ok) throw new Error(`Currency API HTTP ${res.status}`);
        const json = await res.json();
        return {
          base: 'USD',
          rates: json.rates || FALLBACK_RATES,
          last_updated: new Date().toISOString(),
        };
      },
      1000 * 60 * 60 * 24 // 24-hour memory TTL
    );

    return data.rates || FALLBACK_RATES;
  } catch (err) {
    console.warn('Using fallback currency exchange rates due to API error:', err);
    return FALLBACK_RATES;
  }
}

export function formatCurrencyAmount(
  amountUsd: number,
  targetCurrency: string = 'USD',
  rates: Record<string, number> = FALLBACK_RATES
): string {
  const rate = rates[targetCurrency] || FALLBACK_RATES[targetCurrency] || 1.0;
  const converted = amountUsd * rate;

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF ',
    INR: '₹',
  };

  const symbol = currencySymbols[targetCurrency] || `${targetCurrency} `;
  const decimals = targetCurrency === 'JPY' ? 0 : 2;

  return `${symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
