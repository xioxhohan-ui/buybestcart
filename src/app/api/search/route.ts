import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q') || '';
  const q = rawQ.replace(/[,()"%_\\]/g, ' ').replace(/\s+/g, ' ').trim();
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!q) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const supabase = createServerClient();

  // Search products by title, short_description, or ASIN using ilike safely
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, slug, thumbnail_url, price, currency, rating, review_count, brand:brands(name), category:categories(name, slug)')
    .or(`title.ilike.%${q}%,short_description.ilike.%${q}%,asin.ilike.%${q}%`)
    .in('status', ['active', 'featured', 'published'])
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log search query asynchronously for analytics
  try {
    await supabase.from('search_logs').insert({
      query: q,
      results_count: products ? products.length : 0,
    });
  } catch {
    // Non-blocking log
  }

  return NextResponse.json({
    products: products || [],
    total: products ? products.length : 0,
  });
}
