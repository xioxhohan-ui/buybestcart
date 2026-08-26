import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'mark' | 'horizontal' | 'vertical' | 'footer';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  theme?: 'auto' | 'light' | 'dark';
  className?: string;
  showTagline?: boolean;
}

/**
 * Buy Best Cart - Original Vector Brand Mark
 * An emblem with an interlocking geometric B-C monogram and central precision diamond facet.
 */
export function BrandMarkSvg({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="Buy Best Cart Logo Mark"
    >
      <defs>
        {/* Primary Rich Emerald / Indigo Gradient */}
        <linearGradient id="bbc-primary-grad" x1="2" y1="2" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Accent Glow Gradient */}
        <linearGradient id="bbc-accent-glow" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
        </linearGradient>

        {/* Shield / Squircle Background Gradient */}
        <linearGradient id="bbc-bg-grad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Gold Diamond Accent */}
        <linearGradient id="bbc-gold-grad" x1="20" y1="14" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Outer Rounded Squircle Base */}
      <rect
        x="1.5"
        y="1.5"
        width="41"
        height="41"
        rx="11"
        fill="url(#bbc-bg-grad)"
        stroke="url(#bbc-accent-glow)"
        strokeWidth="1.5"
      />

      {/* Geometric Interlocking 'B' & 'C' Monogram */}
      {/* 1. Left Vertical Spine */}
      <path
        d="M13 11C13 9.89543 13.8954 9 15 9H23C26.3137 9 29 11.6863 29 15C29 17.2091 27.7909 19.1436 26 20.1436C28.2091 21.1436 30 23.3137 30 26.5C30 30.0899 27.0899 33 23.5 33H15C13.8954 33 13 32.1046 13 31V11Z"
        fill="none"
        stroke="url(#bbc-primary-grad)"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Inner Upper Loop Spine of B */}
      <path
        d="M18 15H22.5C23.8807 15 25 16.1193 25 17.5C25 18.8807 23.8807 20 22.5 20H18V15Z"
        fill="rgba(16, 185, 129, 0.15)"
        stroke="#34D399"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Inner Lower Loop Spine of B transitioning into open Cart/C arc */}
      <path
        d="M18 22H23.5C25.433 22 27 23.567 27 25.5C27 27.433 25.433 29 23.5 29H18V22Z"
        fill="rgba(16, 185, 129, 0.25)"
        stroke="#34D399"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Center Precision Verification Diamond Facet (The "Best" Mark) */}
      <path
        d="M29 12L31.5 15.5L29 19L26.5 15.5L29 12Z"
        fill="url(#bbc-gold-grad)"
      />
    </svg>
  );
}

export default function BrandLogo({
  variant = 'horizontal',
  size = 'md',
  theme = 'auto',
  className = '',
  showTagline = false,
}: BrandLogoProps) {
  const getPixelSize = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 28;
      case 'lg':
        return 44;
      case 'xl':
        return 54;
      case 'md':
      default:
        return 34;
    }
  };

  const markSize = getPixelSize();

  if (variant === 'mark') {
    return <BrandMarkSvg size={markSize} className={className} />;
  }

  const isLight = theme === 'light';
  const isDark = theme === 'dark';

  const textColor = isLight ? '#0F172A' : isDark ? '#F8FAFC' : 'var(--text-primary)';
  const secondaryColor = isLight ? '#059669' : isDark ? '#34D399' : 'var(--green-accent)';
  const subtitleColor = isLight ? '#64748B' : isDark ? '#94A3B8' : 'var(--text-muted)';

  const fontSize =
    typeof size === 'number'
      ? `${size * 0.58}px`
      : size === 'sm'
      ? '1.05rem'
      : size === 'lg'
      ? '1.55rem'
      : size === 'xl'
      ? '1.95rem'
      : '1.28rem';

  return (
    <div
      className={`brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        textDecoration: 'none',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Brand Icon Mark */}
      <BrandMarkSvg size={markSize} />

      {/* Typography Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
            fontSize,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: textColor,
          }}
        >
          <span style={{ fontWeight: 800 }}>Buy</span>
          <span style={{ fontWeight: 800, marginLeft: '0.22em' }}>Best</span>
          <span
            style={{
              fontWeight: 800,
              marginLeft: '0.22em',
              color: secondaryColor,
            }}
          >
            Cart
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              marginLeft: '3px',
              marginBottom: '2px',
            }}
          />
        </div>

        {showTagline && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: subtitleColor,
              marginTop: '0.2rem',
            }}
          >
            Independent Tech Reviews
          </span>
        )}
      </div>
    </div>
  );
}
