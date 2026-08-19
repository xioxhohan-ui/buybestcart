'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Compass, Plus, Trash2, ArrowUp, ArrowDown, Save, CheckCircle2, RotateCcw, Link2 } from 'lucide-react';
import { Category, Article } from '@/types';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  highlight?: boolean;
  enabled: boolean;
  order: number;
}

const DEFAULT_PRIMARY_NAV: NavItem[] = [
  { id: 'nav-elec', label: 'Electronics', href: '/category/electronics', icon: 'cpu', enabled: true, order: 1 },
  { id: 'nav-comp', label: 'Computers', href: '/category/computers-laptops', icon: 'laptop', enabled: true, order: 2 },
  { id: 'nav-game', label: 'Gaming', href: '/category/gaming', icon: 'gamepad-2', enabled: true, order: 3 },
  { id: 'nav-home', label: 'Home & Kitchen', href: '/category/home-kitchen', icon: 'home', enabled: true, order: 4 },
  { id: 'nav-smart', label: 'Smart Home', href: '/smart-home/best-smart-home-products', icon: 'shield-check', enabled: true, order: 5 },
  { id: 'nav-beauty', label: 'Beauty', href: '/category/beauty', icon: 'sparkles', enabled: true, order: 6 },
  { id: 'nav-health', label: 'Wellness', href: '/category/health-wellness', icon: 'heart-pulse', enabled: true, order: 7 },
  { id: 'nav-sports', label: 'Sports', href: '/category/sports', icon: 'dumbbell', enabled: true, order: 8 },
  { id: 'nav-outdoors', label: 'Outdoors', href: '/category/outdoors', icon: 'tent', enabled: true, order: 9 },
];

export default function AdminNavigationPage() {
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_PRIMARY_NAV);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guides, setGuides] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchNavigation = async () => {
    setLoading(true);
    const [navRes, catRes, guideRes] = await Promise.all([
      supabase.from('settings').select('*').eq('key', 'navigation_config').single(),
      supabase.from('categories').select('id, name, slug').order('name', { ascending: true }),
      supabase.from('articles').select('id, title, slug').order('title', { ascending: true }),
    ]);

    if (navRes.data && Array.isArray(navRes.data.value)) {
      setNavItems(navRes.data.value);
    } else {
      setNavItems(DEFAULT_PRIMARY_NAV);
    }

    if (catRes.data) setCategories(catRes.data as Category[]);
    if (guideRes.data) setGuides(guideRes.data as Article[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= navItems.length) return;

    const copy = [...navItems];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    setNavItems(copy.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  const toggleItem = (id: string) => {
    setNavItems(
      navItems.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const updateItem = (id: string, field: keyof NavItem, value: any) => {
    setNavItems(
      navItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      label: 'New Department Link',
      href: '/category/electronics',
      icon: 'cpu',
      enabled: true,
      order: navItems.length + 1,
    };
    setNavItems([...navItems, newItem]);
  };

  const deleteItem = (id: string) => {
    if (confirm('Delete this menu item?')) {
      setNavItems(navItems.filter((i) => i.id !== id));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.from('settings').upsert({
      key: 'navigation_config',
      category: 'navigation',
      value: navItems,
      description: 'Header primary sub-navigation bar links and department ordering',
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(`Error saving navigation: ${error.message}`);
    }
  };

  const handleReset = () => {
    if (confirm('Reset navigation to factory 9 department tabs?')) {
      setNavItems(DEFAULT_PRIMARY_NAV);
    }
  };

  return (
    <div style={{ maxWidth: '960px' }}>
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
            <Compass size={22} color="var(--green-accent)" />
            <span>Navigation & Mega Menu Builder</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Configure primary department tabs, custom routes, reordering, and direct dropdown links.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RotateCcw size={13} />
            <span>Reset to Default</span>
          </button>
          <button onClick={addItem} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Plus size={13} />
            <span>Add Menu Item</span>
          </button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Save size={13} />
            <span>{saving ? 'Saving...' : 'Save Navigation to DB'}</span>
          </button>
        </div>
      </div>

      {saved && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>Navigation bar configuration saved successfully to Supabase database.</span>
        </div>
      )}

      {/* Quick Link Generator Helper */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Link2 size={14} color="var(--green-accent)" />
          <span>Quick Link Picker:</span>
        </span>
        <select
          onChange={(e) => {
            if (e.target.value) {
              const [label, href] = e.target.value.split('|');
              const newItem: NavItem = {
                id: `nav-${Date.now()}`,
                label,
                href,
                icon: 'folder',
                enabled: true,
                order: navItems.length + 1,
              };
              setNavItems([...navItems, newItem]);
            }
          }}
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
          defaultValue=""
        >
          <option value="" disabled>Select a Category or Guide to Add...</option>
          <optgroup label="Categories">
            {categories.map((c) => (
              <option key={c.id} value={`${c.name}|/category/${c.slug}`}>
                Category: {c.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Buying Guides">
            {guides.map((g) => (
              <option key={g.id} value={`${g.title}|/guides/${g.slug}`}>
                Guide: {g.title.slice(0, 35)}...
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Menu Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ background: 'var(--bg-surface)', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            Loading navigation settings...
          </div>
        ) : (
          navItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                background: item.enabled ? 'var(--bg-surface)' : '#FAF9F6',
                border: `1px solid ${item.enabled ? 'var(--border)' : '#E7E5E4'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                opacity: item.enabled ? 1 : 0.65,
                boxShadow: item.enabled ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {/* Order index & move buttons */}
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
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '0.1rem', color: idx === 0 ? '#CBD5E1' : 'var(--text-secondary)' }}
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === navItems.length - 1}
                    style={{ background: 'none', border: 'none', cursor: idx === navItems.length - 1 ? 'not-allowed' : 'pointer', padding: '0.1rem', color: idx === navItems.length - 1 ? '#CBD5E1' : 'var(--text-secondary)' }}
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                </div>
              </div>

              {/* Label & URL Inputs */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(160px, 1.2fr) minmax(180px, 1.4fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Menu Label
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Destination URL / Route
                  </label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => updateItem(item.id, 'href', e.target.value)}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              {/* Toggle & Delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => toggleItem(item.id)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-xs)',
                    border: `1px solid ${item.enabled ? 'var(--green-border)' : 'var(--border)'}`,
                    background: item.enabled ? 'var(--green-light)' : '#FFFFFF',
                    color: item.enabled ? 'var(--green-accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {item.enabled ? 'Active' : 'Disabled'}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.35rem' }}
                  title="Remove from navigation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
