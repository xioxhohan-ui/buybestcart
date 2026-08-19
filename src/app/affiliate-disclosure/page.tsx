import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Amazon Associates Affiliate Disclosure | Best Buy Cart',
  description: 'Full legal affiliate disclosure regarding our participation in the Amazon Services LLC Associates Program.',
};

export default function AffiliateDisclosurePage() {
  const breadcrumbs = [
    { name: 'Affiliate Disclosure', url: '/affiliate-disclosure' },
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem', maxWidth: '840px' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Amazon Affiliate Disclosure</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          In compliance with the Federal Trade Commission (FTC) guidelines and Amazon Associates Operating Agreement.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <div className="affiliate-disclosure-banner" style={{ background: 'var(--bg-surface)', borderColor: 'var(--primary-border)', padding: '1.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
          <strong>Official Amazon Associate Statement:</strong><br />
          &ldquo;Best Buy Cart is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com, Amazon.co.uk, Amazon.ca, Amazon.de, Amazon.fr, Amazon.it, Amazon.es, Amazon.nl, Amazon.se, Amazon.pl, Amazon.com.au, and any other website that may be affiliated with Amazon Service LLC Associates Program.&rdquo;
        </div>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>What Does This Mean For You?</h2>
          <p>
            When you click on links to Amazon from Best Buy Cart and make a purchase, we may receive a small commission from Amazon. This does <strong>not</strong> increase the purchase price for you. You pay the exact same price as any other Amazon shopper.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Editorial Independence</h2>
          <p>
            Our product selections, comparisons, pros/cons, and ranking scores are curated independently by our editorial team. Amazon does not determine, influence, or approve our rankings.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Amazon Trademarks</h2>
          <p>
            Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates. Best Buy Cart is an independent affiliate publication and is not owned, operated, or endorsed by Amazon.com, Inc. or Best Buy Co., Inc.
          </p>
        </section>
      </div>
    </div>
  );
}
