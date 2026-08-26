import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Buy Best Cart — Curated Reviews & Verified Amazon Deals',
    short_name: 'Buy Best Cart',
    description: 'Independent consumer technology evaluation, laboratory benchmarks, and verified Amazon deals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#10B981',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
