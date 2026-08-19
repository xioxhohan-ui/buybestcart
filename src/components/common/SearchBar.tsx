'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  thumbnail_url?: string;
  price?: number;
  category?: { name: string; slug: string };
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
          setIsOpen(true);
        }
      } catch {
        // Search error fallback
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="search-container">
      <form onSubmit={handleSubmit} className="search-input-wrap">
        <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="var(--text-muted)" />
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Search products, brands, reviews & guides..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          aria-label="Search"
        />
        {isLoading && (
          <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ...
          </span>
        )}
      </form>

      {isOpen && results.length > 0 && (
        <div className="search-dropdown">
          <div style={{ padding: '0.5rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Product Matches
          </div>
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="search-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {product.thumbnail_url && (
                  <img
                    src={product.thumbnail_url}
                    alt=""
                    style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px' }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {product.title}
                  </div>
                  {product.category && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      in {product.category.name}
                    </div>
                  )}
                </div>
              </div>
              {product.price && (
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>
                  ${product.price.toFixed(2)}
                </span>
              )}
            </Link>
          ))}
          <div style={{ padding: '0.625rem 1rem', background: 'var(--bg-subtle)', textAlign: 'center' }}>
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}
              onClick={() => setIsOpen(false)}
            >
              View all results for &ldquo;{query}&rdquo; →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
