import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Use | Buy Best Cart',
  description: 'Terms and conditions governing the use of Buy Best Cart website, editorial content, and affiliate shopping guides.',
};

export default function TermsOfUsePage() {
  const breadcrumbs = [
    { name: 'Terms of Use', url: '/terms' },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem', maxWidth: '840px' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Terms of Use</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Last updated: August 20, 2026. Please read these terms carefully before using Buy Best Cart.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Buy Best Cart website (<a href="https://buybestcart.shop" style={{ color: 'var(--accent-primary)' }}>buybestcart.shop</a>), you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>2. Editorial Independence & Disclaimers</h2>
          <p>
            Buy Best Cart is an independent editorial publication providing product reviews, comparisons, and purchasing recommendations. All product information, specifications, and prices displayed are subject to change without notice on third-party merchant sites.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Buy Best Cart does not sell products directly and is not responsible for product manufacturing, warranties, shipping, or merchant return policies. Transactions are completed directly on merchant storefronts (such as Amazon).
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>3. Intellectual Property</h2>
          <p>
            All original text, editorial analysis, lab scoring algorithms, site design, and code on Buy Best Cart are the proprietary intellectual property of Buy Best Cart.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Product names, logos, trademarks, and registered trademarks displayed on this website are the property of their respective owners (including Apple, Sony, Bose, Samsung, Amazon, and others). Their display does not imply endorsement or affiliation.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>4. Limitation of Liability</h2>
          <p>
            In no event shall Buy Best Cart, its editors, or its operators be liable for any damages arising out of the use or inability to use the materials on Buy Best Cart, including errors in price tracking or external merchant stock availability.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.35rem' }}>5. Contact Information</h2>
          <p>
            If you have questions regarding these terms, contact our legal and editorial department at <a href="mailto:editorial@buybestcart.shop" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>editorial@buybestcart.shop</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
