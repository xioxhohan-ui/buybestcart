'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Article } from '@/types';
import { BookOpen, Plus, Trash2, Edit3, Eye, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminBuyingGuidesPage() {
  const [guides, setGuides] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Article | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    status: 'published' as Article['status'],
    seo_title: '',
    seo_description: '',
  });

  const fetchGuides = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('content_type', 'buying_guide')
      .order('created_at', { ascending: false });
    if (data) setGuides(data as Article[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const openAddModal = () => {
    setEditingGuide(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      status: 'published',
      seo_title: '',
      seo_description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (g: Article) => {
    setEditingGuide(g);
    setFormData({
      title: g.title,
      slug: g.slug,
      excerpt: g.excerpt || '',
      body: g.body || '',
      status: g.status,
      seo_title: g.seo_title || '',
      seo_description: g.seo_description || '',
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
      content_type: 'buying_guide',
      excerpt: formData.excerpt,
      body: formData.body,
      status: formData.status,
      seo_title: formData.seo_title || formData.title,
      seo_description: formData.seo_description || formData.excerpt,
      updated_at: new Date().toISOString(),
    };

    if (editingGuide) {
      const { error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', editingGuide.id);

      if (!error) {
        setShowModal(false);
        fetchGuides();
      } else {
        alert(`Error updating guide: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('articles').insert({
        ...payload,
        schema_type: 'Article',
        views_count: 0,
      });

      if (!error) {
        setShowModal(false);
        fetchGuides();
      } else {
        alert(`Error creating guide: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete buying guide "${title}"?`)) {
      await supabase.from('articles').delete().eq('id', id);
      fetchGuides();
    }
  };

  const filtered = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.slug.toLowerCase().includes(search.toLowerCase())
  );

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
            <BookOpen size={22} color="var(--green-accent)" />
            <span>Buying Guides & Editorial Roundups</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Author in-depth buying guides (e.g. &quot;Best Noise-Cancelling Headphones of 2026&quot;).
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Write New Buying Guide</span>
        </button>
      </div>

      {/* Filter */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Filter guides by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
        />
      </div>

      {/* Guides Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Guide Title & Excerpt</th>
              <th>Route Slug</th>
              <th>Status</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading buying guides...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>No buying guides authored yet. Click &quot;Write New Buying Guide&quot; above to create one.</td></tr>
            ) : (
              filtered.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {g.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.excerpt || 'No summary excerpt provided.'}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem' }}>/guides/{g.slug}</code>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: g.status === 'published' ? 'var(--success)' : 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {g.status === 'published' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{g.status.toUpperCase()}</span>
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {g.views_count?.toLocaleString() || 0}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href={`/guides/${g.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View live guide"
                      >
                        <Eye size={12} />
                      </Link>
                      <button
                        onClick={() => openEditModal(g)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit guide"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id, g.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete guide"
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

      {/* Add / Edit Modal */}
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
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--green-accent)" />
                <span>{editingGuide ? 'Edit Buying Guide' : 'Author New Buying Guide'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Guide Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Noise-Cancelling Headphones of 2026: Lab Tested & Ranked"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Slug (Auto-generated if empty)
                </label>
                <input
                  type="text"
                  placeholder="e.g. best-noise-cancelling-headphones"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Summary Excerpt
                </label>
                <textarea
                  rows={2}
                  placeholder="Short editorial summary preview..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Full Guide Body (Markdown / Text) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Complete buying guide content, lab benchmarks, and tested recommendations..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingGuide ? 'Save Changes' : 'Publish Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
