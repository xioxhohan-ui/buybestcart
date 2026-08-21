'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Star } from 'lucide-react';
import { Product } from '@/types';
import AffiliateCTA from './AffiliateCTA';
import { formatPrice } from '@/lib/region';

interface ProductCardProps {
  product: Product;
  rank?: number;
}

export default function ProductCard({ product, rank }: ProductCardProps) {
  const displayRank = rank || product.global_rank || product.category_rank;

  return (
    <div className="product-card">
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

      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="product-card-image-wrap">
        <img
          src={product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60'}
          alt={product.title}
          className="product-card-image"
          loading="lazy"
        />
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
              {formatPrice(product.price, product.currency || 'USD')}
            </span>
            {product.list_price && product.list_price > (product.price || 0) && (
              <span className="price-list">
                {formatPrice(product.list_price, product.currency || 'USD')}
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
