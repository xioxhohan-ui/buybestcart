'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';
import { Star, Plus, Trash2, Edit3, Award, CheckCircle2, Filter } from 'lucide-react';

export default function AdminReviewsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    rating: '4.8',
    editorial_score: '9.5',
    editor_verdict: '',
    buying_advice: '',
    pros: '',
    cons: '',
  });

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, title, slug, asin, price, rating, review_count, editorial_score, editor_verdict, buying_advice, pros, cons, is_editor_choice')
      .order('editorial_score', { ascending: false, nullsFirst: false });
    if (data) setProducts(data as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      rating: p.rating ? p.rating.toString() : '4.8',
      editorial_score: p.editorial_score ? p.editorial_score.toString() : '9.5',
      editor_verdict: p.editor_verdict || '',
      buying_advice: p.buying_advice || '',
      pros: (p.pros || []).join('\n'),
      cons: (p.cons || []).join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const prosArray = formData.pros.split('\n').map((s) => s.trim()).filter(Boolean);
    const consArray = formData.cons.split('\n').map((s) => s.trim()).filter(Boolean);

    const { error } = await supabase
      .from('products')
      .update({
        rating: parseFloat(formData.rating),
        editorial_score: parseFloat(formData.editorial_score),
        editor_verdict: formData.editor_verdict,
        buying_advice: formData.buying_advice,
        pros: prosArray,
        cons: consArray,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingProduct.id);

    if (!error) {
      setShowModal(false);
      fetchReviews();
    } else {
      alert(`Error saving review: ${error.message}`);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.asin && p.asin.toLowerCase().includes(search.toLowerCase()))
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
            <Award size={22} color="var(--green-accent)" />
            <span>Product Reviews & Lab Verdicts Manager</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage editorial lab scores (e.g. 9.8/10), pros & cons, buying advice, and testing assessments.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Filter reviews by product title or ASIN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
        />
      </div>

      {/* Reviews Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Product Title</th>
              <th>Customer Rating</th>
              <th>Editorial Score</th>
              <th>Pros / Cons Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading reviews...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>No products found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ASIN: {p.asin || 'N/A'} • {p.editor_verdict ? 'Verdict authored' : 'Draft assessment'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--amber-deal)', fontWeight: 700, fontSize: '0.875rem' }}>
                      <Star size={12} fill="currentColor" />
                      <span>{p.rating ? p.rating.toFixed(1) : '4.8'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--green-accent)', fontSize: '0.875rem', padding: '0.2rem 0.5rem', background: 'var(--green-light)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)' }}>
                      {p.editorial_score ? `${p.editorial_score}/10` : '9.0/10'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {(p.pros || []).length} Pros / {(p.cons || []).length} Cons
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openEditModal(p)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Edit3 size={12} />
                      <span>Edit Lab Verdict</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Review Modal */}
      {showModal && editingProduct && (
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--green-accent)" />
                <span>Edit Editorial Review: {editingProduct.title.slice(0, 30)}...</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Customer Rating (out of 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Editorial Lab Score (out of 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    required
                    value={formData.editorial_score}
                    onChange={(e) => setFormData({ ...formData, editorial_score: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Editor&apos;s Final Verdict & Assessment
                </label>
                <textarea
                  rows={3}
                  placeholder="Testing summary, noise cancelling performance benchmarks, and overall evaluation..."
                  value={formData.editor_verdict}
                  onChange={(e) => setFormData({ ...formData, editor_verdict: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Buying Advice (Who should buy / who should avoid)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ideal for frequent flyers and audiophiles who prioritize acoustic clarity..."
                  value={formData.buying_advice}
                  onChange={(e) => setFormData({ ...formData, buying_advice: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Reasons to Buy (Pros - one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Class-leading noise cancelling&#10;Exceptional 30-hour battery life&#10;Lightweight, comfortable build"
                    value={formData.pros}
                    onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Reasons to Avoid (Cons - one per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Premium price tag&#10;Non-folding headband hinge"
                    value={formData.cons}
                    onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Review Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
