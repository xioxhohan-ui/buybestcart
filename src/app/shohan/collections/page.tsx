'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Layers, Plus, Trash2, Edit3, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface CollectionRecord {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  badge?: string;
  is_featured?: boolean;
  status?: string;
  created_at: string;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionRecord | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    badge: 'CURATED EDIT',
    image_url: '',
    is_featured: true,
  });

  const fetchCollections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCollections(data as CollectionRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openAddModal = () => {
    setEditingCollection(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      badge: 'CURATED EDIT',
      image_url: '',
      is_featured: true,
    });
    setShowModal(true);
  };

  const openEditModal = (col: CollectionRecord) => {
    setEditingCollection(col);
    setFormData({
      title: col.title,
      slug: col.slug,
      description: col.description || '',
      badge: col.badge || 'CURATED EDIT',
      image_url: col.image_url || '',
      is_featured: col.is_featured ?? true,
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
      description: formData.description,
      badge: formData.badge,
      image_url: formData.image_url,
      is_featured: formData.is_featured,
      updated_at: new Date().toISOString(),
    };

    if (editingCollection) {
      const { error } = await supabase
        .from('collections')
        .update(payload)
        .eq('id', editingCollection.id);

      if (!error) {
        setShowModal(false);
        fetchCollections();
      } else {
        alert(`Error updating collection: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('collections').insert({
        ...payload,
        status: 'published',
      });

      if (!error) {
        setShowModal(false);
        fetchCollections();
      } else {
        alert(`Error creating collection: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete collection "${title}"?`)) {
      await supabase.from('collections').delete().eq('id', id);
      fetchCollections();
    }
  };

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
            <Layers size={22} color="var(--green-accent)" />
            <span>Curated Collections & Thematic Roundups</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Build custom thematic hubs (e.g. &quot;Best Under $50&quot;, &quot;Starter Kits for Beginners&quot;, &quot;Work from Home Essentials&quot;).
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Create New Collection</span>
        </button>
      </div>

      {/* Collections Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Collection Title</th>
              <th>Route Slug</th>
              <th>Badge</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading collections...</td></tr>
            ) : collections.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>No collections created yet. Click &quot;Create New Collection&quot; to build one.</td></tr>
            ) : (
              collections.map((col) => (
                <tr key={col.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {col.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {col.description || 'Curated thematic product roundup.'}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem' }}>/collection/{col.slug}</code>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', background: 'var(--green-light)', color: 'var(--green-accent)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)' }}>
                      {col.badge || 'CURATED'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={12} />
                      <span>Active</span>
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href={`/category/${col.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View live collection"
                      >
                        <Eye size={12} />
                      </Link>
                      <button
                        onClick={() => openEditModal(col)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit collection"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id, col.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete collection"
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
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--green-accent)" />
                <span>{editingCollection ? 'Edit Collection' : 'Create Thematic Collection'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Smart Home Picks Under $50"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Slug (Auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. smart-home-under-50"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Eyebrow Badge Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BUDGET VALUE"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Description / Editorial Introduction
                </label>
                <textarea
                  rows={3}
                  placeholder="High-value gadgets and smart accessories that deliver great functionality on a budget..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="col_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <label htmlFor="col_featured" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Feature on homepage and top navigation
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingCollection ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
