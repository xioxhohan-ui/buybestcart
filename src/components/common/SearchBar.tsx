'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Loader2, ArrowRight, Package } from 'lucide-react';
import { formatPrice } from '@/lib/region';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string;
  price?: number;
  currency?: string;
  rating?: number;
  review_count?: number;
  brand?: { name: string };
  category?: { name: string; slug: string };
}

interface SearchBarProps {
  placeholder?: string;
  onResultClick?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = 'Search products, categories, reviews...',
  onResultClick,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live search suggestions with 180ms debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
          setIsOpen(true);
          setHasSearched(true);
          setSelectedIndex(-1);
        }
      } catch {
        // Fallback silently
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProduct = useCallback((product: SearchResult) => {
    setIsOpen(false);
    if (onResultClick) onResultClick();
    router.push(`/products/${product.slug}`);
  }, [router, onResultClick]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (selectedIndex >= 0 && selectedIndex < results.length) {
      handleSelectProduct(results[selectedIndex]);
      return;
    }

    setIsOpen(false);
    if (onResultClick) onResultClick();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="search-container" style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} className="search-input-wrap">
        <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--text-muted)" />
        </span>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label="Search products"
          autoComplete="off"
        />

        {isLoading ? (
          <span style={{ position: 'absolute', right: '0.75rem', display: 'flex', alignItems: 'center', color: 'var(--green-accent)' }}>
            <Loader2 size={16} className="animate-spin" />
          </span>
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: '0.65rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem',
              color: 'var(--text-muted)',
              borderRadius: '50%',
            }}
          >
            <X size={14} />
          </button>
        ) : null}
      </form>

      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-display)',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Matching Products ({results.length})</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Use ↑↓ to navigate</span>
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {results.map((product, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isImageBroken = brokenImages[product.id];
                  const hasImage = Boolean(product.thumbnail_url) && !isImageBroken;

                  return (
                    <div
                      key={product.id}
                      className={`search-dropdown-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectProduct(product)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      style={{
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.875rem',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--green-light)' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0, flex: 1 }}>
                        {/* Thumbnail with failover */}
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            minWidth: '42px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            padding: '2px',
                          }}
                        >
                          {hasImage ? (
                            <img
                              src={product.thumbnail_url}
                              alt={product.title}
                              loading="lazy"
                              decoding="async"
                              width={42}
                              height={42}
                              onError={() => setBrokenImages((prev) => ({ ...prev, [product.id]: true }))}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <Package size={18} color="var(--text-muted)" />
                          )}
                        </div>

                        {/* Title and Category/Brand Badge */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.title}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              marginTop: '0.15rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.brand?.name && (
                              <span style={{ fontWeight: 600, color: 'var(--green-dark)' }}>
                                {product.brand.name}
                              </span>
                            )}
                            {product.brand?.name && product.category?.name && <span>•</span>}
                            {product.category?.name && <span>{product.category.name}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Price Badge */}
                      {product.price !== undefined && product.price !== null && (
                        <div
                          style={{
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            flexShrink: 0,
                          }}
                        >
                          {formatPrice(product.price, product.currency || 'USD')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* View all search results link */}
              <div
                style={{
                  padding: '0.625rem 1rem',
                  background: 'var(--bg-subtle)',
                  textAlign: 'center',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--green-accent)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                  onClick={() => {
                    setIsOpen(false);
                    if (onResultClick) onResultClick();
                  }}
                >
                  <span>View all results for &ldquo;{query.trim()}&rdquo;</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </>
          ) : hasSearched && !isLoading ? (
            <div style={{ padding: '1.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                <Search size={24} style={{ margin: '0 auto' }} />
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                No direct matches found for &ldquo;{query.trim()}&rdquo;
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Check your spelling or search across our full catalog.
              </p>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={() => {
                  setIsOpen(false);
                  if (onResultClick) onResultClick();
                }}
              >
                Search Full Catalog →
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
