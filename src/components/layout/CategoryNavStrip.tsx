'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Flame,
  Scale,
  BookOpen,
} from 'lucide-react';
import DepartmentDirectDropdown from './DepartmentDirectDropdown';
import { Category } from '@/types';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface CategoryNavStripProps {
  categories?: Category[];
}

export default function CategoryNavStrip({ categories = [] }: CategoryNavStripProps) {
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (deptId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDepartment(deptId);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDepartment(null);
    }, 200); // 200ms grace window for smooth diagonal cursor glide
  };

  // Only display active top-level categories (no hardcoded fallback categories)
  const topDepartments = (categories || []).filter((c) => !c.parent_id && c.is_active);

  const selectedCategory = topDepartments.find(
    (d) => d.id === activeDepartment || d.slug === activeDepartment
  ) || null;

  const selectedSubcategories = selectedCategory
    ? (categories || []).filter((c) => c.parent_id === selectedCategory.id && c.is_active)
    : [];

  const quickLinks = [
    { label: "Today's Deals", href: '/deals', icon: Flame, highlight: true },
    { label: 'Compare Specs', href: '/compare', icon: Scale },
    { label: 'Buying Guides', href: '/guides', icon: BookOpen },
  ];

  return (
    <div
      className="category-nav-strip"
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        zIndex: 40,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.4rem 0.75rem',
          paddingTop: '0.45rem',
          paddingBottom: '0.45rem',
        }}
      >
        {/* Department Buttons Strip */}
        <div
          className="category-nav-departments"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.25rem 0.35rem',
          }}
        >
          {topDepartments.length > 0 && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginRight: '0.25rem',
                fontFamily: 'var(--font-display)',
              }}
            >
              DEPARTMENTS:
            </span>
          )}

          {topDepartments.map((dept) => {
            const IconComponent = getCategoryIcon(dept.icon, dept.slug || dept.name);
            const isHovered = activeDepartment === dept.id || activeDepartment === dept.slug;
            const deptKey = dept.id || dept.slug;

            return (
              <button
                key={deptKey}
                onMouseEnter={() => handleMouseEnter(deptKey)}
                onClick={() => setActiveDepartment(isHovered ? null : deptKey)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.78125rem',
                  fontWeight: isHovered ? 700 : 500,
                  color: isHovered ? 'var(--green-accent)' : 'var(--text-secondary)',
                  background: isHovered ? 'var(--bg-subtle)' : 'transparent',
                  borderRadius: 'var(--radius-xs)',
                  border: isHovered ? '1px solid var(--border-strong)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-display)',
                }}
              >
                <IconComponent size={13} color={isHovered ? 'var(--green-accent)' : 'var(--text-muted)'} />
                <span>{dept.name}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{isHovered ? '▲' : '▾'}</span>
              </button>
            );
          })}

          {topDepartments.length === 0 && (
            <Link
              href="/category"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <span>Explore All Departments</span>
            </Link>
          )}
        </div>

        {/* Quick Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {quickLinks.map((link, idx) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={idx}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: link.highlight ? 700 : 600,
                  color: link.highlight ? 'var(--amber-deal)' : 'var(--text-secondary)',
                  background: link.highlight ? 'var(--amber-light)' : '#FAF9F6',
                  borderRadius: 'var(--radius-xs)',
                  border: `1px solid ${link.highlight ? 'var(--amber-border)' : 'var(--border)'}`,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconComponent size={12} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Direct Dropdown for ONLY the Active Department */}
      <DepartmentDirectDropdown
        activeDepartment={activeDepartment}
        category={selectedCategory}
        subcategories={selectedSubcategories}
        onClose={() => setActiveDepartment(null)}
        onMouseEnter={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
