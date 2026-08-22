'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Article, Category, TopProductItem, ArticleVideo, ArticleStatus } from '@/types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Video,
  User,
  Tag,
  Calendar,
  Layers,
  Heading,
  Bold,
  Italic,
  List,
  Quote,
  Table as TableIcon,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import TopProductsManager from '@/components/admin/TopProductsManager';
import VideoEmbedManager from '@/components/admin/VideoEmbedManager';
import SeoTitleAdvisor from '@/components/admin/SeoTitleAdvisor';
import TopProductsSection from '@/components/guides/TopProductsSection';
import ArticleContentRenderer from '@/components/guides/ArticleContentRenderer';

export default function AdminBlogGuidesPage() {
  const [guides, setGuides] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'top_products' | 'videos' | 'seo' | 'author'>('content');

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    category_id: string;
    excerpt: string;
    content: string;
    featured_image: string;
    status: ArticleStatus;
    content_type: string;
    reading_time_minutes: number;
    publish_date: string;
    author_name: string;
    author_role: string;
    author_avatar: string;
    tags: string[];
    seo_title: string;
    seo_description: string;
    canonical_url: string;
    top_products: TopProductItem[];
    videos: ArticleVideo[];
  }>({
    title: '',
    slug: '',
    category_id: '',
    excerpt: '',
    content: '',
    featured_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    content_type: 'buying_guide',
    reading_time_minutes: 7,
    publish_date: new Date().toISOString().split('T')[0],
    author_name: 'Editorial Testing Staff',
    author_role: 'Senior Tech & Hardware Analyst',
    author_avatar: '',
    tags: ['Tech', 'Buying Guide', 'Amazon Deals'],
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    top_products: [],
    videos: [],
  });

  const fetchData = async () => {
    setLoading(true);
    const [guideRes, catRes] = await Promise.all([
      supabase.from('articles').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('id, name, slug').order('name', { ascending: true }),
    ]);

    if (guideRes.data) setGuides(guideRes.data as Article[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingGuide(null);
    setFormData({
      title: '',
      slug: '',
      category_id: categories[0]?.id || '',
      excerpt: '',
      content: '## Executive Summary & Testing Methodology\n\nWe spent over 40 hours testing these products in our lab to identify the best options for performance, battery life, and overall value.\n\n### Why You Can Trust Our Lab\n\nOur testing engineers evaluate build quality, thermal throttling, real-world acoustics, and software stability without vendor interference.',
      featured_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      content_type: 'buying_guide',
      reading_time_minutes: 7,
      publish_date: new Date().toISOString().split('T')[0],
      author_name: 'Editorial Testing Staff',
      author_role: 'Senior Tech & Hardware Analyst',
      author_avatar: '',
      tags: ['Hardware', 'Buying Guide', '2026 Picks'],
      seo_title: '',
      seo_description: '',
      canonical_url: '',
      top_products: [],
      videos: [],
    });
    setActiveTab('content');
    setShowModal(true);
  };

  const openEditModal = (g: Article) => {
    setEditingGuide(g);
    setFormData({
      title: g.title || '',
      slug: g.slug || '',
      category_id: g.category_id || (categories[0]?.id || ''),
      excerpt: g.excerpt || '',
      content: g.content || g.body || '',
      featured_image: g.featured_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      status: g.status || 'published',
      content_type: g.content_type || 'buying_guide',
      reading_time_minutes: g.reading_time_minutes || 7,
      publish_date: g.publish_date ? new Date(g.publish_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      author_name: g.author_name || 'Editorial Testing Staff',
      author_role: g.author_role || 'Senior Tech & Hardware Analyst',
      author_avatar: g.author_avatar || '',
      tags: g.tags || ['Tech', 'Buying Guide'],
      seo_title: g.seo_title || '',
      seo_description: g.seo_description || '',
      canonical_url: g.canonical_url || '',
      top_products: g.top_products || [],
      videos: g.videos || [],
    });
    setActiveTab('content');
    setShowModal(true);
  };

  const handleInsertSnippet = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + snippet,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please enter an article title.');
      return;
    }

    const cleanSlug =
      formData.slug.trim() ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload = {
      title: formData.title,
      slug: cleanSlug,
      category_id: formData.category_id || null,
      excerpt: formData.excerpt,
      content: formData.content,
      body: formData.content, // sync both body & content for backward compatibility
      featured_image: formData.featured_image,
      status: formData.status,
      content_type: formData.content_type,
      reading_time_minutes: Number(formData.reading_time_minutes) || 7,
      publish_date: new Date(formData.publish_date).toISOString(),
      published_at: new Date(formData.publish_date).toISOString(),
      author_name: formData.author_name,
      author_role: formData.author_role,
      author_avatar: formData.author_avatar,
      tags: formData.tags,
      seo_title: formData.seo_title || `${formData.title} (2026) | Buy Best Cart`,
      seo_description: formData.seo_description || formData.excerpt,
      canonical_url: formData.canonical_url || `https://buybestcart.shop/guides/${cleanSlug}`,
      top_products: formData.top_products,
      videos: formData.videos,
      schema_type: 'Article',
      updated_at: new Date().toISOString(),
    };

    if (editingGuide) {
      const { error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', editingGuide.id);

      if (!error) {
        setShowModal(false);
        fetchData();
        triggerRevalidation();
      } else {
        alert(`Error updating article: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('articles').insert({
        ...payload,
        views_count: 0,
      });

      if (!error) {
        setShowModal(false);
        fetchData();
        triggerRevalidation();
      } else {
        alert(`Error creating article: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await supabase.from('articles').delete().eq('id', id);
      fetchData();
      triggerRevalidation();
    }
  };

  const filtered = guides.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase()) ||
      (g.excerpt && g.excerpt.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Page Header */}
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
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <BookOpen size={24} color="var(--green-accent)" />
            <span>Blog &amp; Buying Guides CMS</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Create and manage editorial buying guides, Top 5 to Top 20+ ranked product showdowns, embedded video reviews, and rich SEO articles.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/guides" target="_blank" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
            <ExternalLink size={14} />
            <span>View Public Guides</span>
          </Link>
          <button
            onClick={openAddModal}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}
          >
            <Plus size={16} />
            <span>Create New Guide</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Published Guides</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-accent)', marginTop: '0.25rem' }}>
            {guides.filter((g) => g.status === 'published').length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guides with Top Picks</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {guides.filter((g) => g.top_products && g.top_products.length > 0).length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Drafts / Scheduled</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-deal)', marginTop: '0.25rem' }}>
            {guides.filter((g) => g.status === 'draft').length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Articles</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {guides.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1.25rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search guides by title, slug, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
          >
            <option value="all">All Statuses ({guides.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Guides Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '0.875rem 1.25rem' }}>Guide Title / Slug</th>
              <th style={{ padding: '0.875rem 1rem' }}>Category</th>
              <th style={{ padding: '0.875rem 1rem' }}>Top Products</th>
              <th style={{ padding: '0.875rem 1rem' }}>Author</th>
              <th style={{ padding: '0.875rem 1rem' }}>Status</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading buying guides and articles...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No buying guides found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((g) => {
                const topCount = g.top_products?.length || 0;
                const videoCount = g.videos?.length || 0;

                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-slate-50">
                    {/* Title & Slug */}
                    <td style={{ padding: '1rem 1.25rem', maxWidth: '380px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {g.featured_image && (
                          <img
                            src={g.featured_image}
                            alt=""
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', background: '#0F172A', flexShrink: 0 }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem', lineHeight: 1.3 }}>
                            {g.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>/guides/{g.slug}</span>
                            {videoCount > 0 && (
                              <span style={{ color: 'var(--green-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                                <Video size={11} /> {videoCount} video{videoCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <span style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {g.category?.name || 'General'}
                      </span>
                    </td>

                    {/* Top Products */}
                    <td style={{ padding: '1rem' }}>
                      {topCount > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800 }}>
                          <Sparkles size={12} />
                          <span>Top {topCount} Picks</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None (Standard Article)</span>
                      )}
                    </td>

                    {/* Author */}
                    <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <div>{g.author_name || 'Editorial Staff'}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{g.author_role || 'Staff Analyst'}</div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-xs)',
                          background: g.status === 'published' ? 'var(--green-light)' : '#F1F5F9',
                          color: g.status === 'published' ? 'var(--green-deep)' : '#64748B',
                          border: g.status === 'published' ? '1px solid var(--green-border)' : '1px solid #CBD5E1',
                        }}
                      >
                        {g.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Link
                          href={`/guides/${g.slug}`}
                          target="_blank"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title="View on Live Website"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => openEditModal(g)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title="Edit Guide"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id, g.title)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                          title="Delete Guide"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT / CREATE MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '1000px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {editingGuide ? `Edit Guide: ${formData.title || 'Untitled'}` : 'Create New Blog Post / Buying Guide'}
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Complete editor with Top Ranked Picks, Video Embeds, Author Bio, and Live SEO Controls.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Eye size={14} />
                  <span>Live Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Tab Strip */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '0 1.75rem' }}>
              {[
                { id: 'content', label: '1. Main Content & Editor', icon: BookOpen },
                { id: 'top_products', label: `2. Top Products (${formData.top_products.length})`, icon: Sparkles },
                { id: 'videos', label: `3. Videos & Media (${formData.videos.length})`, icon: Video },
                { id: 'seo', label: '4. SEO & Metadata', icon: Search },
                { id: 'author', label: '5. Author & Publishing', icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.875rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--green-accent)' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === tab.id ? 'var(--green-accent)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 800 : 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* TAB 1: MAIN CONTENT & EDITOR */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Title & Slug */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Article / Guide Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. The Best Noise-Canceling Headphones of 2026"
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.9375rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        URL Slug (Auto-generated)
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="best-noise-canceling-headphones-2026"
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  </div>

                  {/* Category & Excerpt */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Primary Category *
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)' }}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Featured Image Cover URL
                      </label>
                      <input
                        type="url"
                        value={formData.featured_image}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  </div>

                  {/* Short Excerpt */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Short Editorial Excerpt (1-2 sentences)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Comprehensive testing breakdown of top active noise cancelling models evaluated by our lab engineers."
                      style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  {/* Rich Text Editor Toolbar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        Full Article Content / Body (Markdown &amp; Video Embeds Supported)
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formData.content.length} characters
                      </span>
                    </div>

                    {/* Toolbar buttons */}
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderBottom: 'none', borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0', padding: '0.4rem 0.6rem', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => handleInsertSnippet('\n## Section Heading\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} title="Insert H2 Heading">
                        H2
                      </button>
                      <button type="button" onClick={() => handleInsertSnippet('\n### Sub-Heading\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} title="Insert H3 Heading">
                        H3
                      </button>
                      <button type="button" onClick={() => handleInsertSnippet('**bold text**')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} title="Bold">
                        <b>B</b>
                      </button>
                      <button type="button" onClick={() => handleInsertSnippet('*italic text*')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} title="Italic">
                        <i>I</i>
                      </button>
                      <button type="button" onClick={() => handleInsertSnippet('\n- Bullet point 1\n- Bullet point 2\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} title="Bullet List">
                        List
                      </button>
                      <button type="button" onClick={() => handleInsertSnippet('\n> Pullquote / Lab Verdict Takeaway\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} title="Quote">
                        Quote
                      </button>
                      <button type="button" onClick={() => handleInsertSnippet('\n[video:https://www.youtube.com/watch?v=YOUR_ID]\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: 'var(--green-accent)' }} title="Insert Video Embed Tag">
                        + Video Tag
                      </button>
                    </div>

                    <textarea
                      rows={12}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your in-depth guide, testing results, acoustics scores, comparisons, and verdicts here..."
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-mono)',
                        lineHeight: 1.6,
                        borderRadius: '0 0 var(--radius-xs) var(--radius-xs)',
                        border: '1px solid var(--border-strong)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TOP PRODUCTS MANAGER */}
              {activeTab === 'top_products' && (
                <TopProductsManager
                  products={formData.top_products}
                  onChange={(updated) => setFormData({ ...formData, top_products: updated })}
                />
              )}

              {/* TAB 3: VIDEOS & MULTIMEDIA */}
              {activeTab === 'videos' && (
                <VideoEmbedManager
                  videos={formData.videos}
                  onChange={(updated) => setFormData({ ...formData, videos: updated })}
                  onInsertTag={(tag) => handleInsertSnippet(tag)}
                />
              )}

              {/* TAB 4: SEO & METADATA */}
              {activeTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      SEO Meta Title (Title Tag)
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      placeholder="e.g. Best Noise-Canceling Headphones 2026: Lab Tested | Buy Best Cart"
                      style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                    <SeoTitleAdvisor
                      title={formData.seo_title || formData.title}
                      onChange={(newTitle) => setFormData({ ...formData, seo_title: newTitle })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      placeholder="Discover the top ranked noise cancelling headphones verified by our editorial lab for comfort, battery life, and active noise suppression."
                      style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      placeholder="https://buybestcart.shop/guides/best-noise-canceling-headphones-2026"
                      style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  {/* Google SERP Live Snippet Preview */}
                  <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Google Search Result Snippet Preview
                    </div>
                    <div style={{ fontFamily: 'Arial, sans-serif' }}>
                      <div style={{ fontSize: '0.75rem', color: '#202124', marginBottom: '0.15rem' }}>
                        https://buybestcart.shop &gt; guides &gt; {formData.slug || 'guide-slug'}
                      </div>
                      <div style={{ fontSize: '1.125rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.25rem' }}>
                        {formData.seo_title || `${formData.title || 'Guide Title'} (2026) | Buy Best Cart`}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#4d5156', lineHeight: 1.4 }}>
                        {formData.seo_description || formData.excerpt || 'Read the complete buying guide, ranked top picks, and verified Amazon deals tested by our editorial staff.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUTHOR & PUBLISHING */}
              {activeTab === 'author' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={formData.author_name}
                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                        placeholder="e.g. Editorial Testing Staff"
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Author Role / Credentials
                      </label>
                      <input
                        type="text"
                        value={formData.author_role}
                        onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                        placeholder="e.g. Senior Tech Analyst & Lab Lead"
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Publishing Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)' }}
                      >
                        <option value="published">Published (Live to Public)</option>
                        <option value="draft">Draft (Private)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Publish Date
                      </label>
                      <input
                        type="date"
                        value={formData.publish_date}
                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                        Est. Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.reading_time_minutes}
                        onChange={(e) => setFormData({ ...formData, reading_time_minutes: parseInt(e.target.value) || 5 })}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                      Topic Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(', ')}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                      placeholder="e.g. Headphones, Noise Cancelling, Tech Reviews, Work From Home"
                      style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={14} />
                    <span>Preview Post</span>
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{editingGuide ? 'Save & Update Guide' : 'Publish Guide'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL LIVE ARTICLE PREVIEW MODAL */}
      {showPreviewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.875rem' }}>
                <Eye size={16} color="var(--green-accent)" />
                <span>Live Reader Experience Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Close Preview ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
                {formData.title || 'Untitled Article Title'}
              </h1>
              {formData.excerpt && (
                <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {formData.excerpt}
                </p>
              )}

              {formData.featured_image && (
                <div style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxHeight: '380px' }}>
                  <img
                    src={formData.featured_image}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Render Top Products */}
              {formData.top_products.length > 0 && (
                <TopProductsSection products={formData.top_products} />
              )}

              {/* Render Rich Body */}
              <ArticleContentRenderer content={formData.content} videos={formData.videos} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
