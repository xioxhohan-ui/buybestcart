'use client';

import React from 'react';
import { getProductRedirectUrl } from '@/lib/affiliate';
import { getStoredRegion } from '@/lib/region';

interface AffiliateCTAProps {
  productSlug: string;
  asin?: string;
  price?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function AffiliateCTA({
  productSlug,
  price,
  label = 'Check Price on Amazon',
  size = 'md',
  fullWidth = false,
}: AffiliateCTAProps) {
  const region = typeof window !== 'undefined' ? getStoredRegion() : 'US';
  const targetUrl = getProductRedirectUrl(productSlug, region, 'view_price');

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="nofollow sponsored noopener"
      className={`btn btn-amazon ${sizeClass}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      <span>{label}</span>
      {price && (
        <span style={{ fontWeight: 800, borderLeft: '1px solid currentColor', paddingLeft: '0.5rem', opacity: 0.9 }}>
          ${price.toFixed(2)}
        </span>
      )}
      <span style={{ fontSize: '0.75rem' }}>↗</span>
    </a>
  );
}
