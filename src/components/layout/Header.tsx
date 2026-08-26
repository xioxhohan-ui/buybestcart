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
  Headphones,
  Laptop,
  Gamepad2,
  Home,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Tent,
  ChevronDown,
  ChevronUp,
  Info,
  Mail,
  Search,
} from 'lucide-react';
import { Category } from '@/types';
import { getCategoryIcon } from '@/lib/categoryIcons';
import SearchBar from '../common/SearchBar';
import BrandLogo from '../common/BrandLogo';
import RegionSelector from './RegionSelector';
import CurrencySelector from './CurrencySelector';
import CategoryNavStrip from './CategoryNavStrip';
import AnnouncementBar from './AnnouncementBar';

interface HeaderProps {
  siteName?: string;
  announcementText?: string;
  announcementLinkText?: string;
  announcementLinkUrl?: string;
  announcementEnabled?: boolean;
  categories?: Category[];
}

export default function Header({
  siteName = 'Buy Best Cart',
  announcementText = 'The 2026 Tech & Lifestyle Edit — 100% Independent Reviews & Verified Regional Amazon Stock',
  announcementLinkText = 'Testing Methodology →',
  announcementLinkUrl = '/how-we-rank',
  announcementEnabled = true,
  categories = [],
}: HeaderProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [departmentsExpanded, setDepartmentsExpanded] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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

  // Escape key handler & Resize listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 100% Dynamic Database-Driven Categories for Mobile Navigation (Zero Hardcoded)
  const parentCategories = (categories || []).filter((c) => !c.parent_id && c.is_active);

  const mobileNavCategories = parentCategories.map((parent) => {
    const subs = (categories || []).filter((c) => c.parent_id === parent.id && c.is_active);
    return {
      id: parent.id || parent.slug,
      label: parent.name,
      href: `/category/${parent.slug}`,
      icon: getCategoryIcon(parent.icon, parent.slug || parent.name),
      subcategories: subs.map((sub) => ({
        name: sub.name,
        href: `/category/${sub.slug}`,
      })),
    };
  });

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
          <Link href="/" style={{ textDecoration: 'none' }} title="Buy Best Cart — Home">
            <BrandLogo size="md" />
          </Link>

          {/* Full Search Bar (Desktop) */}
          <div className="desktop-search-container">
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

          {/* Right Utilities: Mobile Search Icon + Single Currency Selector + Regional Selector (Desktop) + Burger Menu (Mobile) */}
          <div className="header-actions">
            {/* Mobile Search Icon Trigger */}
            <button
              type="button"
              className="mobile-search-trigger-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Search"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0.35rem',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={20} />
            </button>

            {/* SINGLE Currency Selector (Applies across Mobile Icon & Desktop Label modes) */}
            <CurrencySelector />

            {/* Desktop Regional Storefront Selector */}
            <div className="desktop-region-container">
              <RegionSelector />
            </div>

            {/* Universal Burger Menu Trigger Button (Visible <=1024px, Hidden >1024px) */}
            <button
              className="burger-menu-btn"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="burger-menu-label" style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>MENU</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {mobileSearchOpen && (
          <div
            className="mobile-search-overlay-bar"
            style={{
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border)',
              padding: '0.75rem 1rem',
              boxShadow: 'var(--shadow)',
            }}
          >
            <SearchBar autoFocus onResultClick={() => setMobileSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* 03. Category Navigation Strip with Direct 1-to-1 Dropdowns */}
      <CategoryNavStrip categories={categories} />

      {/* 04. Universal Navigation Side Drawer */}
      {mobileDrawerOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setMobileDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 900,
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
              minWidth: '280px',
              height: '100vh',
              maxHeight: '100dvh',
              zIndex: 1000,
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
              padding: '1.125rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-subtle)',
            }}>
              <BrandLogo size="sm" />
              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  touchAction: 'manipulation',
                }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {/* Compact Drawer Search Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <SearchBar onResultClick={() => setMobileDrawerOpen(false)} />
              </div>

              {/* Accordion Departments Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  onClick={() => setDepartmentsExpanded(!departmentsExpanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '0.25rem 0',
                    cursor: 'pointer',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    ALL DEPARTMENTS & HUBS
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {departmentsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </button>

                {departmentsExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {mobileNavCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isExpanded = expandedCategory === cat.id;
                      return (
                        <div
                          key={cat.id}
                          style={{
                            background: 'var(--bg-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.625rem 0.75rem',
                            }}
                          >
                            <Link
                              href={cat.href}
                              onClick={() => setMobileDrawerOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                textDecoration: 'none',
                                flex: 1,
                              }}
                            >
                              <Icon size={15} color="var(--green-accent)" />
                              <span>{cat.label}</span>
                            </Link>
                            {cat.subcategories && cat.subcategories.length > 0 && (
                              <button
                                onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  padding: '0.2rem 0.4rem',
                                  cursor: 'pointer',
                                  color: 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                aria-label={`Toggle ${cat.label} subcategories`}
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            )}
                          </div>

                          {/* Subcategories Accordion List */}
                          {isExpanded && cat.subcategories && (
                            <div
                              style={{
                                borderTop: '1px solid var(--border)',
                                background: 'var(--bg-surface)',
                                padding: '0.5rem 0.75rem 0.625rem 2.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.4rem',
                              }}
                            >
                              {cat.subcategories.map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  href={sub.href}
                                  onClick={() => setMobileDrawerOpen(false)}
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    display: 'block',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  • {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Editorial & Quick Utilities */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                  QUICK DISCOVERY
                </div>
                <Link
                  href="/deals"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', fontSize: '0.8125rem', gap: '0.4rem' }}
                >
                  <Flame size={14} />
                  <span>Today&apos;s Highlighted Deals</span>
                </Link>
                <Link
                  href="/guides"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', fontSize: '0.8125rem', gap: '0.4rem' }}
                >
                  <BookOpen size={14} />
                  <span>2026 Buying Guides & Reviews</span>
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', fontSize: '0.8125rem', gap: '0.4rem' }}
                >
                  <Scale size={14} />
                  <span>Compare Flagships Side-by-Side</span>
                </Link>
                <Link
                  href="/how-we-rank"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  <ShieldCheck size={15} color="var(--green-accent)" />
                  <span>Our Testing Methodology</span>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  <Info size={15} color="var(--green-accent)" />
                  <span>About the Publication</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  <Mail size={15} color="var(--green-accent)" />
                  <span>Contact Editorial Staff</span>
                </Link>
              </div>

              {/* Regional Amazon Endpoint Selector inside Drawer */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AMAZON ENDPOINT REGION
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Storefront:</span>
                  <RegionSelector />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
