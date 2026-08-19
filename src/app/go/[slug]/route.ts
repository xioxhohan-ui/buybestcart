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

  // Find product by slug
  const { data: product } = await supabase
    .from('products')
    .select('id, asin, title, amazon_url')
    .eq('slug', slug)
    .single();

  let destinationUrl = 'https://www.amazon.com?tag=bestbuycart-20';

  if (product) {
    destinationUrl = buildAmazonAffiliateUrl({
      asin: product.asin,
      url: product.amazon_url,
      countryCode: region,
    });

    // Record click analytics asynchronously (safe failover per Section 121)
    try {
      await supabase.from('affiliate_clicks').insert({
        product_id: product.id,
        asin: product.asin,
        cta_type: ctaType,
        country: region,
        page_url: request.headers.get('referer') || '',
        device_category: 'desktop',
      });

      // Increment product clicks_count counter
      await supabase.rpc('increment_clicks', { p_id: product.id });
    } catch {
      // Analytics failure must never prevent Amazon redirect (Section 121)
    }
  }

  // 302 Found redirect to Amazon affiliate marketplace destination
  return NextResponse.redirect(destinationUrl, 302);
}
