import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q') || '';
  const cleanQ = rawQ.replace(/[,()."%_\\]/g, ' ').replace(/\s+/g, ' ').trim();
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!cleanQ) {
    return NextResponse.json({ products: [], articles: [], comparisons: [], total: 0 });
  }

  const supabase = createServerClient();
  const tokens = cleanQ.split(' ').filter(t => t.length > 2);
  const primaryToken = (tokens[0] || cleanQ).replace(/[,()."%_\\]/g, '').trim();

  // 1. Search products by title, short_description, or ASIN
  let productQuery = supabase
    .from('products')
    .select('id, title, slug, thumbnail_url, price, currency, rating, review_count, brand:brands(name), category:categories(name, slug)')
    .in('status', ['active', 'featured', 'published']);

  if (cleanQ.includes(' ') && tokens.length > 1) {
    // Try exact or primary token
    productQuery = productQuery.or(`title.ilike.%${cleanQ}%,short_description.ilike.%${cleanQ}%,title.ilike.%${primaryToken}%,asin.ilike.%${cleanQ}%`);
  } else {
    productQuery = productQuery.or(`title.ilike.%${cleanQ}%,short_description.ilike.%${cleanQ}%,asin.ilike.%${cleanQ}%`);
  }

  const { data: products, error } = await productQuery.limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Search published articles & buying guides
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, content_type, published_at')
    .eq('status', 'published')
    .or(`title.ilike.%${cleanQ}%,excerpt.ilike.%${cleanQ}%,slug.ilike.%${cleanQ}%`)
    .limit(4);

  // 3. Search published comparisons
  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('id, title, slug, description, summary')
    .eq('status', 'published')
    .or(`title.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%,slug.ilike.%${cleanQ}%`)
    .limit(4);

  // Log search query asynchronously for analytics
  try {
    await supabase.from('search_logs').insert({
      query: cleanQ,
      results_count: (products?.length || 0) + (articles?.length || 0) + (comparisons?.length || 0),
    });
  } catch {
    // Non-blocking log
  }

  return NextResponse.json({
    products: products || [],
    articles: articles || [],
    comparisons: comparisons || [],
    total: (products?.length || 0) + (articles?.length || 0) + (comparisons?.length || 0),
  });
}
