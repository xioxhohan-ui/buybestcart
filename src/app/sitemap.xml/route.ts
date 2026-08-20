import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = 'https://buybestcart.shop';

export async function GET() {
  try {
    const supabase = createServerClient();

    const fetchSafe = async <T,>(queryPromise: PromiseLike<{ data: T[] | null }>): Promise<{ data: T[] | null }> => {
      try {
        return await queryPromise;
      } catch {
        return { data: null };
      }
    };

    // Fetch database items safely with timeouts/fallbacks
    const [productsRes, categoriesRes, articlesRes, brandsRes] = await Promise.all([
      fetchSafe(supabase.from('products').select('slug, updated_at').in('status', ['active', 'featured'])),
      fetchSafe(supabase.from('categories').select('slug, updated_at').eq('is_active', true)),
      fetchSafe(supabase.from('articles').select('slug, updated_at').eq('status', 'published')),
      fetchSafe(supabase.from('brands').select('slug, updated_at').eq('is_active', true)),
    ]);

    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const articles = articlesRes.data || [];
    const brands = brandsRes.data || [];

    const urlMap = new Map<string, { loc: string; lastmod: string; changefreq: string; priority: string }>();

    const addUrl = (url: string, lastmodDate: string | Date | undefined, changefreq: string, priority: string) => {
      const cleanUrl = url.replace(/https?:\/\/(www\.)?bestbuycart\.com/g, SITE_URL).replace(/\/$/, '');
      const loc = cleanUrl || SITE_URL;

      let isoDate: string;
      try {
        isoDate = lastmodDate ? new Date(lastmodDate).toISOString() : new Date().toISOString();
      } catch {
        isoDate = new Date().toISOString();
      }

      if (!urlMap.has(loc)) {
        urlMap.set(loc, {
          loc,
          lastmod: isoDate,
          changefreq,
          priority,
        });
      }
    };

    // 1. Static Pages
    addUrl(`${SITE_URL}`, new Date(), 'daily', '1.0');
    addUrl(`${SITE_URL}/deals`, new Date(), 'hourly', '0.9');
    addUrl(`${SITE_URL}/compare`, new Date(), 'weekly', '0.8');
    addUrl(`${SITE_URL}/guides`, new Date(), 'daily', '0.8');
    addUrl(`${SITE_URL}/how-we-rank`, new Date(), 'monthly', '0.7');
    addUrl(`${SITE_URL}/about`, new Date(), 'monthly', '0.6');
    addUrl(`${SITE_URL}/affiliate-disclosure`, new Date(), 'monthly', '0.5');
    addUrl(`${SITE_URL}/contact`, new Date(), 'monthly', '0.5');
    addUrl(`${SITE_URL}/search`, new Date(), 'weekly', '0.5');

    // 2. Categories
    categories.forEach((c: { slug?: string; updated_at?: string }) => {
      if (c.slug) {
        addUrl(`${SITE_URL}/category/${c.slug}`, c.updated_at, 'weekly', '0.8');
      }
    });

    // 3. Products
    products.forEach((p: { slug?: string; updated_at?: string }) => {
      if (p.slug) {
        addUrl(`${SITE_URL}/products/${p.slug}`, p.updated_at, 'daily', '0.8');
      }
    });

    // 4. Articles
    articles.forEach((a: { slug?: string; updated_at?: string }) => {
      if (a.slug) {
        addUrl(`${SITE_URL}/guides/${a.slug}`, a.updated_at, 'weekly', '0.7');
      }
    });

    // 5. Brands
    brands.forEach((b: { slug?: string; updated_at?: string }) => {
      if (b.slug) {
        addUrl(`${SITE_URL}/brands/${b.slug}`, b.updated_at, 'monthly', '0.6');
      }
    });

    // Build XML Content
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const item of urlMap.values()) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
      xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xml += `    <priority>${item.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Error generating sitemap XML:', err);

    // Fallback XML in case of unexpected exception (NEVER RETURN HTML)
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/deals</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/guides</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
