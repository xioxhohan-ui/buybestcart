import { createServerClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/constants';
import { CANONICAL_BASE_URL, cleanPath, getCanonicalUrl } from '@/lib/canonical';
import { validateIndexableUrl } from '@/lib/urls';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  imageUrl?: string;
  imageTitle?: string;
}

const CANONICAL_BASE = CANONICAL_BASE_URL;

// Maximum URLs per XML file according to Google Sitemap Protocol specification (limit 50,000)
const MAX_URLS_PER_SITEMAP = 45000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('p');
    const pageIndex = pageParam ? parseInt(pageParam, 10) : 0;

    const supabase = createServerClient();

    const fetchSafe = async <T>(queryPromise: PromiseLike<{ data: T[] | null }>): Promise<{ data: T[] | null }> => {
      try {
        return await queryPromise;
      } catch {
        return { data: null };
      }
    };

    // Parallel fetch from database with strict public status filters
    const [productsRes, categoriesRes, articlesRes, comparisonsRes, collectionsRes, redirectsRes] = await Promise.all([
      fetchSafe(
        supabase
          .from('products')
          .select('slug, title, thumbnail_url, updated_at, created_at')
          .in('status', ['active', 'featured', 'published'])
          .order('updated_at', { ascending: false })
      ),
      fetchSafe(
        supabase
          .from('categories')
          .select('slug, name, image_url, updated_at, created_at')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
      ),
      fetchSafe(
        supabase
          .from('articles')
          .select('slug, title, featured_image, og_image, updated_at, modified_date, published_at, created_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
      ),
      fetchSafe(
        supabase
          .from('comparisons')
          .select('slug, title, updated_at, created_at')
          .eq('status', 'published')
          .order('updated_at', { ascending: false })
      ),
      fetchSafe(
        supabase
          .from('collections')
          .select('slug, title, image_url, updated_at, created_at')
          .order('created_at', { ascending: false })
      ),
      fetchSafe(
        supabase
          .from('redirects')
          .select('source_path')
          .eq('is_active', true)
      ),
    ]);

    const products = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const articles = articlesRes.data || [];
    const comparisons = comparisonsRes.data || [];
    const collections = collectionsRes.data || [];
    const redirects = redirectsRes.data || [];

    const activeRedirectSources = new Set(
      redirects.map((r: any) => cleanPath(r.source_path || ''))
    );

    const urlMap = new Map<string, SitemapUrlEntry>();

    const addUrl = (
      urlPath: string,
      lastmodDate: string | Date | undefined,
      changefreq: SitemapUrlEntry['changefreq'],
      priority: string,
      imageUrl?: string,
      imageTitle?: string
    ) => {
      if (!urlPath) return;

      // Ensure proper full URL with canonical domain and no trailing slash (except root '/')
      let cPath = cleanPath(urlPath);

      // STRICT SECURITY & ACCURACY FILTERS:
      // 1. Never include admin, private, internal, affiliate redirect, or query routes
      if (
        cPath.startsWith('/shohan') ||
        cPath.startsWith('/admin') ||
        cPath.startsWith('/api') ||
        cPath.startsWith('/go') ||
        cPath.startsWith('/auth') ||
        cPath.startsWith('/search')
      ) {
        return;
      }

      // 2. Never include old slugs or paths that are active 301 redirects
      if (activeRedirectSources.has(cPath)) {
        return;
      }

      const loc = cPath === '/' ? CANONICAL_BASE : `${CANONICAL_BASE}${cPath}`;

      // 3. Strict validation: Never include hash URLs, query duplicates, or malformed URLs
      const validation = validateIndexableUrl(loc);
      if (!validation.isIndexable) {
        return;
      }

      let isoDate: string;
      try {
        if (lastmodDate) {
          const parsed = new Date(lastmodDate);
          isoDate = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
        } else {
          isoDate = new Date().toISOString();
        }
      } catch {
        isoDate = new Date().toISOString();
      }

      // Deduplicate: preserve canonical entry
      if (!urlMap.has(loc)) {
        urlMap.set(loc, {
          loc,
          lastmod: isoDate,
          changefreq,
          priority,
          imageUrl: imageUrl && /^https?:\/\/.+/i.test(imageUrl) ? imageUrl : undefined,
          imageTitle: imageTitle ? imageTitle.trim() : undefined,
        });
      }
    };

    // 1. Static Core Public Pages
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

    // 2. Active Categories
    categories.forEach((cat: { slug?: string; name?: string; image_url?: string; updated_at?: string; created_at?: string }) => {
      if (cat.slug) {
        addUrl(
          `/category/${cat.slug}`,
          cat.updated_at || cat.created_at,
          'weekly',
          '0.8',
          cat.image_url,
          cat.name ? `Best ${cat.name} Recommendations` : undefined
        );
      }
    });

    // 3. Published Catalog Products with Google Image SEO Metadata
    products.forEach((prod: { slug?: string; title?: string; thumbnail_url?: string; updated_at?: string; created_at?: string }) => {
      if (prod.slug) {
        addUrl(
          `/products/${prod.slug}`,
          prod.updated_at || prod.created_at,
          'daily',
          '0.9',
          prod.thumbnail_url,
          prod.title
        );
      }
    });

    // 4. Published Articles & Buying Guides (Strictly published only)
    articles.forEach((art: { slug?: string; title?: string; featured_image?: string; og_image?: string; updated_at?: string; modified_date?: string; published_at?: string; created_at?: string }) => {
      if (art.slug) {
        addUrl(
          `/guides/${art.slug}`,
          art.modified_date || art.updated_at || art.published_at || art.created_at,
          'weekly',
          '0.85',
          art.featured_image || art.og_image,
          art.title
        );
      }
    });

    // 5. Published Head-to-Head Comparisons
    comparisons.forEach((comp: { slug?: string; title?: string; updated_at?: string; created_at?: string }) => {
      if (comp.slug) {
        addUrl(
          `/compare/${comp.slug}`,
          comp.updated_at || comp.created_at,
          'weekly',
          '0.7',
          undefined,
          comp.title
        );
      }
    });

    // 6. Curated Collections
    collections.forEach((col: { slug?: string; title?: string; image_url?: string; updated_at?: string; created_at?: string }) => {
      if (col.slug) {
        addUrl(
          `/collections/${col.slug}`,
          col.updated_at || col.created_at,
          'weekly',
          '0.75',
          col.image_url,
          col.title
        );
      }
    });

    const allEntries = Array.from(urlMap.values());

    // Check if sitemap requires index partitioning (Google threshold: > 45,000 URLs)
    if (allEntries.length > MAX_URLS_PER_SITEMAP && !pageParam) {
      const totalParts = Math.ceil(allEntries.length / MAX_URLS_PER_SITEMAP);
      let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      indexXml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (let i = 0; i < totalParts; i++) {
        indexXml += `  <sitemap>\n`;
        indexXml += `    <loc>${CANONICAL_BASE}/sitemap.xml?p=${i + 1}</loc>\n`;
        indexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
        indexXml += `  </sitemap>\n`;
      }

      indexXml += `</sitemapindex>`;

      return new Response(indexXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    const entriesToRender = pageIndex > 0
      ? allEntries.slice((pageIndex - 1) * MAX_URLS_PER_SITEMAP, pageIndex * MAX_URLS_PER_SITEMAP)
      : allEntries;

    // Build Valid Google XML Content with Image Namespace
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const item of entriesToRender) {
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
        'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    console.error('Error generating sitemap XML:', err);

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CANONICAL_BASE}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/deals</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/compare</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/guides</loc>
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
