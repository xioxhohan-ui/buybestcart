'use client';

import React, { useState, useEffect } from 'react';
import { MARKETPLACES } from '@/lib/affiliate';
import { getStoredRegion, setStoredRegion } from '@/lib/region';

interface RegionSelectorProps {
  compact?: boolean;
}

export default function RegionSelector({ compact = false }: RegionSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('US');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedRegion(getStoredRegion());
  }, []);

  const handleSelect = (code: string) => {
    setSelectedRegion(code);
    setStoredRegion(code);
    setIsOpen(false);
    window.location.reload();
  };

  const current = MARKETPLACES[selectedRegion] || MARKETPLACES.US;

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
          transition: 'all 0.15s ease',
        }}
        aria-label="Select Amazon Marketplace Region"
      >
        <span style={{ fontSize: '0.875rem' }}>{current.flag_emoji}</span>
        <span>{current.country_code}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 600 }}>({current.currency})</span>
        <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginLeft: '0.1rem' }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-header, 100)' as unknown as number }}
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
              zIndex: 'var(--z-search-dropdown, 200)' as unknown as number,
              minWidth: '240px',
              padding: '0.375rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
            }}
          >
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.375rem 0.5rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Select Amazon Endpoint
            </div>
            {Object.entries(MARKETPLACES).map(([code, mkt]) => (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  background: selectedRegion === code ? 'var(--green-light)' : 'transparent',
                  color: selectedRegion === code ? 'var(--green-deep)' : 'var(--text-primary)',
                  border: selectedRegion === code ? '1px solid var(--green-border)' : '1px solid transparent',
                  fontSize: '0.8125rem',
                  fontWeight: selectedRegion === code ? 700 : 500,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{mkt.flag_emoji}</span>
                  <span>{mkt.country}</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mkt.currency}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
