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
  const ctaType = searchParams.get('cta') || searchParams.get('type') || 'direct';
  const ua = request.headers.get('user-agent') || '';
  const isMobile = /mobile|iphone|ipod|android.*mobile|windows.*phone/i.test(ua);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);
  const deviceCategory = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  if (slug) {
    const cleanSlug = slug.replace(/[,()"%_\\]/g, '').trim();
    const { data: product } = await supabase
      .from('products')
      .select('id, asin, affiliate_url, amazon_url')
      .or(`slug.eq.${cleanSlug},asin.eq.${cleanSlug}`)
      .maybeSingle();

    if (product) {
      // Asynchronously log click analytics without blocking redirect response
      const logPromise = (async () => {
        try {
          await supabase.from('affiliate_clicks').insert({
            product_id: product.id,
            asin: product.asin,
            cta_type: ctaType,
            country: region,
            page_url: request.headers.get('referer') || '',
            device_category: deviceCategory,
          });
          await supabase.rpc('increment_clicks', { p_id: product.id });
        } catch {
          // Safe analytics failover
        }
      })();

      // If user came from a specific non-US country, construct region-targeted Amazon link
      let dest: string;
      if (region && region !== 'US' && product.asin) {
        dest = buildAmazonAffiliateUrl({
          asin: product.asin,
          countryCode: region,
        });
      } else if (product.affiliate_url && product.affiliate_url.startsWith('http')) {
        dest = product.affiliate_url;
      } else {
        dest = buildAmazonAffiliateUrl({
          asin: product.asin,
          url: product.amazon_url,
          countryCode: region,
        });
      }

      return NextResponse.redirect(dest, {
        status: 302,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
        },
      });
    }
  }

  if (asin && /^[A-Z0-9]{10}$/i.test(asin)) {
    // Try to find product by ASIN to log product_id if exists
    try {
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('asin', asin)
        .maybeSingle();

      await supabase.from('affiliate_clicks').insert({
        product_id: product?.id || null,
        asin,
        cta_type: ctaType,
        country: region,
        page_url: request.headers.get('referer') || '',
        device_category: deviceCategory,
      });

      if (product?.id) {
        await supabase.rpc('increment_clicks', { p_id: product.id });
      }
    } catch {
      // Safe analytics failover
    }

    const dest = buildAmazonAffiliateUrl({
      asin,
      countryCode: region,
    });

    return NextResponse.redirect(dest, {
      status: 302,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
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
      'Pragma': 'no-cache',
    },
  });
}
