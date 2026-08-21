'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Runtime Error:', error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '6rem 1.5rem 8rem 1.5rem', maxWidth: '640px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: '#fee2e2', color: 'var(--error)', marginBottom: '1.5rem' }}>
        <AlertCircle size={36} />
      </div>

      <div className="editorial-eyebrow" style={{ color: 'var(--error)' }}>SERVER RECOVERY</div>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem' }}>
        Something Went Wrong
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
        An unexpected error occurred while loading this page. Our team has been notified and you can safely retry or navigate back to the home catalog.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => reset()} className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <RefreshCw size={15} />
          <span>Try Again</span>
        </button>
        <Link href="/" className="btn btn-secondary" style={{ gap: '0.4rem' }}>
          <Home size={15} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
