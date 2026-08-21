import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Best Buy Cart — Tech & Lifestyle Shopping Magazine',
    short_name: 'Best Buy Cart',
    description: 'Independent product review, comparison, and verified Amazon deals publication.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF9F5',
    theme_color: '#1b4332',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
