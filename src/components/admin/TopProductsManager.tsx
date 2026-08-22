'use client';

import React, { useState, useEffect } from 'react';
import { TopProductItem, Product } from '@/types';
import { supabase } from '@/lib/supabase/client';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ShoppingBag,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';

interface TopProductsManagerProps {
  products: TopProductItem[];
  onChange: (updated: TopProductItem[]) => void;
}

export default function TopProductsManager({ products = [], onChange }: TopProductsManagerProps) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      const { data } = await supabase
        .from('products')
        .select('id, title, slug, asin, price, list_price, thumbnail_url, short_description, affiliate_url, badge_text, rating, review_count')
        .in('status', ['active', 'featured', 'published'])
        .order('title', { ascending: true });

      if (data) setCatalogProducts(data as Product[]);
      setLoadingCatalog(false);
    };
    fetchCatalog();
  }, []);

  const handleAddBlankProduct = () => {
    const newPos = products.length + 1;
    const newItem: TopProductItem = {
      id: `top-prod-${Date.now()}`,
      position: newPos,
      title: `Top Pick #${newPos}`,
      badge: newPos === 1 ? 'Best Overall Pick' : newPos === 2 ? 'Top Runner-Up' : newPos === 3 ? 'Best Budget Pick' : `Top Ranked #${newPos}`,
      price: 199.99,
      list_price: 249.99,
      thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70',
      short_description: 'Key testing takeaways and lab performance scores...',
      cta_text: 'Buy on Amazon',
      affiliate_url: 'https://www.amazon.com?tag=bestbuycart-20',
      highlights: ['Class-leading performance', 'Exceptional build quality'],
      pros: ['Great battery life', 'Premium acoustic fidelity'],
      cons: ['Premium price point'],
    };

    const updated = [...products, newItem];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleImportCatalogProduct = (catalogId: string) => {
    if (!catalogId) return;
    const found = catalogProducts.find((p) => p.id === catalogId);
    if (!found) return;

    const newPos = products.length + 1;
    const newItem: TopProductItem = {
      id: `top-prod-${Date.now()}`,
      product_id: found.id,
      product_slug: found.slug,
      asin: found.asin,
      position: newPos,
      title: found.title,
      badge: found.badge_text || (newPos === 1 ? 'Best Overall Pick' : newPos === 2 ? 'Top Runner-Up' : `Top Ranked #${newPos}`),
      price: found.price || 199.99,
      list_price: found.list_price || undefined,
      thumbnail_url: found.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70',
      short_description: found.short_description || 'Tested in our editorial lab with high performance scores.',
      cta_text: 'Buy on Amazon',
      affiliate_url: found.affiliate_url || (found.asin ? `https://www.amazon.com/dp/${found.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20'),
      rating: found.rating,
      review_count: found.review_count,
      highlights: ['Lab verified hardware specifications', 'Authentic merchant warranty'],
      pros: ['High build quality', 'Reliable performance in testing'],
      cons: [],
    };

    const updated = [...products, newItem];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleUpdateItem = (index: number, field: keyof TopProductItem, value: any) => {
    const copy = [...products];
    copy[index] = { ...copy[index], [field]: value };
    onChange(copy);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= products.length) return;

    const copy = [...products];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    // Reindex position numbers 1, 2, 3...
    const reindexed = copy.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));

    onChange(reindexed);
    setExpandedIndex(target);
  };

  const handleDelete = (index: number) => {
    const copy = products.filter((_, idx) => idx !== index);
    const reindexed = copy.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));
    onChange(reindexed);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  return (
    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Quick Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <Sparkles size={16} color="var(--green-accent)" />
            <span>Top Products / Numbered Ranked Picks ({products.length} Products Included)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Choose any number of products (Top 3, Top 5, Top 8, Top 10, Top 20+). Reorder and customize titles, prices, badges, and Amazon buy links.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Import from Catalog Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleImportCatalogProduct(e.target.value);
                e.target.value = '';
              }
            }}
            disabled={loadingCatalog}
            style={{
              padding: '0.4rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
            }}
            defaultValue=""
          >
            <option value="" disabled>+ Auto-Fill from Product Catalog...</option>
            {catalogProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title.slice(0, 45)}... (${p.price || 0})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddBlankProduct}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
          >
            <Plus size={13} />
            <span>Add Custom Pick</span>
          </button>
        </div>
      </div>

      {/* List of Products */}
      {products.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '2.5rem', textAlign: 'center' }}>
          <ShoppingBag size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No Top Products Added Yet
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Add ranked products to create a rich Top 5, Top 10, or Top 20 buying guide with live prices and Amazon buy buttons.
          </p>
          <button
            type="button"
            onClick={handleAddBlankProduct}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={13} />
            <span>Add First Ranked Product</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {products.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const rank = item.position || idx + 1;

            return (
              <div
                key={item.id || idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: isExpanded ? '1px solid var(--green-accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                }}
              >
                {/* Product Accordion Header */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    background: isExpanded ? 'var(--green-light)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                    {/* Rank Badge */}
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: rank === 1 ? 'var(--green-accent)' : 'var(--bg-subtle)',
                        color: rank === 1 ? '#FFF' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      #{rank}
                    </span>

                    {/* Thumbnail preview */}
                    {item.thumbnail_url && (
                      <img
                        src={item.thumbnail_url}
                        alt=""
                        style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '3px', background: '#FFF' }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--green-accent)', fontWeight: 700 }}>
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                        <span>•</span>
                        <span>{item.badge || 'No award badge'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reorder and Delete controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '0.2rem', color: idx === 0 ? '#CBD5E1' : 'var(--text-secondary)' }}
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === products.length - 1}
                      style={{ background: 'none', border: 'none', cursor: idx === products.length - 1 ? 'not-allowed' : 'pointer', padding: '0.2rem', color: idx === products.length - 1 ? '#CBD5E1' : 'var(--text-secondary)' }}
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--danger)' }}
                      title="Delete product pick"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-muted)' }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Form Fields */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#FAFAF9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Position #
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.position || idx + 1}
                          onChange={(e) => handleUpdateItem(idx, 'position', parseInt(e.target.value) || idx + 1)}
                          style={{ width: '100%', padding: '0.4rem', fontSize: '0.8125rem', fontWeight: 800, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', textAlign: 'center' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Product Title / Model Name *
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                          placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Award / Highlight Badge
                        </label>
                        <input
                          type="text"
                          value={item.badge || ''}
                          onChange={(e) => handleUpdateItem(idx, 'badge', e.target.value)}
                          placeholder="e.g. Best Overall, Best Budget"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Verified Price ($ USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price ?? ''}
                          onChange={(e) => handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          List / Original Price ($ USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.list_price ?? ''}
                          onChange={(e) => handleUpdateItem(idx, 'list_price', parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Amazon ASIN (10-char)
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          value={item.asin || ''}
                          onChange={(e) => handleUpdateItem(idx, 'asin', e.target.value.toUpperCase())}
                          placeholder="e.g. B09XS7JWHH"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Button CTA Label
                        </label>
                        <input
                          type="text"
                          value={item.cta_text || 'Buy on Amazon'}
                          onChange={(e) => handleUpdateItem(idx, 'cta_text', e.target.value)}
                          placeholder="e.g. Buy on Amazon"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Product Image Thumbnail URL
                      </label>
                      <input
                        type="url"
                        value={item.thumbnail_url || ''}
                        onChange={(e) => handleUpdateItem(idx, 'thumbnail_url', e.target.value)}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Amazon Affiliate Buy URL
                      </label>
                      <input
                        type="url"
                        value={item.affiliate_url || ''}
                        onChange={(e) => handleUpdateItem(idx, 'affiliate_url', e.target.value)}
                        placeholder="https://www.amazon.com/dp/.../?tag=bestbuycart-20"
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Short Review Description &amp; Lab Takeaways
                      </label>
                      <textarea
                        rows={2}
                        value={item.short_description || ''}
                        onChange={(e) => handleUpdateItem(idx, 'short_description', e.target.value)}
                        placeholder="Why this product made the ranking list..."
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--green-deep)' }}>
                          Pros (comma separated)
                        </label>
                        <input
                          type="text"
                          value={(item.pros || []).join(', ')}
                          onChange={(e) => handleUpdateItem(idx, 'pros', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          placeholder="Superior ANC, 30-hour battery, Lightweight"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, marginBottom: '0.25rem', color: '#9F1239' }}>
                          Cons (comma separated)
                        </label>
                        <input
                          type="text"
                          value={(item.cons || []).join(', ')}
                          onChange={(e) => handleUpdateItem(idx, 'cons', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          placeholder="Non-folding hinge, High initial price"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
