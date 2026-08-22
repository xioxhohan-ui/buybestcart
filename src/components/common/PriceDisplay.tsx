'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface PriceDisplayProps {
  amount?: number;
  originalCurrency?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PriceDisplay({
  amount,
  className,
  style,
}: PriceDisplayProps) {
  const { formatPrice } = useCurrency();

  if (amount === undefined || amount === null || isNaN(amount)) {
    return <span className={className} style={style}>Check Amazon</span>;
  }

  return (
    <span className={className} style={style}>
      {formatPrice(amount)}
    </span>
  );
}
