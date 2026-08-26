import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ContactForm from '@/components/contact/ContactForm';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Buy Best Cart — Editorial Feedback & Inquiries',
  description: 'Have a product question, editorial correction, or partnership inquiry? Contact the Buy Best Cart testing and review team directly.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact Buy Best Cart — Editorial Feedback & Inquiries',
    description: 'Have a product question, editorial correction, or partnership inquiry? Reach out to our team.',
    url: `${SITE_URL}/contact`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Contact Buy Best Cart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Buy Best Cart — Editorial Feedback & Inquiries',
    description: 'Have a product question, editorial correction, or partnership inquiry? Reach out to our team.',
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

export default function ContactPage() {
  const breadcrumbs = [{ name: 'Contact', url: '/contact' }];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem', maxWidth: '680px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Contact Buy Best Cart</h1>
        <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)' }}>
          Have a product question, editorial correction, or partnership inquiry? Reach out to our team.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
