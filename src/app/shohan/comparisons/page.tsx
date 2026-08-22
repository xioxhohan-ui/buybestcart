'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Product, Comparison } from '@/types';
import { Scale, Plus, Trash2, Edit3, Eye, Award, ExternalLink, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminComparisonsPage() {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComparison, setEditingComparison] = useState<Comparison | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    product_a_id: '',
    product_b_id: '',
    winner_product_id: '',
    summary: '',
    verdict: '',
    status: 'published' as Comparison['status'],
  });

  const fetchData = async () => {
    setLoading(true);
    const [compRes, prodRes] = await Promise.all([
      supabase.from('comparisons').select('*, product_a:products!product_a_id(*), product_b:products!product_b_id(*), winner:products!winner_product_id(*)').order('created_at', { ascending: false }),
      supabase.from('products').select('id, title, slug, price, thumbnail_url, rating').in('status', ['active', 'featured']),
    ]);

    if (compRes.data) setComparisons(compRes.data as Comparison[]);
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingComparison(null);
    setFormData({
      title: '',
      slug: '',
      product_a_id: products[0]?.id || '',
      product_b_id: products[1]?.id || '',
      winner_product_id: products[0]?.id || '',
      summary: 'Head-to-head laboratory testing comparing acoustic clarity, active noise cancellation, and battery endurance.',
      verdict: 'The flagship model retains the overall crown for noise cancellation, while the rival offers superior comfort.',
      status: 'published',
    });
    setShowModal(true);
  };

  const openEditModal = (c: Comparison) => {
    setEditingComparison(c);
    setFormData({
      title: c.title,
      slug: c.slug,
      product_a_id: c.product_a_id || '',
      product_b_id: c.product_b_id || '',
      winner_product_id: c.winner_product_id || '',
      summary: c.summary || '',
      verdict: c.verdict || '',
      status: c.status,
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
      product_a_id: formData.product_a_id || null,
      product_b_id: formData.product_b_id || null,
      winner_product_id: formData.winner_product_id || null,
      summary: formData.summary,
      verdict: formData.verdict,
      status: formData.status,
      updated_at: new Date().toISOString(),
    };

    if (editingComparison) {
      const { error } = await supabase
        .from('comparisons')
        .update(payload)
        .eq('id', editingComparison.id);

      if (!error) {
        setShowModal(false);
        await fetchData();
        triggerRevalidation();
      } else {
        alert(`Error updating comparison: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('comparisons').insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

      if (!error) {
        setShowModal(false);
        await fetchData();
        triggerRevalidation();
      } else {
        alert(`Error creating comparison: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete comparison showdown "${title}"?`)) {
      await supabase.from('comparisons').delete().eq('id', id);
      await fetchData();
      triggerRevalidation();
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
            <Scale size={22} color="var(--green-accent)" />
            <span>Product Comparison & Head-to-Head Showdowns</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage side-by-side flagship comparisons, winner badges, acoustic metrics, and lab verdicts.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Create New Comparison</span>
        </button>
      </div>

      {/* Comparisons Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Comparison Title</th>
              <th>Contenders</th>
              <th>Overall Winner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading comparisons...</td></tr>
            ) : comparisons.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>No comparison showdowns found. Click &quot;Create New Comparison&quot; to register one.</td></tr>
            ) : (
              comparisons.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Route: <code>/compare</code>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {c.product_a?.title?.slice(0, 25) || 'Contender A'} vs {c.product_b?.title?.slice(0, 25) || 'Contender B'}
                    </div>
                  </td>
                  <td>
                    {c.winner ? (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-accent)', background: 'var(--green-light)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Award size={12} />
                        <span>{c.winner.title.slice(0, 20)}...</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Undecided</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.status === 'published' ? 'var(--success)' : 'var(--text-muted)' }}>
                      ● {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href="/compare"
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View live comparison"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => openEditModal(c)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit comparison"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete comparison"
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

      {/* Add / Edit Comparison Modal */}
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
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scale size={18} color="var(--green-accent)" />
                <span>{editingComparison ? 'Edit Comparison Showdown' : 'Create Comparison Showdown'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Comparison Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 vs Bose QuietComfort Ultra Showdown"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Contender Product A
                  </label>
                  <select
                    value={formData.product_a_id}
                    onChange={(e) => setFormData({ ...formData, product_a_id: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="">Select Contender A...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Contender Product B
                  </label>
                  <select
                    value={formData.product_b_id}
                    onChange={(e) => setFormData({ ...formData, product_b_id: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="">Select Contender B...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Overall Lab Winner
                </label>
                <select
                  value={formData.winner_product_id}
                  onChange={(e) => setFormData({ ...formData, winner_product_id: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                >
                  <option value="">Undecided / Tie</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>Winner: {p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Laboratory Assessment Verdict
                </label>
                <textarea
                  rows={3}
                  value={formData.verdict}
                  onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingComparison ? 'Save Comparison' : 'Publish Showdown'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
