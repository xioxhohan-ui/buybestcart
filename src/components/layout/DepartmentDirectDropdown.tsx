'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { isReducedMotion } from '@/lib/animation';
import { Category } from '@/types';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface DepartmentDirectDropdownProps {
  activeDepartment: string | null;
  category: Category | null;
  subcategories: Category[];
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function DepartmentDirectDropdown({
  activeDepartment,
  category,
  subcategories = [],
  onClose,
  onMouseEnter,
  onMouseLeave,
}: DepartmentDirectDropdownProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || isReducedMotion()) return;

    const ctx = gsap.context(() => {
      if (activeDepartment && category) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: -6 },
          {
            opacity: 1,
            y: 0,
            duration: 0.2,
            ease: 'power2.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeDepartment, category]);

  if (!activeDepartment || !category) {
    return null;
  }

  const IconComponent = getCategoryIcon(category.icon, category.slug || category.name);
  const overviewUrl = `/category/${category.slug}`;

  return (
    <div
      ref={containerRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="department-dropdown-portal"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderBottom: '2px solid var(--border-strong)',
        boxShadow: '0 16px 30px -8px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.05)',
        zIndex: 50,
        padding: '1.5rem 0 1.75rem 0',
      }}
    >
      <div className="container" style={{ maxWidth: '1240px' }}>
        {/* Department Header — name + icon only */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--green-light)',
              border: '1px solid var(--green-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--green-accent)',
              flexShrink: 0,
            }}
          >
            <IconComponent size={18} />
          </div>

          <Link
            href={overviewUrl}
            onClick={onClose}
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              textDecoration: 'none',
              lineHeight: 1,
            }}
          >
            {category.name}
          </Link>
        </div>

        {/* Subcategories Grid */}
        {subcategories.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.6rem',
            }}
          >
            {subcategories.map((sub) => (
              <Link
                key={sub.id || sub.slug}
                href={`/category/${sub.slug}`}
                onClick={onClose}
                style={{
                  display: 'block',
                  padding: '0.6rem 0.9rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                }}
                className="dept-sub-link"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        ) : (
          /* Department has no subcategories — show browse link */
          <Link
            href={overviewUrl}
            onClick={onClose}
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
          >
            Browse {category.name}
          </Link>
        )}
      </div>
    </div>
  );
}
