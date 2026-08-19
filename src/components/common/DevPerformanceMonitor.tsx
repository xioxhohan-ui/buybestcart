'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Dev-Only Performance Monitor (Rule 35)
 * Displays FPS, frame time, ScrollTrigger count, and memory indicators.
 * Only rendered in development mode (process.env.NODE_ENV !== 'production').
 */
export default function DevPerformanceMonitor() {
  const [stats, setStats] = useState({
    fps: 60,
    frameTime: 16.6,
    triggerCount: 0,
    memoryMb: 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Only active in non-production environments
    if (process.env.NODE_ENV === 'production') return;

    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const loop = (now: number) => {
      frameCount++;
      const delta = now - lastTime;
      lastTime = now;

      // Update FPS every 500ms for stable readings
      if (now - lastFpsUpdate >= 500) {
        const calculatedFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        const avgFrameTime = Number(delta.toFixed(1));
        const count = ScrollTrigger.getAll().length;
        
        // Memory metric if supported by browser
        const mem = (performance as unknown as { memory?: { usedJSHeapSize?: number } }).memory;
        const memoryMb = mem?.usedJSHeapSize ? Math.round(mem.usedJSHeapSize / (1024 * 1024)) : 0;

        setStats({
          fps: Math.min(calculatedFps, 144),
          frameTime: avgFrameTime,
          triggerCount: count,
          memoryMb,
        });

        frameCount = 0;
        lastFpsUpdate = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 99999,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
      }}
    >
      {isOpen ? (
        <div
          style={{
            background: 'var(--bg-dark)',
            color: '#FFFFFF',
            border: '1px solid var(--border-dark)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.75rem 1rem',
            boxShadow: 'var(--shadow-box)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            minWidth: '180px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--green-accent)', fontWeight: 700 }}>● PERF TELEMETRY</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>FRAME RATE:</span>
            <span style={{ color: stats.fps >= 55 ? 'var(--green-accent)' : '#ef4444', fontWeight: 700 }}>
              {stats.fps} FPS
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>FRAME TIME:</span>
            <span>{stats.frameTime} ms</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888' }}>SCROLLTRIGGERS:</span>
            <span>{stats.triggerCount} active</span>
          </div>
          {stats.memoryMb > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>HEAP MEMORY:</span>
              <span>{stats.memoryMb} MB</span>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'var(--bg-dark)',
            color: 'var(--green-accent)',
            border: '1px solid var(--border-dark)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="Open Dev Performance Telemetry"
        >
          <span>●</span>
          <span>{stats.fps} FPS</span>
        </button>
      )}
    </div>
  );
}
