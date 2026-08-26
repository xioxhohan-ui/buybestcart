'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
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
  Compass,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { DEFAULT_SITE_CONFIG, SiteConfiguration } from '@/lib/settings';
import { AMAZON_SUPPORTED_COUNTRIES, resolveLocationCurrency, AVAILABLE_CURRENCIES } from '@/lib/geo';

export default function AdminSettingsAndThemePage() {
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'hero' | 'legal' | 'flags' | 'geo'>('branding');
  const [testCountry, setTestCountry] = useState<string>('BD');
  const [config, setConfig] = useState<SiteConfiguration>(DEFAULT_SITE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [disclosurePreviewDevice, setDisclosurePreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showDisclosureWarningModal, setShowDisclosureWarningModal] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('settings').select('*');

    if (data && data.length > 0) {
      const merged = { ...DEFAULT_SITE_CONFIG };
      data.forEach((row) => {
        if (row.key === 'general' && row.value) Object.assign(merged, row.value);
        if (row.key === 'branding' && row.value) Object.assign(merged, row.value);
        if (row.key === 'theme' && row.value) Object.assign(merged, row.value);
        if (row.key === 'affiliate' && row.value) {
          if (row.value.amazon_associate_statement) merged.amazon_associate_statement = row.value.amazon_associate_statement;
          if (row.value.disclosure_text) merged.disclosure_text = row.value.disclosure_text;
          if (row.value.link_level_disclosure) merged.link_level_disclosure = row.value.link_level_disclosure;
          if (row.value.affiliate_disclosure_page_content) merged.affiliate_disclosure_page_content = row.value.affiliate_disclosure_page_content;
        }
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

    // Parallelize all settings upserts for immediate save feedback
    await Promise.all([
      supabase.from('settings').upsert({
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
      }),
      supabase.from('settings').upsert({
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
      }),
      supabase.from('settings').upsert({
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
          font_family: config.font_family,
          heading_weight: config.heading_weight,
          body_weight: config.body_weight,
          layout_density: config.layout_density,
        },
        updated_at: now,
      }),
      supabase.from('settings').upsert({
        key: 'affiliate',
        category: 'affiliate',
        value: {
          amazon_associate_statement: config.amazon_associate_statement,
          disclosure_text: config.disclosure_text,
          link_level_disclosure: config.link_level_disclosure,
          affiliate_disclosure_page_content: config.affiliate_disclosure_page_content,
        },
        updated_at: now,
      }),
      supabase.from('settings').upsert({
        key: 'feature_flags',
        category: 'system',
        value: config.feature_flags,
        updated_at: now,
      }),
    ]);

    setSaving(false);
    setSaved(true);
    triggerRevalidation();
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

        <button
          type="button"
          onClick={() => setActiveTab('geo')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: activeTab === 'geo' ? 700 : 500,
            borderRadius: 'var(--radius-xs)',
            border: activeTab === 'geo' ? '1px solid var(--green-border)' : '1px solid transparent',
            background: activeTab === 'geo' ? 'var(--green-light)' : 'transparent',
            color: activeTab === 'geo' ? 'var(--green-accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Compass size={13} />
          <span>Geo &amp; Currency Detection</span>
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

        {/* TAB 4: LEGAL & AMAZON AFFILIATE DISCLOSURES */}
        {activeTab === 'legal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header & Reset Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>
                  Amazon Affiliate Disclosure &amp; Transparency Management
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Manage the mandatory Amazon Associates identification statement, global footer disclosures, and link-level reader notices.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Restore default Amazon-compliant disclosure wording across all fields?')) {
                    setConfig({
                      ...config,
                      amazon_associate_statement: DEFAULT_SITE_CONFIG.amazon_associate_statement,
                      disclosure_text: DEFAULT_SITE_CONFIG.disclosure_text,
                      link_level_disclosure: DEFAULT_SITE_CONFIG.link_level_disclosure,
                    });
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCcw size={13} />
                <span>Restore Compliant Wording</span>
              </button>
            </div>

            {/* Section 1: Mandatory Associates Identification Statement */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--green-accent)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  1. Mandatory Amazon Associates Statement (Operating Agreement § 5)
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                Amazon Associates Operating Agreement strictly requires you to clearly state the following on your site without alteration:
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={config.amazon_associate_statement || ''}
                  onChange={(e) => setConfig({ ...config, amazon_associate_statement: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border:
                      !config.amazon_associate_statement?.toLowerCase().includes('amazon associate') ||
                      !config.amazon_associate_statement?.toLowerCase().includes('qualifying purchases')
                        ? '2px solid #EF4444'
                        : '1px solid var(--border-strong)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    background: '#FAF9F6',
                  }}
                />
              </div>

              {/* Warning Alert if Statement is Invalid / Altered */}
              {(!config.amazon_associate_statement?.toLowerCase().includes('amazon associate') ||
                !config.amazon_associate_statement?.toLowerCase().includes('qualifying purchases')) && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '0.5rem',
                    lineHeight: 1.5,
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Compliance Warning:</strong> Amazon policy requires the exact phrasing <em>“As an Amazon Associate I earn from qualifying purchases.”</em> Removing this statement puts your Associates account at immediate risk of suspension.
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Global Footer Disclosure */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                2. Global Footer Reader Disclosure Text
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                Renders directly in the footer colophon on every page across the website, adjacent to the link to <code>/affiliate-disclosure</code>.
              </p>
              <textarea
                rows={3}
                value={config.disclosure_text}
                onChange={(e) => setConfig({ ...config, disclosure_text: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', lineHeight: 1.5, fontSize: '0.8125rem' }}
              />
            </div>

            {/* Section 3: Link-Level Contextual Micro-Disclosure */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                3. Link-Level Contextual Micro-Disclosure
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                Renders directly beneath Amazon CTA buttons and product recommendation boxes to ensure FTC and Amazon compliance before click-through.
              </p>
              <input
                type="text"
                value={config.link_level_disclosure || ''}
                onChange={(e) => setConfig({ ...config, link_level_disclosure: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
              />
            </div>

            {/* Section 4: Live Multi-Device Preview Frame */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                    Live Multi-Device Disclosure Preview
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Simulate how disclosures render across desktop, tablet, and mobile viewport widths.
                  </p>
                </div>

                {/* Device Switcher */}
                <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setDisclosurePreviewDevice('desktop')}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      background: disclosurePreviewDevice === 'desktop' ? 'var(--bg-surface)' : 'transparent',
                      color: disclosurePreviewDevice === 'desktop' ? 'var(--green-accent)' : 'var(--text-muted)',
                      boxShadow: disclosurePreviewDevice === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Monitor size={13} />
                    <span>Desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisclosurePreviewDevice('tablet')}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      background: disclosurePreviewDevice === 'tablet' ? 'var(--bg-surface)' : 'transparent',
                      color: disclosurePreviewDevice === 'tablet' ? 'var(--green-accent)' : 'var(--text-muted)',
                      boxShadow: disclosurePreviewDevice === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Tablet size={13} />
                    <span>Tablet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisclosurePreviewDevice('mobile')}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: 'var(--radius-xs)',
                      background: disclosurePreviewDevice === 'mobile' ? 'var(--bg-surface)' : 'transparent',
                      color: disclosurePreviewDevice === 'mobile' ? 'var(--green-accent)' : 'var(--text-muted)',
                      boxShadow: disclosurePreviewDevice === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Smartphone size={13} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Preview Container */}
              <div
                style={{
                  maxWidth: disclosurePreviewDevice === 'mobile' ? '375px' : disclosurePreviewDevice === 'tablet' ? '680px' : '100%',
                  margin: '0 auto',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'max-width 0.3s ease',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {/* 1. Contextual CTA & Link Disclosure Preview */}
                <div style={{ background: '#FAF9F6', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Preview: Contextual Recommendation CTA
                  </div>
                  <div style={{ maxWidth: '320px', margin: '0 auto', textAlign: 'center' }}>
                    <div className="btn btn-amazon" style={{ width: '100%', justifyContent: 'center', gap: '0.4rem', pointerEvents: 'none' }}>
                      <span>Check Price on Amazon</span>
                      <span style={{ fontSize: '0.85rem' }}>↗</span>
                    </div>
                    {config.link_level_disclosure ? (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.45rem', lineHeight: 1.4 }}>
                        <span>{config.link_level_disclosure}</span>{' '}
                        <span style={{ textDecoration: 'underline', color: 'var(--text-secondary)', fontWeight: 600 }}>Details</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 2. Global Footer Disclosure Bar Preview */}
                <div style={{ background: '#1C1917', color: '#D6D3D1', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--green-gold)', marginBottom: '0.65rem' }}>
                    Preview: Global Footer Disclosure
                  </div>
                  <div style={{ fontWeight: 700, color: '#FAF9F5', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                    &ldquo;{config.amazon_associate_statement || 'As an Amazon Associate I earn from qualifying purchases.'}&rdquo;
                  </div>
                  <p style={{ margin: 0, color: '#A8A29E', fontSize: '0.75rem', lineHeight: 1.5 }}>
                    {config.disclosure_text || 'Buy Best Cart is an independent, reader-supported publication. When you buy through links on our site, we may earn an affiliate commission from Amazon and other verified retail partners at no extra cost to you.'}{' '}
                    <span style={{ color: '#FAF9F5', textDecoration: 'underline', fontWeight: 600 }}>
                      Amazon Affiliate Disclosure →
                    </span>
                  </p>
                </div>
              </div>
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

        {/* TAB 6: GEO & CURRENCY DETECTION */}
        {activeTab === 'geo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Resolution Architecture Info Card */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Compass size={18} color="var(--green-accent)" />
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Automatic Geo-IP &amp; Amazon Currency Detection</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Buy Best Cart inspects visitor IP and edge geolocation headers (Cloudflare <code>cf-ipcountry</code>, Vercel <code>x-vercel-ip-country</code>) server-side without exposing raw IP addresses to public HTML.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green-accent)', marginBottom: '0.35rem' }}>
                    ✓ Amazon-Supported Countries
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Visitors from direct Amazon shopping regions (e.g. UK, Germany, France, Canada, Australia, Japan) automatically see their official localized storefront currency (GBP £, EUR €, CAD CA$, AUD A$, JPY ¥).
                  </div>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
                    ✓ Unsupported Country Standard (USD Default)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Visitors from countries outside Amazon's domestic shopping network strictly default to <strong>USD ($)</strong> on Amazon.com to prevent invalid non-Amazon local currency checkout mismatches.
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Country Resolution Simulator */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Coins size={18} color="var(--green-accent)" />
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Country Resolution Simulator</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Test any 2-letter ISO country code to verify the resolved currency and Amazon marketplace endpoint.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="test_country_input" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                    Enter ISO Country Code:
                  </label>
                  <input
                    id="test_country_input"
                    type="text"
                    maxLength={3}
                    value={testCountry}
                    onChange={(e) => setTestCountry(e.target.value.toUpperCase())}
                    style={{
                      width: '80px',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-subtle)',
                      textAlign: 'center',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {['US', 'GB', 'DE', 'CA', 'AU', 'JP', 'BD', 'NG', 'IN', 'FR', 'BR'].map((quickCode) => (
                    <button
                      key={quickCode}
                      type="button"
                      onClick={() => setTestCountry(quickCode)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border)',
                        background: testCountry === quickCode ? 'var(--green-light)' : 'var(--bg-subtle)',
                        color: testCountry === quickCode ? 'var(--green-accent)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      {quickCode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolved Simulation Result */}
              {(() => {
                const res = resolveLocationCurrency(testCountry);
                return (
                  <div
                    style={{
                      background: res.isAmazonSupported ? 'var(--green-light)' : 'var(--bg-subtle)',
                      border: `1px solid ${res.isAmazonSupported ? 'var(--green-border)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Input Country
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {testCountry || 'EMPTY'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Amazon Supported?
                      </div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: res.isAmazonSupported ? 'var(--green-accent)' : 'var(--text-muted)' }}>
                        {res.isAmazonSupported ? '✓ Yes (Amazon Domestic)' : '✕ No (Defaults to USD)'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Displayed Currency
                      </div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {res.currency} ({res.marketplace.currency_symbol})
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Amazon Marketplace Endpoint
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {res.marketplace.flag_emoji} {res.marketplace.domain}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Configured Amazon Countries Registry */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>
                Active Amazon Storefront &amp; Currency Registry ({Object.keys(AMAZON_SUPPORTED_COUNTRIES).length} Configured)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="editorial-table" style={{ width: '100%', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem' }}>Region / Country</th>
                      <th style={{ textAlign: 'center', padding: '0.6rem 0.75rem' }}>ISO Code</th>
                      <th style={{ textAlign: 'center', padding: '0.6rem 0.75rem' }}>Currency</th>
                      <th style={{ textAlign: 'center', padding: '0.6rem 0.75rem' }}>Symbol</th>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem' }}>Amazon Storefront Domain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(AMAZON_SUPPORTED_COUNTRIES).map((mkt) => (
                      <tr key={mkt.country_code}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>
                          <span style={{ marginRight: '0.5rem' }}>{mkt.flag_emoji}</span>
                          <span>{mkt.country_name}</span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {mkt.country_code}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: 'var(--green-accent)' }}>
                          {mkt.currency}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                          {mkt.currency_symbol}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {mkt.domain}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
