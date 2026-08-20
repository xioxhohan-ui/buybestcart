'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Globe, Save, CheckCircle2, Search, Sliders } from 'lucide-react';

export default function AdminSEOPage() {
  const [templates, setTemplates] = useState({
    default_title: 'Best Buy Cart — The Independent Guide to Better Tech & Lifestyle Products',
    default_description: 'Curated, tested, and verified recommendations for laptops, headphones, smart home gear, and gaming hardware with direct Amazon shopping.',
    homepage_title: 'Best Buy Cart — Honest Reviews, Buying Guides & Product Rankings',
    homepage_description: 'Discover top-rated products, in-depth comparisons, expert buying guides, and current verified Amazon deals.',
    product_template: '{product_name} — Price, Reviews & Best Alternatives | Best Buy Cart',
    category_template: 'Best {category} — Top Picks & Buying Guide | Best Buy Cart',
    brand_template: '{brand_name} Products, Ratings & Reviews | Best Buy Cart',
    article_template: '{article_title} | Best Buy Cart Editorial',
    review_template: '{product_name} Review — Pros, Cons & Verdict | Best Buy Cart',
    guide_template: 'The Definitive {category} Buying Guide ({year}) | Best Buy Cart',
    comparison_template: '{product_a} vs {product_b} — Head-to-Head Showdown | Best Buy Cart',
    default_og_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    canonical_base: 'https://buybestcart.shop',
    robots_default: 'index, follow',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase.from('settings').select('*').eq('key', 'seo').single();
      if (data && data.value) {
        setTemplates((prev) => ({ ...prev, ...data.value }));
      }
    };
    fetchTemplates();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('settings').upsert({
      key: 'seo',
      category: 'seo',
      value: templates,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '880px' }}>
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
            <Globe size={22} color="var(--green-accent)" />
            <span>SEO Engine & Dynamic Metadata Templates</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Configure global title patterns, Open Graph tags, canonical domain rules, and entity templates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Save size={13} />
          <span>{saving ? 'Saving...' : 'Save SEO Configuration'}</span>
        </button>
      </div>

      {saved && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>SEO templates saved successfully to Supabase database.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Global Defaults */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Global Meta Defaults & Open Graph</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Default Site Title
              </label>
              <input
                type="text"
                value={templates.default_title}
                onChange={(e) => setTemplates({ ...templates, default_title: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Default Meta Description
              </label>
              <textarea
                rows={2}
                value={templates.default_description}
                onChange={(e) => setTemplates({ ...templates, default_description: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Default Open Graph (OG) Share Image URL
                </label>
                <input
                  type="url"
                  value={templates.default_og_image}
                  onChange={(e) => setTemplates({ ...templates, default_og_image: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Robots Default Directive
                </label>
                <input
                  type="text"
                  value={templates.robots_default}
                  onChange={(e) => setTemplates({ ...templates, robots_default: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Entity Title Patterns */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Dynamic Entity Title Patterns</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Product Template (Tags: <code>{'{product_name}'}</code>)
              </label>
              <input
                type="text"
                value={templates.product_template}
                onChange={(e) => setTemplates({ ...templates, product_template: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Category Template (Tags: <code>{'{category}'}</code>)
              </label>
              <input
                type="text"
                value={templates.category_template}
                onChange={(e) => setTemplates({ ...templates, category_template: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Brand Directory Template (Tags: <code>{'{brand_name}'}</code>)
              </label>
              <input
                type="text"
                value={templates.brand_template}
                onChange={(e) => setTemplates({ ...templates, brand_template: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Buying Guide Template (Tags: <code>{'{category}'}</code>, <code>{'{year}'}</code>)
              </label>
              <input
                type="text"
                value={templates.guide_template}
                onChange={(e) => setTemplates({ ...templates, guide_template: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Comparison Template (Tags: <code>{'{product_a}'}</code>, <code>{'{product_b}'}</code>)
              </label>
              <input
                type="text"
                value={templates.comparison_template}
                onChange={(e) => setTemplates({ ...templates, comparison_template: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Review Template (Tags: <code>{'{product_name}'}</code>)
              </label>
              <input
                type="text"
                value={templates.review_template}
                onChange={(e) => setTemplates({ ...templates, review_template: e.target.value })}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save All SEO Settings to Supabase'}</span>
        </button>
      </form>
    </div>
  );
}
