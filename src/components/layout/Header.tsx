'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
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
import SearchBar from '../common/SearchBar';
import RegionSelector from './RegionSelector';
import CategoryNavStrip from './CategoryNavStrip';
import AnnouncementBar from './AnnouncementBar';

interface HeaderProps {
  siteName?: string;
  announcementText?: string;
  announcementLinkText?: string;
  announcementLinkUrl?: string;
  announcementEnabled?: boolean;
}

export default function Header({
  siteName = 'Best Buy Cart',
  announcementText = 'The 2026 Tech & Lifestyle Edit — 100% Independent Reviews & Verified Regional Amazon Stock',
  announcementLinkText = 'Testing Methodology →',
  announcementLinkUrl = '/how-we-rank',
  announcementEnabled = true,
}: HeaderProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  const mobileNavCategories = [
    { label: 'Electronics', href: '/category/electronics', icon: Cpu },
    { label: 'Computers & Laptops', href: '/category/computers-laptops', icon: Laptop },
    { label: 'Gaming & VR', href: '/category/gaming', icon: Gamepad2 },
    { label: 'Home & Kitchen', href: '/category/home-kitchen', icon: Home },
    { label: 'Smart Home & Security', href: '/category/smart-home', icon: ShieldCheck },
    { label: 'Beauty & Grooming', href: '/category/beauty', icon: Sparkles },
    { label: 'Health & Wellness', href: '/category/health-wellness', icon: HeartPulse },
    { label: 'Fitness & Sports', href: '/category/sports', icon: Dumbbell },
    { label: 'Outdoors & Camping', href: '/category/outdoors', icon: Tent },
  ];

  return (
    <header className="header-wrapper">
      {/* 01. Dynamic Dismissible Announcement Bar */}
      <AnnouncementBar
        text={announcementText}
        linkText={announcementLinkText}
        linkUrl={announcementLinkUrl}
        enabled={announcementEnabled}
      />

      {/* 02. Main Editorial Masthead */}
      <div className="main-header">
        <div className="container header-inner">
          {/* Masthead Brand Logo */}
          <Link href="/" className="logo-brand">
            <span>{siteName}</span>
            <span className="logo-brand-dot">.</span>
          </Link>

          {/* Search Bar */}
          <div style={{ flex: '1 1 320px', maxWidth: '420px', minWidth: '180px', margin: '0 0.75rem' }}>
            <SearchBar />
          </div>

          {/* Main Navigation Links (Desktop) */}
          <nav>
            <ul className="nav-links">
              <li>
                <Link href="/deals" className="nav-link" style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Flame size={13} color="var(--amber-deal)" />
                  <span>Deals</span>
                </Link>
              </li>
              <li>
                <Link href="/guides" className="nav-link">
                  Buying Guides
                </Link>
              </li>
              <li>
                <Link href="/compare" className="nav-link">
                  Compare Specs
                </Link>
              </li>
              <li>
                <Link href="/how-we-rank" className="nav-link">
                  Our Standards
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right Utilities: Regional Storefront Selector & Hamburger */}
          <div className="header-actions">
            <RegionSelector />

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* 03. Category Navigation Strip with Direct 1-to-1 Dropdowns */}
      <CategoryNavStrip />

      {/* 04. Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 'var(--z-backdrop-overlay, 900)' as unknown as number,
            }}
          />
          <div
            className="mobile-drawer"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 'auto',
              width: '85vw',
              maxWidth: '380px',
              minWidth: '270px',
              height: '100vh',
              maxHeight: '100dvh',
              zIndex: 'var(--z-mobile-drawer, 1000)' as unknown as number,
              background: 'var(--bg-surface)',
              boxShadow: '-6px 0 28px rgba(0,0,0,0.18)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              paddingRight: 'env(safe-area-inset-right, 0px)',
            }}
          >
            {/* Drawer Header with Close */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700 }}>
                {siteName}<span style={{ color: 'var(--green-accent)' }}>.</span>
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>
                  DEPARTMENTS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {mobileNavCategories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={idx}
                        href={cat.href}
                        onClick={() => setMobileDrawerOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 0.75rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        <Icon size={14} color="var(--green-accent)" />
                        <span>{cat.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <Link
                  href="/deals"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="btn btn-primary"
                  style={{ justifyContent: 'center' }}
                >
                  Today&apos;s Highlighted Deals
                </Link>
                <Link
                  href="/guides"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center' }}
                >
                  2026 Buying Guides & Reviews
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center' }}
                >
                  Compare Flagships Side-by-Side
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
