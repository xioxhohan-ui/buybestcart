import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import {
  Package,
  FolderTree,
  BookOpen,
  Star,
  Scale,
  Flame,
  Layers,
  Layout,
  Radio,
  Globe,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatPrice } from '@/lib/region';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createServerClient();

  const [productsRes, clicksRes, categoriesRes, articlesRes, dealsRes, comparisonsRes] = await Promise.all([
    supabase.from('products').select('*').order('global_rank', { ascending: true, nullsFirst: false }),
    supabase.from('affiliate_clicks').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('categories').select('id', { count: 'exact' }),
    supabase.from('articles').select('id', { count: 'exact' }),
    supabase.from('deals').select('id', { count: 'exact' }),
    supabase.from('comparisons').select('id', { count: 'exact' }),
  ]);

  const products = (productsRes.data as Product[]) || [];
  const clicks = clicksRes.data || [];
  const totalCategories = categoriesRes.count || 0;
  const totalArticles = articlesRes.count || 0;
  const totalDeals = dealsRes.count || 0;
  const totalComparisons = comparisonsRes.count || 0;

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active' || p.status === 'featured').length;
  const totalClicksCount = clicks.length;

  const quickActions = [
    { label: 'Add Product', href: '/shohan/products', icon: Package, color: 'var(--green-accent)' },
    { label: 'Add Category', href: '/shohan/categories', icon: FolderTree, color: '#2563EB' },
    { label: 'Create Guide', href: '/shohan/guides', icon: BookOpen, color: '#7C3AED' },
    { label: 'Create Review', href: '/shohan/reviews', icon: Star, color: '#D97706' },
    { label: 'Create Comparison', href: '/shohan/comparisons', icon: Scale, color: '#059669' },
    { label: 'Create Deal', href: '/shohan/deals', icon: Flame, color: '#DC2626' },
    { label: 'Add Collection', href: '/shohan/collections', icon: Layers, color: '#4F46E5' },
    { label: 'Manage Homepage', href: '/shohan/homepage', icon: Layout, color: '#0891B2' },
    { label: 'Manage Amazon', href: '/shohan/amazon', icon: Radio, color: '#D97706' },
    { label: 'Manage SEO', href: '/shohan/seo', icon: Globe, color: '#2563EB' },
    { label: 'View Analytics', href: '/shohan/analytics', icon: BarChart3, color: '#16A34A' },
  ];

  return (
    <div>
      {/* Page Title & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Master Control Center</span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--green-light)', color: 'var(--green-accent)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)', fontWeight: 800 }}>
              LIVE SUPABASE SYNC
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Single point of control: all public pages, products, categories, deals, and SEO update in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/" target="_blank" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ExternalLink size={13} />
            <span>Open Public Website</span>
          </Link>
          <Link href="/shohan/system" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Zap size={13} />
            <span>System Health</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Action Bar */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>
          ADMIN DASHBOARD QUICK ACTIONS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.625rem' }}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.75rem',
                  background: '#FAF9F6',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={action.color} />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Products
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalProducts}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>{activeProducts} live in catalog</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Departments
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCategories}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Hierarchical taxonomy</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Guides & Reviews
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalArticles}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>8 template types</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Active Deals
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-deal)' }}>{totalDeals}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Automated expiration</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Comparison Showdowns
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-accent)' }}>{totalComparisons}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Head-to-head matrices</div>
        </div>
      </div>

      {/* Two Column Layout: Top Ranked Products & Recent Referral Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '2rem' }}>
        {/* Top Products */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Flagship Ranked Products</h2>
            <Link href="/shohan/products" style={{ fontSize: '0.8125rem', color: 'var(--green-accent)', fontWeight: 700 }}>
              All Products →
            </Link>
          </div>

          <div className="admin-table-wrapper">
            <table className="editorial-table" style={{ width: '100%', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No products added to catalog yet. <Link href="/shohan/products" style={{ color: 'var(--green-accent)', fontWeight: 700 }}>Add your first product →</Link>
                    </td>
                  </tr>
                ) : (
                  products.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--green-accent)', fontSize: '0.8125rem' }}>
                          #{p.global_rank || '-'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          ASIN: <code>{p.asin}</code>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                          {formatPrice(p.price, 'USD')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: 'var(--green-accent)', fontSize: '0.75rem', padding: '0.15rem 0.4rem', background: 'var(--green-light)', borderRadius: 'var(--radius-xs)' }}>
                          {p.editorial_score}/10
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Amazon Referral Telemetry */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Amazon 11-Marketplace Engine</h2>
            <Link href="/shohan/amazon" style={{ fontSize: '0.8125rem', color: 'var(--green-accent)', fontWeight: 700 }}>
              Storefronts →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--green-accent)', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <ShieldCheck size={14} />
                <span>Single Source of Truth Active</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Updating a product in the Products Catalog immediately cascades to homepage cards, category grids, comparisons, and buying guides without duplicate entry.
              </p>
            </div>

            <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                11 International Regions Configured
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                United States, United Kingdom, Canada, Germany, France, Italy, Spain, Netherlands, Sweden, Poland, and Australia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
