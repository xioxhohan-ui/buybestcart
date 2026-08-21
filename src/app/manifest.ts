import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Best Buy Cart — Tech & Lifestyle Shopping Magazine',
    short_name: 'Best Buy Cart',
    description: 'Independent product review, comparison, and verified Amazon deals publication.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#16a34a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
