'use client';

import React, { useState, useMemo } from 'react';
import { Award, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { ProductImage } from '@/types';

interface ProductGalleryProps {
  title: string;
  thumbnailUrl?: string;
  images?: ProductImage[];
  badgeText?: string;
  globalRank?: number;
}

export default function ProductGallery({
  title,
  thumbnailUrl,
  images = [],
  badgeText,
  globalRank,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Compile unique image list
  const imageList = useMemo(() => {
    const list: string[] = [];
    if (thumbnailUrl && thumbnailUrl.trim()) {
      list.push(thumbnailUrl.trim());
    }

    if (images && Array.isArray(images)) {
      const sorted = [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      sorted.forEach((img) => {
        if (img && img.url && typeof img.url === 'string' && img.url.trim()) {
          const u = img.url.trim();
          if (!list.includes(u)) {
            list.push(u);
          }
        }
      });
    }

    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80');
    }

    return list;
  }, [thumbnailUrl, images]);

  const hasMultiple = imageList.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % imageList.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Main Image Showcase Container */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: '380px',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {/* Top Badges */}
        {badgeText ? (
          <span
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: '#1C1917',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              zIndex: 10,
            }}
          >
            <Award size={12} color="#FFFFFF" />
            <span>{badgeText}</span>
          </span>
        ) : globalRank && globalRank <= 3 ? (
          <span
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'var(--green-accent)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.04em',
              zIndex: 10,
            }}
          >
            #{globalRank} OVERALL PICK
          </span>
        ) : null}

        {/* Multi-Image Counter Badge */}
        {hasMultiple && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(28, 25, 23, 0.8)',
              backdropFilter: 'blur(6px)',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              zIndex: 10,
            }}
          >
            <Images size={12} color="var(--green-accent)" />
            <span>{selectedIndex + 1} / {imageList.length}</span>
          </div>
        )}

        {/* Previous Button */}
        {hasMultiple && (
          <button
            type="button"
            aria-label="Previous image"
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Main Image with Smooth Crossfade */}
        <div style={{ width: '100%', height: '340px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imageList.map((url, idx) => {
            const isVisible = idx === selectedIndex;
            const isAdjacent = idx === (selectedIndex + 1) % imageList.length || idx === (selectedIndex - 1 + imageList.length) % imageList.length;
            if (!isVisible && !isAdjacent && idx !== 0) return null;

            return (
              <img
                key={idx}
                src={url}
                alt={`${title} view ${idx + 1}`}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={400}
                height={340}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                style={{
                  position: 'absolute',
                  maxHeight: '340px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  opacity: idx === selectedIndex ? 1 : 0,
                  transition: 'opacity 0.35s ease-in-out, transform 0.35s ease-out',
                  transform: idx === selectedIndex ? 'scale(1)' : 'scale(0.98)',
                  pointerEvents: idx === selectedIndex ? 'auto' : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Next Button */}
        {hasMultiple && (
          <button
            type="button"
            aria-label="Next image"
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div
          style={{
            display: 'flex',
            gap: '0.625rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'thin',
          }}
        >
          {imageList.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Select view ${idx + 1}`}
              style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: 'var(--radius-sm)',
                border: idx === selectedIndex ? '2px solid var(--green-accent)' : '1px solid var(--border)',
                background: 'var(--bg-surface)',
                padding: '0.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: idx === selectedIndex ? 1 : 0.65,
                transition: 'all 0.2s ease',
                boxShadow: idx === selectedIndex ? '0 2px 8px rgba(45, 106, 79, 0.2)' : 'none',
              }}
            >
              <img
                src={url}
                alt={`${title} thumbnail ${idx + 1}`}
                loading="lazy"
                decoding="async"
                width={64}
                height={64}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
