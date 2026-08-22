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
  Smartphone,
  Tablet,
  Monitor,
  Columns,
  Maximize2,
  ArrowLeft,
  Save,
  Check,
  ShieldCheck,
  FileText,
  Sliders,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import TopProductsManager from '@/components/admin/TopProductsManager';
import VideoEmbedManager from '@/components/admin/VideoEmbedManager';
import SeoTitleAdvisor from '@/components/admin/SeoTitleAdvisor';
import TopProductsSection from '@/components/guides/TopProductsSection';
import ArticleContentRenderer from '@/components/guides/ArticleContentRenderer';
import PriceDisplay from '@/components/common/PriceDisplay';

export default function AdminBlogGuidesPage() {
  const [guides, setGuides] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // WordPress-Style Editor View Settings
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'content' | 'top_products' | 'videos' | 'seo' | 'author'>('content');

  // Form State (Live 2-way data binding)
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    category_id: string;
    excerpt: string;
    introduction: string;
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
    introduction: 'The hardware landscape has shifted significantly over the past 12 months with the rollout of new processor architectures, enhanced acoustic silicon, and aggressive pricing adjustments across Amazon marketplaces.\n\nIn this comprehensive buying guide, our editorial testing team evaluates what is currently available, compares the top performing contenders head-to-head, and outlines which models deliver the best real-world performance for your budget.',
    content: `## Lab Testing Methodology & Evaluation Criteria\n\nWe spent over 40 lab hours evaluating acoustic isolation, active battery endurance, thermal throttling, and overall build longevity.\n\n### Why Trust Our Lab\n\nOur engineers evaluate retail sample units and measure real-world performance without merchant sponsor intervention.\n\n> "A top-tier recommendation must not only benchmark well in the lab, but withstand real-world commuting, drops, and prolonged battery stress."`,
    featured_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    status: 'published',
    content_type: 'buying_guide',
    reading_time_minutes: 7,
    publish_date: new Date().toISOString().split('T')[0],
    author_name: 'Editorial Testing Staff',
    author_role: 'Senior Tech & Hardware Analyst',
    author_avatar: '',
    tags: ['Hardware', 'Buying Guide', 'Amazon Deals', '2026 Picks'],
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
      introduction: 'The hardware landscape has shifted significantly over the past 12 months with the rollout of new processor architectures, enhanced acoustic silicon, and aggressive pricing adjustments across Amazon marketplaces.\n\nIn this comprehensive buying guide, our editorial testing team evaluates what is currently available, compares the top performing contenders head-to-head, and outlines which models deliver the best real-world performance for your budget.',
      content: `## Lab Testing Methodology & Evaluation Criteria\n\nWe spent over 40 lab hours evaluating acoustic isolation, active battery endurance, thermal throttling, and overall build longevity.\n\n### Why Trust Our Lab\n\nOur engineers evaluate retail sample units and measure real-world performance without merchant sponsor intervention.\n\n> "A top-tier recommendation must not only benchmark well in the lab, but withstand real-world commuting, drops, and prolonged battery stress."`,
      featured_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      content_type: 'buying_guide',
      reading_time_minutes: 7,
      publish_date: new Date().toISOString().split('T')[0],
      author_name: 'Editorial Testing Staff',
      author_role: 'Senior Tech & Hardware Analyst',
      author_avatar: '',
      tags: ['Hardware', 'Buying Guide', '2026 Recommendations'],
      seo_title: '',
      seo_description: '',
      canonical_url: '',
      top_products: [],
      videos: [],
    });
    setActiveTab('content');
    setIsEditorOpen(true);
  };

  const openEditModal = (g: Article) => {
    setEditingGuide(g);
    setFormData({
      title: g.title || '',
      slug: g.slug || '',
      category_id: g.category_id || (categories[0]?.id || ''),
      excerpt: g.excerpt || '',
      introduction: g.introduction || 'The hardware landscape has shifted significantly over the past 12 months with new product releases and competitive pricing across Amazon.\n\nIn this guide, we break down what is currently available and identify the top performers for every budget.',
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
    setIsEditorOpen(true);
  };

  const handleInsertSnippet = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + snippet,
    }));
  };

  const handleSave = async (overrideStatus?: ArticleStatus) => {
    if (!formData.title.trim()) {
      alert('Please enter a guide title.');
      return;
    }

    setSaving(true);
    const cleanSlug =
      formData.slug.trim() ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const targetStatus = overrideStatus || formData.status;

    const payload = {
      title: formData.title,
      slug: cleanSlug,
      category_id: formData.category_id || null,
      excerpt: formData.excerpt,
      introduction: formData.introduction,
      content: formData.content,
      body: formData.content,
      featured_image: formData.featured_image,
      status: targetStatus,
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

      setSaving(false);
      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        fetchData();
        triggerRevalidation();
      } else {
        alert(`Error updating guide: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('articles').insert({
        ...payload,
        views_count: 0,
      });

      setSaving(false);
      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        fetchData();
        triggerRevalidation();
        setIsEditorOpen(false);
      } else {
        alert(`Error creating guide: ${error.message}`);
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

  const selectedCategory = categories.find((c) => c.id === formData.category_id);

  const filtered = guides.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase()) ||
      (g.excerpt && g.excerpt.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // RENDER: WORDPRESS-STYLE FULLSCREEN BUILDER
  // ==========================================
  if (isEditorOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0F172A',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Top Sticky Toolbar */}
        <header
          style={{
            height: '60px',
            background: '#1E293B',
            borderBottom: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            color: '#FFF',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {/* Left: Back & Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="btn btn-secondary btn-sm"
              style={{
                background: '#334155',
                color: '#FFF',
                border: '1px solid #475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ArrowLeft size={14} />
              <span>Exit Editor</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#F8FAFC', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {formData.title || 'Untitled Buying Guide'}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '3px',
                  background: formData.status === 'published' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: formData.status === 'published' ? '#4ADE80' : '#FBBF24',
                  border: `1px solid ${formData.status === 'published' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                }}
              >
                {formData.status}
              </span>
            </div>
          </div>

          {/* Center: Layout & Device View Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Split Screen Mode Buttons */}
            <div style={{ display: 'flex', background: '#0F172A', padding: '0.2rem', borderRadius: '6px', border: '1px solid #334155' }}>
              <button
                onClick={() => setLayoutMode('editor')}
                style={{
                  background: layoutMode === 'editor' ? '#3B82F6' : 'transparent',
                  color: layoutMode === 'editor' ? '#FFF' : '#94A3B8',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Editor Fullscreen"
              >
                Editor
              </button>
              <button
                onClick={() => setLayoutMode('split')}
                style={{
                  background: layoutMode === 'split' ? '#3B82F6' : 'transparent',
                  color: layoutMode === 'split' ? '#FFF' : '#94A3B8',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title="Split 50/50 Screen"
              >
                <Columns size={13} />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setLayoutMode('preview')}
                style={{
                  background: layoutMode === 'preview' ? '#3B82F6' : 'transparent',
                  color: layoutMode === 'preview' ? '#FFF' : '#94A3B8',
                  border: 'none',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Live Preview Fullscreen"
              >
                Preview
              </button>
            </div>

            {/* Device Switcher (for Preview panel) */}
            {layoutMode !== 'editor' && (
              <div style={{ display: 'flex', background: '#0F172A', padding: '0.2rem', borderRadius: '6px', border: '1px solid #334155' }}>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  style={{
                    background: previewDevice === 'desktop' ? '#334155' : 'transparent',
                    color: previewDevice === 'desktop' ? '#38BDF8' : '#94A3B8',
                    border: 'none',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Desktop View (100%)"
                >
                  <Monitor size={14} />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  style={{
                    background: previewDevice === 'tablet' ? '#334155' : 'transparent',
                    color: previewDevice === 'tablet' ? '#38BDF8' : '#94A3B8',
                    border: 'none',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Tablet View (768px)"
                >
                  <Tablet size={14} />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  style={{
                    background: previewDevice === 'mobile' ? '#334155' : 'transparent',
                    color: previewDevice === 'mobile' ? '#38BDF8' : '#94A3B8',
                    border: 'none',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Mobile View (375px)"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {formData.slug && (
              <Link
                href={`/guides/${formData.slug}`}
                target="_blank"
                className="btn btn-secondary btn-sm"
                style={{
                  background: '#334155',
                  color: '#FFF',
                  border: '1px solid #475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <ExternalLink size={13} />
                <span>Live URL</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="btn btn-secondary btn-sm"
              style={{ background: '#334155', color: '#FFF', border: '1px solid #475569' }}
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={saving}
              className="btn btn-primary btn-sm"
              style={{
                background: saveSuccess ? '#10B981' : 'var(--green-accent)',
                color: '#FFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 800,
              }}
            >
              {saveSuccess ? <Check size={14} /> : <Save size={14} />}
              <span>{saveSuccess ? 'Saved!' : saving ? 'Saving...' : 'Publish Guide'}</span>
            </button>
          </div>
        </header>

        {/* Main Two-Panel Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT PANEL: WORDPRESS-STYLE CONTENT EDITOR */}
          {(layoutMode === 'split' || layoutMode === 'editor') && (
            <div
              style={{
                flex: layoutMode === 'editor' ? '1 1 100%' : '1 1 50%',
                background: 'var(--bg-surface)',
                borderRight: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Editor Tabs Navigation */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderBottom: '1px solid var(--border)',
                  padding: '0 1rem',
                  display: 'flex',
                  overflowX: 'auto',
                  flexShrink: 0,
                }}
              >
                {[
                  { id: 'content', label: '1. Introduction & Content', icon: BookOpen },
                  { id: 'top_products', label: `2. Our Top Picks (${formData.top_products.length})`, icon: Sparkles },
                  { id: 'videos', label: `3. Videos & Media (${formData.videos.length})`, icon: Video },
                  { id: 'seo', label: '4. SEO & SERP', icon: Search },
                  { id: 'author', label: '5. Author & Date', icon: User },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.75rem 0.85rem',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid var(--green-accent)' : '2px solid transparent',
                      background: 'transparent',
                      color: activeTab === tab.id ? 'var(--green-accent)' : 'var(--text-secondary)',
                      fontWeight: activeTab === tab.id ? 800 : 600,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <tab.icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Scrollable Form Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* TAB 1: MAIN CONTENT */}
                {activeTab === 'content' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Article / Guide Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. The Best Noise-Canceling Headphones of 2026"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '1.0625rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          URL Slug
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="best-noise-canceling-headphones-2026"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Primary Category
                        </label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)' }}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Featured Cover Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.featured_image}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Short Excerpt / Lead Summary
                      </label>
                      <textarea
                        rows={2}
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        placeholder="Key conclusions, test score highlights, and buyer takeaways..."
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    {/* STRUCTURE 1: DEDICATED INTRODUCTION SECTION */}
                    <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <BookOpen size={14} />
                          <span>1. Introduction &amp; Market Overview *</span>
                        </label>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          Current market state, what changed recently, &amp; what this guide covers
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        value={formData.introduction}
                        onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                        placeholder="Explain the current situation in the market, what has changed recently, what products are currently available, and what this article is going to cover..."
                        style={{ width: '100%', padding: '0.65rem 0.75rem', fontSize: '0.8125rem', lineHeight: 1.6, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    {/* Rich Markdown Visual Editor */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                          Editorial Deep-Dive &amp; Testing Results (Markdown &amp; Video Embeds)
                        </label>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formData.content.length} chars
                        </span>
                      </div>

                      {/* Toolbar buttons */}
                      <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', border: '1px solid var(--border)', borderBottom: 'none', borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0', padding: '0.35rem 0.5rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => handleInsertSnippet('\n## Section Heading\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6875rem' }} title="H2 Heading">
                          H2
                        </button>
                        <button type="button" onClick={() => handleInsertSnippet('\n### Sub-Heading\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6875rem' }} title="H3 Heading">
                          H3
                        </button>
                        <button type="button" onClick={() => handleInsertSnippet('**bold text**')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6875rem' }} title="Bold">
                          <b>B</b>
                        </button>
                        <button type="button" onClick={() => handleInsertSnippet('*italic text*')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6875rem' }} title="Italic">
                          <i>I</i>
                        </button>
                        <button type="button" onClick={() => handleInsertSnippet('\n- Key takeaway item\n- Lab measurement score\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6875rem' }} title="List">
                          List
                        </button>
                        <button type="button" onClick={() => handleInsertSnippet('\n> Pullquote / Lab Verdict Takeaway\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6875rem' }} title="Quote">
                          Quote
                        </button>
                        <button type="button" onClick={() => handleInsertSnippet('\n[video:https://www.youtube.com/watch?v=dQw4w9WgXcQ]\n\n')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.4rem', fontSize: '0.6875rem', color: 'var(--green-accent)', fontWeight: 700 }} title="Embed Video">
                          + Video
                        </button>
                      </div>

                      <textarea
                        rows={10}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your detailed product breakdown, benchmark charts, acoustic graphs, and verdict summaries here..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          fontSize: '0.8125rem',
                          fontFamily: 'var(--font-mono)',
                          lineHeight: 1.6,
                          borderRadius: '0 0 var(--radius-xs) var(--radius-xs)',
                          border: '1px solid var(--border-strong)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: TOP PRODUCTS BUILDER */}
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

                {/* TAB 4: SEO & SERP */}
                {activeTab === 'seo' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="e.g. The Best Noise-Canceling Headphones of 2026: Lab Tested | Buy Best Cart"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                      <SeoTitleAdvisor
                        title={formData.seo_title || formData.title}
                        onChange={(newTitle) => setFormData({ ...formData, seo_title: newTitle })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.seo_description}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        placeholder="Discover the top ranked headphones verified by our editorial lab for acoustics, comfort, and verified Amazon deals."
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={formData.canonical_url}
                        onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                        placeholder="https://buybestcart.shop/guides/best-noise-canceling-headphones"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    {/* Live SERP Snippet Preview */}
                    <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Google SERP Search Preview
                      </div>
                      <div style={{ fontFamily: 'Arial, sans-serif' }}>
                        <div style={{ fontSize: '0.75rem', color: '#202124', marginBottom: '0.15rem' }}>
                          https://buybestcart.shop &gt; guides &gt; {formData.slug || 'guide-slug'}
                        </div>
                        <div style={{ fontSize: '1.0625rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.25rem' }}>
                          {formData.seo_title || `${formData.title || 'Guide Title'} (2026) | Buy Best Cart`}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#4d5156', lineHeight: 1.4 }}>
                          {formData.seo_description || formData.excerpt || 'Read the complete buying guide, ranked top picks, and verified Amazon deals tested by our editorial staff.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: AUTHOR & DATE */}
                {activeTab === 'author' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Author Name
                        </label>
                        <input
                          type="text"
                          value={formData.author_name}
                          onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                          placeholder="e.g. David Sterling"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Author Credentials / Role
                        </label>
                        <input
                          type="text"
                          value={formData.author_role}
                          onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                          placeholder="e.g. Senior Acoustics & Hardware Lead"
                          style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Publish Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as ArticleStatus })}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)' }}
                        >
                          <option value="published">Published (Live to Public)</option>
                          <option value="draft">Draft (Private)</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Publish Date
                        </label>
                        <input
                          type="date"
                          value={formData.publish_date}
                          onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Est. Reading Time (Min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={formData.reading_time_minutes}
                          onChange={(e) => setFormData({ ...formData, reading_time_minutes: parseInt(e.target.value) || 5 })}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Topic Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                        placeholder="e.g. Headphones, Noise Cancelling, Tech Reviews"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RIGHT PANEL: INSTANT LIVE PUBLIC PREVIEW */}
          {(layoutMode === 'split' || layoutMode === 'preview') && (
            <div
              style={{
                flex: layoutMode === 'preview' ? '1 1 100%' : '1 1 50%',
                background: '#0F172A',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: previewDevice === 'desktop' ? '1.5rem' : '2rem 1rem',
              }}
            >
              {/* Device Frame Simulation Container */}
              <div
                style={{
                  width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                  maxWidth: previewDevice === 'desktop' ? '880px' : undefined,
                  minHeight: '100%',
                  background: 'var(--bg-surface)',
                  borderRadius: previewDevice === 'desktop' ? 'var(--radius-lg)' : '24px',
                  border: previewDevice === 'desktop' ? '1px solid var(--border)' : '10px solid #1E293B',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  padding: previewDevice === 'mobile' ? '1.5rem 1.25rem' : '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'width 0.2s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Live Public Article Content */}
                <article>
                  {/* Breadcrumb Simulation */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    <span>Blog &amp; Buying Guides</span>
                    <span>/</span>
                    <span style={{ color: 'var(--green-accent)', fontWeight: 700 }}>
                      {selectedCategory?.name || 'General'}
                    </span>
                  </div>

                  {/* Header Bar */}
                  <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', textTransform: 'uppercase' }}>
                        {selectedCategory?.name || 'Buying Guide'}
                      </span>

                      {formData.top_products.length > 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Sparkles size={11} />
                          <span>Top {formData.top_products.length} Ranked Picks</span>
                        </span>
                      )}
                    </div>

                    <h1 style={{ fontSize: previewDevice === 'mobile' ? '1.75rem' : '2.35rem', lineHeight: 1.25, marginBottom: '1rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formData.title || 'Untitled Buying Guide'}
                    </h1>

                    {formData.excerpt && (
                      <p style={{ fontSize: previewDevice === 'mobile' ? '1rem' : '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                        {formData.excerpt}
                      </p>
                    )}

                    {/* Metadata bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-subtle)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-accent)', fontWeight: 800 }}>
                          <User size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formData.author_name || 'Editorial Testing Staff'}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {formData.author_role || 'Senior Tech Analyst'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          <span>{formData.publish_date}</span>
                        </span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} />
                          <span>{formData.reading_time_minutes} min read</span>
                        </span>
                      </div>
                    </div>
                  </header>

                  {/* Featured Cover Image */}
                  {formData.featured_image && (
                    <div style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: '#0F172A' }}>
                      <img
                        src={formData.featured_image}
                        alt=""
                        style={{ width: '100%', height: 'auto', maxHeight: '420px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* 1. Introduction & Market Overview Section (Live Preview) */}
                  {formData.introduction && (
                    <section style={{ marginBottom: '2.5rem' }}>
                      <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.875rem', fontFamily: 'var(--font-display)' }}>
                        1. Introduction &amp; 2026 Market Overview
                      </h2>
                      <div style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-primary)' }}>
                        {formData.introduction.split('\n').filter((p) => p.trim()).map((para, pIdx) => (
                          <p key={pIdx} style={{ marginBottom: '1rem' }}>{para}</p>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 2. Numbered Top Products Live Section */}
                  {formData.top_products.length > 0 && (
                    <TopProductsSection products={formData.top_products} title="2. Our Top Picks" subtitle="Independently tested, ranked, and verified by our editorial lab staff." />
                  )}

                  {/* Rich Article Body Content */}
                  <ArticleContentRenderer content={formData.content} videos={formData.videos} />

                  {/* Tags */}
                  {formData.tags && formData.tags.length > 0 && (
                    <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Tags:
                      </span>
                      {formData.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Editorial Seal Box */}
                  <div
                    style={{
                      marginTop: '3rem',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--green-light)',
                        border: '2px solid var(--green-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--green-accent)',
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                        Buy Best Cart Independent Testing
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Authored by {formData.author_name || 'Editorial Testing Staff'}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                        All hardware picks are independently ranked using calibrated testing benches and Amazon price tracking.
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN ADMIN CMS DASHBOARD & TABLE
  // ==========================================
  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header */}
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
            <span>Blog &amp; Buying Guides Builder</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            WordPress-style split-screen editor with instant live preview, dedicated Introduction &amp; Market Analysis, Top 5 to Top 20+ ranked product showdowns, video reviews, and live SEO controls.
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 800 }}
          >
            <Plus size={16} />
            <span>Open Buying Guide Builder</span>
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
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Drafts &amp; Scheduled</div>
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
            placeholder="Search buying guides and reviews by title, slug, or keywords..."
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
                          title="View Live Page"
                        >
                          <Eye size={13} />
                        </Link>
                        <button
                          onClick={() => openEditModal(g)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title="Open WordPress-Style Builder"
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
    </div>
  );
}
