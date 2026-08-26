'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { AVAILABLE_CURRENCIES, AMAZON_SUPPORTED_COUNTRIES } from '@/lib/geo';
import { ChevronDown, Globe, Sparkles, Check, Search } from 'lucide-react';

interface RegionSelectorProps {
  compact?: boolean;
}

export default function RegionSelector({ compact = false }: RegionSelectorProps) {
  const {
    currency,
    countryCode,
    marketplace,
    isAmazonSupported,
    isAutoDetected,
    setCurrency,
    setRegion,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape or click outside
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

  const filteredCurrencies = AVAILABLE_CURRENCIES.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.countryCode.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  });

  const handleSelectCurrency = (code: string) => {
    setCurrency(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectCountry = (country: string) => {
    setRegion(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const flag = marketplace.flag_emoji || '🇺🇸';
  const symbol = marketplace.currency_symbol || '$';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
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
        aria-label={`Select Currency and Amazon Marketplace (Currently ${countryCode} / ${currency})`}
      >
        <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{flag}</span>
        <span style={{ fontWeight: 800, color: 'var(--green-accent)' }}>{symbol}</span>
        <span>{currency}</span>
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
            width: '320px',
            maxWidth: '90vw',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* Header & Auto-Detection Status */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Currency &amp; Marketplace
              </span>
              {isAutoDetected ? (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: 'var(--green-accent)',
                    background: 'var(--green-light)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: 'var(--radius-xs)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  <Sparkles size={10} /> Auto-Detected
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-subtle)',
                    padding: '0.15rem 0.4rem',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  Custom Selected
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
              Live prices convert automatically for your region. Amazon-supported countries display official localized storefront currencies; all other countries default to USD ($).
            </p>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative' }}>
            <Search size={12} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search currency, country, symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.5rem 0.35rem 1.8rem',
                fontSize: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Currency List */}
          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              paddingRight: '0.25rem',
            }}
          >
            {filteredCurrencies.map((item) => {
              const isSelected = currency === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectCurrency(item.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-xs)',
                    background: isSelected ? 'var(--green-light)' : 'transparent',
                    color: isSelected ? 'var(--green-deep)' : 'var(--text-primary)',
                    border: isSelected ? '1px solid var(--green-border)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem' }}>{item.flag}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: isSelected ? 800 : 600 }}>
                        {item.code} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({item.symbol})</span>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                        {item.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={13} color="var(--green-accent)" />}
                </button>
              );
            })}

            {filteredCurrencies.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No matching currency found.
              </div>
            )}
          </div>

          {/* Amazon Affiliate Guidance Note */}
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.45rem 0.6rem',
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            <strong>Amazon Partner Integration:</strong> When clicking out to purchase, you are directed to your active regional Amazon storefront ({marketplace.domain}).
          </div>
        </div>
      )}
    </div>
  );
}
