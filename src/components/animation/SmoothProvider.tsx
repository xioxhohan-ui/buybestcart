'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getAnimationProfile, monitorRuntimePerformance } from '@/lib/animation';
import DevPerformanceMonitor from '@/components/common/DevPerformanceMonitor';

interface SmoothProviderProps {
  children: React.ReactNode;
}

export default function SmoothProvider({ children }: SmoothProviderProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    monitorRuntimePerformance();
    const profile = getAnimationProfile();

    // 1. Visibility Handler (Rule 22): Pause animations when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        gsap.globalTimeline.pause();
      } else {
        gsap.globalTimeline.resume();
        ScrollTrigger.refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. High-Performance Desktop-Only Custom Cursor (Rules 09, 10, 11, 19, 26, 41)
    let removeCursorListeners: (() => void) | null = null;

    if (profile.enableCursor && cursorRef.current) {
      const cursor = cursorRef.current;
      cursor.style.display = 'block';

      // Use GSAP quickTo for buttery 60-144fps frame pacing
      const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3.out' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3.out' });

      const onMouseMove = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };

      const onMouseEnterInteractive = () => {
        gsap.to(cursor, { scale: 2.0, opacity: 0.35, duration: 0.18, ease: 'power2.out' });
      };

      const onMouseLeaveInteractive = () => {
        gsap.to(cursor, { scale: 1, opacity: 0.75, duration: 0.18, ease: 'power2.out' });
      };

      window.addEventListener('mousemove', onMouseMove, { passive: true });

      const interactiveElements = document.querySelectorAll('a, button, input, [role="button"], .box-card, .product-card');
      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterInteractive);
        el.addEventListener('mouseleave', onMouseLeaveInteractive);
      });

      removeCursorListeners = () => {
        window.removeEventListener('mousemove', onMouseMove);
        interactiveElements.forEach((el) => {
          el.removeEventListener('mouseenter', onMouseEnterInteractive);
          el.removeEventListener('mouseleave', onMouseLeaveInteractive);
        });
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (removeCursorListeners) removeCursorListeners();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      {/* Desktop Only Smooth Follower Dot */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: -6,
          left: -6,
          width: '12px',
          height: '12px',
          backgroundColor: 'var(--green-accent)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'none',
          opacity: 0.75,
          mixBlendMode: 'difference',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
        }}
        aria-hidden="true"
      />
      {children}
      <DevPerformanceMonitor />
    </>
  );
}
