import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buildAmazonAffiliateUrl, MARKETPLACES } from '@/lib/affiliate';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const region = (searchParams.get('region') || 'US').toUpperCase();
  const ctaType = searchParams.get('cta') || 'direct';

  const supabase = createServerClient();

  // Find product by slug or direct ASIN
  const { data: product } = await supabase
    .from('products')
    .select('id, asin, title, amazon_url, affiliate_url')
    .or(`slug.eq.${slug},asin.eq.${slug}`)
    .maybeSingle();

  let destinationUrl = buildAmazonAffiliateUrl({ countryCode: region });

  if (product) {
    if (product.affiliate_url && product.affiliate_url.trim().startsWith('http')) {
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
  } else if (/^[A-Z0-9]{10}$/i.test(slug)) {
    // If direct 10-char ASIN was passed
    destinationUrl = buildAmazonAffiliateUrl({
      asin: slug.toUpperCase(),
      countryCode: region,
    });
  }

  // 302 Found redirect to Amazon affiliate marketplace destination
  return NextResponse.redirect(destinationUrl, 302);
}
