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
} from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'svg' | 'banner';
  alt_text: string;
  title_text: string;
  caption?: string;
  copyright?: string;
  focal_point?: string;
  size: string;
  dimensions: string;
  format: string;
  created_at: string;
}

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'm-1',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    name: 'sony-wh-1000xm5-wireless-headphones.webp',
    type: 'image',
    alt_text: 'Sony WH-1000XM5 wireless noise cancelling headphones on studio stand',
    title_text: 'Sony WH-1000XM5 Wireless Headphones',
    caption: 'Official product photograph used in lab reviews',
    copyright: 'Sony Electronics Inc.',
    focal_point: 'center',
    size: '142 KB',
    dimensions: '1200 × 800',
    format: 'WebP',
    created_at: '2026-08-19',
  },
  {
    id: 'm-2',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    name: 'apple-macbook-air-m3-15-inch.webp',
    type: 'image',
    alt_text: 'Apple MacBook Air M3 15-inch laptop open on wooden editorial desk',
    title_text: 'Apple MacBook Air M3 15-Inch',
    caption: 'MacBook Air M3 testing unit',
    copyright: 'Apple Inc.',
    focal_point: 'center',
    size: '188 KB',
    dimensions: '1200 × 800',
    format: 'WebP',
    created_at: '2026-08-18',
  },
  {
    id: 'm-3',
    url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    name: 'asus-rog-zephyrus-g16-gaming-laptop.webp',
    type: 'image',
    alt_text: 'ASUS ROG Zephyrus G16 OLED gaming laptop keyboard RGB backlight',
    title_text: 'ASUS ROG Zephyrus G16 Gaming Laptop',
    caption: 'Gaming laptop OLED display benchmark',
    copyright: 'ASUS Computer',
    focal_point: 'center',
    size: '210 KB',
    dimensions: '1200 × 800',
    format: 'WebP',
    created_at: '2026-08-17',
  },
  {
    id: 'm-4',
    url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
    name: 'smart-home-hub-lighting-security.webp',
    type: 'image',
    alt_text: 'Smart home hub automation controller and wireless ambient lighting',
    title_text: 'Smart Home Automation & Lighting',
    caption: 'Smart home ecosystem comparison',
    copyright: 'BuyBestCart Editorial',
    focal_point: 'center',
    size: '165 KB',
    dimensions: '1200 × 800',
    format: 'WebP',
    created_at: '2026-08-16',
  },
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // New Media Form State
  const [newUrl, setNewUrl] = useState('');
  const [assetTitle, setAssetTitle] = useState('');
  const [assetAlt, setAssetAlt] = useState('');
  const [assetType, setAssetType] = useState<'image' | 'svg' | 'banner'>('image');

  // Auto-generate clean SEO filename and ALT text when title changes
  const handleTitleChange = (val: string) => {
    setAssetTitle(val);
    if (val && !assetAlt) {
      setAssetAlt(`${val} product photography and buying advice`);
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const rawName = newUrl.split('/').pop()?.split('?')[0] || 'media-asset';
    const seoFilename = assetTitle
      ? `${assetTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.webp`
      : rawName;

    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      url: newUrl,
      name: seoFilename,
      type: assetType,
      alt_text: assetAlt || assetTitle || 'BuyBestCart verified product photography',
      title_text: assetTitle || 'Product Asset',
      size: 'Web Optimized',
      dimensions: 'Responsive (1200 × 800)',
      format: newUrl.endsWith('.svg') ? 'SVG' : 'WebP',
      created_at: new Date().toISOString().split('T')[0],
    };

    setMediaList([newItem, ...mediaList]);
    setNewUrl('');
    setAssetTitle('');
    setAssetAlt('');
    alert('Media asset added to library with automated Google Image SEO metadata.');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this asset from media library?')) {
      setMediaList(mediaList.filter((m) => m.id !== id));
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.title_text.toLowerCase().includes(search.toLowerCase()) ||
      m.alt_text.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={22} color="var(--green-accent)" />
            <span>Media Library & Google Image SEO System</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Upload WebP/AVIF images, vector SVGs, and responsive device banners with automated SEO filenames and ALT tags.
          </p>
        </div>
      </div>

      {/* Add New Asset Box */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Upload size={18} color="var(--green-accent)" />
          <span>Upload & Register New Asset with Image SEO</span>
        </h2>

        <form onSubmit={handleAddMedia} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Asset Image / SVG URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-... or SVG URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Asset Title (e.g. Sony WH-1000XM5)
              </label>
              <input
                type="text"
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                value={assetTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Asset Type
              </label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as 'image' | 'svg' | 'banner')}
                style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: 'var(--bg-surface)', fontWeight: 600 }}
              >
                <option value="image">WebP / AVIF Photo</option>
                <option value="svg">Vector SVG Icon / Badge</option>
                <option value="banner">Responsive Hero / Banner</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Google Image ALT Text (Automated Suggestion)
            </label>
            <input
              type="text"
              placeholder="Descriptive image ALT text for Google Image Search indexing..."
              value={assetAlt}
              onChange={(e) => setAssetAlt(e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: '0.35rem' }}>
            <Sparkles size={15} />
            <span>Process & Register Media Asset</span>
          </button>
        </form>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search media by filename, title, or ALT text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTypeFilter('all')}
            className={`btn btn-sm ${typeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Media ({mediaList.length})
          </button>
          <button
            onClick={() => setTypeFilter('image')}
            className={`btn btn-sm ${typeFilter === 'image' ? 'btn-primary' : 'btn-secondary'}`}
          >
            WebP / Photos
          </button>
          <button
            onClick={() => setTypeFilter('svg')}
            className={`btn btn-sm ${typeFilter === 'svg' ? 'btn-primary' : 'btn-secondary'}`}
          >
            SVGs & Icons
          </button>
          <button
            onClick={() => setTypeFilter('banner')}
            className={`btn btn-sm ${typeFilter === 'banner' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Banners & Heros
          </button>
        </div>
      </div>

      {/* Media Asset Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredMedia.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            No media assets found matching filters.
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Asset Preview */}
              <div style={{ position: 'relative', height: '180px', background: '#F8FAFC', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={item.url}
                  alt={item.alt_text}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '0.5rem' }}
                />
                <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.75)', color: '#FFFFFF', fontSize: '0.6875rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  {item.format}
                </span>
              </div>

              {/* Asset Details */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {item.title_text}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  File: {item.name}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <strong>ALT Tag:</strong> &ldquo;{item.alt_text}&rdquo;
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => copyToClipboard(item.url, item.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', gap: '0.25rem' }}
                  >
                    {copiedId === item.id ? <CheckCircle2 size={12} color="var(--success)" /> : <Copy size={12} />}
                    <span>{copiedId === item.id ? 'Copied Link' : 'Copy URL'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.4rem' }}
                    >
                      <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.4rem', color: 'var(--danger)' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
