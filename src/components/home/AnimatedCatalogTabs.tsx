'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Product } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';
import { isReducedMotion } from '@/lib/animation';

interface AnimatedCatalogTabsProps {
  products: Product[];
}

export default function AnimatedCatalogTabs({ products }: AnimatedCatalogTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    const catSlug = p.category?.slug || '';
    if (activeTab === 'audio') return catSlug.includes('audio') || catSlug.includes('headphone');
    if (activeTab === 'computers') return catSlug.includes('computer') || catSlug.includes('laptop');
    if (activeTab === 'gaming') return catSlug.includes('gaming');
    return true;
  });

  useEffect(() => {
    if (!gridContainerRef.current) return;
    if (isReducedMotion()) return;

    gsap.fromTo(
      gridContainerRef.current,
      { opacity: 0.4, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [activeTab]);

  return (
    <div>
      {/* Editorial Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.85rem',
        }}
      >
        {[
          { key: 'all', label: 'All Curated Picks' },
          { key: 'audio', label: 'Audio & Acoustics' },
          { key: 'computers', label: 'Laptops & Workstations' },
          { key: 'gaming', label: 'Gaming & Ergonomics' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.5rem 1.125rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: activeTab === tab.key ? '1px solid var(--green-accent)' : '1px solid var(--border)',
              background: activeTab === tab.key ? 'var(--green-accent)' : 'var(--bg-surface)',
              color: activeTab === tab.key ? '#FFFFFF' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtered Grid with GSAP Entrance */}
      <div ref={gridContainerRef}>
        <ProductGrid products={filteredProducts} ranked={true} />
      </div>
    </div>
  );
}
