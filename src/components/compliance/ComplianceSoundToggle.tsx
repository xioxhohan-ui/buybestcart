'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isComplianceSoundEnabled, setComplianceSoundEnabled, playComplianceSuccessSound } from '@/lib/compliance/sound';

interface ComplianceSoundToggleProps {
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ComplianceSoundToggle({
  showLabel = true,
  size = 'md',
}: ComplianceSoundToggleProps) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isComplianceSoundEnabled());
  }, []);

  const handleToggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    setComplianceSoundEnabled(nextState);
    if (nextState) {
      playComplianceSuccessSound();
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={enabled ? 'Mute Compliance Audio Alerts' : 'Enable Compliance Audio Alerts'}
      title={enabled ? 'Compliance Sound Alerts Active (Click to Mute)' : 'Compliance Sound Alerts Muted (Click to Enable)'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: enabled ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-subtle)',
        border: `1px solid ${enabled ? 'var(--green-border)' : 'var(--border)'}`,
        color: enabled ? 'var(--green-accent)' : 'var(--text-muted)',
        padding: isSmall ? '0.25rem 0.5rem' : '0.4rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {enabled ? (
        <Volume2 size={isSmall ? 13 : 15} color="var(--green-accent)" />
      ) : (
        <VolumeX size={isSmall ? 13 : 15} color="var(--text-muted)" />
      )}
      {showLabel && <span>{enabled ? 'Alerts Sound: ON' : 'Alerts Sound: MUTED'}</span>}
    </button>
  );
}
