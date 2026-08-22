'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Article, Category, ArticleType, ArticleStatus } from '@/types';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Eye,
  Sliders,
  Sparkles,
  Globe,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import SeoTitleAdvisor from '@/components/admin/SeoTitleAdvisor';

export default function AdminArticlesCMSPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'guide' as ArticleType,
    status: 'published' as ArticleStatus,
    category_id: '',
    excerpt: '',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    reading_time_minutes: 7,
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    og_image: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [artRes, catRes] = await Promise.all([
      supabase.from('articles').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, slug').order('name', { ascending: true }),
    ]);

    if (artRes.data) setArticles(artRes.data as Article[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      type: 'guide',
      status: 'published',
      category_id: categories[0]?.id || '',
      excerpt: '',
      content: '# Complete Editorial Testing Guide\n\nOur laboratory tested over 20 flagship devices to evaluate frequency response, ergonomics, and value.',
      featured_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
      reading_time_minutes: 7,
      seo_title: '',
      seo_description: '',
      canonical_url: '',
      og_image: '',
    });
    setShowModal(true);
  };

  const openEditModal = (a: Article) => {
    setEditingArticle(a);
    setFormData({
      title: a.title,
      slug: a.slug,
      type: a.type,
      status: a.status,
      category_id: a.category_id || '',
      excerpt: a.excerpt || '',
      content: a.content || '',
      featured_image: a.featured_image || '',
      reading_time_minutes: a.reading_time_minutes || 7,
      seo_title: a.seo_title || '',
      seo_description: a.seo_description || '',
      canonical_url: a.canonical_url || '',
      og_image: a.og_image || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const generatedSlug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload = {
      title: formData.title,
      slug: generatedSlug,
      type: formData.type,
      status: formData.status,
      category_id: formData.category_id || null,
      excerpt: formData.excerpt,
      content: formData.content,
      featured_image: formData.featured_image,
      reading_time_minutes: Number(formData.reading_time_minutes) || 7,
      seo_title: formData.seo_title || `${formData.title} | Buy Best Cart Editorial`,
      seo_description: formData.seo_description || formData.excerpt || `Read the complete editorial guide and laboratory reviews for ${formData.title}.`,
      canonical_url: formData.canonical_url || `https://buybestcart.shop/guides/${generatedSlug}`,
      og_image: formData.og_image || formData.featured_image,
      updated_at: new Date().toISOString(),
    };

    if (editingArticle) {
      const { error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', editingArticle.id);

      if (!error) {
        setShowModal(false);
        fetchData();
      } else {
        alert(`Error updating article: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('articles').insert({
        ...payload,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      });

      if (!error) {
        setShowModal(false);
        fetchData();
      } else {
        alert(`Error creating article: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete article "${title}"?`)) {
      await supabase.from('articles').delete().eq('id', id);
      fetchData();
    }
  };

  const filtered = articles.filter((a) => {
    return typeFilter === 'all' || a.type === typeFilter;
  });

  const effectiveSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'article-slug';
  const effectiveSeoTitle = formData.seo_title || (formData.title ? `${formData.title} | Buy Best Cart Editorial` : 'Article Title | Buy Best Cart Editorial');
  const effectiveSeoDesc = formData.seo_description || formData.excerpt || 'Read our in-depth lab testing, verified comparisons, and buying recommendations.';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="var(--green-accent)" />
            <span>Editorial CMS & SEO Optimization (8 Content Types)</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage Buying Guides, Reviews, Comparisons, Roundups, custom Google URL slugs, and SERP metadata.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Write New Article / Guide</span>
        </button>
      </div>

      {/* Content Type Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'guide', 'review', 'comparison', 'roundup', 'how_to', 'faq', 'deal_guide', 'article'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: typeFilter === t ? '1px solid var(--green-border)' : '1px solid var(--border)',
              background: typeFilter === t ? 'var(--green-light)' : 'var(--bg-surface)',
              color: typeFilter === t ? 'var(--green-accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Articles Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Article Title & Slug</th>
              <th>Category</th>
              <th>Read Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading editorial articles...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>No articles found for this content type filter.</td></tr>
            ) : (
              filtered.map((art) => (
                <tr key={art.id}>
                  <td>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-xs)', background: 'var(--green-light)', color: 'var(--green-accent)', border: '1px solid var(--green-border)', textTransform: 'uppercase' }}>
                      {art.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {art.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Route: <code>/guides/{art.slug}</code>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {art.category?.name || 'General Tech'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {art.reading_time_minutes || 7} min
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: art.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>
                      ● {art.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href={`/guides/${art.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View live article"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => openEditModal(art)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit article"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id, art.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete article"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Article Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '880px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--green-accent)" />
                <span>{editingArticle ? 'Edit Article Document & SEO' : 'Write New Article & SEO'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Noise-Cancelling Headphones of 2026: Lab Tested"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                />
              </div>

              {/* DEDICATED GOOGLE SERP & SEO METADATA CARD */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--green-accent)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Globe size={16} color="var(--green-accent)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    GOOGLE SEARCH ENGINE OPTIMIZATION (SEO) &amp; URL SLUG
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Custom URL Slug (Link: /guides/{formData.slug || 'slug'})
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. best-noise-cancelling-headphones"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: '#FFFFFF', fontFamily: 'monospace' }}
                  />
                </div>

                <SeoTitleAdvisor
                  title={formData.seo_title}
                  onChange={(newTitle) => setFormData({ ...formData, seo_title: newTitle })}
                  rawEntityTitle={formData.title}
                  slug={formData.slug}
                  pathPrefix="guides"
                  description={formData.seo_description}
                  onDescriptionChange={(newDesc) => setFormData({ ...formData, seo_description: newDesc })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Canonical URL Override
                    </label>
                    <input
                      type="url"
                      placeholder="https://buybestcart.shop/guides/..."
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.75rem', background: '#FFFFFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Open Graph (OG) Social Share Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.og_image}
                      onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.75rem', background: '#FFFFFF' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Content Type (8 Templates)
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ArticleType })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="guide">Buying Guide</option>
                    <option value="review">In-Depth Review</option>
                    <option value="comparison">Head-to-Head Comparison</option>
                    <option value="roundup">Product Roundup</option>
                    <option value="how_to">How-To Technical Guide</option>
                    <option value="deal_guide">Deals & Shopping Guide</option>
                    <option value="faq">FAQ Archive</option>
                    <option value="article">Editorial Essay</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Category Department
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="published">Published Live</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Editorial Excerpt / Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Markdown Document Body Content
                </label>
                <textarea
                  rows={7}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: 1.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Featured Image CDN URL
                </label>
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingArticle ? 'Save Article Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
