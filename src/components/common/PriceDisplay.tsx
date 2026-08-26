'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface PriceDisplayProps {
  amount?: number | null;
  originalCurrency?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PriceDisplay({
  amount,
  originalCurrency = 'USD',
  className,
  style,
}: PriceDisplayProps) {
  const { formatPrice, currency } = useCurrency();

  // If no valid price exists (> 0), render nothing cleanly
  if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
    return null;
  }

  const formatted = formatPrice(amount, originalCurrency);

  return (
    <span className={className} style={style} aria-label={`${formatted} ${currency}`}>
      {formatted}
    </span>
  );
}
