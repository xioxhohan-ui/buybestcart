import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Buy Best Cart — Tech & Lifestyle Shopping Magazine',
    short_name: 'Buy Best Cart',
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
