'use client';

import React, { useEffect, useRef } from 'react';
import { animateCounter } from '@/lib/animation';
import { useCurrency } from '@/context/CurrencyContext';

export default function AnimatedStats() {
  const stat1Ref = useRef<HTMLDivElement | null>(null);
  const stat2Ref = useRef<HTMLDivElement | null>(null);
  const stat3Ref = useRef<HTMLDivElement | null>(null);
  const stat4Ref = useRef<HTMLDivElement | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    animateCounter(stat1Ref.current, 7400, '', '+', 0, 1.8);
    animateCounter(stat2Ref.current, 11, '', '', 0, 1.2);
    animateCounter(stat3Ref.current, 100, '', '%', 0, 1.4);
  }, []);

  return (
    <section className="container" style={{ padding: '4rem 1.5rem' }}>
      <div className="stats-grid">
        <div className="stat-cell">
          <div ref={stat1Ref} className="stat-value">
            7,400+
          </div>
          <div className="stat-label">Products Lab-Tested</div>
        </div>
        <div className="stat-cell">
          <div ref={stat2Ref} className="stat-value">
            11
          </div>
          <div className="stat-label">Regional Marketplaces</div>
        </div>
        <div className="stat-cell">
          <div ref={stat3Ref} className="stat-value" style={{ color: 'var(--green-accent)' }}>
            100%
          </div>
          <div className="stat-label">Editorial Independence</div>
        </div>
        <div className="stat-cell">
          <div ref={stat4Ref} className="stat-value">
            {formatPrice(0)}
          </div>
          <div className="stat-label">Direct Markup Fees</div>
        </div>
      </div>
    </section>
  );
}
