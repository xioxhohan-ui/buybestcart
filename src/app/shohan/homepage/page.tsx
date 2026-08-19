'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Layout, ArrowUp, ArrowDown, Eye, EyeOff, Save, CheckCircle2, RotateCcw, Sliders, Layers } from 'lucide-react';
import { DEFAULT_SITE_CONFIG } from '@/lib/settings';

interface HomepageSectionConfig {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_text?: string;
  cta_url?: string;
  product_source?: 'featured' | 'deals' | 'top_ranked' | 'all';
  enabled: boolean;
  order: number;
  display_count?: number;
}

export default function AdminHomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSectionConfig[]>(DEFAULT_SITE_CONFIG.homepage_sections);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'homepage_layout')
      .single();

    if (data && Array.isArray(data.value)) {
      setSections(data.value);
    } else {
      setSections(DEFAULT_SITE_CONFIG.homepage_sections);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    const reindexed = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(reindexed);
  };

  const toggleSection = (id: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateSectionField = (id: string, field: keyof HomepageSectionConfig, val: any) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.from('settings').upsert({
      key: 'homepage_layout',
      category: 'homepage',
      value: sections,
      description: 'Homepage section display ordering, titles, display counts, and visibility',
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(`Error saving homepage layout: ${error.message}`);
    }
  };

  const handleReset = () => {
    if (confirm('Reset homepage layout to default factory ordering?')) {
      setSections(DEFAULT_SITE_CONFIG.homepage_sections);
    }
  };

  return (
    <div style={{ maxWidth: '980px' }}>
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
            <Layout size={22} color="var(--green-accent)" />
            <span>Homepage Section Builder & Section Controls</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Reorder, customize titles, display counts, product sources, and toggle visibility across all homepage blocks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RotateCcw size={13} />
            <span>Reset to Default</span>
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Save size={13} />
            <span>{saving ? 'Saving...' : 'Save Homepage Layout'}</span>
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>Homepage layout and section configurations saved successfully to Supabase database.</span>
        </div>
      )}

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {loading ? (
          <div style={{ background: 'var(--bg-surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            Loading section configuration...
          </div>
        ) : (
          sections.map((section, idx) => (
            <div
              key={section.id}
              style={{
                background: section.enabled ? 'var(--bg-surface)' : '#FAF9F6',
                border: `1px solid ${section.enabled ? 'var(--border)' : '#E7E5E4'}`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                opacity: section.enabled ? 1 : 0.65,
                boxShadow: section.enabled ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {/* Header Bar */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  background: section.enabled ? '#FFFFFF' : '#F5F5F4',
                }}
              >
                {/* Order Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {idx + 1}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '0.1rem', color: idx === 0 ? '#CBD5E1' : 'var(--text-secondary)' }}
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      style={{ background: 'none', border: 'none', cursor: idx === sections.length - 1 ? 'not-allowed' : 'pointer', padding: '0.1rem', color: idx === sections.length - 1 ? '#CBD5E1' : 'var(--text-secondary)' }}
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>

                {/* Section Title Preview */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {section.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Type: <code style={{ textTransform: 'uppercase' }}>{section.type}</code> • {section.subtitle || 'No eyebrow'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Sliders size={12} />
                    <span>{expandedSectionId === section.id ? 'Collapse Controls' : 'Edit Section Controls'}</span>
                  </button>

                  <button
                    onClick={() => toggleSection(section.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-xs)',
                      border: `1px solid ${section.enabled ? 'var(--green-border)' : 'var(--border)'}`,
                      background: section.enabled ? 'var(--green-light)' : '#FFFFFF',
                      color: section.enabled ? 'var(--green-accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {section.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{section.enabled ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>

              {/* Detailed Section Controls Drawer */}
              {expandedSectionId === section.id && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', background: '#FAF9F6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        Section Main Heading Title *
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSectionField(section.id, 'title', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        Eyebrow / Subtitle Tag
                      </label>
                      <input
                        type="text"
                        value={section.subtitle || ''}
                        placeholder="e.g. THE 2026 EDIT"
                        onChange={(e) => updateSectionField(section.id, 'subtitle', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Editorial Description Paragraph
                    </label>
                    <textarea
                      rows={2}
                      value={section.description || ''}
                      placeholder="Testing notes and context displayed beneath the heading..."
                      onChange={(e) => updateSectionField(section.id, 'description', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        Display Count (Items to Render)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={section.display_count || 8}
                        onChange={(e) => updateSectionField(section.id, 'display_count', parseInt(e.target.value) || 8)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        Product Source Query
                      </label>
                      <select
                        value={section.product_source || 'featured'}
                        onChange={(e) => updateSectionField(section.id, 'product_source', e.target.value as any)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      >
                        <option value="featured">Featured Picks (status = featured)</option>
                        <option value="deals">Active Deals (deal_status != none)</option>
                        <option value="top_ranked">Top Global Rank (#1 to #10)</option>
                        <option value="all">All Active Catalog Products</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={section.cta_text || ''}
                        placeholder="e.g. View All Picks →"
                        onChange={(e) => updateSectionField(section.id, 'cta_text', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        CTA Destination URL
                      </label>
                      <input
                        type="text"
                        value={section.cta_url || ''}
                        placeholder="e.g. /category/electronics"
                        onChange={(e) => updateSectionField(section.id, 'cta_url', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
