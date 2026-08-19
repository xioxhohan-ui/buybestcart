'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  text?: string;
  linkText?: string;
  linkUrl?: string;
  enabled?: boolean;
  dismissible?: boolean;
}

export default function AnnouncementBar({
  text = 'The 2026 Tech & Lifestyle Edit — 100% Independent Reviews & Verified Regional Amazon Stock',
  linkText = 'Testing Methodology →',
  linkUrl = '/how-we-rank',
  enabled = true,
  dismissible = true,
}: AnnouncementBarProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('bbc_announcement_dismissed');
    if (isDismissed === 'true') {
      setVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('bbc_announcement_dismissed', 'true');
  };

  if (!enabled || !visible) return null;

  return (
    <div
      style={{
        background: 'var(--bg-dark, #1C1917)',
        color: '#D6D3D1',
        fontSize: '0.75rem',
        padding: '0.45rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          gap: '0.75rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Sparkles size={12} color="var(--green-gold, #B38E5D)" />
          <span style={{ fontWeight: 500 }}>{text}</span>
          {linkText && linkUrl && (
            <Link
              href={linkUrl}
              style={{
                color: '#FAF9F5',
                fontWeight: 700,
                textDecoration: 'underline',
                marginLeft: '0.25rem',
              }}
            >
              {linkText}
            </Link>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#8C857B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
            title="Dismiss Announcement"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
