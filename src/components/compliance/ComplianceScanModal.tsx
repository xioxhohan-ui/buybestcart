'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
  Save,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { ComplianceScanResult, ComplianceViolation } from '@/lib/compliance/types';
import ComplianceSoundToggle from './ComplianceSoundToggle';

interface ComplianceScanModalProps {
  isOpen: boolean;
  scanResult: ComplianceScanResult | null;
  onClose: () => void;
  onSaveAsDraft?: () => void;
  onConfirmPublishAnyway?: () => void;
  savingAsDraft?: boolean;
}

export default function ComplianceScanModal({
  isOpen,
  scanResult,
  onClose,
  onSaveAsDraft,
  onConfirmPublishAnyway,
  savingAsDraft = false,
}: ComplianceScanModalProps) {
  if (!isOpen || !scanResult) return null;

  const violations = scanResult.violations || [];
  const blockingViolations = violations.filter((v) => v.blocking);
  const nonBlockingViolations = violations.filter((v) => !v.blocking);

  const hasBlocking = scanResult.hasBlockingViolations;

  const renderViolationCard = (v: ComplianceViolation, idx: number) => {
    const isCritical = v.severity === 'critical';
    const isHigh = v.severity === 'high';

    let cardBg = isCritical ? 'rgba(239, 68, 68, 0.04)' : isHigh ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-subtle)';
    let cardBorder = isCritical ? 'rgba(239, 68, 68, 0.25)' : isHigh ? 'rgba(245, 158, 11, 0.25)' : 'var(--border)';
    let badgeBg = isCritical ? '#EF4444' : isHigh ? '#F59E0B' : 'var(--text-muted)';
    let IconComp = isCritical ? AlertCircle : isHigh ? AlertTriangle : Info;

    return (
      <div
        key={v.id || idx}
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                background: badgeBg,
                color: '#FFF',
                fontSize: '0.6875rem',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Rule #{v.ruleNumber}: {v.ruleId}
            </span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {v.title}
            </span>
          </div>

          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 800,
              color: isCritical ? '#EF4444' : isHigh ? '#D97706' : 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            {v.severity.toUpperCase()} SEVERITY
          </span>
        </div>

        {/* Message */}
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
          {v.message}
        </p>

        {/* Offending Value (if exists) */}
        {v.offendingValue && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: '#DC2626',
              marginBottom: '0.75rem',
              wordBreak: 'break-all',
            }}
          >
            <strong>Offending Content:</strong> &ldquo;{v.offendingValue}&rdquo;
          </div>
        )}

        {/* Required Change / Actionable Remediation */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.65rem 0.85rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--green-accent)' }}>Required Action:</strong> {v.remediation}
        </div>

        {/* Policy Citation */}
        {v.amazonPolicyRef && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
            Reference: {v.amazonPolicyRef}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: hasBlocking ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldAlert size={22} color={hasBlocking ? '#EF4444' : '#F59E0B'} />
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Amazon Affiliate Compliance Guard
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {scanResult.targetType.toUpperCase()}: {scanResult.targetTitle || 'Untitled Item'} • Score: {scanResult.score}/100
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ComplianceSoundToggle size="sm" showLabel={false} />
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.25rem',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Blocking Warning Banner */}
        {hasBlocking && (
          <div
            style={{
              background: '#EF4444',
              color: '#FFF',
              padding: '0.75rem 1.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>⚠️ Publishing is blocked until {blockingViolations.length} critical compliance issue(s) are resolved.</span>
            <span style={{ fontSize: '0.6875rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Save as Draft Allowed</span>
          </div>
        )}

        {/* Violations List Container */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {violations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle2 size={40} color="var(--green-accent)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>100% Fully Compliant</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>
                All 10 Amazon Associates Program rules and link guidelines are satisfied. Ready to publish!
              </p>
            </div>
          ) : (
            <div>
              {blockingViolations.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#EF4444', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    Blocking Violations ({blockingViolations.length})
                  </div>
                  {blockingViolations.map((v, i) => renderViolationCard(v, i))}
                </div>
              )}

              {nonBlockingViolations.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    Advisories &amp; Non-Blocking Notices ({nonBlockingViolations.length})
                  </div>
                  {nonBlockingViolations.map((v, i) => renderViolationCard(v, i + blockingViolations.length))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Amazon Associates Operating Agreement (2026 Guard)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8125rem' }}
            >
              Back to Editor
            </button>

            {hasBlocking && onSaveAsDraft && (
              <button
                type="button"
                onClick={onSaveAsDraft}
                disabled={savingAsDraft}
                className="btn btn-primary btn-sm"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#F59E0B',
                  borderColor: '#D97706',
                  color: '#000',
                }}
              >
                <Save size={13} />
                <span>{savingAsDraft ? 'Saving Draft...' : 'Save as Draft Instead'}</span>
              </button>
            )}

            {!hasBlocking && onConfirmPublishAnyway && (
              <button
                type="button"
                onClick={onConfirmPublishAnyway}
                className="btn btn-primary btn-sm"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
              >
                Proceed &amp; Publish →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
