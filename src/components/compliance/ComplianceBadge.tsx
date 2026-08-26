'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ComplianceScanResult } from '@/lib/compliance/types';

interface ComplianceBadgeProps {
  scanResult?: ComplianceScanResult | null;
  score?: number;
  criticalCount?: number;
  highCount?: number;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export default function ComplianceBadge({
  scanResult,
  score,
  criticalCount = 0,
  highCount = 0,
  onClick,
  size = 'md',
}: ComplianceBadgeProps) {
  const currentScore = scanResult ? scanResult.score : score !== undefined ? score : 100;
  const criticals = scanResult ? scanResult.criticalCount : criticalCount;
  const highs = scanResult ? scanResult.highCount : highCount;

  let bg = 'rgba(16, 185, 129, 0.1)';
  let color = 'var(--green-accent)';
  let border = 'var(--green-border)';
  let label = '100% Compliant';
  let Icon = ShieldCheck;

  if (criticals > 0) {
    bg = 'rgba(239, 68, 68, 0.12)';
    color = '#EF4444';
    border = 'rgba(239, 68, 68, 0.3)';
    label = `${criticals} Critical ${criticals === 1 ? 'Violation' : 'Violations'}`;
    Icon = AlertCircle;
  } else if (highs > 0) {
    bg = 'rgba(245, 158, 11, 0.12)';
    color = '#D97706';
    border = 'rgba(245, 158, 11, 0.3)';
    label = `${highs} Warning ${highs === 1 ? 'Issue' : 'Issues'}`;
    Icon = AlertTriangle;
  } else if (currentScore < 100) {
    bg = 'rgba(59, 130, 246, 0.1)';
    color = '#2563EB';
    border = 'rgba(59, 130, 246, 0.25)';
    label = `${currentScore}% Compliant`;
    Icon = Info;
  }

  const isSmall = size === 'sm';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: bg,
        color,
        border: `1px solid ${border}`,
        padding: isSmall ? '0.15rem 0.45rem' : '0.25rem 0.65rem',
        borderRadius: 'var(--radius-xs)',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
      }}
      title="Amazon Associates Program Compliance Status"
    >
      <Icon size={isSmall ? 11 : 13} />
      <span>{label}</span>
    </div>
  );
}
