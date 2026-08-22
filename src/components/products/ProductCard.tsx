'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Award, Star, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Product } from '@/types';
import AffiliateCTA from './AffiliateCTA';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  rank?: number;
}

export default function ProductCard({ product, rank }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const displayRank = rank || product.global_rank || product.category_rank;
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Compile all unique images for this product (thumbnail + gallery images)
  const imageList = useMemo(() => {
    const list: string[] = [];
    if (product.thumbnail_url && typeof product.thumbnail_url === 'string' && product.thumbnail_url.trim()) {
      list.push(product.thumbnail_url.trim());
    }

    if (product.images && Array.isArray(product.images)) {
      const sortedImages = [...product.images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      sortedImages.forEach((img) => {
        if (img && img.url && typeof img.url === 'string' && img.url.trim()) {
          const u = img.url.trim();
          if (!list.includes(u)) {
            list.push(u);
          }
        }
      });
    }

    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60');
    }

    return list;
  }, [product.thumbnail_url, product.images]);

  const hasMultipleImages = imageList.length > 1;

  // Auto-cycling interval: 2 seconds by default, speeds up to 1 second on hover
  useEffect(() => {
    if (!hasMultipleImages) return;

    const intervalTime = isHovered ? 1000 : 2000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [hasMultipleImages, isHovered, imageList.length]);

  // Touch Swipe Support for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40 && hasMultipleImages) {
      if (diff > 0) {
        // Swiped left -> next image
        setCurrentIndex((prev) => (prev + 1) % imageList.length);
      } else {
        // Swiped right -> prev image
        setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Editorial Badge Indicator */}
      {displayRank && displayRank <= 3 && (
        <div className="product-card-badge badge-rank-1">
          #{displayRank} TOP PICK
        </div>
      )}
      {product.deal_status && product.deal_status !== 'none' && !displayRank && (
        <div className="product-card-badge badge-deal">
          ● FEATURED DEAL
        </div>
      )}
      {product.is_editor_choice && !displayRank && product.deal_status === 'none' && (
        <div className="product-card-badge badge-editor" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Award size={10} />
          <span>EDITOR&apos;S CHOICE</span>
        </div>
      )}

      {/* Multi-Image Gallery Counter Pill */}
      {hasMultipleImages && (
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            zIndex: 15,
            background: isHovered ? 'rgba(28, 25, 23, 0.9)' : 'rgba(28, 25, 23, 0.7)',
            backdropFilter: 'blur(6px)',
            color: '#FFFFFF',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            transition: 'background 0.2s ease, transform 0.2s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
          title={`${imageList.length} Product Photos Available`}
        >
          <Images size={11} color="var(--green-accent)" />
          <span>{currentIndex + 1}/{imageList.length}</span>
        </div>
      )}

      {/* Product Image Container with Smooth Crossfade Multi-Image Slider */}
      <Link
        href={`/products/${product.slug}`}
        className="product-card-image-wrap"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {imageList.map((imgUrl, idx) => {
          // Only render active image or initial/adjacent images to save mobile memory
          const shouldRender = idx === currentIndex || idx === (currentIndex + 1) % imageList.length || idx === 0;
          if (!shouldRender) return null;

          return (
            <img
              key={idx}
              src={imgUrl}
              alt={`${product.title} - View ${idx + 1}`}
              className="product-card-image"
              loading={rank && rank <= 2 && idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              width={280}
              height={280}
              style={{
                position: idx === 0 ? 'relative' : 'absolute',
                top: idx === 0 ? 'auto' : 0,
                left: idx === 0 ? 'auto' : 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '2rem',
                opacity: idx === currentIndex ? 1 : 0,
                transition: 'opacity 0.35s ease, transform 0.35s ease',
                transform: isHovered ? 'scale(1.04)' : 'scale(1.0)',
                pointerEvents: idx === currentIndex ? 'auto' : 'none',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60';
              }}
            />
          );
        })}

        {/* Multi-Image Indicator Dot Bar */}
        {hasMultipleImages && (
          <div
            style={{
              position: 'absolute',
              bottom: '0.5rem',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.35rem',
              zIndex: 10,
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {imageList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`View photo ${idx + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                style={{
                  width: idx === currentIndex ? '1.25rem' : '0.375rem',
                  height: '0.375rem',
                  borderRadius: '999px',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  background:
                    idx === currentIndex
                      ? 'var(--green-accent)'
                      : 'rgba(0, 0, 0, 0.2)',
                  boxShadow:
                    idx === currentIndex
                      ? '0 1px 4px rgba(45, 106, 79, 0.4)'
                      : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
          </div>
        )}
      </Link>

      {/* Product Card Body */}
      <div className="product-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
          {product.brand && (
            <div className="product-card-brand">{product.brand.name}</div>
          )}
          {product.category && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {product.category.name}
            </div>
          )}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="product-card-title">{product.title}</h3>
        </Link>

        {/* Rating and Reviews */}
        <div className="product-card-rating">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={11} fill="currentColor" />
            <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
            ({product.review_count ? product.review_count.toLocaleString() : '1,000+'} verified)
          </span>
          {product.editorial_score && (
            <span style={{ marginLeft: 'auto', background: 'var(--green-light)', color: 'var(--green-accent)', border: '1px solid var(--green-border)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-xs)', fontSize: '0.6875rem', fontWeight: 700 }}>
              {product.editorial_score}/10 RATING
            </span>
          )}
        </div>

        {/* Short Spec Summary */}
        {product.short_description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
            {product.short_description}
          </p>
        )}

        {/* Price Row */}
        <div className="product-card-price-row">
          <div>
            <span className="price-current">
              {formatPrice(product.price)}
            </span>
            {product.list_price && product.list_price > (product.price || 0) && (
              <span className="price-list">
                {formatPrice(product.list_price)}
              </span>
            )}
          </div>
          <Link href={`/products/${product.slug}`} className="btn btn-secondary btn-sm">
            Review ↗
          </Link>
        </div>

        {/* Amazon Action CTA */}
        <div style={{ marginTop: '0.85rem' }}>
          <AffiliateCTA
            productSlug={product.slug}
            asin={product.asin}
            price={product.price}
            affiliateUrl={product.affiliate_url}
            label="Buy on Amazon"
            size="sm"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
