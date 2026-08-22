import { Product, TopProductItem, ProductSpecItem } from '@/types';

export interface ProductTemplateData {
  version: '1.0';
  exported_at: string;
  source: 'Buy Best Cart Central Catalog';
  product: {
    id?: string;
    asin?: string;
    title: string;
    slug?: string;
    brand?: string;
    category?: string;
    thumbnail_url?: string;
    gallery_images?: string[];
    price?: number;
    list_price?: number;
    currency?: string;
    availability?: string;
    score?: number;
    rating?: number;
    review_count?: number;
    badge?: string;
    award_label?: string;
    custom_award_label?: string;
    ranking_reason?: string;
    short_description?: string;
    full_description?: string;
    highlights?: string[];
    important_features?: string[];
    specifications?: ProductSpecItem[];
    pros?: string[];
    cons?: string[];
    best_for?: string;
    avoid_if?: string;
    performance_notes?: string;
    custom_notes?: string;
    affiliate_url?: string;
    buy_url?: string;
    cta_text?: string;
    video_url?: string;
    video_title?: string;
  };
}

/**
 * Converts any catalog Product or TopProductItem into a standardized exportable JSON string
 */
export function exportProductToJson(item: Product | TopProductItem): string {
  const isCatalogProduct = 'description' in item && ('editorial_score' in item || 'is_featured' in item);

  let gallery: string[] = [];
  if ('gallery_images' in item && Array.isArray(item.gallery_images)) {
    gallery = item.gallery_images;
  } else if ('images' in item && Array.isArray((item as Product).images)) {
    gallery = ((item as Product).images || []).map((img) => img.url).filter(Boolean);
  }

  let specs: ProductSpecItem[] = [];
  if ('specifications' in item && Array.isArray(item.specifications)) {
    specs = (item.specifications as any[]).map((s) => ({
      name: s.name || s.spec_key || s.spec_name || '',
      value: s.value || s.spec_value || '',
    })).filter((s) => s.name);
  }

  let highlights: string[] = [];
  if ('highlights' in item && Array.isArray(item.highlights)) {
    highlights = item.highlights;
  } else if ('features' in item && Array.isArray((item as Product).features)) {
    highlights = ((item as Product).features || []).map((f) => (f as any).feature || (f as any).feature_text).filter(Boolean);
  }

  let pros: string[] = [];
  if ('pros' in item) {
    if (Array.isArray(item.pros)) pros = item.pros;
    else if (typeof item.pros === 'string') pros = (item.pros as string).split('\n').filter(Boolean);
  }

  let cons: string[] = [];
  if ('cons' in item) {
    if (Array.isArray(item.cons)) cons = item.cons;
    else if (typeof item.cons === 'string') cons = (item.cons as string).split('\n').filter(Boolean);
  }

  const templateData: ProductTemplateData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    source: 'Buy Best Cart Central Catalog',
    product: {
      id: item.id,
      asin: item.asin,
      title: item.title,
      slug: (item as any).slug || (item as any).product_slug,
      brand: (item as any).brand?.name || (item as any).manufacturer || '',
      category: (item as any).category?.name || '',
      thumbnail_url: item.thumbnail_url,
      gallery_images: gallery,
      price: item.price ? Number(item.price) : undefined,
      list_price: item.list_price ? Number(item.list_price) : undefined,
      currency: item.currency || 'USD',
      availability: item.availability || 'In Stock',
      score: (item as any).score || (item as any).editorial_score ? Number((item as any).score || (item as any).editorial_score) : undefined,
      rating: item.rating ? Number(item.rating) : undefined,
      review_count: item.review_count ? Number(item.review_count) : undefined,
      badge: (item as any).badge || (item as any).badge_text,
      award_label: (item as any).award_label || (item as any).badge_text,
      custom_award_label: (item as any).custom_award_label || (item as any).badge,
      ranking_reason: (item as any).ranking_reason || (item as any).why_we_like_it,
      short_description: (item as any).short_description,
      full_description: (item as any).full_description || (item as any).description,
      highlights,
      important_features: (item as any).important_features || highlights.slice(0, 4),
      specifications: specs,
      pros,
      cons,
      best_for: (item as any).best_for || (item as any).who_should_buy,
      avoid_if: (item as any).avoid_if || (item as any).who_should_avoid,
      performance_notes: (item as any).performance_notes || (item as any).editor_verdict,
      custom_notes: (item as any).custom_notes,
      affiliate_url: (item as any).affiliate_url,
      buy_url: (item as any).buy_url || (item as any).affiliate_url,
      cta_text: (item as any).cta_text || 'Buy on Amazon',
      video_url: (item as any).video_url,
      video_title: (item as any).video_title,
    },
  };

  return JSON.stringify(templateData, null, 2);
}

/**
 * Triggers a browser file download of product JSON data
 */
export function downloadProductJson(item: Product | TopProductItem, filename?: string) {
  const jsonContent = exportProductToJson(item);
  const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const fileName = filename || `buybestcart-product-${cleanTitle || 'template'}.json`;

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Converts a catalog Product into a standalone TopProductItem for a blog post
 */
export function convertCatalogProductToTopProduct(p: Product, rank: number): TopProductItem {
  const gallery = (p.images || []).map((img) => img.url).filter(Boolean);
  const specs: ProductSpecItem[] = (p.specifications || []).map((s: any) => ({
    name: s.spec_key || s.spec_name || s.name || '',
    value: s.spec_value || s.value || '',
  })).filter((s) => s.name);

  const highlights = (p.features || []).map((f: any) => f.feature || f.feature_text || '').filter(Boolean);

  let pros: string[] = [];
  if (Array.isArray(p.pros)) pros = p.pros;
  else if (typeof p.pros === 'string') pros = (p.pros as string).split('\n').filter(Boolean);

  let cons: string[] = [];
  if (Array.isArray(p.cons)) cons = p.cons;
  else if (typeof p.cons === 'string') cons = (p.cons as string).split('\n').filter(Boolean);

  return {
    id: `blog-prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    product_id: p.id,
    product_slug: p.slug,
    asin: p.asin,
    position: rank,
    rank: rank,
    title: p.title,
    badge: p.badge_text || (rank === 1 ? 'Best Overall' : rank === 2 ? 'Top Runner-Up' : rank === 3 ? 'Best Value' : `Top Pick #${rank}`),
    award_label: p.badge_text || (rank === 1 ? 'Best Overall' : `Top Pick #${rank}`),
    custom_award_label: p.badge_text || (rank === 1 ? 'Best Overall' : `Top Pick #${rank}`),
    price: p.price ? Number(p.price) : 199.99,
    list_price: p.list_price ? Number(p.list_price) : undefined,
    currency: p.currency || 'USD',
    availability: p.availability || 'In Stock',
    score: p.editorial_score ? Number(p.editorial_score) : 9.5,
    rating: p.rating ? Number(p.rating) : 4.8,
    review_count: p.review_count ? Number(p.review_count) : 250,
    thumbnail_url: p.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70',
    gallery_images: gallery.length > 0 ? gallery : (p.thumbnail_url ? [p.thumbnail_url] : []),
    short_description: p.short_description || 'Tested in our independent editorial lab with standout benchmark performance.',
    ranking_reason: p.why_we_like_it || p.editor_verdict || 'High performance stability and premium ergonomics in our lab benchmarks.',
    full_description: p.description || 'Our engineers evaluated this unit across multiple performance metrics, measuring acoustic/thermal stability and real-world durability.',
    highlights: highlights.length > 0 ? highlights : ['Lab verified hardware specifications', 'High build quality', 'Reliable performance'],
    important_features: highlights.slice(0, 4),
    specifications: specs.length > 0 ? specs : [
      { name: 'ASIN', value: p.asin || 'N/A' },
      { name: 'Availability', value: p.availability || 'In Stock' },
      { name: 'Warranty', value: '1-Year Manufacturer Warranty' },
    ],
    pros: pros.length > 0 ? pros : ['High build quality', 'Reliable performance in testing'],
    cons: cons,
    best_for: p.who_should_buy || p.best_for || 'Buyers seeking verified, highly-rated Amazon hardware.',
    avoid_if: p.who_should_avoid || '',
    performance_notes: p.editor_verdict || '',
    cta_text: 'Buy on Amazon',
    affiliate_url: p.affiliate_url || (p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20'),
    buy_url: p.affiliate_url || (p.asin ? `https://www.amazon.com/dp/${p.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20'),
    video_url: '',
    video_title: '',
  };
}

/**
 * Parses any uploaded or pasted JSON data into TopProductItem(s)
 */
export function parseProductJsonToTopProducts(jsonString: string, startingRank = 1): TopProductItem[] {
  try {
    const parsed = JSON.parse(jsonString);
    const items: any[] = Array.isArray(parsed)
      ? parsed
      : parsed.products && Array.isArray(parsed.products)
      ? parsed.products
      : parsed.product
      ? [parsed.product]
      : [parsed];

    return items.map((raw, idx) => {
      const rank = startingRank + idx;
      return {
        id: `imported-prod-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        product_id: raw.id || raw.product_id,
        product_slug: raw.slug || raw.product_slug,
        asin: raw.asin,
        position: raw.position || rank,
        rank: raw.rank || rank,
        title: raw.title || `Imported Product #${rank}`,
        badge: raw.badge || raw.custom_award_label || raw.award_label || (rank === 1 ? 'Best Overall' : `Top Pick #${rank}`),
        award_label: raw.award_label || raw.badge || (rank === 1 ? 'Best Overall' : `Top Pick #${rank}`),
        custom_award_label: raw.custom_award_label || raw.badge || (rank === 1 ? 'Best Overall' : `Top Pick #${rank}`),
        price: raw.price ? Number(raw.price) : 199.99,
        list_price: raw.list_price ? Number(raw.list_price) : undefined,
        currency: raw.currency || 'USD',
        availability: raw.availability || 'In Stock',
        score: raw.score ? Number(raw.score) : raw.editorial_score ? Number(raw.editorial_score) : 9.5,
        rating: raw.rating ? Number(raw.rating) : 4.8,
        review_count: raw.review_count ? Number(raw.review_count) : 250,
        thumbnail_url: raw.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70',
        gallery_images: Array.isArray(raw.gallery_images) ? raw.gallery_images : [],
        short_description: raw.short_description || 'Imported product from structured template.',
        ranking_reason: raw.ranking_reason || 'Verified performance in testing benchmarks.',
        full_description: raw.full_description || raw.description || '',
        highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
        important_features: Array.isArray(raw.important_features) ? raw.important_features : [],
        specifications: Array.isArray(raw.specifications)
          ? raw.specifications.map((s: any) => ({ name: s.name || s.spec_name || '', value: s.value || s.spec_value || '' }))
          : [],
        pros: Array.isArray(raw.pros) ? raw.pros : typeof raw.pros === 'string' ? raw.pros.split('\n').filter(Boolean) : [],
        cons: Array.isArray(raw.cons) ? raw.cons : typeof raw.cons === 'string' ? raw.cons.split('\n').filter(Boolean) : [],
        best_for: raw.best_for || raw.who_should_buy || '',
        avoid_if: raw.avoid_if || raw.who_should_avoid || '',
        performance_notes: raw.performance_notes || '',
        custom_notes: raw.custom_notes || '',
        cta_text: raw.cta_text || 'Buy on Amazon',
        affiliate_url: raw.affiliate_url || raw.buy_url || (raw.asin ? `https://www.amazon.com/dp/${raw.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20'),
        buy_url: raw.buy_url || raw.affiliate_url || (raw.asin ? `https://www.amazon.com/dp/${raw.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20'),
        video_url: raw.video_url || '',
        video_title: raw.video_title || '',
      };
    });
  } catch (err) {
    console.error('Error parsing product JSON:', err);
    return [];
  }
}
