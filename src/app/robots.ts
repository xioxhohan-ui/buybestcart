import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/go/',
          '/go/*',
          '/search',
          '/shohan/',
          '/admin/',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/go/',
          '/go/*',
          '/search',
          '/shohan/',
          '/admin/',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/go/',
          '/go/*',
          '/search',
          '/shohan/',
          '/admin/',
          '/*?*sort=',
          '/*?*filter=',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/*.png$', '/*.jpg$', '/*.webp$', '/*.svg$', '/_next/image*'],
        disallow: ['/shohan/', '/admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
