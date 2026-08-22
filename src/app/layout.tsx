import type { Metadata } from 'next';
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothProvider from '@/components/animation/SmoothProvider';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { generateWebSiteJsonLd } from '@/lib/seo';
import { getSiteConfiguration } from '@/lib/settings';
import { Analytics } from '@vercel/analytics/react';

const fontSans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const fontSerif = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['600', '700', '800'],
  style: ['normal', 'italic'],
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfiguration();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buybestcart.shop';

  return {
    title: `${config.site_name} — ${config.tagline}`,
    description: config.brand_description || config.hero_description,
    metadataBase: new URL(siteUrl),
    keywords: [
      'buy best cart',
      'buybestcart',
      'best laptops for remote work',
      'work from home laptop 2026',
      'top laptops for productivity',
      'macbook air vs dell xps',
      'macbook air m3 review',
      'best laptop under 1500',
      'how to spot fake reviews',
      'verified product reviews',
      'unbiased tech reviews',
      'how does noise cancellation work',
      'active noise canceling headphones',
      'best anc headphones 2026',
      'sony xm5 vs bose qc45',
      'best noise canceling headphones comparison',
      'sony vs bose headphones',
      'gaming laptop under 2000',
      'best gaming laptop 2026',
      'asus rog zephyrus review',
      'amazon price history tracker',
      'how to find amazon deals',
      'best time to buy electronics on amazon',
      'best headphones for office workers',
      'noise canceling headphones for work',
      'office headphones 2026',
      'gaming pc vs laptop performance',
      'amazon affiliate reviews',
      'tech reviews 2026',
      'buying guides'
    ],
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
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontDisplay.variable}`}>
      <head>
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
        <CurrencyProvider>
          <SmoothProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </SmoothProvider>
          <Analytics />
        </CurrencyProvider>
      </body>
    </html>
  );
}
