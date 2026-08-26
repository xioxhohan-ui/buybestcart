import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { createServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Terms of Service & Editorial Policies | Buy Best Cart',
  description: 'Terms of service and user agreements governing the use of Buy Best Cart website, editorial content, and affiliate shopping guides.',
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: 'Terms of Service & Editorial Policies | Buy Best Cart',
    description: 'Terms of service and user agreements governing the use of Buy Best Cart website and buying guides.',
    url: `${SITE_URL}/terms`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Buy Best Cart Terms of Use' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use | Buy Best Cart',
    description: 'Terms and conditions governing the use of Buy Best Cart website and buying guides.',
    images: [`${SITE_URL}/og-image.png`],
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
};

export default async function TermsOfUsePage() {
  const supabase = createServerClient();
  const { data: legalSettings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'legal_policies')
    .maybeSingle();

  const customTermsText = legalSettings?.value?.terms_text;

  const breadcrumbs = [
    { name: 'Terms of Use', url: '/terms' },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem', maxWidth: '840px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Terms of Use</h1>
        <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Last updated: August 2026. Please read these terms carefully before using Buy Best Cart.
        </p>
      </div>

      {customTermsText ? (
        <div
          className="cms-editorial-content"
          style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '2.5rem' }}
        >
          {customTermsText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Buy Best Cart (buybestcart.shop), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>2. Editorial Independence &amp; Affiliate Disclosure</h2>
            <p>
              Buy Best Cart is an independent product review and comparison resource. We participate in the Amazon Services LLC Associates Program. When you click outbound links on our site and make purchases on Amazon, we may earn an affiliate commission at no extra cost to you.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>3. Price &amp; Stock Disclaimer</h2>
            <p>
              Product prices, availability, and promotional discounts are synced periodically with Amazon and are subject to immediate merchant change. The price and availability displayed on Amazon at the time of purchase will apply.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>4. Intellectual Property</h2>
            <p>
              All editorial reviews, scoring matrices, comparison methodologies, and platform design are the intellectual property of Buy Best Cart. Product trademarks, logos, and images remain the property of their respective manufacturers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>5. Limitation of Liability</h2>
            <p>
              Buy Best Cart is provided on an &quot;as is&quot; basis without warranties of any kind. We do not sell products directly and bear no responsibility for order fulfillment, returns, or merchant disputes.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
