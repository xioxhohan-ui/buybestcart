'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, ExternalLink } from 'lucide-react';

interface SelfPurchaseWarningNoticeProps {
  compact?: boolean;
}

export default function SelfPurchaseWarningNotice({ compact = false }: SelfPurchaseWarningNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (compact) {
    return (
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-xs)',
          padding: '0.4rem 0.65rem',
          fontSize: '0.75rem',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        <ShieldAlert size={13} style={{ flexShrink: 0 }} />
        <span><strong>Rule #1 Reminder:</strong> Never complete personal purchases through this link.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius)',
        padding: '0.875rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldAlert size={16} color="#EF4444" />
        </div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#B91C1C' }}>
            Amazon Compliance Rule #1: Prohibition on Self-Purchases
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Never purchase items for yourself, friends, or colleagues using your own affiliate links. Amazon tracks IP and payment methods and will void commissions and close accounts.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          padding: '0.2rem',
        }}
        title="Dismiss notice"
      >
        <X size={14} />
      </button>
    </div>
  );
}
