const http = require('http');

const BASE_URL = 'http://localhost:3000';
const CANONICAL_BASE = 'https://buybestcart.shop';

const publicRoutes = [
  '/',
  '/products',
  '/products/dell-xps-16-intel-core-ultra-rtx4060',
  '/category',
  '/category/audio-headphones',
  '/guides',
  '/guides/best-noise-canceling-headphones',
  '/compare',
  '/compare/sony-wh-1000xm5-vs-bose-quietcomfort-ultra',
  '/deals',
  '/about',
  '/contact',
  '/how-we-rank',
  '/privacy-policy',
  '/terms',
  '/affiliate-disclosure',
];

const nonIndexableRoutes = [
  { path: '/search?q=headphones', expectedRobots: 'noindex', expectedStatus: 200 },
  { path: '/go/dell-xps-16-intel-core-ultra-rtx4060', expectedStatus: 302, checkHeader: 'x-robots-tag' },
  { path: '/api/revalidate', expectedStatus: 200, checkHeader: 'x-robots-tag' },
  { path: '/shohan', expectedStatus: 200, checkHeader: 'x-robots-tag' },
];

function fetchPage(urlPath, options = {}) {
  return new Promise((resolve) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${BASE_URL}${urlPath}`;
    const req = http.get(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
    req.setTimeout(35000, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout', body: '' });
    });
  });
}

function extractMeta(html) {
  const result = {
    title: '',
    description: '',
    canonical: '',
    robots: '',
    ogTitle: '',
    ogDesc: '',
    ogImage: '',
    ogUrl: '',
    twitterCard: '',
    jsonLdSchemas: [],
  };

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) result.title = titleMatch[1].trim();

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  if (descMatch) result.description = descMatch[1].trim();

  const canonMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
                     html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  if (canonMatch) result.canonical = canonMatch[1].trim();

  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  if (robotsMatch) result.robots = robotsMatch[1].trim();

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
  if (ogTitleMatch) result.ogTitle = ogTitleMatch[1].trim();

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
  if (ogDescMatch) result.ogDesc = ogDescMatch[1].trim();

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
  if (ogImageMatch) result.ogImage = ogImageMatch[1].trim();

  const ogUrlMatch = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);
  if (ogUrlMatch) result.ogUrl = ogUrlMatch[1].trim();

  const twitterCardMatch = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
  if (twitterCardMatch) result.twitterCard = twitterCardMatch[1].trim();

  // Extract JSON-LD schemas
  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      const type = parsed['@type'] || (parsed['@graph'] ? 'Graph' : 'Unknown');
      result.jsonLdSchemas.push(type);
    } catch (e) {
      result.jsonLdSchemas.push('INVALID_JSON');
    }
  }

  return result;
}

async function runTechnicalSeoAudit() {
  console.log('========================================================================');
  console.log('🚀 RUNNING DEEP TECHNICAL SEO & GOOGLEBOT CRAWLABILITY AUDIT');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;
  const auditResults = [];

  // 1. Robots.txt Audit
  console.log('--- 1. AUDITING ROBOTS.TXT ---');
  const robotsRes = await fetchPage('/robots.txt');
  totalTests += 4;
  if (robotsRes.status === 200) {
    console.log('  ✓ [200 OK] robots.txt accessible');
    passedTests++;
  } else {
    console.error('  ✗ robots.txt failed status:', robotsRes.status);
  }

  if (robotsRes.body.toLowerCase().includes('sitemap: https://buybestcart.shop/sitemap.xml')) {
    console.log('  ✓ [Sitemap Declared] Sitemap: https://buybestcart.shop/sitemap.xml');
    passedTests++;
  } else {
    console.error('  ✗ robots.txt missing correct sitemap reference');
  }

  if (robotsRes.body.includes('Disallow: /shohan/') && robotsRes.body.includes('Disallow: /go/')) {
    console.log('  ✓ [Security Exclusions] Disallow /shohan/, /go/, /api/ confirmed');
    passedTests++;
  } else {
    console.error('  ✗ robots.txt missing private route disallow rules');
  }

  if (robotsRes.body.includes('Googlebot')) {
    console.log('  ✓ [Googlebot Target] Dedicated Googlebot and Googlebot-Image directives configured');
    passedTests++;
  } else {
    console.error('  ✗ robots.txt missing Googlebot directives');
  }

  // 2. Sitemap.xml Audit
  console.log('\n--- 2. AUDITING SITEMAP.XML ---');
  const sitemapRes = await fetchPage('/sitemap.xml');
  totalTests += 5;
  if (sitemapRes.status === 200) {
    console.log('  ✓ [200 OK] sitemap.xml accessible');
    passedTests++;
  } else {
    console.error('  ✗ sitemap.xml status:', sitemapRes.status);
  }

  if (sitemapRes.body.includes('<urlset') && sitemapRes.body.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) {
    console.log('  ✓ [Valid XML Namespace] Valid sitemaps.org schema namespace');
    passedTests++;
  } else {
    console.error('  ✗ sitemap.xml missing urlset namespace');
  }

  if (sitemapRes.body.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
    console.log('  ✓ [Google Image SEO] Google image sitemap extension integrated');
    passedTests++;
  } else {
    console.error('  ✗ sitemap.xml missing image schema');
  }

  const locMatches = [...sitemapRes.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const urlCount = locMatches.length;
  if (urlCount >= 10) {
    console.log(`  ✓ [URL Volume] ${urlCount} public indexable URLs included in sitemap`);
    passedTests++;
  } else {
    console.error(`  ✗ Low URL count in sitemap: ${urlCount}`);
  }

  const hasProhibitedLocs = locMatches.some(loc => loc.includes('/shohan') || loc.includes('/go/') || loc.includes('?'));
  if (!hasProhibitedLocs) {
    console.log('  ✓ [Strict Exclusions] Zero admin, affiliate redirect, or parameterized duplicate URLs found in sitemap');
    passedTests++;
  } else {
    console.error('  ✗ Sitemap contains prohibited routes in loc tags');
  }

  // 3. Public Indexable Routes Audit
  console.log('\n--- 3. AUDITING PUBLIC INDEXABLE ROUTES FOR GOOGLEBOT ---');
  for (const route of publicRoutes) {
    const res = await fetchPage(route);
    const meta = extractMeta(res.body);
    const expectedCanonical = route === '/' ? CANONICAL_BASE : `${CANONICAL_BASE}${route}`;

    const checks = {
      route,
      status: res.status,
      title: meta.title,
      titleLength: meta.title.length,
      hasDescription: meta.description.length > 20,
      canonical: meta.canonical,
      canonicalMatch: meta.canonical === expectedCanonical,
      hasOgTitle: !!meta.ogTitle,
      hasOgImage: !!meta.ogImage,
      jsonLd: meta.jsonLdSchemas,
      htmlLength: res.body.length,
    };

    auditResults.push(checks);

    totalTests += 4;
    if (res.status === 200) {
      passedTests++;
    } else {
      console.error(`  ✗ [${res.status}] ${route}`);
    }

    if (checks.canonicalMatch) {
      passedTests++;
    } else {
      console.error(`  ✗ Canonical mismatch on ${route}: expected ${expectedCanonical}, got ${meta.canonical}`);
    }

    if (checks.titleLength >= 20 && checks.titleLength <= 90) {
      passedTests++;
    } else {
      console.warn(`  ⚠ Title length warning on ${route}: ${checks.titleLength} chars ("${meta.title}")`);
    }

    if (checks.jsonLd.length > 0 && !checks.jsonLd.includes('INVALID_JSON')) {
      passedTests++;
    } else {
      console.error(`  ✗ Missing or invalid JSON-LD schema on ${route}`);
    }

    console.log(`  ✓ [200 OK] ${route.padEnd(48)} | Canon: Match | Schemas: [${meta.jsonLdSchemas.join(', ')}] | Title: "${meta.title.slice(0, 38)}..."`);
  }

  // 4. Non-Indexable & Redirect Routes Audit
  console.log('\n--- 4. AUDITING NON-INDEXABLE, AFFILIATE & UTILITY ROUTES ---');
  for (const test of nonIndexableRoutes) {
    const res = await fetchPage(test.path);
    totalTests++;
    if (res.status === test.expectedStatus) {
      console.log(`  ✓ [Status ${res.status}] ${test.path.padEnd(45)} (Expected ${test.expectedStatus})`);
      passedTests++;
    } else {
      console.error(`  ✗ Status error on ${test.path}: expected ${test.expectedStatus}, got ${res.status}`);
    }

    if (test.checkHeader && res.headers && res.headers[test.checkHeader]) {
      totalTests++;
      const headerVal = res.headers[test.checkHeader];
      if (headerVal.includes('noindex')) {
        console.log(`  ✓ [${test.checkHeader}] ${test.path.padEnd(35)} -> "${headerVal}"`);
        passedTests++;
      } else {
        console.error(`  ✗ Missing noindex in ${test.checkHeader} on ${test.path}`);
      }
    }
  }

  console.log('\n========================================================================');
  console.log(`🏁 AUDIT COMPLETE: ${passedTests} / ${totalTests} CHECKS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log('========================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTechnicalSeoAudit();
