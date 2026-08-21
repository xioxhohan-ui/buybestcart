import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothProvider from '@/components/animation/SmoothProvider';
import { generateWebSiteJsonLd } from '@/lib/seo';
import { getSiteConfiguration } from '@/lib/settings';
import { Analytics } from '@vercel/analytics/react';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfiguration();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buybestcart.shop';

  return {
    title: `${config.site_name} — ${config.tagline}`,
    description: config.brand_description || config.hero_description,
    metadataBase: new URL(siteUrl),
    keywords: ['buy best cart', 'buybestcart', 'best buy cart', 'amazon affiliate reviews', 'tech reviews 2026', 'buying guides', 'top rated tech', 'flagship comparisons'],
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: `${config.site_name} — ${config.tagline}`,
      description: config.brand_description || config.hero_description,
      url: siteUrl,
      siteName: config.site_name,
      type: 'website',
      images: [
        {
          url: config.og_default_image || `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${config.site_name} — ${config.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.site_name} — ${config.tagline}`,
      description: config.brand_description || config.hero_description,
      images: [config.default_social_image || `${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'VGCKTw_xZGWQqX0N2aH6sH0raK0U5G5OOm3TV7Ja9t8',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfiguration();
  const jsonLd = generateWebSiteJsonLd();

  // Dynamic CSS variables from Supabase theme tokens
  const dynamicCss = `
    :root {
      --primary: ${config.primary_color};
      --text-primary: ${config.text_color};
      --text-secondary: ${config.secondary_color};
      --text-muted: ${config.muted_text_color};
      --green-accent: ${config.accent_color};
      --bg-main: ${config.background_color};
      --bg-surface: ${config.surface_color};
      --border: ${config.border_color};
      --radius: ${config.button_radius};
      --radius-md: ${config.card_radius};
      --font-weight-heading: ${config.heading_weight};
      --font-weight-body: ${config.body_weight};
    }
  `;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  window.addEventListener('load', () => {
                    const docEl = document.documentElement;
                    if (docEl.scrollWidth > docEl.clientWidth) {
                      console.warn('[Overflow Check] Horizontal overflow detected: scrollWidth (' + docEl.scrollWidth + ') > clientWidth (' + docEl.clientWidth + ')');
                    }
                  });
                }
              `,
            }}
          />
        )}
      </head>
      <body>
        <SmoothProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </SmoothProvider>
        <Analytics />
      </body>
    </html>
  );
}
