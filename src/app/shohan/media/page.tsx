'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  Sliders,
  Code,
  Tag,
  Monitor,
  Smartphone,
  Tablet,
  FileCode,
  RefreshCw,
  X,
} from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mime_type?: string;
  alt_text?: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  file_size?: number;
  created_at: string;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // New Media Form State
  const [newUrl, setNewUrl] = useState('');
  const [assetTitle, setAssetTitle] = useState('');
  const [assetAlt, setAssetAlt] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      setMediaList((data as MediaItem[]) || []);
    } catch (err) {
      console.error('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleTitleChange = (val: string) => {
    setAssetTitle(val);
    if (val && !assetAlt) {
      setAssetAlt(`${val} product photography and buying advice`);
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setSaving(true);
    try {
      const rawName = newUrl.split('/').pop()?.split('?')[0] || 'media-asset';
      const seoFilename = assetTitle
        ? `${assetTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`
        : rawName;

      const payload = {
        url: newUrl,
        filename: seoFilename,
        mime_type: newUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/webp',
        alt_text: assetAlt || assetTitle || 'BuyBestCart verified product photography',
        title: assetTitle || 'Product Asset',
        caption: 'Editorial product photograph',
        width: 1200,
        height: 800,
        file_size: 150000,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('media').insert([payload]);
      if (error) throw error;

      setNewUrl('');
      setAssetTitle('');
      setAssetAlt('');
      await fetchMedia();
      alert('Media asset added to PostgreSQL library with automated Google Image SEO metadata.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding media';
      alert(`Failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('media')
        .update({
          title: editingItem.title,
          alt_text: editingItem.alt_text,
          caption: editingItem.caption,
          url: editingItem.url,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      setEditingItem(null);
      await fetchMedia();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating media';
      alert(`Save failed: ${msg}`);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from media library?`)) {
      try {
        const { error } = await supabase.from('media').delete().eq('id', id);
        if (error) throw error;
        await fetchMedia();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error deleting media';
        alert(`Delete failed: ${msg}`);
      }
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    return (
      (m.title && m.title.toLowerCase().includes(search.toLowerCase())) ||
      (m.filename && m.filename.toLowerCase().includes(search.toLowerCase())) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div style={{ maxWidth: '1080px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={22} color="var(--green-accent)" />
            <span>Digital Asset Manager & Image SEO Pipeline</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Curate high-resolution WebP photography, automatic Alt tags, focal point presets, and clean CDN embeds.
          </p>
        </div>

        <button onClick={fetchMedia} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Library</span>
        </button>
      </div>

      {/* Add New Asset Card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={16} color="var(--green-accent)" />
          <span>Add Media Asset from CDN / Unsplash / Direct URL</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          Assets added here are persisted in PostgreSQL with automated Google Image Search structured metadata.
        </p>

        <form onSubmit={handleAddMedia} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Image Direct URL (WebP / JPG / PNG / SVG) *
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Asset Title / Headline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sony WH-1000XM5 Studio View"
                value={assetTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                SEO Alt Text (Google Images)
              </label>
              <input
                type="text"
                placeholder="e.g. Sony WH-1000XM5 wireless noise cancelling headphones on studio stand"
                value={assetAlt}
                onChange={(e) => setAssetAlt(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
              <Upload size={14} />
              <span>{saving ? 'Adding to Library...' : 'Save & Register Image'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search media by title, filename, or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
          />
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredMedia.length}</strong> of {mediaList.length} assets
        </div>
      </div>

      {/* Media Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {mediaList.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
            <ImageIcon size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.25rem' }}>No Media Assets in Library</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
              Add your first image URL above to persist photographs, vector icons, and SEO metadata.
            </p>
          </div>
        ) : (
          filteredMedia.map((m) => (
          <div
            key={m.id}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ position: 'relative', height: '160px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={m.url}
                alt={m.alt_text || m.title || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                {m.mime_type?.includes('svg') ? 'SVG' : 'WebP'}
              </span>
            </div>

            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.title || m.filename}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.filename}
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => copyToClipboard(m.url, m.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: '0.72rem', justifyContent: 'center', gap: '0.25rem' }}
                >
                  {copiedId === m.id ? <CheckCircle2 size={12} color="var(--success)" /> : <Copy size={12} />}
                  <span>{copiedId === m.id ? 'Copied' : 'Copy URL'}</span>
                </button>
                <button
                  onClick={() => setEditingItem(m)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(m.id, m.title || m.filename)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', color: 'var(--error)' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Media Metadata</h2>
              <button
                onClick={() => setEditingItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Asset Title
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Image Alt Text (SEO)
                </label>
                <input
                  type="text"
                  value={editingItem.alt_text || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, alt_text: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Caption / Testing Context
                </label>
                <input
                  type="text"
                  value={editingItem.caption || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
