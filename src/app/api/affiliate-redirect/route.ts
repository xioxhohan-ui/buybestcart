import { NextRequest, NextResponse } from 'next/server';
import { buildAmazonAffiliateUrl } from '@/lib/affiliate';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asin = (searchParams.get('asin') || '').trim().toUpperCase();
  const slug = (searchParams.get('slug') || '').trim();
  const region = (searchParams.get('region') || searchParams.get('country') || 'US').toUpperCase();

  const supabase = createServerClient();

  if (slug) {
    const { data: product } = await supabase
      .from('products')
      .select('id, asin, affiliate_url, amazon_url')
      .eq('slug', slug)
      .maybeSingle();

    if (product) {
      if (product.affiliate_url && product.affiliate_url.startsWith('http')) {
        return NextResponse.redirect(product.affiliate_url, {
          status: 302,
          headers: {
            'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        });
      }

      const dest = buildAmazonAffiliateUrl({
        asin: product.asin,
        url: product.amazon_url,
        countryCode: region,
      });

      return NextResponse.redirect(dest, {
        status: 302,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }
  }

  if (asin) {
    const dest = buildAmazonAffiliateUrl({
      asin,
      countryCode: region,
    });

    return NextResponse.redirect(dest, {
      status: 302,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // Fallback to Amazon homepage with affiliate tag
  const fallbackUrl = buildAmazonAffiliateUrl({ countryCode: region });
  return NextResponse.redirect(fallbackUrl, {
    status: 302,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
