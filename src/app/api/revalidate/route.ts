import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/deals');
    revalidatePath('/compare');
    revalidatePath('/guides');
    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      message: 'All website caches, sitemaps, and layout paths successfully revalidated in real-time.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ revalidated: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
