'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  ExternalLink,
  BookOpen,
  Package,
  Scale,
  Eye,
  Filter,
} from 'lucide-react';
import { evaluateSeoTitle, optimizeSeoTitle } from '@/lib/seo';
import SeoTitleAdvisor from '@/components/admin/SeoTitleAdvisor';

interface SeoAuditItem {
  id: string;
  type: 'product' | 'article' | 'comparison';
  title: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  path: string;
  updated_at: string;
}

export default function AdminSEOPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'templates'>('audit');
  const [templates, setTemplates] = useState({
    default_title: 'Buy Best Cart — Independent Tech Reviews & Buying Guides',
    default_description: 'Curated, tested, and verified recommendations for laptops, headphones, and gaming hardware with direct Amazon shopping.',
    homepage_title: 'Buy Best Cart — Honest Reviews, Buying Guides & Deals (2026)',
    homepage_description: 'Discover top-rated products, in-depth comparisons, expert buying guides, and verified Amazon deals.',
    product_template: '{product_name} Review (2026)',
    category_template: 'Best {category} of 2026',
    brand_template: '{brand_name} Products & Reviews',
    article_template: '{article_title}',
    review_template: '{product_name} Review & Price',
    guide_template: 'Best {category} ({year})',
    comparison_template: '{product_a} vs {product_b}',
    default_og_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    canonical_base: 'https://buybestcart.shop',
    robots_default: 'index, follow',
  });

  const [auditItems, setAuditItems] = useState<SeoAuditItem[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'too_long' | 'short' | 'good'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [itemSuccess, setItemSuccess] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAuditData = async () => {
    setLoadingAudit(true);
    const [pRes, aRes, cRes] = await Promise.all([
      supabase.from('products').select('id, title, slug, seo_title, short_description, updated_at').in('status', ['active', 'featured', 'published']),
      supabase.from('articles').select('id, title, slug, seo_title, excerpt, updated_at').eq('status', 'published'),
      supabase.from('comparisons').select('id, title, slug, summary, updated_at').eq('status', 'published'),
    ]);

    const items: SeoAuditItem[] = [];

    if (pRes.data) {
      pRes.data.forEach((p: any) => {
        items.push({
          id: p.id,
          type: 'product',
          title: p.title,
          slug: p.slug,
          seo_title: p.seo_title || '',
          seo_description: p.short_description || '',
          path: `/products/${p.slug}`,
          updated_at: p.updated_at,
        });
      });
    }

    if (aRes.data) {
      aRes.data.forEach((a: any) => {
        items.push({
          id: a.id,
          type: 'article',
          title: a.title,
          slug: a.slug,
          seo_title: a.seo_title || '',
          seo_description: a.excerpt || '',
          path: `/guides/${a.slug}`,
          updated_at: a.updated_at,
        });
      });
    }

    if (cRes.data) {
      cRes.data.forEach((c: any) => {
        items.push({
          id: c.id,
          type: 'comparison',
          title: c.title,
          slug: c.slug,
          seo_title: c.title || '',
          seo_description: c.summary || '',
          path: `/compare/${c.slug}`,
          updated_at: c.updated_at,
        });
      });
    }

    setAuditItems(items);
    setLoadingAudit(false);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('settings').select('*').eq('key', 'seo').maybeSingle();
      if (data && data.value) {
        setTemplates((prev) => ({ ...prev, ...data.value }));
      }
    };
    fetchTemplates();
    fetchAuditData();
  }, []);

  const handleSaveTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('settings').upsert({
      key: 'seo',
      category: 'seo',
      value: templates,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    triggerRevalidation();
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpdateItemTitle = (id: string, newTitle: string) => {
    setAuditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, seo_title: newTitle } : item))
    );
  };

  const handleApplyRecommendation = (id: string, recommendedTitle: string) => {
    handleUpdateItemTitle(id, recommendedTitle);
  };

  const handleSaveSingleItem = async (item: SeoAuditItem) => {
    setSavingItem(item.id);
    const table = item.type === 'product' ? 'products' : item.type === 'article' ? 'articles' : 'comparisons';

    const { error } = await supabase
      .from(table)
      .update({
        seo_title: item.seo_title.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    setSavingItem(null);
    if (!error) {
      setItemSuccess(item.id);
      setTimeout(() => setItemSuccess(null), 3000);
    }
  };

  const handleApplyAllRecommended = () => {
    setAuditItems((prev) =>
      prev.map((item) => {
        const evalRes = evaluateSeoTitle(item.seo_title, item.title);
        if (evalRes.status === 'too_long' || !item.seo_title) {
          return { ...item, seo_title: evalRes.recommendedTitle };
        }
        return item;
      })
    );
  };

  // Filter and search audit items
  const filteredAuditItems = auditItems.filter((item) => {
    const effectiveTitle = item.seo_title || item.title;
    const evalRes = evaluateSeoTitle(effectiveTitle, item.title);

    if (auditFilter === 'too_long' && evalRes.status !== 'too_long') return false;
    if (auditFilter === 'short' && evalRes.status !== 'too_short') return false;
    if (auditFilter === 'good' && evalRes.status !== 'good') return false;

    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.seo_title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Calculate audit stats
  const totalCount = auditItems.length;
  const tooLongCount = auditItems.filter(
    (i) => evaluateSeoTitle(i.seo_title || i.title, i.title).status === 'too_long'
  ).length;
  const goodCount = auditItems.filter(
    (i) => evaluateSeoTitle(i.seo_title || i.title, i.title).status === 'good'
  ).length;

  return (
    <div style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={22} color="var(--green-accent)" />
            <span>SEO Engine &amp; Title Recommendation Suite</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Audit sitewide title lengths, optimize SERP snippets, preview Google results, and manage canonical metadata.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              background: activeTab === 'audit' ? 'var(--green-accent)' : 'transparent',
              color: activeTab === 'audit' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={14} />
            <span>Live Title Auditor ({totalCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              background: activeTab === 'templates' ? 'var(--green-accent)' : 'transparent',
              color: activeTab === 'templates' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sliders size={14} />
            <span>Templates &amp; Rules</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE TITLE AUDITOR & RECOMMENDATION ENGINE */}
      {activeTab === 'audit' && (
        <div>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Total Indexed Pages
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {totalCount}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-accent)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={12} />
                <span>Optimal (35–60 Chars)</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-accent)' }}>
                {goodCount} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>({Math.round((goodCount / (totalCount || 1)) * 100)}%)</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: `1px solid ${tooLongCount > 0 ? 'rgba(220, 38, 38, 0.4)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: tooLongCount > 0 ? '#DC2626' : 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={12} />
                <span>Too Long (&gt; 60 Chars)</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: tooLongCount > 0 ? '#DC2626' : 'var(--text-primary)' }}>
                {tooLongCount}
              </div>
            </div>
          </div>

          {/* Filter & Action Bar */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setAuditFilter('all')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: auditFilter === 'all' ? 'var(--primary)' : 'var(--bg-main)',
                  color: auditFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setAuditFilter('too_long')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: auditFilter === 'too_long' ? '#DC2626' : 'var(--bg-main)',
                  color: auditFilter === 'too_long' ? '#FFFFFF' : '#DC2626',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  cursor: 'pointer',
                }}
              >
                Too Long ({tooLongCount})
              </button>
              <button
                onClick={() => setAuditFilter('good')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: auditFilter === 'good' ? 'var(--green-accent)' : 'var(--bg-main)',
                  color: auditFilter === 'good' ? '#FFFFFF' : 'var(--green-accent)',
                  border: '1px solid var(--green-border)',
                  cursor: 'pointer',
                }}
              >
                Good ({goodCount})
              </button>
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by title or slug..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            {tooLongCount > 0 && (
              <button
                onClick={handleApplyAllRecommended}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCw size={12} />
                <span>Auto-Fix All Too Long</span>
              </button>
            )}
          </div>

          {/* Audit Items List */}
          {loadingAudit ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Scanning sitewide titles and metadata...
            </div>
          ) : filteredAuditItems.length === 0 ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center' }}>
              <CheckCircle2 size={32} color="var(--green-accent)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>No Issues Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                All filtered page titles adhere to optimal Google SERP length criteria.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredAuditItems.map((item) => {
                const currentTitle = item.seo_title || item.title;
                const evalRes = evaluateSeoTitle(currentTitle, item.title);
                const isTooLong = evalRes.status === 'too_long';
                const isShort = evalRes.status === 'too_short';
                const isSaving = savingItem === item.id;
                const isSuccess = itemSuccess === item.id;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${isTooLong ? 'rgba(220, 38, 38, 0.4)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {/* Item Type & URL Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-xs)',
                            background: item.type === 'product' ? 'rgba(59, 130, 246, 0.1)' : item.type === 'article' ? 'rgba(27, 67, 50, 0.1)' : 'rgba(147, 51, 234, 0.1)',
                            color: item.type === 'product' ? '#2563EB' : item.type === 'article' ? 'var(--green-accent)' : '#9333EA',
                            border: '1px solid currentColor',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {item.type === 'product' ? <Package size={10} /> : item.type === 'article' ? <BookOpen size={10} /> : <Scale size={10} />}
                          <span>{item.type}</span>
                        </span>

                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          https://buybestcart.shop{item.path}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {evalRes.status === 'good' ? (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: 'rgba(27, 67, 50, 0.1)',
                              color: 'var(--green-accent)',
                              border: '1px solid var(--green-border)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            ✓ Good ({currentTitle.length} chars)
                          </span>
                        ) : isTooLong ? (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: 'rgba(220, 38, 38, 0.1)',
                              color: '#DC2626',
                              border: '1px solid rgba(220, 38, 38, 0.3)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            ⚠ Too Long ({currentTitle.length} chars)
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: 'rgba(217, 119, 6, 0.1)',
                              color: '#D97706',
                              border: '1px solid rgba(217, 119, 6, 0.3)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                            }}
                          >
                            Short ({currentTitle.length} chars)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Editable SEO Title Field */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        value={item.seo_title}
                        placeholder={item.title}
                        onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          fontSize: '0.875rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${isTooLong ? '#DC2626' : 'var(--border)'}`,
                          background: 'var(--bg-main)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveSingleItem(item)}
                        className="btn btn-primary btn-sm"
                        style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Save size={12} />
                        <span>{isSaving ? 'Saving...' : isSuccess ? 'Saved ✓' : 'Save Title'}</span>
                      </button>
                    </div>

                    {/* Recommendation Quick-Apply Bar */}
                    {evalRes.recommendedTitle && evalRes.recommendedTitle !== currentTitle && (
                      <div
                        style={{
                          background: 'var(--bg-main)',
                          border: '1px dashed var(--border)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.5rem 0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          fontSize: '0.8125rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--green-accent)', marginRight: '0.5rem' }}>
                            Recommended ({evalRes.recommendedTitle.length} chars):
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>{evalRes.recommendedTitle}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyRecommendation(item.id, evalRes.recommendedTitle)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
                        >
                          Apply Recommendation
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GLOBAL TEMPLATES & DEFAULTS */}
      {activeTab === 'templates' && (
        <form onSubmit={handleSaveTemplates} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {saved && (
            <div style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.875rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>SEO templates saved successfully to Supabase.</span>
            </div>
          )}

          {/* Global Defaults */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Global Site Titles &amp; Open Graph</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Default Site Title Tag (Target: 50–60 chars)
                </label>
                <input
                  type="text"
                  value={templates.default_title}
                  onChange={(e) => setTemplates({ ...templates, default_title: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {templates.default_title.length}/60 chars
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Homepage SEO Title
                </label>
                <input
                  type="text"
                  value={templates.homepage_title}
                  onChange={(e) => setTemplates({ ...templates, homepage_title: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  {templates.homepage_title.length}/60 chars
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Default Meta Description (Target: 140–160 chars)
                </label>
                <textarea
                  rows={2}
                  value={templates.default_description}
                  onChange={(e) => setTemplates({ ...templates, default_description: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Default Open Graph (OG) Image URL
                  </label>
                  <input
                    type="url"
                    value={templates.default_og_image}
                    onChange={(e) => setTemplates({ ...templates, default_og_image: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Robots Default Directive
                  </label>
                  <input
                    type="text"
                    value={templates.robots_default}
                    onChange={(e) => setTemplates({ ...templates, robots_default: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save All SEO Settings'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
