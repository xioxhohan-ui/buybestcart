import { NextResponse } from 'next/server';
import { getExchangeRates } from '@/lib/api/currency';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rates = await getExchangeRates();
    return NextResponse.json({
      success: true,
      base: 'USD',
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      success: false,
      base: 'USD',
      rates: {
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
      },
    });
  }
}
