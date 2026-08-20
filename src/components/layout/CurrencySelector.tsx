'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ChevronDown } from 'lucide-react';
import { getExchangeRates } from '@/lib/api/currency';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: string, rates: Record<string, number>) => void;
  compact?: boolean;
}

export default function CurrencySelector({ onCurrencyChange, compact = false }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1.0 });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  ];

  useEffect(() => {
    getExchangeRates().then((data) => {
      setRates(data);
    });
  }, []);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    setIsOpen(false);
    if (onCurrencyChange) {
      onCurrencyChange(code, rates);
    }
  };

  const current = currencies.find((c) => c.code === selectedCurrency) || currencies[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: compact ? 'transparent' : 'var(--bg-surface)',
          border: compact ? 'none' : '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: compact ? '0.2rem 0.4rem' : '0 0.65rem',
          height: compact ? 'auto' : '36px',
          fontSize: '0.75rem',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          color: compact ? '#A3A3A3' : 'var(--text-primary)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
        aria-label="Select Currency"
      >
        <DollarSign size={13} color="var(--green-gold)" />
        <span>{current.code}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>({current.symbol})</span>
        <ChevronDown size={13} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.25rem)',
              right: 0,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xs)',
              boxShadow: 'var(--shadow-hover)',
              zIndex: 200,
              minWidth: '180px',
              padding: '0.375rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.375rem 0.5rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Select Display Currency
            </div>
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelect(c.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: selectedCurrency === c.code ? 'var(--green-light)' : 'transparent',
                  color: selectedCurrency === c.code ? 'var(--green-deep)' : 'var(--text-primary)',
                  border: selectedCurrency === c.code ? '1px solid var(--green-border)' : '1px solid transparent',
                  fontSize: '0.8125rem',
                  fontWeight: selectedCurrency === c.code ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{c.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{c.symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
