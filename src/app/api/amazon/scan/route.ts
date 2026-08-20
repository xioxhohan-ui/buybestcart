import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid Amazon URL or ASIN is required.' },
        { status: 400 }
      );
    }

    const input = url.trim();

    // 1. Extract ASIN (10 alphanumeric characters)
    const asinMatch = input.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i) || input.match(/\b([A-Z0-9]{10})\b/i);
    if (!asinMatch) {
      return NextResponse.json(
        { success: false, error: 'Could not extract valid 10-character Amazon ASIN from the provided link.' },
        { status: 400 }
      );
    }

    const asin = asinMatch[1].toUpperCase();

    // 2. Detect Marketplace
    let marketplace = 'US';
    if (input.includes('amazon.co.uk')) marketplace = 'UK';
    else if (input.includes('amazon.ca')) marketplace = 'CA';
    else if (input.includes('amazon.de')) marketplace = 'DE';
    else if (input.includes('amazon.fr')) marketplace = 'FR';
    else if (input.includes('amazon.com.au')) marketplace = 'AU';

    // 3. Format Clean Tagged Affiliate Link
    const affiliateTag = 'bestbuycart-20';
    const domainMap: Record<string, string> = {
      US: 'amazon.com',
      UK: 'amazon.co.uk',
      CA: 'amazon.ca',
      DE: 'amazon.de',
      FR: 'amazon.fr',
      AU: 'amazon.com.au',
    };
    const domain = domainMap[marketplace] || 'amazon.com';
    const cleanAffiliateUrl = `https://www.${domain}/dp/${asin}?tag=${affiliateTag}`;

    // 4. Query Supabase API credentials if configured in settings
    const supabase = createServerClient();
    const { data: apiSettings } = await supabase.from('settings').select('value').eq('key', 'api_configs').single();
    const amazonConfig = apiSettings?.value?.amazon || {};

    // 5. Suggest Department based on ASIN or title hints
    const suggestDepartment = (titleHint: string): string => {
      const lower = titleHint.toLowerCase();
      if (lower.includes('headphone') || lower.includes('speaker') || lower.includes('tv') || lower.includes('camera') || lower.includes('audio')) return 'Electronics';
      if (lower.includes('laptop') || lower.includes('monitor') || lower.includes('keyboard') || lower.includes('mouse') || lower.includes('ssd') || lower.includes('macbook')) return 'Computers & Accessories';
      if (lower.includes('phone') || lower.includes('charger') || lower.includes('case') || lower.includes('iphone') || lower.includes('galaxy')) return 'Phones & Accessories';
      if (lower.includes('coffee') || lower.includes('blender') || lower.includes('vacuum') || lower.includes('air fryer') || lower.includes('kitchen')) return 'Home & Kitchen';
      if (lower.includes('watch') || lower.includes('treadmill') || lower.includes('fitness') || lower.includes('dumbbell')) return 'Sports & Outdoors';
      if (lower.includes('game') || lower.includes('ps5') || lower.includes('xbox') || lower.includes('nintendo') || lower.includes('controller')) return 'Video Games';
      return 'Electronics';
    };

    // Return scanned product payload
    return NextResponse.json({
      success: true,
      data: {
        asin,
        marketplace,
        affiliate_tag: affiliateTag,
        amazon_url: `https://www.${domain}/dp/${asin}`,
        affiliate_url: cleanAffiliateUrl,
        suggested_department: suggestDepartment(input),
        last_price_update: new Date().toISOString(),
        api_status: amazonConfig.apiKey ? 'official_api_active' : 'asin_parsed_clean',
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
