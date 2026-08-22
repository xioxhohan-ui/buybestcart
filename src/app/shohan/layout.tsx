'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Layers,
  Flame,
  Star,
  Scale,
  BookOpen,
  FileCode,
  Image as ImageIcon,
  ShieldCheck,
  Compass,
  Layout,
  ShoppingBag,
  Link2,
  Mail,
  MessageSquare,
  BarChart3,
  Search,
  FileText,
  Users,
  Settings,
  Activity,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
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

  // If on login page, don't show full admin shell
  if (pathname === '/shohan/login' || pathname === '/shohan') {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>{children}</div>;
  }

  const navSections = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/shohan/dashboard', icon: LayoutDashboard },
        { name: 'Click Analytics', href: '/shohan/analytics', icon: BarChart3 },
      ],
    },
    {
      group: 'Content Layer',
      items: [
        { name: 'Products Catalog', href: '/shohan/products', icon: Package },
        { name: 'Categories & Taxonomy', href: '/shohan/categories', icon: FolderTree },
        { name: 'Brands Directory', href: '/shohan/brands', icon: Tag },
        { name: 'Curated Collections', href: '/shohan/collections', icon: Layers },
        { name: 'Today\'s Deals', href: '/shohan/deals', icon: Flame },
        { name: 'Product Reviews', href: '/shohan/reviews', icon: Star },
        { name: 'Comparisons Matrix', href: '/shohan/comparisons', icon: Scale },
        { name: 'Blog & Buying Guides', href: '/shohan/guides', icon: BookOpen },
        { name: 'Media Library', href: '/shohan/media', icon: ImageIcon },
      ],
    },
    {
      group: 'Configuration Layer',
      items: [
        { name: 'Navigation Builder', href: '/shohan/navigation', icon: Compass },
        { name: 'Homepage Builder', href: '/shohan/homepage', icon: Layout },
        { name: 'Amazon 11 Stores', href: '/shohan/amazon', icon: ShoppingBag },
        { name: 'Affiliate Engine', href: '/shohan/affiliate', icon: Link2 },
        { name: 'SEO Engine', href: '/shohan/seo', icon: Search },
        { name: 'Legal Policies CMS', href: '/shohan/legal', icon: FileText },
        { name: 'Platform Settings', href: '/shohan/settings', icon: Settings },
      ],
    },
    {
      group: 'System Data Layer',
      items: [
        { name: 'Newsletter Audience', href: '/shohan/subscribers', icon: Mail },
        { name: 'Reader Inquiries', href: '/shohan/messages', icon: MessageSquare },
        { name: 'Users & Roles', href: '/shohan/users', icon: Users },
        { name: 'System Health & Sync', href: '/shohan/system', icon: Activity },
        { name: 'Audit & System Logs', href: '/shohan/logs', icon: ScrollText },
      ],
    },
  ];

  const renderNavLinks = (isMobile: boolean = false) => (
    <nav style={{ padding: '0.75rem 0.5rem', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {navSections.map((sec) => (
          <div key={sec.group}>
            {(!collapsed || isMobile) && (
              <div style={{ padding: '0 0.75rem 0.35rem 0.75rem', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {sec.group}
              </div>
            )}
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.15rem', padding: 0, margin: 0 }}>
              {sec.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const IconComp = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setMobileDrawerOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius)',
                        color: active ? '#ffffff' : '#94a3b8',
                        background: active ? 'var(--primary)' : 'transparent',
                        fontWeight: active ? 600 : 500,
                        fontSize: '0.8125rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <IconComp size={16} color={active ? '#ffffff' : '#94a3b8'} />
                      {(!collapsed || isMobile) && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', overflowX: 'hidden' }}>
      {/* Desktop Admin Sidebar (>1024px) */}
      <aside
        className="admin-desktop-sidebar"
        style={{
          width: collapsed ? '70px' : '260px',
          background: 'var(--secondary)',
          color: '#cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          borderRight: '1px solid #1e293b',
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && (
            <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9375rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Settings size={15} color="var(--green-gold)" />
              <span>BUY BEST CART CMS</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {renderNavLinks(false)}

        <div style={{ padding: '0.875rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
          {!collapsed && (
            <div>
              <div>Master Admin v2.0.0</div>
              <Link href="/" target="_blank" style={{ color: '#94a3b8', textDecoration: 'underline', marginTop: '0.2rem', display: 'inline-block' }}>
                ↗ Public Live Site
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Admin Sidebar Drawer (<=1024px) */}
      {mobileDrawerOpen && (
        <>
          <div
            onClick={() => setMobileDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 900,
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '85vw',
              maxWidth: '320px',
              height: '100vh',
              maxHeight: '100dvh',
              background: 'var(--secondary)',
              color: '#cbd5e1',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '6px 0 24px rgba(0,0,0,0.3)',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a' }}>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9375rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Settings size={15} color="var(--green-gold)" />
                <span>BUY BEST CART CMS</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: 'transparent', border: '1px solid #334155', borderRadius: '4px', padding: '0.35rem', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            {renderNavLinks(true)}

            <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
              <div>Master Admin v2.0.0</div>
              <Link href="/" target="_blank" style={{ color: '#94a3b8', textDecoration: 'underline', marginTop: '0.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>Public Live Site</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Admin Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '56px',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="admin-mobile-toggle"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              aria-label="Toggle Admin Navigation Menu"
            >
              <Menu size={14} />
              <span>MENU</span>
            </button>
            <span className="admin-status-badge" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', background: 'var(--success-light)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)' }}>
              Connected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/" className="btn btn-secondary btn-sm" target="_blank" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Public Site</span>
              <ExternalLink size={12} />
            </Link>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>
              S
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '1.25rem 1rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
