import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    // 1. Revalidate Next.js cache routes for instant updates
    revalidatePath('/', 'layout');
    revalidatePath('/category');
    revalidatePath('/products');
    revalidatePath('/deals');
    revalidatePath('/compare');
    revalidatePath('/guides');
    revalidatePath('/sitemap.xml');

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
