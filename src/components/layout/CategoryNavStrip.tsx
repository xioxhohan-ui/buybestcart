'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Flame,
  Scale,
  BookOpen,
  Cpu,
  Laptop,
  Gamepad2,
  Home,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Tent,
} from 'lucide-react';
import DepartmentDirectDropdown from './DepartmentDirectDropdown';

export default function CategoryNavStrip() {
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (deptId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDepartment(deptId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDepartment(null);
    }, 200); // 200ms grace window for smooth diagonal cursor glide
  };

  const primaryDepartments = [
    { id: 'electronics', label: 'Electronics', icon: Cpu },
    { id: 'computers', label: 'Computers', icon: Laptop },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'home', label: 'Home & Kitchen', icon: Home },
    { id: 'smarthome', label: 'Smart Home', icon: ShieldCheck },
    { id: 'beauty', label: 'Beauty', icon: Sparkles },
    { id: 'health', label: 'Wellness', icon: HeartPulse },
    { id: 'fitness', label: 'Sports', icon: Dumbbell },
    { id: 'outdoors', label: 'Outdoors', icon: Tent },
  ];

  const quickLinks = [
    { label: "Today's Deals", href: '/deals', icon: Flame, highlight: true },
    { label: 'Compare Specs', href: '/compare', icon: Scale },
    { label: 'Buying Guides', href: '/guides', icon: BookOpen },
  ];

  return (
    <div
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
          padding: '0.45rem 1.5rem',
        }}
      >
        {/* Department Buttons Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.25rem 0.35rem',
          }}
        >
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

          {primaryDepartments.map((dept) => {
            const IconComponent = dept.icon;
            const isHovered = activeDepartment === dept.id;
            return (
              <button
                key={dept.id}
                onMouseEnter={() => handleMouseEnter(dept.id)}
                onClick={() => setActiveDepartment(isHovered ? null : dept.id)}
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
                <span>{dept.label}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{isHovered ? '▲' : '▾'}</span>
              </button>
            );
          })}
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
        onClose={() => setActiveDepartment(null)}
        onMouseEnter={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
