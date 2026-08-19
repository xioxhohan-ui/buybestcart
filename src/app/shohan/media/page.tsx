'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: string;
  dimensions: string;
  created_at: string;
}

const SAMPLE_MEDIA: MediaItem[] = [
  {
    id: 'm-1',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    name: 'sony-wh-1000xm5-hero.jpg',
    size: '142 KB',
    dimensions: '1200 × 800',
    created_at: '2026-08-19',
  },
  {
    id: 'm-2',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    name: 'macbook-air-m3-showcase.jpg',
    size: '188 KB',
    dimensions: '1200 × 800',
    created_at: '2026-08-18',
  },
  {
    id: 'm-3',
    url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    name: 'asus-zephyrus-g16.jpg',
    size: '210 KB',
    dimensions: '1200 × 800',
    created_at: '2026-08-17',
  },
  {
    id: 'm-4',
    url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
    name: 'smart-home-hub-lighting.jpg',
    size: '165 KB',
    dimensions: '1200 × 800',
    created_at: '2026-08-16',
  },
];

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>(SAMPLE_MEDIA);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) return;

    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      url: uploadUrl,
      name: uploadUrl.split('/').pop()?.slice(0, 30) || 'product-asset.jpg',
      size: 'Web Asset',
      dimensions: 'Dynamic',
      created_at: new Date().toISOString().split('T')[0],
    };

    setMediaList([newItem, ...mediaList]);
    setUploadUrl('');
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this asset from media library?')) {
      setMediaList(mediaList.filter((m) => m.id !== id));
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
            <ImageIcon size={22} color="var(--green-accent)" />
            <span>Media Library & CDN Asset Manager</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage product images, category hero banners, and editorial CDN photos.
          </p>
        </div>
      </div>

      {/* Add New Media URL */}
      <form
        onSubmit={handleAddImage}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <input
          type="url"
          required
          placeholder="Paste image URL (Unsplash, Supabase Storage, or Amazon CDN)..."
          value={uploadUrl}
          onChange={(e) => setUploadUrl(e.target.value)}
          style={{ flex: 1, padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
        />
        <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Upload size={13} />
          <span>Register Asset</span>
        </button>
      </form>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {mediaList.map((item) => (
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
            <div style={{ height: '160px', background: '#F5F5F4', overflow: 'hidden', position: 'relative' }}>
              <img
                src={item.url}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {item.dimensions} • {item.size}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.url, item.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                >
                  {copiedId === item.id ? <CheckCircle2 size={12} color="var(--success)" /> : <Copy size={12} />}
                  <span>{copiedId === item.id ? 'Copied URL!' : 'Copy URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                  title="Delete image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
