'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Deal, Product, DealStatus } from '@/types';
import {
  Flame,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Calendar,
  DollarSign,
  Tag,
  Percent,
  CheckCircle2,
  Clock,
  Archive,
} from 'lucide-react';
import { formatPrice } from '@/lib/region';
import Link from 'next/link';

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    product_id: '',
    deal_label: 'Limited Time Deal',
    current_price: '299.99',
    previous_price: '399.99',
    savings_percentage: '25',
    description: '',
    badge: 'HOT DEAL',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 1,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    cta_text: 'Claim Amazon Deal ↗',
    cta_url: '/deals',
    status: 'active' as DealStatus,
  });

  const fetchData = async () => {
    setLoading(true);
    const [dealRes, prodRes] = await Promise.all([
      supabase.from('deals').select('*, product:products(*)').order('priority', { ascending: true }),
      supabase.from('products').select('id, title, slug, price, list_price, thumbnail_url').order('title', { ascending: true }),
    ]);

    if (dealRes.data) {
      // Automatic transition logic: check if end_date has passed
      const now = new Date();
      const processed = (dealRes.data as Deal[]).map((d) => {
        if (d.end_date && new Date(d.end_date) < now && d.status === 'active') {
          return { ...d, status: 'expired' as DealStatus };
        }
        if (d.start_date && new Date(d.start_date) > now && d.status === 'active') {
          return { ...d, status: 'scheduled' as DealStatus };
        }
        return d;
      });
      setDeals(processed);
    }
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingDeal(null);
    setFormData({
      title: '',
      slug: '',
      product_id: products[0]?.id || '',
      deal_label: 'Prime Member Exclusive Deal',
      current_price: '249.99',
      previous_price: '349.99',
      savings_percentage: '28',
      description: 'Lowest Amazon historical price drop verified against 90-day tracking data.',
      badge: 'HOT DEAL',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 1,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
      cta_text: 'Claim Amazon Deal ↗',
      cta_url: '/deals',
      status: 'active',
    });
    setShowModal(true);
  };

  const openEditModal = (d: Deal) => {
    setEditingDeal(d);
    setFormData({
      title: d.title,
      slug: d.slug,
      product_id: d.product_id || '',
      deal_label: d.deal_label || 'Limited Time Deal',
      current_price: d.current_price ? d.current_price.toString() : '',
      previous_price: d.previous_price ? d.previous_price.toString() : '',
      savings_percentage: d.savings_percentage ? d.savings_percentage.toString() : '',
      description: d.description || '',
      badge: d.badge || 'HOT DEAL',
      start_date: d.start_date ? d.start_date.split('T')[0] : '',
      end_date: d.end_date ? d.end_date.split('T')[0] : '',
      priority: d.priority || 1,
      image_url: d.image_url || '',
      cta_text: d.cta_text || 'Claim Amazon Deal ↗',
      cta_url: d.cta_url || '/deals',
      status: d.status,
    });
    setShowModal(true);
  };

  const handleProductSelect = (productId: string) => {
    const selected = products.find((p) => p.id === productId);
    if (selected) {
      const curPrice = selected.price || 299.99;
      const prevPrice = selected.list_price || curPrice * 1.25;
      const savings = Math.round(((prevPrice - curPrice) / prevPrice) * 100);

      setFormData({
        ...formData,
        product_id: productId,
        title: `${selected.title} Price Drop`,
        slug: `${selected.slug}-deal`,
        current_price: curPrice.toString(),
        previous_price: prevPrice.toString(),
        savings_percentage: savings > 0 ? savings.toString() : '20',
        image_url: selected.thumbnail_url || formData.image_url,
      });
    }
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

    const cur = parseFloat(formData.current_price) || 0;
    const prev = parseFloat(formData.previous_price) || 0;
    const calcSavings = prev > cur ? Math.round(((prev - cur) / prev) * 100) : parseInt(formData.savings_percentage) || 0;

    const payload = {
      title: formData.title,
      slug: generatedSlug,
      product_id: formData.product_id || null,
      deal_label: formData.deal_label,
      current_price: cur,
      previous_price: prev || null,
      savings_percentage: calcSavings,
      description: formData.description,
      badge: formData.badge,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      priority: Number(formData.priority) || 1,
      image_url: formData.image_url,
      cta_text: formData.cta_text,
      cta_url: formData.cta_url,
      status: formData.status,
      updated_at: new Date().toISOString(),
    };

    if (editingDeal) {
      const { error } = await supabase
        .from('deals')
        .update(payload)
        .eq('id', editingDeal.id);

      if (!error) {
        setShowModal(false);
        fetchData();
        triggerRevalidation();
      } else {
        alert(`Error updating deal: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('deals').insert(payload);

      if (!error) {
        setShowModal(false);
        fetchData();
        triggerRevalidation();
      } else {
        alert(`Error creating deal: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete deal "${title}"?`)) {
      await supabase.from('deals').delete().eq('id', id);
      fetchData();
      triggerRevalidation();
    }
  };

  const getStatusBadge = (status: DealStatus) => {
    const map: Record<DealStatus, { bg: string; color: string; label: string }> = {
      active: { bg: 'var(--success-light)', color: 'var(--success)', label: 'Active Live' },
      scheduled: { bg: '#E0E7FF', color: '#4338CA', label: 'Scheduled' },
      draft: { bg: '#F1F5F9', color: '#64748B', label: 'Draft' },
      expired: { bg: '#FEF3C7', color: '#B45309', label: 'Expired' },
      archived: { bg: '#FEE2E2', color: '#DC2626', label: 'Archived' },
    };
    const s = map[status] || { bg: '#F1F5F9', color: '#64748B', label: status };
    return (
      <span style={{ fontSize: '0.6875rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-xs)', background: s.bg, color: s.color, textTransform: 'uppercase' }}>
        {s.label}
      </span>
    );
  };

  const filtered = deals.filter((d) => {
    return statusFilter === 'all' || d.status === statusFilter;
  });

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
            <Flame size={22} color="var(--amber-deal)" />
            <span>Time-Sensitive Deals & Price Drops Engine</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage Amazon flash sales, savings percentages, automated scheduling, and expiration transitions.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Create New Deal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'active', 'scheduled', 'expired', 'draft', 'archived'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: statusFilter === st ? '1px solid var(--green-border)' : '1px solid var(--border)',
              background: statusFilter === st ? 'var(--green-light)' : 'var(--bg-surface)',
              color: statusFilter === st ? 'var(--green-accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Deals Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Deal Title & Label</th>
              <th>Live Deal Price</th>
              <th>Savings</th>
              <th>Valid Window</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading active deals...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem' }}>No deals matched this filter.</td></tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      #{d.priority}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {d.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {d.deal_label} • Badge: <code>{d.badge || 'DEAL'}</code>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--amber-deal)', fontSize: '0.9375rem' }}>
                        {formatPrice(d.current_price, 'USD')}
                      </span>
                      {d.previous_price && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatPrice(d.previous_price, 'USD')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', background: 'var(--success-light)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-xs)' }}>
                      -{d.savings_percentage || 20}% OFF
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {d.start_date ? new Date(d.start_date).toLocaleDateString() : 'Immediate'} →{' '}
                      {d.end_date ? new Date(d.end_date).toLocaleDateString() : 'Open-ended'}
                    </div>
                  </td>
                  <td>{getStatusBadge(d.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        onClick={() => openEditModal(d)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit deal"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete deal"
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

      {/* Add / Edit Deal Modal */}
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
                <Flame size={18} color="var(--amber-deal)" />
                <span>{editingDeal ? 'Edit Time-Sensitive Deal' : 'Register Time-Sensitive Price Drop'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Linked Product Helper */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Link to Catalog Product (Auto-fills pricing and title)
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                >
                  <option value="">Manual Deal Entry (Unlinked)...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} (${p.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Deal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Deal Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Original MSRP ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.previous_price}
                    onChange={(e) => setFormData({ ...formData, previous_price: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Savings (%)
                  </label>
                  <input
                    type="number"
                    value={formData.savings_percentage}
                    onChange={(e) => setFormData({ ...formData, savings_percentage: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Status (5 States)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DealStatus })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="active">Active (Live on Deals page)</option>
                    <option value="scheduled">Scheduled (Upcoming)</option>
                    <option value="draft">Draft</option>
                    <option value="expired">Expired</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Deal Summary Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingDeal ? 'Save Deal Changes' : 'Publish Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
