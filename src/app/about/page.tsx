import React from 'react';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Buy Best Cart',
  description: 'Learn about Buy Best Cart — an independent product discovery, comparison, and review platform.',
};

export default function AboutPage() {
  const breadcrumbs = [{ name: 'About', url: '/about' }];

  return (
    <div className="container" style={{ padding: '1.5rem 1.25rem 4rem 1.25rem', maxWidth: '840px' }}>
      <Breadcrumbs items={breadcrumbs} />

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>About Buy Best Cart</h1>
        <p style={{ fontSize: '1.1875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Helping consumers discover, compare, and understand high-performance consumer technology.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Our Mission</h2>
          <p>
            With millions of products on Amazon and inconsistent online reviews, choosing the right laptop, noise-canceling headphones, or smart home device has become unnecessarily confusing. Buy Best Cart was created to solve this problem through clear, side-by-side spec comparisons, transparent pros/cons, and curated rankings.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>What We Do (And What We Don&apos;t)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--success-light)', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ color: 'var(--success)', fontSize: '1rem', marginBottom: '0.5rem' }}>✓ What We Do</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9375rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li>Analyze technical specifications</li>
                <li>Compare competing products</li>
                <li>Provide editorial scores & rankings</li>
                <li>Route users to their regional Amazon store</li>
              </ul>
            </div>

            <div style={{ background: 'var(--danger-light)', border: '1px solid #fecaca', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '0.5rem' }}>✗ What We Don&apos;t Do</h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9375rem', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li>We do not hold physical inventory</li>
                <li>We do not process credit cards</li>
                <li>We do not ship packages directly</li>
                <li>We do not charge hidden user fees</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Multi-Region Amazon Integration</h2>
          <p>
            Whether you are shopping in the United States, United Kingdom, Canada, Germany, France, or Australia, our intelligent regional routing automatically directs you to the corresponding Amazon marketplace.
          </p>
        </section>

        <div style={{ marginTop: '1rem' }}>
          <Link href="/how-we-rank" className="btn btn-primary">
            Read Our Ranking Criteria →
          </Link>
        </div>
      </div>
    </div>
  );
}
