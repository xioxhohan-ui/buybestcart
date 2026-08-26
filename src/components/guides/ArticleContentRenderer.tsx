'use client';

import React from 'react';
import VideoEmbed, { parseVideoUrl } from '@/components/common/VideoEmbed';
import { ArticleVideo } from '@/types';

interface ArticleContentRendererProps {
  content?: string;
  videos?: ArticleVideo[];
}

export default function ArticleContentRenderer({ content = '', videos = [] }: ArticleContentRendererProps) {
  if (!content && (!videos || videos.length === 0)) {
    return null;
  }

  // Pre-process content to extract or replace standalone video lines
  // Supported video embed syntax:
  // [video:https://www.youtube.com/watch?v=XYZ] or [video:https://vimeo.com/123]
  // or raw YouTube/Vimeo URLs on their own line
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = (key: string) => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        // Check if header
        if (text.startsWith('# ')) {
          renderedElements.push(
            <h2 key={key} style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '2.5rem 0 1rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {text.replace(/^#\s+/, '')}
            </h2>
          );
        } else if (text.startsWith('## ')) {
          renderedElements.push(
            <h2 key={key} style={{ fontSize: '1.625rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '2.25rem 0 0.875rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {text.replace(/^##\s+/, '')}
            </h2>
          );
        } else if (text.startsWith('### ')) {
          renderedElements.push(
            <h3 key={key} style={{ fontSize: '1.25rem', fontWeight: 800, margin: '1.75rem 0 0.75rem 0', color: 'var(--text-primary)' }}>
              {text.replace(/^###\s+/, '')}
            </h3>
          );
        } else if (text.startsWith('> ')) {
          renderedElements.push(
            <blockquote key={key} style={{ borderLeft: '3px solid var(--green-accent)', padding: '0.875rem 1.25rem', margin: '1.5rem 0', background: 'var(--bg-subtle)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {text.replace(/^>\s+/, '')}
            </blockquote>
          );
        } else {
          // Standard Paragraph with basic inline formatting (bold, links, code)
          renderedElements.push(
            <p key={key} style={{ fontSize: '1.0625rem', lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: '1.25rem' }} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
          );
        }
      }
      currentParagraph = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for [video:URL] or standalone video link
    const videoTagMatch = trimmed.match(/^\[video:(https?:\/\/[^\]]+)\]$/i);
    const isStandaloneVideoUrl =
      /^(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)\/[^\s]+)$/i.test(trimmed);

    if (videoTagMatch || isStandaloneVideoUrl) {
      flushParagraph(`p-${index}`);
      const videoUrl = videoTagMatch ? videoTagMatch[1] : trimmed;
      renderedElements.push(
        <VideoEmbed key={`video-${index}`} url={videoUrl} />
      );
    } else if (trimmed === '') {
      flushParagraph(`p-${index}`);
    } else {
      currentParagraph.push(line);
    }
  });

  flushParagraph('p-last');

  return (
    <div className="article-editorial-content" style={{ fontSize: '1.0625rem', lineHeight: 1.8 }}>
      {renderedElements}

      {/* Render any explicitly attached gallery videos if not already inlined */}
      {videos && videos.length > 0 && (
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Featured Video Reviews &amp; Lab Demonstrations
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: videos.length > 1 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '1.5rem' }}>
            {videos.map((v) => (
              <VideoEmbed key={v.id || v.url} url={v.url} title={v.title} caption={v.caption} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatInlineMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline Code
    .replace(/`([^`]+)`/g, '<code style="background: var(--bg-subtle); padding: 0.15rem 0.35rem; border-radius: 3px; font-size: 0.875em; border: 1px solid var(--border);">$1</code>')
    // Markdown Links [Text](URL)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--green-accent); text-decoration: underline; font-weight: 600;">$1</a>');
}
