'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, DollarSign, Check, Sparkles } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { AVAILABLE_CURRENCIES } from '@/lib/geo';

interface CurrencySelectorProps {
  compact?: boolean;
}

export default function CurrencySelector({ compact = false }: CurrencySelectorProps) {
  const { currency, setCurrency, isAutoDetected } = useCurrency();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const current = AVAILABLE_CURRENCIES.find((c) => c.code === currency) || AVAILABLE_CURRENCIES[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="currency-selector-btn"
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
          transition: 'all 0.15s ease',
        }}
        aria-label={`Select Currency (Currently ${current.code})`}
      >
        <span style={{ fontWeight: 800, color: 'var(--green-accent)', fontSize: '0.85rem' }}>
          {current.symbol}
        </span>
        <span className="currency-selector-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <span>{current.code}</span>
        </span>
        <ChevronDown size={12} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.35rem)',
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-hover)',
            zIndex: 300,
            minWidth: '240px',
            maxWidth: '90vw',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0.5rem 0.5rem 0.5rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Select Currency
            </span>
            {isAutoDetected && (
              <span style={{ fontSize: '0.625rem', color: 'var(--green-accent)', background: 'var(--green-light)', padding: '0.1rem 0.35rem', borderRadius: 'var(--radius-xs)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                <Sparkles size={10} /> Auto-Detected
              </span>
            )}
          </div>

          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {AVAILABLE_CURRENCIES.map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    background: isSelected ? 'var(--green-light)' : 'transparent',
                    color: isSelected ? 'var(--green-deep)' : 'var(--text-primary)',
                    border: isSelected ? '1px solid var(--green-border)' : '1px solid transparent',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 800 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {c.code} ({c.symbol})
                    </span>
                    {isSelected && <Check size={12} color="var(--green-accent)" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
