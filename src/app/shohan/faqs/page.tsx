'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { FAQ } from '@/types';
import { HelpCircle, Plus, Trash2, Edit3, CheckCircle2, Save, Sparkles } from 'lucide-react';

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    priority: 1,
    is_active: true,
  });

  const fetchFaqs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .order('priority', { ascending: true });
    if (data) setFaqs(data as FAQ[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openAddModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'Editorial & Testing',
      priority: faqs.length + 1,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (f: FAQ) => {
    setEditingFaq(f);
    setFormData({
      question: f.question,
      answer: f.answer,
      category: f.category || 'General',
      priority: f.priority,
      is_active: f.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;

    const payload = {
      question: formData.question,
      answer: formData.answer,
      category: formData.category,
      priority: Number(formData.priority) || 1,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingFaq) {
      const { error } = await supabase
        .from('faqs')
        .update(payload)
        .eq('id', editingFaq.id);

      if (!error) {
        setShowModal(false);
        await fetchFaqs();
        triggerRevalidation();
      } else {
        alert(`Error updating FAQ: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('faqs').insert(payload);

      if (!error) {
        setShowModal(false);
        await fetchFaqs();
        triggerRevalidation();
      } else {
        alert(`Error creating FAQ: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, q: string) => {
    if (confirm(`Delete FAQ "${q}"?`)) {
      await supabase.from('faqs').delete().eq('id', id);
      await fetchFaqs();
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
            <HelpCircle size={22} color="var(--green-accent)" />
            <span>Frequently Asked Questions & Schema Engine</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage editorial FAQs, priority ordering, categories, and automated FAQPage JSON-LD schema generation.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* FAQs Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Priority</th>
              <th>Question & Category</th>
              <th>Editorial Answer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading FAQ library...</td></tr>
            ) : faqs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>No FAQs found. Click &quot;Add New FAQ&quot; to create one.</td></tr>
            ) : (
              faqs.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      #{f.priority}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {f.question}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Category: <code>{f.category || 'General'}</code>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '480px' }}>
                      {f.answer}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: f.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {f.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        onClick={() => openEditModal(f)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit FAQ"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.question)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete FAQ"
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

      {/* Add / Edit FAQ Modal */}
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
                <HelpCircle size={18} color="var(--green-accent)" />
                <span>{editingFaq ? 'Edit FAQ Item' : 'Create FAQ Item'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does Buy Best Cart verify and rank products?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Category Group
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Testing Methodology, Affiliate Disclosure, Shipping"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Editorial Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed editorial response..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="is_active_faq"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active_faq" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Active & Included in Public FAQ and FAQPage JSON-LD Schema
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingFaq ? 'Save FAQ Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
