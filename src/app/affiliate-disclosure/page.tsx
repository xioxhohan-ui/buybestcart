import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { getSiteConfiguration } from '@/lib/settings';
import { ShieldCheck, ExternalLink, HelpCircle, CheckCircle2, Lock, FileText, Info } from 'lucide-react';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Affiliate Disclosure & Transparency Policy | Buy Best Cart',
  description:
    'Full disclosure regarding Buy Best Cart participation in the Amazon Associates Program, reader trust, and zero-cost affiliate commissions.',
  alternates: {
    canonical: `${SITE_URL}/affiliate-disclosure`,
  },
  openGraph: {
    title: 'Affiliate Disclosure & Transparency Policy | Buy Best Cart',
    description:
      'Full disclosure regarding Buy Best Cart participation in the Amazon Associates Program, reader trust, and zero-cost affiliate commissions.',
    url: `${SITE_URL}/affiliate-disclosure`,
    siteName: 'Buy Best Cart',
    type: 'website',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Buy Best Cart Affiliate Disclosure' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amazon Associates Affiliate Disclosure | Buy Best Cart',
    description: 'Our commitment to editorial transparency, Amazon Associates program compliance, and reader trust.',
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

export default async function AffiliateDisclosurePage() {
  const config = await getSiteConfiguration();
  const breadcrumbs = [
    { name: 'Amazon Affiliate Disclosure', url: '/affiliate-disclosure' },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '860px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--green-light)',
            border: '1px solid var(--green-border)',
            color: 'var(--green-deep)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          <ShieldCheck size={13} />
          <span>Editorial Transparency &amp; Compliance</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Amazon Affiliate Disclosure &amp; Policy
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          In full accordance with Federal Trade Commission (FTC) guidelines, global advertising standards, and the official Amazon Associates Program Operating Agreement.
        </p>
      </header>

      {/* Mandatory Associates Statement Callout Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
          color: '#FAF9F5',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '3rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid #44403C',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green-gold)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={14} />
          <span>Mandatory Amazon Associates Identification</span>
        </div>
        <p style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.5, margin: '0 0 1rem 0', fontFamily: 'var(--font-serif)', color: '#FFFFFF' }}>
          &ldquo;{config.amazon_associate_statement || 'As an Amazon Associate I earn from qualifying purchases.'}&rdquo;
        </p>
        <p style={{ fontSize: '0.875rem', color: '#D6D3D1', lineHeight: 1.6, margin: 0 }}>
          {config.site_name} participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for independent publications to earn advertising fees by linking to official Amazon storefronts globally.
        </p>
      </div>

      {/* Structured Policy Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-primary)' }}>
        
        {/* Section 1: What Are Affiliate Links & How They Work */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--green-accent)" />
            <span>1. What Are Affiliate Links &amp; How They Work</span>
          </h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            Throughout our articles, buying guides, product reviews, comparison showdowns, and deal roundups, you will find outbound buttons and text links labeled <strong>“Check Price on Amazon”</strong>, <strong>“View on Amazon”</strong>, or <strong>“Claim Amazon Deal”</strong>.
          </p>
          <p style={{ margin: 0 }}>
            These are customized affiliate tracking links. When you click one of these links and navigate to Amazon to complete a qualifying purchase within the designated cookie window, Amazon pays <strong>{config.site_name}</strong> a referral commission.
          </p>
        </section>

        {/* Section 2: Zero Cost to You as a Reader */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="var(--green-accent)" />
            <span>2. Zero Added Cost to You ($0 Extra)</span>
          </h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            <strong>Clicking an affiliate link never increases the price you pay.</strong>
          </p>
          <p style={{ margin: 0 }}>
            The retail price, available coupons, Prime shipping benefits, promotional discounts, and payment terms on Amazon remain identical regardless of whether you access the product through our link, a search engine, or by typing Amazon.com directly into your browser.
          </p>
        </section>

        {/* Section 3: Orders, Payments & Customer Service */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="var(--green-accent)" />
            <span>3. Order Processing, Payments &amp; Merchant Control</span>
          </h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            <strong>{config.site_name} does not sell products directly, process transactions, collect credit card details, handle shipments, or manage product returns.</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>Merchant Control:</strong> Amazon and its authorized third-party sellers maintain sole control over final checkout pricing, shipping speeds, warehouse fulfillment, warranty claims, and return policies.
            </li>
            <li>
              <strong>Dynamic Inventory:</strong> Product availability, color variants, merchant stock, and delivery estimates are dynamic and may fluctuate rapidly on Amazon.
            </li>
            <li>
              <strong>Customer Inquiries:</strong> Any questions regarding order tracking, defective items, refunds, or customer support must be addressed directly through your Amazon customer account.
            </li>
          </ul>
        </section>

        {/* Section 4: Editorial Independence Guarantee */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--green-accent)" />
            <span>4. Strict Editorial Independence</span>
          </h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            Our testing methodologies, lab benchmark scores, award badges (e.g. <em>#1 Top Pick</em>, <em>Best Value</em>, <em>Top Runner-Up</em>), and editorial pros/cons assessments are formulated completely independently by our research staff.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>We do <strong>not</strong> accept paid product placements or sponsored review scores.</li>
            <li>We do <strong>not</strong> favor products with higher commission tiers over superior lower-commission products.</li>
            <li>If a product fails our build quality, acoustic, or usability tests, we explicitly document its flaws in our &ldquo;Cons&rdquo; and &ldquo;Who Should Avoid&rdquo; sections.</li>
          </ul>
        </section>

        {/* Section 5: Trademark Notice & Non-Endorsement */}
        <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} color="var(--green-accent)" />
            <span>5. Trademark Notice &amp; Non-Endorsement</span>
          </h2>
          <p style={{ margin: '0 0 1rem 0' }}>
            Amazon, the Amazon logo, AmazonSmile, Prime, and all related brand marks are registered trademarks of Amazon.com, Inc. or its affiliates.
          </p>
          <p style={{ margin: 0 }}>
            {config.site_name} is an independent shopping publication. Amazon does not sponsor, endorse, certify, or review our editorial opinions, ratings, or comparison findings.
          </p>
        </section>

        {/* Section 6: Earnings Transparency & Reader Inquiries */}
        <section style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Questions About Our Affiliate Program?
          </h2>
          <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-secondary)' }}>
            We are committed to maintaining the highest level of consumer trust. If you have questions about our disclosures or testing standards, please reach out to our editorial team.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/how-we-rank" className="btn btn-secondary btn-sm">
              Our Testing Standards →
            </Link>
            <Link href="/contact" className="btn btn-primary btn-sm">
              Contact Editorial Staff →
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
