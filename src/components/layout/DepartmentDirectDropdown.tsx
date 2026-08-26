'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ArrowRight, X, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
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
            duration: 0.22,
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
        boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
        zIndex: 50,
        padding: '1.75rem 0 2rem 0',
      }}
    >
      <div className="container" style={{ maxWidth: '1240px' }}>
        {/* Department Masthead Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
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
              <IconComponent size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: 'var(--green-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Verified Department
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>•</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  2026 Testing Database
                </span>
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                }}
              >
                {category.name}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              href={overviewUrl}
              onClick={onClose}
              className="btn btn-primary btn-sm"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>Explore {category.name} Department</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.45rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close dropdown"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Subcategories Grid or Overview Card */}
        {subcategories.length > 0 ? (
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Layers size={13} color="var(--green-accent)" />
              <span>Curated Sub-Categories &amp; Product Types</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.85rem',
              }}
            >
              {subcategories.map((sub) => (
                <Link
                  key={sub.id || sub.slug}
                  href={`/category/${sub.slug}`}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover:border-green-accent hover:bg-white"
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {sub.name}
                  </span>
                  <ArrowUpRight size={14} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ maxWidth: '680px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--green-accent)', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                <Sparkles size={14} />
                <span>Editorial Department Overview</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
                {category.description || `Browse tested products, hands-on acoustic and performance benchmarks, and verified Amazon deals for ${category.name}.`}
              </p>
            </div>

            <Link
              href={overviewUrl}
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem 1rem', fontWeight: 700 }}
            >
              View Full Department Hub →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
