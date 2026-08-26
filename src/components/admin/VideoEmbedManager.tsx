'use client';

import React, { useState } from 'react';
import { ArticleVideo } from '@/types';
import { Video, Plus, Trash2, ArrowUp, ArrowDown, Play, ExternalLink } from 'lucide-react';
import { parseVideoUrl } from '@/components/common/VideoEmbed';

interface VideoEmbedManagerProps {
  videos: ArticleVideo[];
  onChange: (updated: ArticleVideo[]) => void;
  onInsertTag?: (tag: string) => void;
}

export default function VideoEmbedManager({ videos = [], onChange, onInsertTag }: VideoEmbedManagerProps) {
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoCaptionInput, setVideoCaptionInput] = useState('');

  const handleAddVideo = () => {
    if (!videoUrlInput.trim()) return;

    const newVideo: ArticleVideo = {
      id: `vid-${Date.now()}`,
      url: videoUrlInput.trim(),
      title: videoTitleInput.trim() || 'Video Demonstration',
      caption: videoCaptionInput.trim() || undefined,
      display_order: videos.length + 1,
    };

    onChange([...videos, newVideo]);
    setVideoUrlInput('');
    setVideoTitleInput('');
    setVideoCaptionInput('');
  };

  const handleDelete = (index: number) => {
    const copy = videos.filter((_, idx) => idx !== index);
    onChange(copy.map((v, idx) => ({ ...v, display_order: idx + 1 })));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= videos.length) return;

    const copy = [...videos];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    onChange(copy.map((v, idx) => ({ ...v, display_order: idx + 1 })));
  };

  return (
    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        <Video size={16} color="var(--green-accent)" />
        <span>Embedded Video Reviews &amp; Lab Media ({videos.length} Videos Attached)</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
        Attach YouTube, Vimeo, or MP4 video links to this article. You can also insert <code>[video:URL]</code> directly into the text editor body.
      </p>

      {/* Add New Video Box */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            Video URL (YouTube, Vimeo, MP4) *
          </label>
          <input
            type="url"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            Video Title
          </label>
          <input
            type="text"
            value={videoTitleInput}
            onChange={(e) => setVideoTitleInput(e.target.value)}
            placeholder="e.g. Acoustic ANC Lab Teardown"
            style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            Caption / Notes
          </label>
          <input
            type="text"
            value={videoCaptionInput}
            onChange={(e) => setVideoCaptionInput(e.target.value)}
            placeholder="e.g. Demonstration at 50dB ambient noise"
            style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
          />
        </div>

        <button
          type="button"
          onClick={handleAddVideo}
          disabled={!videoUrlInput.trim()}
          className="btn btn-primary btn-sm"
          style={{ height: '32px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={13} />
          <span>Add Video</span>
        </button>
      </div>

      {/* Video List */}
      {videos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {videos.map((v, idx) => {
            const { type } = parseVideoUrl(v.url);

            return (
              <div
                key={v.id || idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Play size={11} fill="currentColor" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {v.title || 'Video Embed'}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ textTransform: 'uppercase', fontWeight: 800, color: 'var(--green-accent)', marginRight: '0.4rem' }}>{type}</span>
                      {v.url}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {onInsertTag && (
                    <button
                      type="button"
                      onClick={() => onInsertTag(`\n[video:${v.url}]\n`)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
                      title="Insert [video:URL] tag into article text"
                    >
                      Insert in Body
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '0.15rem', color: idx === 0 ? '#CBD5E1' : 'var(--text-secondary)' }}
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === videos.length - 1}
                    style={{ background: 'none', border: 'none', cursor: idx === videos.length - 1 ? 'not-allowed' : 'pointer', padding: '0.15rem', color: idx === videos.length - 1 ? '#CBD5E1' : 'var(--text-secondary)' }}
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.15rem', color: 'var(--danger)' }}
                    title="Delete video"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
