'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Category } from '@/types';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Globe,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    icon: 'folder',
    parent_id: '',
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    og_image: '',
    is_featured: true,
    is_active: true,
    display_order: 1,
    depth: 0,
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = (parentId: string = '', depth: number = 0) => {
    setEditingCat(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
      icon: 'folder',
      parent_id: parentId,
      seo_title: '',
      seo_description: '',
      canonical_url: '',
      og_image: '',
      is_featured: true,
      is_active: true,
      display_order: categories.length + 1,
      depth,
    });
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      icon: cat.icon || 'folder',
      parent_id: cat.parent_id || '',
      seo_title: cat.seo_title || '',
      seo_description: cat.seo_description || '',
      canonical_url: cat.canonical_url || '',
      og_image: cat.og_image || '',
      is_featured: cat.is_featured,
      is_active: cat.is_active,
      display_order: cat.display_order,
      depth: cat.depth || 0,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const generatedSlug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload = {
      name: formData.name,
      slug: generatedSlug,
      description: formData.description,
      image_url: formData.image_url,
      icon: formData.icon,
      parent_id: formData.parent_id || null,
      seo_title: formData.seo_title || `${formData.name} Buying Guides & Reviews | Best Buy Cart`,
      seo_description: formData.seo_description || formData.description,
      canonical_url: formData.canonical_url,
      og_image: formData.og_image || formData.image_url,
      is_featured: formData.is_featured,
      is_active: formData.is_active,
      display_order: Number(formData.display_order),
      depth: formData.parent_id ? 1 : 0,
      updated_at: new Date().toISOString(),
    };

    if (editingCat) {
      const { error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', editingCat.id);

      if (!error) {
        setShowModal(false);
        fetchCategories();
        triggerRevalidation();
      } else {
        alert(`Error updating category: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('categories').insert(payload);

      if (!error) {
        setShowModal(false);
        fetchCategories();
        triggerRevalidation();
      } else {
        alert(`Error creating category: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete department/category "${name}"?`)) {
      await supabase.from('categories').delete().eq('id', id);
      fetchCategories();
      triggerRevalidation();
    }
  };

  const parentDepartments = categories.filter((c) => !c.parent_id);

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
            <FolderTree size={22} color="var(--green-accent)" />
            <span>Category & Department Taxonomy System</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Create and organize unlimited departments (Electronics, Computers, Gaming, Home, Kitchen, Beauty, Sports, Automotive, Pets, Tools, etc.), subcategories, SEO metadata, and icons.
          </p>
        </div>

        <button onClick={() => openAddModal()} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Add New Department / Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Order</th>
              <th>Department / Category</th>
              <th>Parent Level</th>
              <th>Slug / Route</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading taxonomy...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem' }}>No departments found. Click &quot;Add New Department / Category&quot; to begin.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      #{cat.display_order}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{cat.name}</span>
                    </div>
                    {cat.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cat.parent_id ? 'var(--text-secondary)' : 'var(--green-accent)' }}>
                      {cat.parent_id ? 'Subcategory' : 'Primary Department (Root)'}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem' }}>/category/{cat.slug}</code>
                  </td>
                  <td>
                    {cat.is_featured ? (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', background: 'var(--green-light)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)' }}>
                        FEATURED
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>STANDARD</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cat.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {cat.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href={`/category/${cat.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View live category"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit category"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete category"
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

      {/* Category Add/Edit Modal */}
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
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderTree size={18} color="var(--green-accent)" />
                <span>{editingCat ? 'Edit Department / Category' : 'Register New Department / Taxonomy'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Department / Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Automotive & Garage"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Slug (Auto-generated if empty)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. automotive"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Parent Hierarchy
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="">None (Top-Level Primary Department)</option>
                    {parentDepartments.map((p) => (
                      <option key={p.id} value={p.id}>Department: {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Editorial Description & Buying Scope
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  placeholder="Tested recommendations, comparisons, and buying guides for this department..."
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Featured Showcase Image CDN URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="checkbox"
                    id="is_featured_cat"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <label htmlFor="is_featured_cat" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    Feature on Homepage Grid
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="checkbox"
                    id="is_active_cat"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active_cat" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    Active & Publicly Visible
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingCat ? 'Save Taxonomy Changes' : 'Register Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
