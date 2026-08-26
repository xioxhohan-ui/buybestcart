// Centralized API Service Manager & Caching Layer for BuyBestCart

export interface ApiConfig {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
  endpoint?: string;
  status: 'active' | 'degraded' | 'disabled' | 'error';
  lastSuccess?: string;
  lastError?: string;
  requestCount: number;
  cacheHitRate: number;
}

// In-Memory Fallback Cache Store with TTL
const cacheStore = new Map<string, { data: unknown; expiresAt: number }>();

export const DEFAULT_API_CONFIGS: Record<string, ApiConfig> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon Product Advertising API',
    provider: 'Amazon Associates / PA-API v5',
    enabled: true,
    endpoint: 'https://webservices.amazon.com/paapi5/searchitems',
    status: 'active',
    lastSuccess: new Date().toISOString(),
    requestCount: 1420,
    cacheHitRate: 88.5,
  },
  currency: {
    id: 'currency',
    name: 'ExchangeRate-API',
    provider: 'ExchangeRate-API (Open Tier)',
    enabled: true,
    endpoint: 'https://open.er-api.com/v6/latest/USD',
    status: 'active',
    lastSuccess: new Date().toISOString(),
    requestCount: 560,
    cacheHitRate: 94.2,
  },
  countries: {
    id: 'countries',
    name: 'REST Countries API',
    provider: 'REST Countries (Open Data)',
    enabled: true,
    endpoint: 'https://restcountries.com/v3.1/all',
    status: 'active',
    lastSuccess: new Date().toISOString(),
    requestCount: 310,
    cacheHitRate: 98.1,
  },
  meteo: {
    id: 'meteo',
    name: 'Open-Meteo Weather API',
    provider: 'Open-Meteo (Non-Commercial Free)',
    enabled: true,
    endpoint: 'https://api.open-meteo.com/v1/forecast',
    status: 'active',
    lastSuccess: new Date().toISOString(),
    requestCount: 220,
    cacheHitRate: 91.0,
  },
  holidays: {
    id: 'holidays',
    name: 'Nager.Date Holiday API',
    provider: 'Nager.Date Global Holidays',
    enabled: true,
    endpoint: 'https://date.nager.at/api/v3/PublicHolidays',
    status: 'active',
    lastSuccess: new Date().toISOString(),
    requestCount: 180,
    cacheHitRate: 99.0,
  },
  ai: {
    id: 'ai',
    name: 'AI Copywriting Engine',
    provider: 'Free/Free-Tier LLM Provider',
    enabled: true,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    status: 'active',
    lastSuccess: new Date().toISOString(),
    requestCount: 450,
    cacheHitRate: 76.4,
  },
  search_console: {
    id: 'search_console',
    name: 'Google Search Console API',
    provider: 'Google API Client',
    enabled: true,
    endpoint: 'https://www.googleapis.com/webmasters/v3/sites',
    status: 'active',
    lastSuccess: new Date().toISOString(),
    requestCount: 890,
    cacheHitRate: 85.0,
  },
};

/**
 * Fetch with built-in TTL caching and fallback safety.
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 1000 * 60 * 60 // 1 hour default TTL
): Promise<T> {
  const cached = cacheStore.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as T;
  }

  try {
    const data = await fetchFn();
    cacheStore.set(cacheKey, { data, expiresAt: Date.now() + ttlMs });
    return data;
  } catch (error) {
    if (cached) {
      console.warn(`API Fetch failed for key ${cacheKey}, serving expired cache fallback.`, error);
      return cached.data as T;
    }
    throw error;
  }
}

/**
 * Mask sensitive API keys for UI display.
 */
export function maskApiKey(key?: string): string {
  if (!key || key.length < 6) return '••••••••••••';
  return `${key.slice(0, 3)}••••••••${key.slice(-3)}`;
}
