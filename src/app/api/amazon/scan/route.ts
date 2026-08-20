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

    // 1. Extract ASIN (10-character code)
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
    let domain = 'amazon.com';
    let currency = 'USD';

    if (input.includes('amazon.co.uk')) {
      marketplace = 'UK';
      domain = 'amazon.co.uk';
      currency = 'GBP';
    } else if (input.includes('amazon.ca')) {
      marketplace = 'CA';
      domain = 'amazon.ca';
      currency = 'CAD';
    } else if (input.includes('amazon.de')) {
      marketplace = 'DE';
      domain = 'amazon.de';
      currency = 'EUR';
    } else if (input.includes('amazon.fr')) {
      marketplace = 'FR';
      domain = 'amazon.fr';
      currency = 'EUR';
    } else if (input.includes('amazon.it')) {
      marketplace = 'IT';
      domain = 'amazon.it';
      currency = 'EUR';
    } else if (input.includes('amazon.es')) {
      marketplace = 'ES';
      domain = 'amazon.es';
      currency = 'EUR';
    } else if (input.includes('amazon.com.au')) {
      marketplace = 'AU';
      domain = 'amazon.com.au';
      currency = 'AUD';
    }

    // 3. Query Admin Credentials from Supabase
    const supabase = createServerClient();
    const { data: apiSettings } = await supabase.from('settings').select('value').eq('key', 'api_configs').single();
    const amazonConfig = apiSettings?.value?.amazon || {};

    const partnerTag = amazonConfig.partnerTag || 'bestbuycart-20';
    const cleanAffiliateUrl = `https://www.${domain}/dp/${asin}?tag=${partnerTag}`;
    const rawAmazonUrl = `https://www.${domain}/dp/${asin}`;
    const now = new Date().toISOString();

    // Check if Creators API credentials are present
    const hasCredentials = Boolean(amazonConfig.apiKey && amazonConfig.secretKey);

    // Department Auto-Suggestion Logic based on ASIN/URL keywords
    const suggestDepartment = (str: string): string => {
      const lower = str.toLowerCase();
      if (lower.includes('phone') || lower.includes('charger') || lower.includes('case') || lower.includes('iphone') || lower.includes('galaxy') || lower.includes('cellular')) return 'Cell Phones & Accessories';
      if (lower.includes('laptop') || lower.includes('monitor') || lower.includes('keyboard') || lower.includes('mouse') || lower.includes('ssd') || lower.includes('macbook') || lower.includes('computer')) return 'Computers & Accessories';
      if (lower.includes('headphone') || lower.includes('speaker') || lower.includes('tv') || lower.includes('camera') || lower.includes('audio') || lower.includes('electronics')) return 'Electronics';
      if (lower.includes('coffee') || lower.includes('blender') || lower.includes('vacuum') || lower.includes('air fryer') || lower.includes('kitchen') || lower.includes('home')) return 'Home & Kitchen';
      if (lower.includes('watch') || lower.includes('treadmill') || lower.includes('fitness') || lower.includes('dumbbell') || lower.includes('sport')) return 'Sports & Outdoors';
      if (lower.includes('game') || lower.includes('ps5') || lower.includes('xbox') || lower.includes('nintendo') || lower.includes('controller') || lower.includes('gaming')) return 'Video Games';
      if (lower.includes('beauty') || lower.includes('skincare') || lower.includes('hair') || lower.includes('makeup')) return 'Beauty & Personal Care';
      if (lower.includes('drill') || lower.includes('tool') || lower.includes('saw') || lower.includes('hardware')) return 'Tools & Home Improvement';
      return 'Electronics';
    };

    const suggestedDepartment = suggestDepartment(input);

    // 4. Call Official Amazon Creators API if configured
    let fetchedTitle: string | null = null;
    let fetchedPrice: string | null = null;
    let fetchedAvailability: string = 'In Stock';
    let fetchedBrand: string | null = null;
    let fetchedImage: string | null = null;
    let apiStatus = 'asin_parsed_clean';
    let apiNotice: string | null = null;

    if (hasCredentials) {
      try {
        // Attempt official Creators API HTTP request
        const endpoint = amazonConfig.endpoint || `https://webservices.${domain}/paapi5/getitems`;
        const apiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-amz-target': 'com.amazon.paapi5.v1.AmazonProductAdvertisingAPIv1.GetItems',
          },
          body: JSON.stringify({
            ItemIds: [asin],
            PartnerTag: partnerTag,
            PartnerType: 'Associates',
            Marketplace: `www.${domain}`,
            Resources: [
              'ItemInfo.Title',
              'ItemInfo.ByLineInfo',
              'Images.Primary.Large',
              'OffersV2.Listings.Price',
              'OffersV2.Listings.Availability',
            ],
          }),
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          const item = apiData.ItemsResult?.Items?.[0];
          if (item) {
            fetchedTitle = item.ItemInfo?.Title?.DisplayValue || null;
            fetchedBrand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || null;
            fetchedImage = item.Images?.Primary?.Large?.URL || null;

            const listing = item.OffersV2?.Listings?.[0];
            if (listing?.Price?.Amount) {
              fetchedPrice = listing.Price.Amount.toString();
            }
            if (listing?.Availability?.Message) {
              fetchedAvailability = listing.Availability.Message;
            }
            apiStatus = 'creators_api_success';
          }
        } else {
          apiNotice = `Amazon Creators API returned HTTP ${apiResponse.status}. Using clean ASIN parameters.`;
        }
      } catch (err: unknown) {
        apiNotice = `Creators API connection notice: ${err instanceof Error ? err.message : 'Unknown'}.`;
      }
    } else {
      apiNotice = 'Amazon Creators API credentials not configured in Admin → Settings → API.';
    }

    return NextResponse.json({
      success: true,
      data: {
        asin,
        marketplace,
        domain,
        currency,
        partner_tag: partnerTag,
        amazon_url: rawAmazonUrl,
        affiliate_url: cleanAffiliateUrl,
        title: fetchedTitle,
        brand: fetchedBrand,
        price: fetchedPrice,
        price_display: fetchedPrice ? `${currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : ''}${fetchedPrice}` : 'Price unavailable — Check current price on Amazon',
        availability: fetchedAvailability,
        image_url: fetchedImage,
        suggested_department: suggestedDepartment,
        last_synced_at: now,
        api_status: apiStatus,
        api_notice: apiNotice,
        is_creators_api_configured: hasCredentials,
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
