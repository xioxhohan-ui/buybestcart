// Currency Exchange Rate Service using ExchangeRate-API (Free Open Tier)
import { fetchWithCache } from './manager';
import { createServerClient } from '@/lib/supabase/server';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  last_updated: string;
}

export const FALLBACK_RATES: Record<string, number> = {
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
  CHF: 0.91,
};

export async function getExchangeRates(): Promise<Record<string, number>> {
  try {
    const data = await fetchWithCache<ExchangeRates>(
      'exchange_rates_usd',
      async () => {
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/USD', {
            next: { revalidate: 86400 }, // 24-hour Next.js cache
          });
          if (!res.ok) throw new Error(`Currency API HTTP ${res.status}`);
          const json = await res.json();
          const fetchedRates = json.rates || FALLBACK_RATES;

          // Asynchronously persist to Supabase settings cache for persistent failover
          try {
            const supabase = createServerClient();
            await supabase.from('settings').upsert({
              key: 'exchange_rates_cache',
              category: 'currency',
              value: {
                base: 'USD',
                rates: fetchedRates,
                updated_at: new Date().toISOString(),
              },
              description: 'Cached foreign exchange rates for offline/fallback currency conversions',
            }, { onConflict: 'key' });
          } catch {}

          return {
            base: 'USD',
            rates: fetchedRates,
            last_updated: new Date().toISOString(),
          };
        } catch (fetchErr) {
          // Attempt recovery from Supabase database settings cache
          try {
            const supabase = createServerClient();
            const { data: dbCache } = await supabase
              .from('settings')
              .select('value')
              .eq('key', 'exchange_rates_cache')
              .maybeSingle();

            if (dbCache?.value?.rates) {
              return {
                base: 'USD',
                rates: dbCache.value.rates,
                last_updated: dbCache.value.updated_at || new Date().toISOString(),
              };
            }
          } catch {}
          throw fetchErr;
        }
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
  amount: number,
  targetCurrency: string = 'USD',
  rates: Record<string, number> = FALLBACK_RATES,
  fromCurrency: string = 'USD'
): string {
  const from = fromCurrency.toUpperCase();
  const to = targetCurrency.toUpperCase();

  const fromRate = rates[from] || FALLBACK_RATES[from] || 1.0;
  const toRate = rates[to] || FALLBACK_RATES[to] || 1.0;

  // Normalize to USD base, then convert to target
  const amountUsd = from === 'USD' ? amount : amount / fromRate;
  const converted = to === 'USD' ? amountUsd : amountUsd * toRate;

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
    SEK: 'kr ',
    PLN: 'zł ',
    INR: '₹',
    CHF: 'CHF ',
    MXN: 'MX$',
    BRL: 'R$',
    AED: 'AED ',
    SAR: 'SAR ',
    SGD: 'S$',
  };

  const symbol = currencySymbols[to] || `${to} `;

  // Format with standard decimals (JPY has 0 decimals)
  if (to === 'JPY') {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${symbol}${converted.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
