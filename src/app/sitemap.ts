import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buybestcart.shop';

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

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/deals`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/how-we-rank`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/affiliate-disclosure`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p: { slug: string; updated_at?: string }) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c: { slug: string; updated_at?: string }) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a: { slug: string; updated_at?: string }) => ({
    url: `${SITE_URL}/guides/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b: { slug: string; updated_at?: string }) => ({
    url: `${SITE_URL}/brands/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((col: { slug: string; updated_at?: string }) => ({
    url: `${SITE_URL}/collections/${col.slug}`,
    lastModified: col.updated_at ? new Date(col.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...articleRoutes,
    ...brandRoutes,
    ...collectionRoutes,
  ];
}
