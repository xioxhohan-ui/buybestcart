'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ShieldCheck, Plus, Trash2, Edit3, Eye, CheckCircle2, XCircle } from 'lucide-react';

interface AdSlotRecord {
  id: string;
  slot_name: string;
  slot_type: string;
  headline: string;
  subline: string;
  cta_text: string;
  cta_link: string;
  sponsor_name: string;
  is_active: boolean;
  clicks_count?: number;
  impressions_count?: number;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdSlotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<AdSlotRecord | null>(null);

  const [formData, setFormData] = useState({
    slot_name: '',
    slot_type: 'billboard',
    headline: '',
    subline: '',
    cta_text: 'View Deals ↗',
    cta_link: '/deals',
    sponsor_name: 'Amazon Prime Audio',
    is_active: true,
  });

  const fetchAds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ad_slots')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAds(data as AdSlotRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openAddModal = () => {
    setEditingAd(null);
    setFormData({
      slot_name: '',
      slot_type: 'billboard',
      headline: '',
      subline: '',
      cta_text: 'View Deals ↗',
      cta_link: '/deals',
      sponsor_name: 'Amazon Partner',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (ad: AdSlotRecord) => {
    setEditingAd(ad);
    setFormData({
      slot_name: ad.slot_name,
      slot_type: ad.slot_type,
      headline: ad.headline,
      subline: ad.subline || '',
      cta_text: ad.cta_text || 'View Deals ↗',
      cta_link: ad.cta_link || '/deals',
      sponsor_name: ad.sponsor_name || 'Amazon Partner',
      is_active: ad.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headline || !formData.slot_name) return;

    const payload = {
      slot_name: formData.slot_name,
      slot_type: formData.slot_type,
      headline: formData.headline,
      subline: formData.subline,
      cta_text: formData.cta_text,
      cta_link: formData.cta_link,
      sponsor_name: formData.sponsor_name,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingAd) {
      const { error } = await supabase
        .from('ad_slots')
        .update(payload)
        .eq('id', editingAd.id);

      if (!error) {
        setShowModal(false);
        fetchAds();
      } else {
        alert(`Error updating ad slot: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('ad_slots').insert({
        ...payload,
        clicks_count: 0,
        impressions_count: 0,
      });

      if (!error) {
        setShowModal(false);
        fetchAds();
      } else {
        alert(`Error creating ad slot: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ad placement "${name}"?`)) {
      await supabase.from('ad_slots').delete().eq('id', id);
      fetchAds();
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
            <ShieldCheck size={22} color="var(--green-accent)" />
            <span>Promotional Banners & Sponsored Ad Placements</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage partner spotlights, Amazon Prime billboard promos, and custom sidebar banners.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>New Ad Placement</span>
        </button>
      </div>

      {/* Ads Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Placement Identifier</th>
              <th>Type</th>
              <th>Headline & Sponsor</th>
              <th>CTA Target</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading ad placements...</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>No ad placements registered yet. Click &quot;New Ad Placement&quot; to configure one.</td></tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id}>
                  <td>
                    <code style={{ fontSize: '0.75rem', fontWeight: 700 }}>{ad.slot_name}</code>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', textTransform: 'uppercase' }}>
                      {ad.slot_type}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{ad.headline}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sponsor: {ad.sponsor_name}</div>
                  </td>
                  <td>
                    <a href={ad.cta_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--green-accent)' }}>
                      {ad.cta_text} ({ad.cta_link})
                    </a>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: ad.is_active ? 'var(--success)' : 'var(--text-muted)',
                      }}
                    >
                      {ad.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{ad.is_active ? 'Active' : 'Paused'}</span>
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        onClick={() => openEditModal(ad)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit ad"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id, ad.slot_name)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete ad"
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--green-accent)" />
                <span>{editingAd ? 'Edit Ad Placement' : 'New Promotional Placement'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Slot Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. homepage_billboard"
                    value={formData.slot_name}
                    onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Slot Type
                  </label>
                  <select
                    value={formData.slot_type}
                    onChange={(e) => setFormData({ ...formData, slot_type: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="billboard">Billboard (Full Width Hero)</option>
                    <option value="leaderboard">Leaderboard (Header Banner)</option>
                    <option value="sidebar-medium">Sidebar Medium (300x250)</option>
                    <option value="sidebar-halfpage">Sidebar Halfpage (300x600)</option>
                    <option value="between-content">Between Content Banner</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Prime Acoustic & Headphone Showcase"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Subline / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Save up to 35% on noise-cancelling headphones with verified same-day Prime delivery."
                  value={formData.subline}
                  onChange={(e) => setFormData({ ...formData, subline: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Sponsor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Tech Hub"
                    value={formData.sponsor_name}
                    onChange={(e) => setFormData({ ...formData, sponsor_name: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. View Prime Deals ↗"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Destination URL
                </label>
                <input
                  type="text"
                  placeholder="/deals or https://amazon.com/..."
                  value={formData.cta_link}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="ad_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="ad_active" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Active & displaying on public site
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingAd ? 'Save Changes' : 'Create Ad Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
