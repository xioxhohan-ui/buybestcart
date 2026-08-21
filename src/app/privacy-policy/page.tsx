import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy | Buy Best Cart',
  description: 'Our privacy policy explains how Buy Best Cart collects, uses, and protects your information.',
};

export default function PrivacyPolicyPage() {
  const breadcrumbs = [
    { name: 'Privacy Policy', url: '/privacy-policy' },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem', maxWidth: '840px' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Last updated: August 20, 2026. Your privacy and data transparency are paramount to us.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>1. Information We Collect</h2>
          <p>
            Buy Best Cart is an independent editorial review and product ranking publication. We do not require account registration to read our reviews, comparisons, or buying guides. We do not collect or store sensitive financial details, payment card numbers, or personal billing addresses.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            We collect anonymous usage data such as page views, referral sources, browser types, and interaction telemetry to monitor website performance and improve user experience.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>2. Cookies & Affiliate Tracking</h2>
          <p>
            We use essential cookies to maintain regional marketplace selections (e.g. United States, United Kingdom, Canada) and anonymous analytics identifiers.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            When you click an outbound link to merchant partners (including Amazon.com and affiliated international storefronts), merchant cookies may be placed on your device to attribute referral sales in compliance with the Amazon Associates Program Operating Agreement.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>3. How We Use Information</h2>
          <p>
            Information collected is used solely to:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Deliver and maintain fast, reliable access to product reviews and guides.</li>
            <li>Analyze content engagement to guide editorial testing priorities.</li>
            <li>Prevent automated bot scraping, malicious attacks, and security vulnerabilities.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>4. Third-Party Services & Links</h2>
          <p>
            Buy Best Cart contains links to third-party retail merchants and service providers. We are not responsible for the privacy practices, policies, or content of external websites. We encourage you to review the privacy policies of any merchant website you visit.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>5. Contact & Data Inquiries</h2>
          <p>
            For questions regarding this Privacy Policy or your data rights, please contact our editorial and compliance team at <a href="mailto:privacy@buybestcart.shop" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>privacy@buybestcart.shop</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
