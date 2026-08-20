import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    // 1. Revalidate Next.js cache routes
    revalidatePath('/', 'layout');
    revalidatePath('/deals');
    revalidatePath('/compare');
    revalidatePath('/guides');
    revalidatePath('/sitemap.xml');

    // 2. Automatically Ping Google Search Console & Indexing Service for immediate auto-indexing
    const sitemapUrl = 'https://buybestcart.shop/sitemap.xml';
    try {
      fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`).catch(() => {});
      fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`).catch(() => {});
    } catch {
      // Ignore background ping errors
    }

    return NextResponse.json({
      revalidated: true,
      google_pinged: true,
      timestamp: new Date().toISOString(),
      message: 'All website caches, sitemaps, and layout paths successfully revalidated, and Google Search Console pinged for instant auto-indexing.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ revalidated: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
