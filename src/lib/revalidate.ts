import { revalidatePath } from 'next/cache';

export async function triggerRevalidation() {
  if (typeof window === 'undefined') {
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/category');
      revalidatePath('/products');
      revalidatePath('/deals');
      revalidatePath('/compare');
      revalidatePath('/guides');
      revalidatePath('/sitemap.xml');
    } catch {
      // Server-side revalidation
    }
  } else {
    try {
      await fetch('/api/revalidate', { method: 'POST' }).catch(() => {});
    } catch {
      // Client-side revalidation
    }
  }
}
