'use client';

import React, { useState, useEffect } from 'react';
import { TopProductItem, Product, ProductSpecItem } from '@/types';
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
  DollarSign,
  Tag,
  Table as TableIcon,
  Video,
  UserCheck,
  AlertTriangle,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';

interface TopProductsManagerProps {
  products: TopProductItem[];
  onChange: (updated: TopProductItem[]) => void;
}

const PRESET_AWARD_LABELS = [
  'Best Overall',
  'Best Budget',
  'Best Premium',
  'Best for Gaming',
  'Best Value',
  'Best for Professionals',
  'Best Battery Life',
  'Editor\'s Choice',
  'Best Noise Cancelling',
  'Top Runner-Up',
];

const COMMON_SPEC_SUGGESTIONS = [
  { name: 'Dimensions', value: '' },
  { name: 'Weight', value: '' },
  { name: 'Battery Life', value: '' },
  { name: 'Connectivity', value: '' },
  { name: 'Materials', value: '' },
  { name: 'Driver / Screen Size', value: '' },
  { name: 'Warranty', value: '1-Year Limited' },
];

export default function TopProductsManager({ products = [], onChange }: TopProductsManagerProps) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      const { data } = await supabase
        .from('products')
        .select('id, title, slug, asin, price, list_price, thumbnail_url, short_description, description, affiliate_url, badge_text, rating, review_count')
        .in('status', ['active', 'featured', 'published'])
        .order('title', { ascending: true });

      if (data) setCatalogProducts(data as Product[]);
      setLoadingCatalog(false);
    };
    fetchCatalog();
  }, []);

  const handleAddBlankProduct = () => {
    const newPos = products.length + 1;
    const defaultBadge =
      newPos === 1
        ? 'Best Overall'
        : newPos === 2
        ? 'Top Runner-Up'
        : newPos === 3
        ? 'Best Budget'
        : newPos === 4
        ? 'Best Value'
        : `Top Ranked #${newPos}`;

    const newItem: TopProductItem = {
      id: `top-prod-${Date.now()}`,
      position: newPos,
      title: `Top Pick #${newPos}`,
      badge: defaultBadge,
      price: 199.99,
      list_price: 249.99,
      availability: 'In Stock',
      thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70',
      gallery_images: [],
      short_description: 'Key testing takeaways, lab benchmark scores, and real-world performance evaluation...',
      full_description: 'In our prolonged lab evaluations, this product stood out for its responsive engineering, dependable durability, and balanced acoustic/performance tuning.',
      cta_text: 'Buy on Amazon',
      affiliate_url: 'https://www.amazon.com?tag=bestbuycart-20',
      highlights: ['Class-leading performance', 'Exceptional build quality', 'Long-lasting battery endurance'],
      important_features: ['Active ANC', 'Fast Charging', 'Spatial Audio'],
      specifications: [
        { name: 'Weight', value: '250g' },
        { name: 'Battery Life', value: '30 Hours' },
        { name: 'Connectivity', value: 'Bluetooth 5.2 / USB-C' },
        { name: 'Materials', value: 'Recycled Aluminum & Foam' },
      ],
      pros: ['Great battery life', 'Premium acoustic fidelity', 'Comfortable ear cups'],
      cons: ['Premium price point'],
      best_for: 'Frequent commuters, office professionals, and audiophiles seeking top acoustic suppression.',
      avoid_if: 'Budget shoppers seeking entry-level sub-$50 alternatives.',
      performance_notes: 'Measured 94% noise cancellation across low airplane rumblings and 30.5 hours continuous playback.',
      video_url: '',
      video_title: '',
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
    const defaultBadge =
      found.badge_text ||
      (newPos === 1 ? 'Best Overall' : newPos === 2 ? 'Top Runner-Up' : newPos === 3 ? 'Best Budget' : `Top Ranked #${newPos}`);

    const newItem: TopProductItem = {
      id: `top-prod-${Date.now()}`,
      product_id: found.id,
      product_slug: found.slug,
      asin: found.asin,
      position: newPos,
      title: found.title,
      badge: defaultBadge,
      price: found.price || 199.99,
      list_price: found.list_price || undefined,
      availability: 'In Stock',
      thumbnail_url: found.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70',
      gallery_images: [],
      short_description: found.short_description || 'Tested in our editorial lab with high performance scores.',
      full_description: found.description || 'Our testing engineers put this product through calibrated bench tests measuring build quality, thermal behavior, and real-world durability.',
      cta_text: 'Buy on Amazon',
      affiliate_url: found.affiliate_url || (found.asin ? `https://www.amazon.com/dp/${found.asin}?tag=bestbuycart-20` : 'https://www.amazon.com?tag=bestbuycart-20'),
      rating: found.rating,
      review_count: found.review_count,
      highlights: ['Lab verified hardware specifications', 'Authentic merchant warranty', 'High-grade components'],
      important_features: ['Verified Stock', 'Fast Shipping'],
      specifications: [
        { name: 'ASIN', value: found.asin || 'N/A' },
        { name: 'Availability', value: 'In Stock' },
        { name: 'Warranty', value: '1-Year Manufacturer Warranty' },
      ],
      pros: ['High build quality', 'Reliable performance in testing'],
      cons: [],
      best_for: 'Buyers looking for verified Amazon authentic hardware.',
      avoid_if: '',
      performance_notes: '',
      video_url: '',
      video_title: '',
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

  // Dynamic Specs Row Management
  const handleAddSpecRow = (prodIndex: number, name = 'Spec Name', value = '') => {
    const copy = [...products];
    const currentSpecs = copy[prodIndex].specifications || [];
    copy[prodIndex].specifications = [...currentSpecs, { name, value }];
    onChange(copy);
  };

  const handleUpdateSpecRow = (prodIndex: number, specIndex: number, field: 'name' | 'value', val: string) => {
    const copy = [...products];
    const currentSpecs = [...(copy[prodIndex].specifications || [])];
    currentSpecs[specIndex] = { ...currentSpecs[specIndex], [field]: val };
    copy[prodIndex].specifications = currentSpecs;
    onChange(copy);
  };

  const handleDeleteSpecRow = (prodIndex: number, specIndex: number) => {
    const copy = [...products];
    const currentSpecs = (copy[prodIndex].specifications || []).filter((_, idx) => idx !== specIndex);
    copy[prodIndex].specifications = currentSpecs;
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
            <span>2. Our Top Picks &amp; Detailed Review Builder ({products.length} Products Included)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Choose any number of products (Top 5, Top 6, Top 7, Top 8, Top 9, Top 10, Top 15, Top 20+). Configure customizable specifications, galleries, pros/cons, &quot;best for&quot; callouts, and Amazon CTA buttons.
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
            <option value="" disabled>+ Auto-Fill from Catalog...</option>
            {catalogProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title.slice(0, 42)}... (${p.price || 0})
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
            No Top Picks Added Yet
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Add ranked products to create a rich Top 5, Top 10, or Top 20 buying guide with live prices, custom specifications, pros/cons, and Amazon buy buttons.
          </p>
          <button
            type="button"
            onClick={handleAddBlankProduct}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={13} />
            <span>Add #1 Ranked Pick</span>
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
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--green-accent)', fontWeight: 700 }}>
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '0 0.35rem', borderRadius: '2px' }}>
                          {item.badge || `Top Pick #${rank}`}
                        </span>
                        <span>•</span>
                        <span>{(item.specifications || []).length} specs</span>
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
                  <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#FAFAF9' }}>
                    {/* Rank & Title */}
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Rank #
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.position || idx + 1}
                          onChange={(e) => handleUpdateItem(idx, 'position', parseInt(e.target.value) || idx + 1)}
                          style={{ width: '100%', padding: '0.45rem', fontSize: '0.875rem', fontWeight: 800, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', textAlign: 'center' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Product Name * (Clickable link on public website)
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                          placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
                          style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.875rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    {/* Custom Award / Ranking Label Section */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <label style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#B45309' }}>
                          <Award size={13} />
                          <span>Custom Ranking Label / Award *</span>
                        </label>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          Click a preset or type any custom award:
                        </span>
                      </div>

                      <input
                        type="text"
                        value={item.badge || ''}
                        onChange={(e) => handleUpdateItem(idx, 'badge', e.target.value)}
                        placeholder="e.g. Best Overall, Best Budget, Best for Gaming, Best for Professionals, or custom text"
                        style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', marginBottom: '0.4rem' }}
                      />

                      {/* Preset Award Chips */}
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {PRESET_AWARD_LABELS.map((preset) => {
                          const isSelected = item.badge === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleUpdateItem(idx, 'badge', preset)}
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.45rem',
                                borderRadius: 'var(--radius-xs)',
                                border: isSelected ? '1px solid #D97706' : '1px solid var(--border)',
                                background: isSelected ? '#FEF3C7' : 'var(--bg-surface)',
                                color: isSelected ? '#B45309' : 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              {preset}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price, Availability & CTA Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Verified Price ($ USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price ?? ''}
                          onChange={(e) => handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          List Price ($ USD)
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
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Availability Status
                        </label>
                        <input
                          type="text"
                          value={item.availability || 'In Stock'}
                          onChange={(e) => handleUpdateItem(idx, 'availability', e.target.value)}
                          placeholder="e.g. In Stock, Ships Fast"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Amazon ASIN
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
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          CTA Button Label
                        </label>
                        <input
                          type="text"
                          value={item.cta_text || 'Buy on Amazon'}
                          onChange={(e) => handleUpdateItem(idx, 'cta_text', e.target.value)}
                          placeholder="e.g. Buy on Amazon"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    {/* Image & Gallery URLs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Primary Thumbnail URL
                        </label>
                        <input
                          type="url"
                          value={item.thumbnail_url || ''}
                          onChange={(e) => handleUpdateItem(idx, 'thumbnail_url', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Amazon Affiliate Link *
                        </label>
                        <input
                          type="url"
                          value={item.affiliate_url || ''}
                          onChange={(e) => handleUpdateItem(idx, 'affiliate_url', e.target.value)}
                          placeholder="https://www.amazon.com/dp/B09XS7JWHH?tag=bestbuycart-20"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    {/* Additional Gallery Images */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Additional Gallery Image URLs (comma separated)
                      </label>
                      <input
                        type="text"
                        value={(item.gallery_images || []).join(', ')}
                        onChange={(e) => handleUpdateItem(idx, 'gallery_images', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                        placeholder="https://images.unsplash.com/img1.jpg, https://images.unsplash.com/img2.jpg"
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    {/* Short Description Quote */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Short Review Verdict / Quote
                      </label>
                      <textarea
                        rows={2}
                        value={item.short_description || ''}
                        onChange={(e) => handleUpdateItem(idx, 'short_description', e.target.value)}
                        placeholder="Key takeaway quote summarizing why this product is ranked..."
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    {/* Full Detailed Description */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Full In-Depth Product Review / Lab Assessment
                      </label>
                      <textarea
                        rows={4}
                        value={item.full_description || ''}
                        onChange={(e) => handleUpdateItem(idx, 'full_description', e.target.value)}
                        placeholder="Write multiple in-depth paragraphs describing sound quality, ergonomics, daily battery endurance, real-world quirks, and hardware durability..."
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', lineHeight: 1.6, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    {/* Key Highlights & Important Features */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Key Highlights (comma separated)
                        </label>
                        <input
                          type="text"
                          value={(item.highlights || []).join(', ')}
                          onChange={(e) => handleUpdateItem(idx, 'highlights', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          placeholder="30-hour battery, ANC optimizer, 8-mic array"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Important Features Pills (comma separated)
                        </label>
                        <input
                          type="text"
                          value={(item.important_features || []).join(', ')}
                          onChange={(e) => handleUpdateItem(idx, 'important_features', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          placeholder="Active ANC, Fast Charge, Multipoint Bluetooth"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    {/* DYNAMIC CUSTOMIZABLE SPECIFICATIONS BUILDER */}
                    <div style={{ background: '#FFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
                            <TableIcon size={13} color="var(--green-accent)" />
                            <span>Customizable Specifications ({(item.specifications || []).length} Specs Added)</span>
                          </div>
                          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>
                            Add, remove, or customize any key-value spec rows (Dimensions, Weight, Battery, Connectivity, Materials, Custom).
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleAddSpecRow(idx, 'New Spec', '')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            <Plus size={11} />
                            <span>Add Row</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Spec Presets */}
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, alignSelf: 'center' }}>
                          Quick Add:
                        </span>
                        {COMMON_SPEC_SUGGESTIONS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleAddSpecRow(idx, preset.name, preset.value)}
                            style={{
                              fontSize: '0.6875rem',
                              padding: '0.15rem 0.4rem',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-subtle)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>

                      {/* Spec Rows Table */}
                      {(item.specifications || []).length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem' }}>
                          No specifications added. Click &quot;Add Row&quot; or a quick preset above.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {item.specifications?.map((spec, sIdx) => (
                            <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: '0.4rem', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={spec.name}
                                onChange={(e) => handleUpdateSpecRow(idx, sIdx, 'name', e.target.value)}
                                placeholder="e.g. Weight"
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                              />
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) => handleUpdateSpecRow(idx, sIdx, 'value', e.target.value)}
                                placeholder="e.g. 250g / 8.8 oz"
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteSpecRow(idx, sIdx)}
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                                title="Remove spec"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pros & Cons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--green-deep)' }}>
                          Pros (comma separated)
                        </label>
                        <input
                          type="text"
                          value={(item.pros || []).join(', ')}
                          onChange={(e) => handleUpdateItem(idx, 'pros', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          placeholder="Exceptional ANC, 30-hour battery, Lightweight"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#9F1239' }}>
                          Cons (comma separated)
                        </label>
                        <input
                          type="text"
                          value={(item.cons || []).join(', ')}
                          onChange={(e) => handleUpdateItem(idx, 'cons', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          placeholder="Non-collapsible headband, Premium price"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    {/* "Who it is best for" & "Who should avoid it" */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--green-accent)' }}>
                          Who It Is Best For
                        </label>
                        <textarea
                          rows={2}
                          value={item.best_for || ''}
                          onChange={(e) => handleUpdateItem(idx, 'best_for', e.target.value)}
                          placeholder="e.g. Frequent flyers, office workers, and remote professionals needing top-tier isolation."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--amber-deal)' }}>
                          Who Should Avoid It
                        </label>
                        <textarea
                          rows={2}
                          value={item.avoid_if || ''}
                          onChange={(e) => handleUpdateItem(idx, 'avoid_if', e.target.value)}
                          placeholder="e.g. Gym enthusiasts needing IPX8 waterproof rating or folding headbands."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    {/* Product Video & Performance Notes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Product Video URL (YouTube / Vimeo / MP4)
                        </label>
                        <input
                          type="url"
                          value={item.video_url || ''}
                          onChange={(e) => handleUpdateItem(idx, 'video_url', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Video Title
                        </label>
                        <input
                          type="text"
                          value={item.video_title || ''}
                          onChange={(e) => handleUpdateItem(idx, 'video_title', e.target.value)}
                          placeholder="e.g. Real-world Noise Cancellation Lab Test"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Performance &amp; Battery Lab Benchmark Notes
                      </label>
                      <input
                        type="text"
                        value={item.performance_notes || ''}
                        onChange={(e) => handleUpdateItem(idx, 'performance_notes', e.target.value)}
                        placeholder="e.g. Measured 94% low-frequency cancellation and 30.5 hours continuous runtime."
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
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
