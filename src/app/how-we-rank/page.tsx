import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How We Rank: Unbiased Tech Reviews & Verification Standards | Buy Best Cart',
  description: 'Learn how Buy Best Cart produces 100% unbiased tech reviews and verified product reviews. Discover how our laboratory testing detects fake ratings and flawed hardware.',
  keywords: ['unbiased tech reviews', 'verified product reviews', 'how to spot fake reviews', 'editorial methodology', 'product ranking algorithm', 'buy best cart standards'],
  openGraph: {
    title: 'How We Rank: Unbiased Tech Reviews & Verification Standards | Buy Best Cart',
    description: 'Learn how Buy Best Cart produces 100% unbiased tech reviews and verified product reviews with zero manufacturer compensation.',
    images: [{ url: 'https://buybestcart.shop/og-image.png', width: 1200, height: 630, alt: 'Buy Best Cart Ranking Standards' }],
  },
};

export default function HowWeRankPage() {
  const breadcrumbs = [
    { name: 'Editorial Methodology', url: '/how-we-rank' },
  ];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem', maxWidth: '840px' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Transparency & Standards
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>How We Review &amp; Rank Products</h1>
        <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          At Buy Best Cart, our mission is to provide clear, unbiased tech reviews and verified product recommendations. Here is an open look at our ranking algorithm and editorial philosophy.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>1. The Four Pillars of Our Ranking Score</h2>
          <p>Every product showcased on Buy Best Cart is evaluated across four core dimensions:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Technical Performance (35%):</strong> Verifiable specifications, benchmark scores, battery endurance, and component reliability.</li>
            <li><strong>Verified Product Reviews &amp; Longevity (25%):</strong> Thousands of verified Amazon buyer reviews analyzed with anomaly detection algorithms to filter out fake or incentivized ratings.</li>
            <li><strong>Value Proposition (25%):</strong> Price-to-feature ratio compared against direct category competitors.</li>
            <li><strong>Design &amp; Ergonomics (15%):</strong> Portability, ease of use, physical controls, and software ecosystem compatibility.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>2. Unbiased Tech Reviews &amp; Zero Paid Placements</h2>
          <p>
            Manufacturers and sellers cannot pay us to rank their products higher. Our #1 picks, Editor&apos;s Choices, and Best Budget designations are determined solely by technical merit and real-world value. Read our guide on <Link href="/guides/how-to-spot-fake-reviews" style={{ color: 'var(--green-accent)', fontWeight: 600 }}>how to spot fake reviews</Link> to learn more about how we filter hijacked ASINs.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>3. How Affiliate Links Work</h2>
          <p>
            Buy Best Cart earns revenue through the Amazon Associates affiliate program. When you click our links to purchase a product on Amazon, we may earn a small referral commission. This occurs at <strong>zero additional cost to you</strong> and does not influence our editorial ratings.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>4. Ongoing Price & Availability Monitoring</h2>
          <p>
            We synchronize product data regularly with Amazon&apos;s API to reflect current pricing, lightning deals, and inventory status. However, the final price is always what appears on Amazon at checkout.
          </p>
        </section>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginTop: '1rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Have questions about our methodology?</h3>
          <p style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>
            We welcome feedback from engineers, researchers, and readers.
          </p>
          <Link href="/contact" className="btn btn-primary btn-sm">
            Contact Editorial Team
          </Link>
        </div>
      </div>
    </div>
  );
}
