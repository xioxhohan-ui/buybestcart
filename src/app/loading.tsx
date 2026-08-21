import React from 'react';

export default function Loading() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '60vh' }}>
      {/* Skeleton Header */}
      <div style={{ marginBottom: '2.5rem', maxWidth: '600px' }}>
        <div style={{ width: '120px', height: '14px', background: 'var(--border)', borderRadius: '4px', marginBottom: '0.75rem', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '320px', height: '36px', background: 'var(--border)', borderRadius: '6px', marginBottom: '0.75rem', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '100%', height: '18px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
      </div>

      {/* Skeleton Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ width: '100%', height: '200px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '40%', height: '12px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '85%', height: '20px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ width: '50%', height: '24px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
