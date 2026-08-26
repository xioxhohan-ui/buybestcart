import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { clearSiteConfigCache } from '@/lib/settings';

export async function POST() {
  try {
    clearSiteConfigCache();
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/category');
      revalidatePath('/products');
      revalidatePath('/deals');
      revalidatePath('/compare');
      revalidatePath('/guides');
      revalidatePath('/sitemap.xml');
    } catch {}

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      message: 'Website cache, sitemaps, and core layout routes successfully revalidated.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ revalidated: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
