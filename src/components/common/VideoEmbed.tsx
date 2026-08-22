'use client';

import React from 'react';
import { Play } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  title?: string;
  caption?: string;
  className?: string;
}

export function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'mp4' | 'unknown'; embedUrl: string | null } {
  if (!url || typeof url !== 'string') return { type: 'unknown', embedUrl: null };
  const trimmed = url.trim();

  // YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  // Matches: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1&title=0&byline=0`,
    };
  }

  // Direct MP4 / WebM video file
  if (/\.(mp4|webm|ogg)$/i.test(trimmed)) {
    return {
      type: 'mp4',
      embedUrl: trimmed,
    };
  }

  return { type: 'unknown', embedUrl: null };
}

export default function VideoEmbed({ url, title, caption, className }: VideoEmbedProps) {
  const { type, embedUrl } = parseVideoUrl(url);

  if (!embedUrl) {
    return null;
  }

  return (
    <figure
      className={className}
      style={{
        margin: '2rem 0',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: '#0F172A',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%', // 16:9 Aspect Ratio
          height: 0,
          background: '#0F172A',
        }}
      >
        {type === 'youtube' || type === 'vimeo' ? (
          <iframe
            src={embedUrl}
            title={title || 'Embedded Video Review'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        ) : (
          <video
            src={embedUrl}
            controls
            preload="metadata"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          >
            Your browser does not support HTML5 video playback.
          </video>
        )}
      </div>

      {(caption || title) && (
        <figcaption
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Play size={13} color="var(--green-accent)" />
          <span>{caption || title}</span>
        </figcaption>
      )}
    </figure>
  );
}
