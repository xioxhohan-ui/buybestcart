'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface CategorySortSelectProps {
  currentSort?: string;
}

export default function CategorySortSelect({ currentSort = 'rank' }: CategorySortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');

    if (value === 'rank') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(targetUrl);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        style={{
          padding: '0.375rem 0.75rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="rank">Recommended Rank</option>
        <option value="rating">Highest Rated</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
