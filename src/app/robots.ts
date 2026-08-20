import { MetadataRoute } from 'next';

const SITE_URL = 'https://buybestcart.shop';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/shohan/',
        '/shohan/*',
        '/api/',
        '/api/*',
        '/go/',
        '/go/*',
        '/search',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
