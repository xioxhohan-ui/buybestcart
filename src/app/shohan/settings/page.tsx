'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Settings,
  Palette,
  Sparkles,
  FileText,
  ToggleLeft,
  Save,
  CheckCircle2,
  Globe,
  Award,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_SITE_CONFIG, SiteConfiguration } from '@/lib/settings';

export default function AdminSettingsAndThemePage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'hero' | 'legal' | 'flags'>('branding');
  const [config, setConfig] = useState<SiteConfiguration>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('settings').select('*');

    if (data && data.length > 0) {
      const merged = { ...DEFAULT_SITE_CONFIG };
      data.forEach((row) => {
        if (row.key === 'general' && row.value) Object.assign(merged, row.value);
        if (row.key === 'branding' && row.value) Object.assign(merged, row.value);
        if (row.key === 'theme' && row.value) Object.assign(merged, row.value);
        if (row.key === 'affiliate' && row.value?.disclosure_text) merged.disclosure_text = row.value.disclosure_text;
        if (row.key === 'feature_flags' && row.value) merged.feature_flags = { ...merged.feature_flags, ...row.value };
      });
      setConfig(merged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const now = new Date().toISOString();

    // 1. General & Hero
    await supabase.from('settings').upsert({
      key: 'general',
      category: 'general',
      value: {
        site_name: config.site_name,
        tagline: config.tagline,
        hero_heading: config.hero_heading,
        hero_subheading: config.hero_subheading,
        hero_description: config.hero_description,
        marquee_text: config.marquee_text,
        support_email: config.support_email,
        contact_email: config.contact_email,
      },
      updated_at: now,
    });

    // 2. Branding
    await supabase.from('settings').upsert({
      key: 'branding',
      category: 'branding',
      value: {
        company_name: config.company_name,
        brand_description: config.brand_description,
        logo_url: config.logo_url,
        logo_dark_url: config.logo_dark_url,
        logo_mobile_url: config.logo_mobile_url,
        favicon_url: config.favicon_url,
        footer_logo_url: config.footer_logo_url,
        browser_theme_color: config.browser_theme_color,
        og_default_image: config.og_default_image,
        default_social_image: config.default_social_image,
        social_links: config.social_links,
      },
      updated_at: now,
    });

    // 3. Theme Tokens
    await supabase.from('settings').upsert({
      key: 'theme',
      category: 'theme',
      value: {
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        accent_color: config.accent_color,
        background_color: config.background_color,
        surface_color: config.surface_color,
        text_color: config.text_color,
        muted_text_color: config.muted_text_color,
        border_color: config.border_color,
        button_radius: config.button_radius,
        card_radius: config.card_radius,
        shadow_intensity: config.shadow_intensity,
        font_family: config.font_family,
        heading_weight: config.heading_weight,
        body_weight: config.body_weight,
        layout_density: config.layout_density,
      },
      updated_at: now,
    });

    // 4. Affiliate
    await supabase.from('settings').upsert({
      key: 'affiliate',
      category: 'affiliate',
      value: { disclosure_text: config.disclosure_text },
      updated_at: now,
    });

    // 5. Feature Flags
    await supabase.from('settings').upsert({
      key: 'feature_flags',
      category: 'system',
      value: config.feature_flags,
      updated_at: now,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetTheme = () => {
    if (confirm('Reset theme tokens to factory Luxury Editorial palette?')) {
      setConfig({
        ...config,
        primary_color: DEFAULT_SITE_CONFIG.primary_color,
        secondary_color: DEFAULT_SITE_CONFIG.secondary_color,
        accent_color: DEFAULT_SITE_CONFIG.accent_color,
        background_color: DEFAULT_SITE_CONFIG.background_color,
        surface_color: DEFAULT_SITE_CONFIG.surface_color,
        text_color: DEFAULT_SITE_CONFIG.text_color,
        muted_text_color: DEFAULT_SITE_CONFIG.muted_text_color,
        border_color: DEFAULT_SITE_CONFIG.border_color,
        button_radius: DEFAULT_SITE_CONFIG.button_radius,
        card_radius: DEFAULT_SITE_CONFIG.card_radius,
        heading_weight: DEFAULT_SITE_CONFIG.heading_weight,
        body_weight: DEFAULT_SITE_CONFIG.body_weight,
      });
    }
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
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
            <Settings size={22} color="var(--green-accent)" />
            <span>Platform Settings & Theme Design System</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Configure website branding, typography, color tokens, hero copy, and feature flags.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Save size={13} />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {saved && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>Settings, branding, and theme tokens saved successfully to Supabase database.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('branding')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'branding' ? 700 : 500,
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'branding' ? '1px solid var(--green-border)' : '1px solid transparent',
            background: activeTab === 'branding' ? 'var(--green-light)' : 'transparent',
            color: activeTab === 'branding' ? 'var(--green-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Globe size={13} />
          <span>Brand & Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'theme' ? 700 : 500,
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'theme' ? '1px solid var(--green-border)' : '1px solid transparent',
            background: activeTab === 'theme' ? 'var(--green-light)' : 'transparent',
            color: activeTab === 'theme' ? 'var(--green-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Palette size={13} />
          <span>Theme & Design System</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'hero' ? 700 : 500,
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'hero' ? '1px solid var(--green-border)' : '1px solid transparent',
            background: activeTab === 'hero' ? 'var(--green-light)' : 'transparent',
            color: activeTab === 'hero' ? 'var(--green-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Sparkles size={13} />
          <span>Hero & Marquee Copy</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'legal' ? 700 : 500,
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'legal' ? '1px solid var(--green-border)' : '1px solid transparent',
            background: activeTab === 'legal' ? 'var(--green-light)' : 'transparent',
            color: activeTab === 'legal' ? 'var(--green-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <FileText size={13} />
          <span>Affiliate Disclosures</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'flags' ? 700 : 500,
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'flags' ? '1px solid var(--green-border)' : '1px solid transparent',
            background: activeTab === 'flags' ? 'var(--green-light)' : 'transparent',
            color: activeTab === 'flags' ? 'var(--green-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <ToggleLeft size={13} />
          <span>Feature Flags</span>
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* TAB 1: BRANDING */}
        {activeTab === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Brand & Organization Identity</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Website Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={config.site_name}
                    onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={config.company_name}
                    onChange={(e) => setConfig({ ...config, company_name: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Site-Wide Tagline
                  </label>
                  <input
                    type="text"
                    value={config.tagline}
                    onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Brand Editorial Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    value={config.brand_description}
                    onChange={(e) => setConfig({ ...config, brand_description: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', lineHeight: 1.5 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Contact & Support Communications</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Editorial Support Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={config.support_email}
                    onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    General Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={config.contact_email}
                    onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Social Channels & Profiles</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Twitter / X URL
                  </label>
                  <input
                    type="url"
                    value={config.social_links?.twitter_x || ''}
                    onChange={(e) => setConfig({ ...config, social_links: { ...config.social_links, twitter_x: e.target.value } })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={config.social_links?.youtube || ''}
                    onChange={(e) => setConfig({ ...config, social_links: { ...config.social_links, youtube: e.target.value } })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THEME & DESIGN TOKENS */}
        {activeTab === 'theme' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Color Palette Design Tokens</h2>
                <button type="button" onClick={handleResetTheme} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RotateCcw size={12} />
                  <span>Reset Palette</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Primary Color (Obsidian)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Accent Color (Heritage Green)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.accent_color}
                      onChange={(e) => setConfig({ ...config, accent_color: e.target.value })}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Canvas Background
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={config.background_color}
                      onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.background_color}
                      onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Border Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={config.border_color}
                      onChange={(e) => setConfig({ ...config, border_color: e.target.value })}
                      style={{ width: '36px', height: '36px', border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={config.border_color}
                      onChange={(e) => setConfig({ ...config, border_color: e.target.value })}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Geometry & Typography Weights</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Button Radius
                  </label>
                  <select
                    value={config.button_radius}
                    onChange={(e) => setConfig({ ...config, button_radius: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="3px">Sharp Subtle (3px)</option>
                    <option value="6px">Organic Balanced (6px - Default)</option>
                    <option value="10px">Soft Rounded (10px)</option>
                    <option value="9999px">Full Pill (9999px)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Card Radius
                  </label>
                  <select
                    value={config.card_radius}
                    onChange={(e) => setConfig({ ...config, card_radius: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="4px">Compact (4px)</option>
                    <option value="8px">Editorial Standard (8px - Default)</option>
                    <option value="12px">Luxury Elevated (12px)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Heading Font Weight
                  </label>
                  <select
                    value={config.heading_weight}
                    onChange={(e) => setConfig({ ...config, heading_weight: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  >
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700 - Default)</option>
                    <option value="800">Extra-Bold Display (800)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Interactive Token Preview */}
            <div style={{ background: config.background_color, border: `1px solid ${config.border_color}`, borderRadius: config.card_radius, padding: '2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: config.accent_color, letterSpacing: '0.08em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                LIVE TOKEN PREVIEW
              </div>
              <h3 style={{ fontSize: '1.5rem', color: config.primary_color, fontWeight: config.heading_weight as any, marginBottom: '0.5rem' }}>
                Preview of Custom Theme Tokens
              </h3>
              <p style={{ fontSize: '0.9375rem', color: config.secondary_color, lineHeight: 1.6, marginBottom: '1.25rem' }}>
                This is a live rendered preview of how your custom primary obsidian, heritage green accent, and border radius tokens will render across public product cards.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" style={{ background: config.primary_color, color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: config.button_radius, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Primary CTA Button
                </button>
                <button type="button" style={{ background: 'transparent', color: config.accent_color, padding: '0.5rem 1rem', borderRadius: config.button_radius, border: `1px solid ${config.border_color}`, fontWeight: 700, cursor: 'pointer' }}>
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HERO & MARQUEE */}
        {activeTab === 'hero' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Homepage Hero Section Copy</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Main Headline Title
                  </label>
                  <input
                    type="text"
                    value={config.hero_heading}
                    onChange={(e) => setConfig({ ...config, hero_heading: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Italic Highlight Subline
                  </label>
                  <input
                    type="text"
                    value={config.hero_subheading}
                    onChange={(e) => setConfig({ ...config, hero_subheading: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Hero Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={config.hero_description}
                    onChange={(e) => setConfig({ ...config, hero_description: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', lineHeight: 1.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Running Marquee Ticker Text
                  </label>
                  <input
                    type="text"
                    value={config.marquee_text}
                    onChange={(e) => setConfig({ ...config, marquee_text: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEGAL */}
        {activeTab === 'legal' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>FTC & Amazon Associates Disclaimer</h2>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Legal Statement (Renders in footer & on product cards)
              </label>
              <textarea
                rows={4}
                value={config.disclosure_text}
                onChange={(e) => setConfig({ ...config, disclosure_text: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', lineHeight: 1.5 }}
              />
            </div>
          </div>
        )}

        {/* TAB 5: FEATURE FLAGS */}
        {activeTab === 'flags' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Global Website Feature Toggles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <input
                  type="checkbox"
                  id="flag_compare"
                  checked={config.feature_flags?.comparisons ?? true}
                  onChange={(e) => setConfig({ ...config, feature_flags: { ...config.feature_flags, comparisons: e.target.checked } })}
                />
                <label htmlFor="flag_compare" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Side-by-Side Comparison Matrix (/compare)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <input
                  type="checkbox"
                  id="flag_price"
                  checked={config.feature_flags?.price_tracking ?? true}
                  onChange={(e) => setConfig({ ...config, feature_flags: { ...config.feature_flags, price_tracking: e.target.checked } })}
                />
                <label htmlFor="flag_price" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Real-Time Price & Deal Tracker (/deals)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <input
                  type="checkbox"
                  id="flag_multi"
                  checked={config.feature_flags?.multi_region ?? true}
                  onChange={(e) => setConfig({ ...config, feature_flags: { ...config.feature_flags, multi_region: e.target.checked } })}
                />
                <label htmlFor="flag_multi" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  11 International Amazon Marketplaces
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <input
                  type="checkbox"
                  id="flag_news"
                  checked={config.feature_flags?.newsletter ?? true}
                  onChange={(e) => setConfig({ ...config, feature_flags: { ...config.feature_flags, newsletter: e.target.checked } })}
                />
                <label htmlFor="flag_news" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                  Weekly Shopping Edit Newsletter
                </label>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem' }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Configuration to Supabase'}</span>
        </button>
      </form>
    </div>
  );
}
