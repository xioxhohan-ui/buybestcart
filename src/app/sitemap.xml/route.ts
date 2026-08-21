import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buybestcart.shop';

interface UrlEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  imageUrl?: string;
  imageTitle?: string;
}

export async function GET() {
  try {
    const supabase = createServerClient();

    const fetchSafe = async <T>(queryPromise: PromiseLike<{ data: T[] | null }>): Promise<{ data: T[] | null }> => {
      try {
        return await queryPromise;
      } catch {
        return { data: null };
      }
    };

    // Fetch database items safely with strict status filters for public indexable content only
    const [productsRes, categoriesRes, articlesRes, comparisonsRes] = await Promise.all([
      fetchSafe(
        supabase
          .from('products')
          .select('slug, title, thumbnail_url, updated_at')
          .in('status', ['active', 'featured', 'published'])
      ),
      fetchSafe(
        supabase
          .from('categories')
          .select('slug, updated_at')
          .eq('is_active', true)
      ),
      fetchSafe(
        supabase
          .from('articles')
          .select('slug, updated_at, modified_date')
          .eq('status', 'published')
      ),
      fetchSafe(
        supabase
          .from('comparisons')
          .select('slug, updated_at')
          .eq('status', 'published')
      ),
    ]);

    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const articles = articlesRes.data || [];
    const comparisons = comparisonsRes.data || [];

    const urlMap = new Map<string, UrlEntry>();

    const addUrl = (
      urlPath: string,
      lastmodDate: string | Date | undefined,
      changefreq: string,
      priority: string,
      imageUrl?: string,
      imageTitle?: string
    ) => {
      if (!urlPath) return;

      // Ensure proper full URL with SITE_URL domain and no trailing slash (except root)
      let cleanPath = urlPath
        .replace(/^https?:\/\/[^\/]+/, '')
        .replace(/\/$/, '');

      if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
      }

      // STRICT SECURITY FILTER: Zero admin, private, internal, affiliate, or non-indexable routes
      if (
        cleanPath.startsWith('/shohan') ||
        cleanPath.startsWith('/admin') ||
        cleanPath.startsWith('/api') ||
        cleanPath.startsWith('/go') ||
        cleanPath.startsWith('/auth') ||
        cleanPath.startsWith('/search') ||
        cleanPath.includes('?')
      ) {
        return;
      }

      const loc = cleanPath === '/' ? SITE_URL : `${SITE_URL}${cleanPath}`;

      let isoDate: string;
      try {
        isoDate = lastmodDate ? new Date(lastmodDate).toISOString() : new Date().toISOString();
      } catch {
        isoDate = new Date().toISOString();
      }

      // Deduplicate: preserve first entry or update if richer data
      if (!urlMap.has(loc)) {
        urlMap.set(loc, {
          loc,
          lastmod: isoDate,
          changefreq,
          priority,
          imageUrl: imageUrl || undefined,
          imageTitle: imageTitle || undefined,
        });
      }
    };

    // 1. Static Core Public Landing Pages
    addUrl('/', new Date(), 'daily', '1.0');
    addUrl('/products', new Date(), 'daily', '0.9');
    addUrl('/category', new Date(), 'weekly', '0.8');
    addUrl('/deals', new Date(), 'hourly', '0.9');
    addUrl('/compare', new Date(), 'weekly', '0.8');
    addUrl('/guides', new Date(), 'daily', '0.8');
    addUrl('/how-we-rank', new Date(), 'monthly', '0.7');
    addUrl('/about', new Date(), 'monthly', '0.6');
    addUrl('/affiliate-disclosure', new Date(), 'monthly', '0.5');
    addUrl('/privacy-policy', new Date(), 'yearly', '0.4');
    addUrl('/terms', new Date(), 'yearly', '0.4');
    addUrl('/contact', new Date(), 'monthly', '0.5');

    // 2. Published Categories
    categories.forEach((c: { slug?: string; updated_at?: string }) => {
      if (c.slug) {
        addUrl(`/category/${c.slug}`, c.updated_at, 'weekly', '0.8');
      }
    });

    // 3. Published Catalog Products with Google Image SEO
    products.forEach((p: { slug?: string; title?: string; thumbnail_url?: string; updated_at?: string }) => {
      if (p.slug) {
        addUrl(
          `/products/${p.slug}`,
          p.updated_at,
          'daily',
          '0.9',
          p.thumbnail_url,
          p.title
        );
      }
    });

    // 4. Published Articles & Buying Guides
    articles.forEach((a: { slug?: string; updated_at?: string; modified_date?: string }) => {
      if (a.slug) {
        addUrl(`/guides/${a.slug}`, a.modified_date || a.updated_at, 'weekly', '0.8');
      }
    });

    // 5. Published Head-to-Head Comparisons
    comparisons.forEach((comp: { slug?: string; updated_at?: string }) => {
      if (comp.slug) {
        addUrl(`/compare/${comp.slug}`, comp.updated_at, 'weekly', '0.7');
      }
    });

    // Build Valid Google XML Content with Image Namespace
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const item of urlMap.values()) {
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
      xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
      xml += `    <priority>${item.priority}</priority>\n`;
      if (item.imageUrl) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(item.imageUrl)}</image:loc>\n`;
        if (item.imageTitle) {
          xml += `      <image:title>${escapeXml(item.imageTitle)}</image:title>\n`;
        }
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('Error generating sitemap XML:', err);

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/deals</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/compare</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
