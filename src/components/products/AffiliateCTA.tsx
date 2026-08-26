'use client';

import React from 'react';
import { getProductRedirectUrl } from '@/lib/affiliate';
import { useCurrency } from '@/context/CurrencyContext';

interface AffiliateCTAProps {
  productSlug: string;
  asin?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  affiliateUrl?: string;
}

export default function AffiliateCTA({
  productSlug,
  label = 'Check Price on Amazon',
  size = 'md',
  fullWidth = false,
  affiliateUrl,
}: AffiliateCTAProps) {
  const { countryCode } = useCurrency();
  const targetUrl =
    affiliateUrl && affiliateUrl.trim().startsWith('http')
      ? affiliateUrl.trim()
      : getProductRedirectUrl(productSlug, countryCode || 'US', 'view_price');

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
        gap: '0.4rem',
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: '0.85rem' }}>↗</span>
    </a>
  );
}
