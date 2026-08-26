import { NextRequest, NextResponse } from 'next/server';
import { resolveLocationCurrency, getAmazonMarketplace } from '@/lib/geo';

export const dynamic = 'force-dynamic';

// In-memory cache for IP lookups to avoid rate limits (24-hour TTL)
const ipCache = new Map<string, { country: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.20.') ||
    ip.startsWith('172.21.') ||
    ip.startsWith('172.22.') ||
    ip.startsWith('172.23.') ||
    ip.startsWith('172.24.') ||
    ip.startsWith('172.25.') ||
    ip.startsWith('172.26.') ||
    ip.startsWith('172.27.') ||
    ip.startsWith('172.28.') ||
    ip.startsWith('172.29.') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.') ||
    ip.startsWith('fc00:') ||
    ip.startsWith('fe80:')
  );
}

export async function GET(req: NextRequest) {
  try {
    // 1. Direct Edge Headers (Vercel, Cloudflare, AWS CloudFront)
    const vercelCountry = req.headers.get('x-vercel-ip-country');
    const cloudflareCountry = req.headers.get('cf-ipcountry');
    const customCountry = req.headers.get('x-country-code');

    let detectedCountry = vercelCountry || cloudflareCountry || customCountry;

    // 2. If no edge header, inspect IP address
    if (!detectedCountry) {
      const forwardedFor = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      const rawIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '';

      if (rawIp && !isPrivateIp(rawIp)) {
        const cached = ipCache.get(rawIp);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          detectedCountry = cached.country;
        } else {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1200); // 1.2s timeout

            const res = await fetch(`https://ipwho.is/${encodeURIComponent(rawIp)}`, {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
            });
            clearTimeout(timeout);

            if (res.ok) {
              const data = await res.json();
              if (data && data.success && data.country_code) {
                detectedCountry = data.country_code;
                ipCache.set(rawIp, { country: data.country_code, timestamp: Date.now() });
              }
            }
          } catch {
            // Geolocation fallback
          }
        }
      }
    }

    // 3. Resolve through Amazon-supported Country Logic
    // If country is supported by Amazon -> return country currency
    // If NOT supported by Amazon -> default strictly to USD ($)
    const locationInfo = resolveLocationCurrency(detectedCountry);

    return NextResponse.json({
      success: true,
      detectedCountry: detectedCountry ? detectedCountry.toUpperCase() : 'US',
      effectiveCountry: locationInfo.countryCode,
      currency: locationInfo.currency,
      currencySymbol: locationInfo.marketplace.currency_symbol,
      isAmazonSupported: locationInfo.isAmazonSupported,
      marketplaceDomain: locationInfo.marketplace.domain,
      marketplaceName: locationInfo.marketplace.country_name,
      flagEmoji: locationInfo.marketplace.flag_emoji,
    });
  } catch (err: unknown) {
    const error = err as Error;
    const fallback = resolveLocationCurrency('US');
    return NextResponse.json({
      success: false,
      error: error.message,
      effectiveCountry: 'US',
      currency: 'USD',
      currencySymbol: '$',
      isAmazonSupported: true,
      marketplaceDomain: fallback.marketplace.domain,
      marketplaceName: fallback.marketplace.country_name,
      flagEmoji: fallback.marketplace.flag_emoji,
    });
  }
}
