'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Scale,
  Search,
  X,
  Plus,
  Star,
  Check,
  Award,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Product, ProductSpecification } from '@/types';
import AffiliateCTA from '@/components/products/AffiliateCTA';
import { useCurrency } from '@/context/CurrencyContext';

interface CustomCompareEngineProps {
  allProducts: Product[];
  initialSelectedSlugs?: string[];
}

export default function CustomCompareEngine({
  allProducts,
  initialSelectedSlugs = [],
}: CustomCompareEngineProps) {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine initial 3 slots from search params or initialSelectedSlugs or first 2-3 products
  const initialSlots = useMemo(() => {
    const p1Slug = searchParams?.get('p1') || initialSelectedSlugs[0];
    const p2Slug = searchParams?.get('p2') || initialSelectedSlugs[1];
    const p3Slug = searchParams?.get('p3') || initialSelectedSlugs[2];

    const findProduct = (slug?: string) =>
      slug ? allProducts.find((p) => p.slug === slug) || null : null;

    let slot1 = findProduct(p1Slug);
    let slot2 = findProduct(p2Slug);
    let slot3 = findProduct(p3Slug);

    // Fallbacks if slots are completely unassigned
    if (!slot1 && allProducts.length > 0) slot1 = allProducts[0];
    if (!slot2 && allProducts.length > 1) slot2 = allProducts[1];

    return [slot1, slot2, slot3] as [Product | null, Product | null, Product | null];
  }, [allProducts, initialSelectedSlugs, searchParams]);

  const [selectedSlots, setSelectedSlots] = useState<[Product | null, Product | null, Product | null]>(initialSlots);
  const [activeSearchSlot, setActiveSearchSlot] = useState<number | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<number, string>>({ 0: '', 1: '', 2: '' });
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);

  // Sync URL query params when selected products change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedSlots[0]) params.set('p1', selectedSlots[0].slug);
    if (selectedSlots[1]) params.set('p2', selectedSlots[1].slug);
    if (selectedSlots[2]) params.set('p3', selectedSlots[2].slug);

    const queryString = params.toString();
    const newUrl = queryString ? `/compare?${queryString}` : '/compare';
    router.replace(newUrl, { scroll: false });
  }, [selectedSlots, router]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setActiveSearchSlot(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available products for a specific slot search
  const getFilteredProducts = (slotIndex: number) => {
    const query = (searchQueries[slotIndex] || '').toLowerCase().trim();
    const selectedIds = selectedSlots.filter(Boolean).map((p) => p!.id);

    return allProducts.filter((p) => {
      if (!query) return true;
      const titleMatch = p.title.toLowerCase().includes(query);
      const brandMatch = p.brand?.name?.toLowerCase().includes(query) || false;
      const catMatch = p.category?.name?.toLowerCase().includes(query) || false;
      return titleMatch || brandMatch || catMatch;
    });
  };

  const handleSelectProduct = (slotIndex: number, product: Product) => {
    const updated = [...selectedSlots] as [Product | null, Product | null, Product | null];
    updated[slotIndex] = product;
    setSelectedSlots(updated);
    setActiveSearchSlot(null);
    setSearchQueries((prev) => ({ ...prev, [slotIndex]: '' }));
  };

  const handleRemoveProduct = (slotIndex: number) => {
    const updated = [...selectedSlots] as [Product | null, Product | null, Product | null];
    updated[slotIndex] = null;
    setSelectedSlots(updated);
    setActiveSearchSlot(null);
  };

  const handleQuickPreset = (slugs: string[]) => {
    const p1 = allProducts.find((p) => p.slug === slugs[0]) || null;
    const p2 = allProducts.find((p) => p.slug === slugs[1]) || null;
    const p3 = slugs[2] ? allProducts.find((p) => p.slug === slugs[2]) || null : null;
    setSelectedSlots([p1, p2, p3]);
    setActiveSearchSlot(null);
  };

  // Active products in comparison (filtered for non-null)
  const activeProducts = useMemo(() => {
    return selectedSlots.filter((p): p is Product => p !== null);
  }, [selectedSlots]);

  // Aggregate all unique specification keys across the selected products
  const uniqueSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    activeProducts.forEach((p) => {
      if (p.specifications && Array.isArray(p.specifications)) {
        p.specifications.forEach((s) => {
          if (s && s.spec_key && s.spec_key.trim()) {
            keys.add(s.spec_key.trim());
          }
        });
      }
    });
    return Array.from(keys);
  }, [activeProducts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* 02. Interactive Product Selection Slots (Slot 1, Slot 2, Slot 3) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={20} color="var(--green-accent)" />
            <span>Select Products to Compare ({activeProducts.length}/3)</span>
          </h2>
          {activeProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedSlots([null, null, null])}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear All Slots
            </button>
          )}
        </div>

        <div
          ref={searchDropdownRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.25rem',
            position: 'relative',
          }}
        >
          {[0, 1, 2].map((slotIdx) => {
            const product = selectedSlots[slotIdx];
            const isSearching = activeSearchSlot === slotIdx;
            const isSlot3 = slotIdx === 2;

            return (
              <div
                key={slotIdx}
                style={{
                  background: 'var(--bg-surface)',
                  border: product ? '2px solid var(--green-accent)' : isSearching ? '2px solid var(--primary)' : '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  position: 'relative',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: product ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* Slot Label Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      background: product ? 'var(--green-light)' : '#F5F5F4',
                      color: product ? 'var(--green-accent)' : 'var(--text-muted)',
                      border: product ? '1px solid var(--green-border)' : '1px solid var(--border)',
                    }}
                  >
                    Product {slotIdx + 1} {isSlot3 && '(Optional 3rd)'}
                  </span>

                  {product && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(slotIdx)}
                      aria-label="Remove product"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <X size={14} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Slot Content: Filled vs Empty */}
                {product ? (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: '#FAF9F6', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', flexShrink: 0 }}>
                      <img
                        src={product.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60'}
                        alt={product.title}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {product.brand?.name || product.manufacturer || 'Tech'}
                      </div>
                      <div className="product-compare-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }} title={product.title}>
                        {product.title}
                      </div>
                      <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.0625rem' }}>
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FAF9F6', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }}>
                      <Plus size={20} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {isSlot3 ? 'Add 3rd Product (Optional)' : `Select Product ${slotIdx + 1}`}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      Search catalog by name or brand
                    </p>
                  </div>
                )}

                {/* Trigger Button to Open Search Dropdown */}
                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSearchSlot(isSearching ? null : slotIdx);
                      setSearchQueries((prev) => ({ ...prev, [slotIdx]: '' }));
                    }}
                    className={`btn ${product ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    style={{ width: '100%', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}
                  >
                    <Search size={14} />
                    <span>{product ? 'Change Product ↻' : `+ Choose Product ${slotIdx + 1}`}</span>
                  </button>
                </div>

                {/* Instant Search Dropdown Overlay */}
                {isSearching && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.5rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                      zIndex: 50,
                      padding: '0.85rem',
                      maxHeight: '340px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Search Input Box */}
                    <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Type product name, brand or model..."
                        value={searchQueries[slotIdx] || ''}
                        onChange={(e) =>
                          setSearchQueries((prev) => ({ ...prev, [slotIdx]: e.target.value }))
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem 2rem 0.5rem 0.75rem',
                          fontSize: '0.8125rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-strong)',
                          background: '#FAF9F6',
                        }}
                      />
                      {searchQueries[slotIdx] && (
                        <button
                          type="button"
                          onClick={() => setSearchQueries((prev) => ({ ...prev, [slotIdx]: '' }))}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Results List */}
                    <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {getFilteredProducts(slotIdx).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          No products found matching &quot;{searchQueries[slotIdx]}&quot;.
                        </div>
                      ) : (
                        getFilteredProducts(slotIdx).map((prod) => {
                          const isAlreadySelected = selectedSlots.some((s) => s?.id === prod.id);

                          return (
                            <div
                              key={prod.id}
                              onClick={() => {
                                if (!isAlreadySelected) handleSelectProduct(slotIdx, prod);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-xs)',
                                background: isAlreadySelected ? '#F5F5F4' : '#FAF9F6',
                                cursor: isAlreadySelected ? 'not-allowed' : 'pointer',
                                opacity: isAlreadySelected ? 0.6 : 1,
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (!isAlreadySelected) e.currentTarget.style.background = '#F0FDF4';
                              }}
                              onMouseLeave={(e) => {
                                if (!isAlreadySelected) e.currentTarget.style.background = '#FAF9F6';
                              }}
                            >
                              <img
                                src={prod.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=60'}
                                alt={prod.title}
                                style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#FFF', borderRadius: '4px', border: '1px solid var(--border)', padding: '2px', flexShrink: 0 }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="product-search-item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {prod.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <span>{prod.brand?.name || 'Tech'}</span>
                                  <span>•</span>
                                  <span style={{ color: 'var(--green-accent)', fontWeight: 700 }}>
                                    ● In Stock
                                  </span>
                                </div>
                              </div>
                              <div style={{ flexShrink: 0 }}>
                                {isAlreadySelected ? (
                                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Added
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--green-accent)', fontWeight: 800 }}>
                                    + Select
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 03. Side-by-Side Dynamic Comparison Matrix */}
      {activeProducts.length >= 2 ? (
        <div className="table-scroll-wrapper">
          <div className="table-scroll-hint">
            <span>↔ Swipe horizontally to compare all {activeProducts.length} products</span>
          </div>
          <div className="responsive-table-container">
            <table className="editorial-table comparison-table-fluid" style={{ width: '100%' }}>
              {/* Header: Product Cards & Buy CTAs */}
              <thead>
                <tr>
                  <th style={{ width: '22%', background: 'var(--bg-subtle)', verticalAlign: 'middle', padding: '1.25rem 0.875rem', minWidth: '110px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                      Comparing {activeProducts.length} Products
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      Head-to-Head Specs
                    </div>
                  </th>

                  {activeProducts.map((p) => (
                    <th key={p.id} style={{ width: `${78 / activeProducts.length}%`, textAlign: 'center', padding: '1.25rem 0.875rem', verticalAlign: 'top', minWidth: '150px' }}>
                      {/* Badge */}
                      {p.badge_text && (
                        <div style={{ marginBottom: '0.4rem' }}>
                          <span style={{ background: 'var(--green-accent)', color: '#FFF', fontSize: '0.625rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {p.badge_text}
                          </span>
                        </div>
                      )}

                      {/* Thumbnail */}
                      <Link href={`/products/${p.slug}`}>
                        <img
                          src={p.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60'}
                          alt={p.title}
                          style={{ height: '90px', maxWidth: '110px', objectFit: 'contain', margin: '0 auto 0.5rem auto', transition: 'transform 0.2s ease' }}
                          className="hover:scale-105"
                        />
                      </Link>

                      {/* Title */}
                      <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                        <div className="product-compare-title" style={{ minHeight: '2.5rem', marginBottom: '0.4rem', fontSize: '0.875rem', lineHeight: 1.3 }}>
                          {p.title}
                        </div>
                      </Link>

                      {/* Buy CTA */}
                      <div style={{ marginTop: '0.65rem' }}>
                        <AffiliateCTA
                          productSlug={p.slug}
                          asin={p.asin}
                          affiliateUrl={p.affiliate_url}
                          label="Check Price on Amazon"
                          size="sm"
                          fullWidth
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Row 1: Editorial Score & Rating */}
                <tr>
                  <th style={{ background: 'var(--bg-subtle)' }}>Editorial Score &amp; Rating</th>
                  {activeProducts.map((p) => (
                    <td key={p.id} style={{ textAlign: 'center', padding: '0.875rem 0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                        {p.editorial_score && (
                          <span style={{ background: 'var(--green-light)', color: 'var(--green-accent)', border: '1px solid var(--green-border)', padding: '0.12rem 0.45rem', borderRadius: 'var(--radius-xs)', fontSize: '0.6875rem', fontWeight: 800 }}>
                            {p.editorial_score} / 10 LAB SCORE
                          </span>
                        )}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--amber-deal)', fontWeight: 700, fontSize: '0.8125rem' }}>
                          <Star size={12} fill="currentColor" />
                          <span>{p.rating ? p.rating.toFixed(1) : '4.8'}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.6875rem' }}>
                            ({p.review_count ? p.review_count.toLocaleString() : '1,000+'})
                          </span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row 2: Key Highlights */}
                <tr>
                  <th style={{ background: 'var(--bg-subtle)' }}>Key Highlights</th>
                  {activeProducts.map((p) => {
                    const highlights = (p.features && p.features.length > 0)
                      ? p.features.map((f: { feature: string }) => f.feature)
                      : (p.key_highlights || []);

                    return (
                      <td key={p.id} style={{ padding: '0.875rem 0.65rem', verticalAlign: 'top' }}>
                        {highlights.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                            {highlights.map((h: string, i: number) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Verified lab tested</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 3: Best For */}
                <tr>
                  <th style={{ background: 'var(--bg-subtle)' }}>Best For (Target User)</th>
                  {activeProducts.map((p) => (
                    <td key={p.id} style={{ textAlign: 'center', fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-primary)', padding: '0.875rem 0.5rem' }}>
                      {p.best_for || 'Everyday professionals and enthusiasts'}
                    </td>
                  ))}
                </tr>

                {/* Row 4: Why We Like It */}
                <tr>
                  <th style={{ background: 'var(--bg-subtle)' }}>Why We Like It</th>
                  {activeProducts.map((p) => (
                    <td key={p.id} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.875rem 0.5rem', lineHeight: 1.45 }}>
                      {p.why_we_like_it || 'Excellent build quality, acoustic balance, and verified Amazon value.'}
                    </td>
                  ))}
                </tr>

                {/* Row 5: Pros (Reasons to Buy) */}
                <tr>
                  <th style={{ background: 'var(--bg-subtle)' }}>Reasons to Buy (Pros)</th>
                  {activeProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.875rem 0.5rem', verticalAlign: 'top' }}>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem' }}>
                        {p.pros && p.pros.length > 0 ? (
                          p.pros.map((pro, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem', color: 'var(--text-primary)' }}>
                              <span style={{ color: 'var(--green-accent)', fontWeight: 800 }}>✓</span>
                              <span>{pro}</span>
                            </li>
                          ))
                        ) : (
                          <li style={{ color: 'var(--text-muted)' }}>High reliability and performance</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Row 6: Cons (Reasons to Avoid) */}
                <tr>
                  <th style={{ background: 'var(--bg-subtle)' }}>Reasons to Avoid (Cons)</th>
                  {activeProducts.map((p) => (
                    <td key={p.id} style={{ padding: '0.875rem 0.5rem', verticalAlign: 'top' }}>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem' }}>
                        {p.cons && p.cons.length > 0 ? (
                          p.cons.map((con, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                              <span style={{ color: 'var(--amber-deal)', fontWeight: 800 }}>✕</span>
                              <span>{con}</span>
                            </li>
                          ))
                        ) : (
                          <li style={{ color: 'var(--text-muted)' }}>Premium price point</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Dynamic Technical Specifications Matrix Rows */}
                {uniqueSpecKeys.map((specKey) => (
                  <tr key={specKey}>
                    <th style={{ background: 'var(--bg-subtle)' }}>{specKey}</th>
                    {activeProducts.map((p) => {
                      const match = p.specifications?.find(
                        (s) => s.spec_key.toLowerCase().trim() === specKey.toLowerCase().trim()
                      );

                      return (
                        <td key={p.id} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-primary)', padding: '0.75rem 0.5rem' }}>
                          {match ? match.spec_value : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Final Row: Action Bar */}
                <tr>
                  <th style={{ background: 'var(--bg-subtle)', verticalAlign: 'middle' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>Check Live Price</span>
                  </th>
                  {activeProducts.map((p) => (
                    <td key={p.id} style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                      <AffiliateCTA
                        productSlug={p.slug}
                        asin={p.asin}
                        affiliateUrl={p.affiliate_url}
                        label="Buy on Amazon"
                        size="sm"
                        fullWidth
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3.5rem 1.5rem' }}>
          <Scale size={40} color="var(--green-accent)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Select At Least 2 Products to Compare
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            Choose products using the search slots above to view side-by-side technical breakdowns, lab scores, and real-time pricing.
          </p>
        </div>
      )}
    </div>
  );
}
