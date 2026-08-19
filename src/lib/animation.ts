import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins safely on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Set default animation config
  gsap.config({
    autoSleep: 60,
    force3D: true,
    nullTargetWarn: false,
  });

  // Global performance defaults
  ScrollTrigger.config({
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
    ignoreMobileResize: true,
  });
}

/**
 * Performance & Easing Tokens (Rules 38 & 39)
 */
export const MOTION = {
  ease: {
    primary: 'power3.out',
    secondary: 'power4.out',
    soft: 'power2.out',
    interactive: 'power3.inOut',
  },
  duration: {
    micro: 0.18, // 150 - 220ms
    button: 0.25, // 200 - 300ms
    card: 0.32, // 250 - 400ms
    reveal: 0.65, // 500 - 800ms
    hero: 0.85, // 700 - 1200ms
    section: 0.80, // 800 - 1200ms
  },
  stagger: {
    fast: 0.04,
    normal: 0.06,
    relaxed: 0.08,
  },
};

/**
 * Performance Modes (Rule 36)
 */
export type PerformanceMode = 'NORMAL' | 'PERFORMANCE' | 'SAFE_MODE';

let currentPerformanceMode: PerformanceMode = 'NORMAL';
let frameDropCount = 0;

/**
 * Rule 11 & 42: Accessibility check
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Rule 41: Mobile touch detection
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768
  );
}

/**
 * Rule 10: Low-end device hardware heuristics
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (isReducedMotion()) return true;

  const nav = navigator as unknown as {
    hardwareConcurrency?: number;
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) return true;
  if (nav.deviceMemory && nav.deviceMemory < 4) return true;
  if (nav.connection?.saveData === true || nav.connection?.effectiveType === '2g') return true;

  return false;
}

/**
 * Rule 36: Adaptive Performance Fallback Engine
 */
export function getAnimationProfile() {
  const isReduced = isReducedMotion();
  const isLowEnd = isLowEndDevice();
  const isMobile = isTouchDevice();

  if (isReduced || currentPerformanceMode === 'SAFE_MODE') {
    return {
      mode: 'SAFE_MODE' as PerformanceMode,
      isReduced: true,
      isLowEnd: true,
      isMobile,
      enableCursor: false,
      enableParallax: false,
      enableContinuousLoops: false,
      staggerDuration: 0,
      revealDistance: 0,
      duration: 0.1,
    };
  }

  if (isLowEnd || isMobile || currentPerformanceMode === 'PERFORMANCE') {
    return {
      mode: 'PERFORMANCE' as PerformanceMode,
      isReduced: false,
      isLowEnd: true,
      isMobile,
      enableCursor: false,
      enableParallax: false,
      enableContinuousLoops: false,
      staggerDuration: MOTION.stagger.fast,
      revealDistance: 15,
      duration: 0.45,
    };
  }

  return {
    mode: 'NORMAL' as PerformanceMode,
    isReduced: false,
    isLowEnd: false,
    isMobile: false,
    enableCursor: true,
    enableParallax: true,
    enableContinuousLoops: true,
    staggerDuration: MOTION.stagger.normal,
    revealDistance: 30,
    duration: MOTION.duration.reveal,
  };
}

/**
 * Rule 36: Runtime Frame Performance Watcher
 * Degrades mode gracefully if client experiences sustained frame drops
 */
export function monitorRuntimePerformance() {
  if (typeof window === 'undefined') return;
  if (isReducedMotion() || isTouchDevice()) return;

  let lastTime = performance.now();

  const checkFrame = (now: number) => {
    const delta = now - lastTime;
    lastTime = now;

    // A frame taking longer than 40ms implies < 25fps
    if (delta > 40) {
      frameDropCount++;
      if (frameDropCount > 10 && currentPerformanceMode === 'NORMAL') {
        currentPerformanceMode = 'PERFORMANCE';
      } else if (frameDropCount > 25 && currentPerformanceMode === 'PERFORMANCE') {
        currentPerformanceMode = 'SAFE_MODE';
        // Disable non-essential visual loops
        document.body.classList.add('safe-performance-mode');
      }
    } else {
      frameDropCount = Math.max(0, frameDropCount - 1);
    }

    requestAnimationFrame(checkFrame);
  };

  requestAnimationFrame(checkFrame);
}

/**
 * Rule 08: Viewport-based Number Counter
 */
export function animateCounter(
  target: HTMLElement | null,
  endValue: number,
  prefix: string = '',
  suffix: string = '',
  decimals: number = 0,
  duration: number = 1.4
) {
  if (!target) return;
  const profile = getAnimationProfile();

  if (profile.isReduced) {
    target.innerText = `${prefix}${decimals > 0 ? endValue.toFixed(decimals) : endValue.toLocaleString()}${suffix}`;
    return;
  }

  const obj = { val: 0 };
  gsap.to(obj, {
    val: endValue,
    duration,
    ease: MOTION.ease.primary,
    scrollTrigger: {
      trigger: target,
      start: 'top 88%',
      once: true,
    },
    onUpdate: () => {
      const formatted = decimals > 0 ? obj.val.toFixed(decimals) : Math.round(obj.val).toLocaleString();
      target.innerText = `${prefix}${formatted}${suffix}`;
    },
  });
}
