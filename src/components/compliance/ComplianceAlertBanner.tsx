'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Check, ArrowRight, X } from 'lucide-react';
import { ComplianceViolation, ComplianceScanResult } from '@/lib/compliance/types';

interface ComplianceAlertBannerProps {
  scanResult: ComplianceScanResult | null;
  onOpenDetails?: () => void;
  onDismiss?: () => void;
}

export default function ComplianceAlertBanner({
  scanResult,
  onOpenDetails,
  onDismiss,
}: ComplianceAlertBannerProps) {
  if (!scanResult || (scanResult.violations.length === 0 && scanResult.passed)) {
    return null;
  }

  const criticals = scanResult.violations.filter((v) => v.severity === 'critical');
  const highs = scanResult.violations.filter((v) => v.severity === 'high');
  const warnings = scanResult.violations.filter((v) => v.severity === 'medium' || v.severity === 'warning');

  const hasBlocking = scanResult.hasBlockingViolations;

  let bg = 'rgba(239, 68, 68, 0.08)';
  let borderColor = 'rgba(239, 68, 68, 0.3)';
  let textColor = '#EF4444';
  let Icon = AlertCircle;
  let title = 'Amazon Affiliate Compliance Violations Detected';

  if (!hasBlocking && (highs.length > 0 || warnings.length > 0)) {
    bg = 'rgba(245, 158, 11, 0.08)';
    borderColor = 'rgba(245, 158, 11, 0.3)';
    textColor = '#D97706';
    Icon = AlertTriangle;
    title = 'Amazon Affiliate Compliance Advisories';
  }

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius)',
        padding: '0.875rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
        <Icon size={18} color={textColor} style={{ marginTop: '0.15rem', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: textColor, marginBottom: '0.2rem' }}>
            {title} {hasBlocking && <span style={{ background: '#EF4444', color: '#FFF', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.6875rem', marginLeft: '0.5rem' }}>PUBLISHING BLOCKED</span>}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Found {criticals.length} critical and {highs.length} high-severity issues. Please resolve before publishing to avoid Amazon Associates account suspension.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {onOpenDetails && (
          <button
            type="button"
            onClick={onOpenDetails}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderColor,
              color: textColor,
            }}
          >
            <span>Review {scanResult.violations.length} Issues</span>
            <ArrowRight size={12} />
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
            }}
            title="Dismiss banner"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
