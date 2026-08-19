import React from 'react';
import Link from 'next/link';

interface EditorialAdPlacementProps {
  headline?: string;
  tagline?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function EditorialAdPlacement({
  headline = 'Amazon Prime & Seasonal Electronics Showcase',
  tagline = 'Exclusive partner promotions, verified limited-time price drops, and lightning deals tracked across all 11 global Amazon marketplaces.',
  ctaText = 'View Active Deals on Amazon →',
  ctaLink = '/deals',
}: EditorialAdPlacementProps) {
  return (
    <div className="container" style={{ margin: '3rem auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '2.5rem 3rem',
          color: '#FAF9F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          boxShadow: 'var(--shadow)',
          border: '1px solid #44403C',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--green-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>
            <span>✦</span>
            <span>FEATURED AMAZON PARTNER SPOTLIGHT</span>
          </div>
          <h3 style={{ color: '#FAF9F5', fontSize: '1.65rem', fontFamily: 'var(--font-serif)', marginBottom: '0.625rem' }}>
            {headline}
          </h3>
          <p style={{ color: '#D6D3D1', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            {tagline}
          </p>
        </div>

        <div>
          <Link href={ctaLink} className="btn btn-primary btn-lg" style={{ background: 'var(--green-accent)', borderColor: 'var(--green-accent)' }}>
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
}
