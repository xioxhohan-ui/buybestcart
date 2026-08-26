import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buildAmazonAffiliateUrl, isCompliantAmazonUrl } from '@/lib/affiliate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = (slug || '').replace(/[,()"%_\\]/g, '').trim();
  const { searchParams } = new URL(request.url);
  const region = (searchParams.get('region') || 'US').toUpperCase();
  const ctaType = searchParams.get('cta') || 'direct';

  const supabase = createServerClient();

  // Find product by slug or direct ASIN
  const { data: product } = await supabase
    .from('products')
    .select('id, asin, title, amazon_url, affiliate_url')
    .or(`slug.eq.${cleanSlug},asin.eq.${cleanSlug}`)
    .maybeSingle();

  if (!product && !/^[A-Z0-9]{10}$/i.test(cleanSlug)) {
    return NextResponse.json(
      { error: 'Affiliate product resource not found', status: 404 },
      {
        status: 404,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  }

  let destinationUrl = '';

  if (product) {
    if (product.affiliate_url && product.affiliate_url.trim().startsWith('http') && isCompliantAmazonUrl(product.affiliate_url.trim())) {
      destinationUrl = product.affiliate_url.trim();
    } else {
      destinationUrl = buildAmazonAffiliateUrl({
        asin: product.asin,
        url: product.amazon_url,
        countryCode: region,
      });
    }

    // Record click analytics asynchronously (safe failover per Section 121)
    try {
      const ua = request.headers.get('user-agent') || '';
      const isMobile = /mobile|iphone|ipod|android.*mobile|windows.*phone/i.test(ua);
      const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(ua);
      const deviceCategory = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

      await supabase.from('affiliate_clicks').insert({
        product_id: product.id,
        asin: product.asin,
        cta_type: ctaType,
        country: region,
        page_url: request.headers.get('referer') || '',
        device_category: deviceCategory,
      });

      // Increment product clicks_count counter
      await supabase.rpc('increment_clicks', { p_id: product.id });
    } catch {
      // Analytics failure must never prevent Amazon redirect (Section 121)
    }
  } else if (/^[A-Z0-9]{10}$/i.test(cleanSlug)) {
    // If direct 10-char ASIN was passed
    destinationUrl = buildAmazonAffiliateUrl({
      asin: cleanSlug.toUpperCase(),
      countryCode: region,
    });
  }

  // 302 Found redirect to Amazon affiliate marketplace destination
  // CRITICAL SEO HEADERS: Explicitly mark all affiliate redirects as non-indexable for Googlebot & SEO tools
  return NextResponse.redirect(destinationUrl, {
    status: 302,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    },
  });
}
