import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = 'https://buybestcart.shop';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();

  const [productsRes, categoriesRes, articlesRes, brandsRes, collectionsRes] = await Promise.all([
    supabase.from('products').select('slug, updated_at').in('status', ['active', 'featured']),
    supabase.from('categories').select('slug, updated_at').eq('is_active', true),
    supabase.from('articles').select('slug, updated_at').eq('status', 'published'),
    supabase.from('brands').select('slug, updated_at').eq('is_active', true),
    supabase.from('collections').select('slug, updated_at').eq('is_active', true),
  ]);

  const products = productsRes.data || [];
  const categories = categoriesRes.data || [];
  const articles = articlesRes.data || [];
  const brands = brandsRes.data || [];
  const collections = collectionsRes.data || [];

  const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

  const addRoute = (url: string, lastModified: Date, changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never', priority: number) => {
    // Force replace any legacy domain bestbuycart.com with buybestcart.shop
    const sanitizedUrl = url.replace(/https?:\/\/(www\.)?bestbuycart\.com/g, SITE_URL);
    // Ensure clean absolute URL without trailing slash (except root)
    const cleanUrl = sanitizedUrl === `${SITE_URL}/` ? sanitizedUrl : sanitizedUrl.replace(/\/$/, '');
    if (!sitemapMap.has(cleanUrl)) {
      sitemapMap.set(cleanUrl, {
        url: cleanUrl,
        lastModified,
        changeFrequency,
        priority,
      });
    }
  };

  // 1. Static SEO-Indexable Pages
  addRoute(`${SITE_URL}/`, new Date(), 'daily', 1.0);
  addRoute(`${SITE_URL}/deals`, new Date(), 'hourly', 0.9);
  addRoute(`${SITE_URL}/compare`, new Date(), 'weekly', 0.8);
  addRoute(`${SITE_URL}/guides`, new Date(), 'daily', 0.8);
  addRoute(`${SITE_URL}/how-we-rank`, new Date(), 'monthly', 0.7);
  addRoute(`${SITE_URL}/about`, new Date(), 'monthly', 0.6);
  addRoute(`${SITE_URL}/affiliate-disclosure`, new Date(), 'monthly', 0.5);
  addRoute(`${SITE_URL}/contact`, new Date(), 'monthly', 0.5);
  addRoute(`${SITE_URL}/search`, new Date(), 'weekly', 0.5);

  // 2. Active Categories
  categories.forEach((c: { slug: string; updated_at?: string }) => {
    if (c.slug) {
      addRoute(
        `${SITE_URL}/category/${c.slug}`,
        c.updated_at ? new Date(c.updated_at) : new Date(),
        'weekly',
        0.8
      );
    }
  });

  // 3. Active Products (supports both /products/ and /product/ route aliases)
  products.forEach((p: { slug: string; updated_at?: string }) => {
    if (p.slug) {
      addRoute(
        `${SITE_URL}/products/${p.slug}`,
        p.updated_at ? new Date(p.updated_at) : new Date(),
        'daily',
        0.8
      );
      addRoute(
        `${SITE_URL}/product/${p.slug}`,
        p.updated_at ? new Date(p.updated_at) : new Date(),
        'daily',
        0.8
      );
    }
  });

  // 4. Published Articles & Guides
  articles.forEach((a: { slug: string; updated_at?: string }) => {
    if (a.slug) {
      addRoute(
        `${SITE_URL}/guides/${a.slug}`,
        a.updated_at ? new Date(a.updated_at) : new Date(),
        'weekly',
        0.7
      );
    }
  });

  // 5. Active Brands
  brands.forEach((b: { slug: string; updated_at?: string }) => {
    if (b.slug) {
      addRoute(
        `${SITE_URL}/brands/${b.slug}`,
        b.updated_at ? new Date(b.updated_at) : new Date(),
        'monthly',
        0.6
      );
    }
  });

  // 6. Active Collections
  collections.forEach((col: { slug: string; updated_at?: string }) => {
    if (col.slug) {
      addRoute(
        `${SITE_URL}/collections/${col.slug}`,
        col.updated_at ? new Date(col.updated_at) : new Date(),
        'weekly',
        0.7
      );
    }
  });

  return Array.from(sitemapMap.values());
}
