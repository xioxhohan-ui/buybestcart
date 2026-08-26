import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { createServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Protection | Buy Best Cart',
  description: 'Our privacy policy explains how Buy Best Cart collects, protects, and handles your data when browsing product reviews and buying guides.',
  alternates: {
    canonical: `${SITE_URL}/privacy-policy`,
  },
  openGraph: {
    title: 'Privacy Policy & Data Protection | Buy Best Cart',
    description: 'Our privacy policy explains how Buy Best Cart collects, protects, and handles your data.',
    url: `${SITE_URL}/privacy-policy`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Buy Best Cart Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Buy Best Cart',
    description: 'Our privacy policy explains how Buy Best Cart collects, uses, and protects your information.',
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

export default async function PrivacyPolicyPage() {
  const supabase = createServerClient();
  const { data: legalSettings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'legal_policies')
    .maybeSingle();

  const customPrivacyText = legalSettings?.value?.privacy_policy_text;

  const breadcrumbs = [
    { name: 'Privacy Policy', url: '/privacy-policy' },
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
        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Last updated: August 2026. Your privacy and data transparency are paramount to us.
        </p>
      </div>

      {customPrivacyText ? (
        <div
          className="cms-editorial-content"
          style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '2.5rem' }}
        >
          {customPrivacyText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>1. Information We Collect</h2>
            <p>
              Buy Best Cart is an informational discovery and comparison website. We do not require account creation to browse our buying guides, rankings, or price matrix tables. We collect standard server telemetry (anonymized IP addresses, browser user agents, and referral paths) to ensure platform security, prevent bot abuse, and monitor website performance.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>2. Cookies &amp; Tracking Technologies</h2>
            <p>
              We use functional session cookies to remember your preferred currency display and theme preferences. Third-party services, such as Amazon Associates and analytical counters, may place cookies on your browser when you interact with external shopping links to record qualified affiliate referral actions.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>3. How We Use Information</h2>
            <p>
              Any feedback or contact messages submitted through our contact portal are used solely to investigate editorial corrections or respond to inquiries. We never sell, rent, or trade your personal contact details to third-party marketers.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>4. External Merchant Links</h2>
            <p>
              Our website contains outbound links to Amazon marketplaces. When you leave Buy Best Cart, the privacy policies of the destination merchant govern your transaction and data processing.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>5. Contact Information</h2>
            <p>
              If you have questions about this privacy statement, please contact us at <a href="mailto:privacy@buybestcart.shop" style={{ color: 'var(--green-accent)' }}>privacy@buybestcart.shop</a>.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
