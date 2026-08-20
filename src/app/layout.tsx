import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothProvider from '@/components/animation/SmoothProvider';
import { generateWebSiteJsonLd } from '@/lib/seo';
import { getSiteConfiguration } from '@/lib/settings';
import { Analytics } from '@vercel/analytics/next';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfiguration();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bestbuycart.com';

  return {
    title: `${config.site_name} — ${config.tagline}`,
    description: config.brand_description || config.hero_description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: `${config.site_name} — ${config.tagline}`,
      description: config.brand_description || config.hero_description,
      url: siteUrl,
      siteName: config.site_name,
      type: 'website',
      images: config.og_default_image ? [{ url: config.og_default_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.site_name} — ${config.tagline}`,
      description: config.brand_description || config.hero_description,
      images: config.default_social_image ? [config.default_social_image] : [],
    },
    robots: {
      index: true,
      follow: true,
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
