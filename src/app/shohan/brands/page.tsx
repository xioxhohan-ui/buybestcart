'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Brand } from '@/types';
import { Tag, Plus, Trash2, Edit3, Globe, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    description: '',
    logo_url: '',
    is_active: true,
  });

  const fetchBrands = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });
    if (data) setBrands(data as Brand[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      website: '',
      description: '',
      logo_url: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      website: brand.website || '',
      description: brand.description || '',
      logo_url: brand.logo_url || '',
      is_active: brand.is_active,
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
      website: formData.website,
      description: formData.description,
      logo_url: formData.logo_url,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingBrand) {
      const { error } = await supabase
        .from('brands')
        .update(payload)
        .eq('id', editingBrand.id);

      if (!error) {
        setShowModal(false);
        await fetchBrands();
        triggerRevalidation();
      } else {
        alert(`Error updating brand: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('brands').insert({
        ...payload,
        product_count: 0,
      });

      if (!error) {
        setShowModal(false);
        await fetchBrands();
        triggerRevalidation();
      } else {
        alert(`Error creating brand: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
      await supabase.from('brands').delete().eq('id', id);
      await fetchBrands();
      triggerRevalidation();
    }
  };

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
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
            <Tag size={22} color="var(--green-accent)" />
            <span>Brand Catalog & Manufacturer Directory</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage verified brand profiles (Apple, Sony, Bose, Dyson, Anker, Ecobee, etc.).
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Search Filter */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Filter by brand name or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
        />
      </div>

      {/* Brands Table */}
      <div className="admin-table-wrapper">
        <table className="editorial-table" style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th>Brand Name</th>
              <th>Slug / Route</th>
              <th>Website</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading brands catalog...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>No brands found. Click &quot;Add New Brand&quot; to register one.</td></tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {b.name}
                    </div>
                    {b.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem' }}>/brand/{b.slug}</code>
                  </td>
                  <td>
                    {b.website ? (
                      <a href={b.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--green-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Globe size={12} />
                        <span>Visit Site ↗</span>
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: b.is_active ? 'var(--success)' : 'var(--text-muted)',
                      }}
                    >
                      {b.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{b.is_active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        onClick={() => openEditModal(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit brand"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete brand"
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
                <Tag size={18} color="var(--green-accent)" />
                <span>{editingBrand ? 'Edit Brand Profile' : 'Register New Brand'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony, Apple, Bose, Dyson"
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
                  placeholder="e.g. sony, apple, bose"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Official Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.sony.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Description / Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Short brand summary and key product lines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="brand_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="brand_active" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Active and visible in brand directories
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingBrand ? 'Save Changes' : 'Register Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
