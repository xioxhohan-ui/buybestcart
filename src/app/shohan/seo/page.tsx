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
  FolderTree,
  Eye,
  Filter,
  Check,
  Zap,
} from 'lucide-react';
import { evaluateMetadataHealth, generateProductMetadata, generateCategoryMetadata, generateArticleMetadata, generateComparisonMetadata } from '@/lib/metadata';

interface SeoAuditItem {
  id: string;
  type: 'product' | 'article' | 'comparison' | 'category';
  title: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  path: string;
  updated_at: string;
  rawItem?: any;
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
  const [auditFilter, setAuditFilter] = useState<'all' | 'duplicates' | 'missing' | 'too_long' | 'short' | 'good'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [itemSuccess, setItemSuccess] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAuditData = async () => {
    setLoadingAudit(true);
    const [pRes, aRes, cRes, catRes] = await Promise.all([
      supabase.from('products').select('*').in('status', ['active', 'featured', 'published']),
      supabase.from('articles').select('*').eq('status', 'published'),
      supabase.from('comparisons').select('*').eq('status', 'published'),
      supabase.from('categories').select('*').eq('is_active', true),
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
          seo_description: p.seo_description || p.short_description || '',
          path: `/products/${p.slug}`,
          updated_at: p.updated_at,
          rawItem: p,
        });
      });
    }

    if (catRes.data) {
      catRes.data.forEach((c: any) => {
        items.push({
          id: c.id,
          type: 'category',
          title: c.name,
          slug: c.slug,
          seo_title: c.seo_title || '',
          seo_description: c.seo_description || c.description || '',
          path: `/category/${c.slug}`,
          updated_at: c.updated_at,
          rawItem: c,
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
          seo_description: a.seo_description || a.excerpt || '',
          path: `/guides/${a.slug}`,
          updated_at: a.updated_at,
          rawItem: a,
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
          seo_title: c.seo_title || c.title || '',
          seo_description: c.seo_description || c.summary || '',
          path: `/compare/${c.slug}`,
          updated_at: c.updated_at,
          rawItem: c,
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

  const handleUpdateItem = (id: string, updates: Partial<SeoAuditItem>) => {
    setAuditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleAutoOptimizeItem = (item: SeoAuditItem) => {
    let auto: { title: string; description: string };
    if (item.type === 'product') {
      auto = generateProductMetadata(item.rawItem || { title: item.title, slug: item.slug });
    } else if (item.type === 'category') {
      auto = generateCategoryMetadata(item.rawItem || { name: item.title, slug: item.slug });
    } else if (item.type === 'article') {
      auto = generateArticleMetadata(item.rawItem || { title: item.title, slug: item.slug });
    } else {
      auto = generateComparisonMetadata(item.rawItem || { title: item.title, slug: item.slug });
    }

    handleUpdateItem(item.id, {
      seo_title: auto.title,
      seo_description: auto.description,
    });
  };

  const handleSaveSingleItem = async (item: SeoAuditItem) => {
    setSavingItem(item.id);
    const table =
      item.type === 'product'
        ? 'products'
        : item.type === 'category'
        ? 'categories'
        : item.type === 'article'
        ? 'articles'
        : 'comparisons';

    const { error } = await supabase
      .from(table)
      .update({
        seo_title: item.seo_title.trim(),
        seo_description: item.seo_description.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    setSavingItem(null);
    if (!error) {
      setItemSuccess(item.id);
      triggerRevalidation();
      setTimeout(() => setItemSuccess(null), 3000);
    } else {
      alert(`Error updating SEO metadata: ${error.message}`);
    }
  };

  const handleBatchAutoOptimize = () => {
    setAuditItems((prev) =>
      prev.map((item) => {
        let auto: { title: string; description: string };
        if (item.type === 'product') {
          auto = generateProductMetadata(item.rawItem || { title: item.title, slug: item.slug });
        } else if (item.type === 'category') {
          auto = generateCategoryMetadata(item.rawItem || { name: item.title, slug: item.slug });
        } else if (item.type === 'article') {
          auto = generateArticleMetadata(item.rawItem || { title: item.title, slug: item.slug });
        } else {
          auto = generateComparisonMetadata(item.rawItem || { title: item.title, slug: item.slug });
        }
        return {
          ...item,
          seo_title: auto.title,
          seo_description: auto.description,
        };
      })
    );
  };

  // Duplicate detection across loaded items
  const titleCounts = new Map<string, number>();
  const descCounts = new Map<string, number>();

  auditItems.forEach((i) => {
    const t = (i.seo_title || i.title).trim().toLowerCase();
    const d = i.seo_description.trim().toLowerCase();
    if (t) titleCounts.set(t, (titleCounts.get(t) || 0) + 1);
    if (d && d.length > 20) descCounts.set(d, (descCounts.get(d) || 0) + 1);
  });

  // Filter and search audit items
  const filteredAuditItems = auditItems.filter((item) => {
    const effectiveTitle = item.seo_title || item.title;
    const health = evaluateMetadataHealth(effectiveTitle, item.seo_description);
    const isDupTitle = (titleCounts.get(effectiveTitle.trim().toLowerCase()) || 0) > 1;
    const isDupDesc = item.seo_description.trim().length > 20 && (descCounts.get(item.seo_description.trim().toLowerCase()) || 0) > 1;

    if (auditFilter === 'duplicates' && !isDupTitle && !isDupDesc) return false;
    if (auditFilter === 'missing' && health.titleStatus !== 'missing' && health.descStatus !== 'missing') return false;
    if (auditFilter === 'too_long' && health.titleStatus !== 'too_long' && health.descStatus !== 'too_long') return false;
    if (auditFilter === 'short' && health.titleStatus !== 'too_short' && health.descStatus !== 'too_short') return false;
    if (auditFilter === 'good' && (!health.isOptimal || isDupTitle || isDupDesc)) return false;

    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.seo_title.toLowerCase().includes(q) ||
        item.seo_description.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Calculate audit metrics
  const totalCount = auditItems.length;
  let uniqueTitlesCount = 0;
  let duplicateTitlesCount = 0;
  let missingTitlesCount = 0;
  let uniqueDescCount = 0;
  let duplicateDescCount = 0;
  let missingDescCount = 0;
  let reviewRequiredCount = 0;

  auditItems.forEach((i) => {
    const t = (i.seo_title || i.title).trim().toLowerCase();
    const d = i.seo_description.trim().toLowerCase();
    const h = evaluateMetadataHealth(i.seo_title || i.title, i.seo_description);

    if (!t) missingTitlesCount++;
    else if ((titleCounts.get(t) || 0) > 1) duplicateTitlesCount++;
    else uniqueTitlesCount++;

    if (!d) missingDescCount++;
    else if (d.length > 20 && (descCounts.get(d) || 0) > 1) duplicateDescCount++;
    else uniqueDescCount++;

    if (!h.isOptimal || (titleCounts.get(t) || 0) > 1 || (d.length > 20 && (descCounts.get(d) || 0) > 1)) {
      reviewRequiredCount++;
    }
  });

  return (
    <div style={{ maxWidth: '1100px', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={22} color="var(--green-accent)" />
            <span>SEO Metadata Audit &amp; SERP Recommendation Studio</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Audit sitewide unique titles, descriptions, duplicate detection, and automated Google snippet optimization.
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
            <span>Sitewide Metadata Auditor ({totalCount})</span>
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
            <span>Global Defaults &amp; Patterns</span>
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div>
          {/* Metadata Health Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Indexable Pages</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{totalCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All live content</div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unique Titles</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-accent)', marginTop: '0.2rem' }}>{uniqueTitlesCount}</div>
              <div style={{ fontSize: '0.75rem', color: duplicateTitlesCount > 0 ? '#DC2626' : 'var(--text-muted)' }}>
                {duplicateTitlesCount} Duplicates / {missingTitlesCount} Missing
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unique Descriptions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-accent)', marginTop: '0.2rem' }}>{uniqueDescCount}</div>
              <div style={{ fontSize: '0.75rem', color: duplicateDescCount > 0 ? '#DC2626' : 'var(--text-muted)' }}>
                {duplicateDescCount} Duplicates / {missingDescCount} Missing
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action Required</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: reviewRequiredCount > 0 ? 'var(--amber-deal)' : 'var(--green-accent)', marginTop: '0.2rem' }}>
                {reviewRequiredCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {reviewRequiredCount === 0 ? 'All metadata optimal' : 'Pages requiring review'}
              </div>
            </div>
          </div>

          {/* Search, Filter Bar & Batch Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search page title, slug, or meta keywords..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.15rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                {(['all', 'duplicates', 'missing', 'too_long', 'short', 'good'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setAuditFilter(filterKey)}
                    style={{
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: auditFilter === filterKey ? 700 : 500,
                      background: auditFilter === filterKey ? 'var(--bg-main)' : 'transparent',
                      color: auditFilter === filterKey ? 'var(--primary)' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {filterKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleBatchAutoOptimize}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                title="Synthesize clean titles & descriptions for all items"
              >
                <Zap size={13} color="var(--amber-deal)" />
                <span>Auto-Synthesize All</span>
              </button>

              <button
                type="button"
                onClick={fetchAuditData}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
              >
                <RefreshCw size={13} />
                <span>Refresh Audit</span>
              </button>
            </div>
          </div>

          {/* Audit List Table */}
          {loadingAudit ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem' }} />
              <div>Running sitewide SEO metadata audit...</div>
            </div>
          ) : filteredAuditItems.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <CheckCircle2 size={32} color="var(--green-accent)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No Issues Found</div>
              <div style={{ fontSize: '0.8125rem' }}>
                {auditItems.length === 0 ? 'No active content in the catalog yet.' : 'All metadata matches the selected filter perfectly.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredAuditItems.map((item) => {
                const effectiveTitle = item.seo_title || item.title;
                const health = evaluateMetadataHealth(effectiveTitle, item.seo_description);
                const isDupTitle = (titleCounts.get(effectiveTitle.trim().toLowerCase()) || 0) > 1;
                const isDupDesc = item.seo_description.trim().length > 20 && (descCounts.get(item.seo_description.trim().toLowerCase()) || 0) > 1;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${isDupTitle || isDupDesc ? 'rgba(220, 38, 38, 0.4)' : health.isOptimal ? 'var(--border)' : 'rgba(245, 158, 11, 0.4)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {/* Item Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: item.type === 'product' ? 'var(--primary-subtle)' : item.type === 'article' ? '#EDE9FE' : item.type === 'category' ? '#DCFCE7' : '#FEF3C7',
                            color: item.type === 'product' ? 'var(--primary)' : item.type === 'article' ? '#6D28D9' : item.type === 'category' ? '#15803D' : '#D97706',
                          }}
                        >
                          {item.type}
                        </span>

                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>

                        <a
                          href={item.path}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}
                        >
                          <span>{item.path}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleAutoOptimizeItem(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Sparkles size={11} />
                          <span>Synthesize</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveSingleItem(item)}
                          disabled={savingItem === item.id}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {savingItem === item.id ? <RefreshCw className="animate-spin" size={11} /> : itemSuccess === item.id ? <Check size={11} /> : <Save size={11} />}
                          <span>{itemSuccess === item.id ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Duplicate Alerts */}
                    {(isDupTitle || isDupDesc) && (
                      <div style={{ marginBottom: '0.75rem', padding: '0.45rem 0.65rem', background: 'rgba(220, 38, 38, 0.08)', borderRadius: '4px', fontSize: '0.75rem', color: '#DC2626', display: 'flex', gap: '0.75rem' }}>
                        {isDupTitle && <span>⚠️ <strong>Duplicate Title:</strong> Title is shared by multiple pages</span>}
                        {isDupDesc && <span>⚠️ <strong>Duplicate Description:</strong> Description is shared by multiple pages</span>}
                      </div>
                    )}

                    {/* Inputs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1rem' }}>
                      {/* Title Edit */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>SEO Title Tag</span>
                          <span style={{ color: health.titleStatus === 'good' ? 'var(--green-accent)' : health.titleStatus === 'too_long' ? '#DC2626' : 'var(--amber-deal)', fontWeight: 600 }}>
                            {health.titleLength} / 60 chars
                          </span>
                        </div>
                        <input
                          type="text"
                          value={item.seo_title}
                          onChange={(e) => handleUpdateItem(item.id, { seo_title: e.target.value })}
                          placeholder={item.title}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      {/* Description Edit */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Meta Description</span>
                          <span style={{ color: health.descStatus === 'good' ? 'var(--green-accent)' : health.descStatus === 'too_long' ? '#DC2626' : 'var(--amber-deal)', fontWeight: 600 }}>
                            {health.descLength} / 160 chars
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={item.seo_description}
                          onChange={(e) => handleUpdateItem(item.id, { seo_description: e.target.value })}
                          placeholder="Informative description..."
                          style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', lineHeight: 1.4 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: TEMPLATES & GLOBAL PATTERNS */
        <form onSubmit={handleSaveTemplates} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="var(--green-accent)" />
            <span>Global SEO Title &amp; Description Patterns</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Default Site Title
              </label>
              <input
                type="text"
                value={templates.default_title}
                onChange={(e) => setTemplates({ ...templates, default_title: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Default Meta Description
              </label>
              <textarea
                rows={3}
                value={templates.default_description}
                onChange={(e) => setTemplates({ ...templates, default_description: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Product Title Pattern
                </label>
                <input
                  type="text"
                  value={templates.product_template}
                  onChange={(e) => setTemplates({ ...templates, product_template: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Category Title Pattern
                </label>
                <input
                  type="text"
                  value={templates.category_template}
                  onChange={(e) => setTemplates({ ...templates, category_template: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                {saving ? <RefreshCw className="animate-spin" size={13} /> : saved ? <Check size={13} /> : <Save size={13} />}
                <span>{saved ? 'Saved Successfully' : 'Save Global Patterns'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
