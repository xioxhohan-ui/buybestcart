'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Download,
  Upload,
  FileCode,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  downloadProductJson,
  convertCatalogProductToTopProduct,
  parseProductJsonToTopProducts,
} from '@/lib/productTemplate';
import PriceDisplay from '@/components/common/PriceDisplay';

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

  // Search Catalog Modal State
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // JSON Import Modal State
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [jsonParsedPreview, setJsonParsedPreview] = useState<TopProductItem[]>([]);
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    const { data } = await supabase
      .from('products')
      .select('*, brand:brands(*), category:categories(*), specifications:product_specifications(*), features:product_features(*), images:product_images(*)')
      .in('status', ['active', 'featured', 'published'])
      .order('title', { ascending: true });

    if (data) setCatalogProducts(data as Product[]);
    setLoadingCatalog(false);
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Filter Catalog Products
  const filteredCatalog = useMemo(() => {
    return catalogProducts.filter((p) => {
      const matchSearch =
        !catalogSearch.trim() ||
        p.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (p.asin && p.asin.toLowerCase().includes(catalogSearch.toLowerCase()));

      const matchCat =
        selectedCategoryFilter === 'all' ||
        (p.category?.slug && p.category.slug === selectedCategoryFilter) ||
        (p.category?.name && p.category.name.toLowerCase() === selectedCategoryFilter.toLowerCase());

      return matchSearch && matchCat;
    });
  }, [catalogProducts, catalogSearch, selectedCategoryFilter]);

  // Unique categories from catalog
  const catalogCategories = useMemo(() => {
    const cats = new Set<string>();
    catalogProducts.forEach((p) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return Array.from(cats);
  }, [catalogProducts]);

  // Add Blank Product
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
      rank: newPos,
      title: `Top Pick #${newPos}`,
      badge: defaultBadge,
      award_label: defaultBadge,
      custom_award_label: defaultBadge,
      price: 199.99,
      list_price: 249.99,
      currency: 'USD',
      availability: 'In Stock',
      score: 9.5,
      rating: 4.8,
      review_count: 250,
      thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=70',
      gallery_images: [],
      short_description: 'Key testing takeaways, lab benchmark scores, and real-world performance evaluation...',
      ranking_reason: 'High performance stability and premium ergonomics in our lab benchmarks.',
      full_description: 'In our prolonged lab evaluations, this product stood out for its responsive engineering, dependable durability, and balanced acoustic/performance tuning.',
      cta_text: 'Buy on Amazon',
      affiliate_url: 'https://www.amazon.com?tag=bestbuycart-20',
      buy_url: 'https://www.amazon.com?tag=bestbuycart-20',
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

  // Import Product from Central Catalog (Deep Clone)
  const handleImportFromCatalog = (catalogProduct: Product) => {
    const newRank = products.length + 1;
    const importedItem = convertCatalogProductToTopProduct(catalogProduct, newRank);
    const updated = [...products, importedItem];
    onChange(updated);
    setIsCatalogModalOpen(false);
    setExpandedIndex(updated.length - 1);
  };

  // Handle JSON Text Changes in Import Modal
  const handleJsonInputChange = (text: string) => {
    setJsonInputText(text);
    if (!text.trim()) {
      setJsonParsedPreview([]);
      setJsonParseError(null);
      return;
    }

    try {
      const parsed = parseProductJsonToTopProducts(text, products.length + 1);
      if (parsed.length === 0) {
        setJsonParseError('Valid JSON detected, but no matching product fields were found.');
        setJsonParsedPreview([]);
      } else {
        setJsonParsedPreview(parsed);
        setJsonParseError(null);
      }
    } catch (err: any) {
      setJsonParseError(`Invalid JSON format: ${err?.message || 'Check syntax'}`);
      setJsonParsedPreview([]);
    }
  };

  // Handle File Upload for JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleJsonInputChange(content);
    };
    reader.readAsText(file);
  };

  // Confirm JSON Import
  const handleConfirmJsonImport = () => {
    if (jsonParsedPreview.length === 0) return;
    const updated = [...products, ...jsonParsedPreview];
    onChange(updated);
    setIsJsonModalOpen(false);
    setJsonInputText('');
    setJsonParsedPreview([]);
    setJsonParseError(null);
    setExpandedIndex(updated.length - 1);
  };

  // Auto-Rank Products by Score
  const handleAutoRankByScore = () => {
    const sorted = [...products].sort((a, b) => (b.score || 0) - (a.score || 0));
    const reindexed = sorted.map((item, idx) => ({
      ...item,
      position: idx + 1,
      rank: idx + 1,
      badge: idx === 0 && (!item.badge || item.badge.includes('Top Pick') || item.badge.includes('Top Ranked')) ? 'Best Overall' : item.badge,
    }));
    onChange(reindexed);
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
      rank: idx + 1,
    }));

    onChange(reindexed);
    setExpandedIndex(target);
  };

  const handleDelete = (index: number) => {
    const copy = products.filter((_, idx) => idx !== index);
    const reindexed = copy.map((item, idx) => ({
      ...item,
      position: idx + 1,
      rank: idx + 1,
    }));
    onChange(reindexed);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  return (
    <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <Sparkles size={16} color="var(--green-accent)" />
            <span>2. Our Top Picks &amp; Detailed Reviews ({products.length} Products Included)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Choose any number of products (Top 5, Top 10, Top 15, Top 20+). Import from your central Product Catalog or upload a JSON template.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* OPTION 1: Search Catalog Button */}
          <button
            type="button"
            onClick={() => setIsCatalogModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Search size={13} />
            <span>Option 1: Search Catalog ({catalogProducts.length})</span>
          </button>

          {/* OPTION 2: Import JSON Button */}
          <button
            type="button"
            onClick={() => setIsJsonModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FileCode size={13} />
            <span>Option 2: Import JSON</span>
          </button>

          {/* Auto-Rank by Score Button */}
          {products.length > 1 && (
            <button
              type="button"
              onClick={handleAutoRankByScore}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              title="Automatically sort products by Overall Lab Score (Highest to Lowest)"
            >
              <Award size={13} color="#B45309" />
              <span>Auto-Rank by Score</span>
            </button>
          )}

          {/* Add Blank Product Button */}
          <button
            type="button"
            onClick={handleAddBlankProduct}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={13} />
            <span>Add Custom Pick</span>
          </button>
        </div>
      </div>

      {/* Product List Cards */}
      {products.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center' }}>
          <ShoppingBag size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No Ranked Products Added Yet
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '500px', margin: '0 auto 1.25rem auto' }}>
            Add products from your central Product Catalog or upload a JSON file to build your Top 5, Top 10, or Top 20+ listicle.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsCatalogModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Search size={14} />
              <span>Search Product Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => setIsJsonModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Upload size={14} />
              <span>Import JSON Template</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {products.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const rank = item.rank || item.position || idx + 1;

            return (
              <div
                key={item.id || idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: isExpanded ? '1px solid var(--green-accent)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                  boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {/* Header Row / Collapsed Summary */}
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
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ color: 'var(--green-accent)', fontWeight: 700 }}>
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '0 0.35rem', borderRadius: '2px' }}>
                          {item.badge || `Top Pick #${rank}`}
                        </span>
                        <span>•</span>
                        <span style={{ color: 'var(--green-deep)', fontWeight: 700 }}>
                          Score: {item.score ?? 9.5}/10
                        </span>
                        <span>•</span>
                        <span>{(item.specifications || []).length} specs</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons (Export JSON, Reorder, Delete) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => downloadProductJson(item)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text-secondary)' }}
                      title="Export this product to JSON"
                    >
                      <Download size={14} />
                    </button>
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
                      title="Remove product"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-secondary)' }}
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

                    {/* Price, Score, Availability & CTA Controls */}
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
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--green-deep)' }}>
                          Lab Score (/10)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="10"
                          value={item.score ?? ''}
                          onChange={(e) => handleUpdateItem(idx, 'score', parseFloat(e.target.value) || undefined)}
                          placeholder="e.g. 9.8"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8125rem', fontWeight: 800, borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)', background: 'var(--green-light)' }}
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

                    {/* Ranking Reason / Standout Advantage */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#B45309' }}>
                        Short Reason for This Ranking / Standout Factor
                      </label>
                      <input
                        type="text"
                        value={item.ranking_reason || ''}
                        onChange={(e) => handleUpdateItem(idx, 'ranking_reason', e.target.value)}
                        placeholder="e.g. Industry-leading acoustic suppression, all-day comfort, and 30-hour battery life."
                        style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
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

                    {/* Gallery Images */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Additional Gallery Image URLs (one per line)
                      </label>
                      <textarea
                        rows={2}
                        value={(item.gallery_images || []).join('\n')}
                        onChange={(e) => handleUpdateItem(idx, 'gallery_images', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
                        placeholder="https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."
                        style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                    </div>

                    {/* Dynamic Specifications Table */}
                    <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-sm)', padding: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <TableIcon size={12} />
                          <span>Customizable Specifications Table ({(item.specifications || []).length} rows)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddSpecRow(idx, 'New Spec', '')}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.6875rem', padding: '0.15rem 0.45rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          <Plus size={10} />
                          <span>Add Spec Row</span>
                        </button>
                      </div>

                      {/* Quick Spec Presets */}
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        {COMMON_SPEC_SUGGESTIONS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleAddSpecRow(idx, preset.name, preset.value)}
                            style={{ fontSize: '0.6875rem', padding: '0.1rem 0.35rem', borderRadius: '2px', border: '1px solid var(--border)', background: 'var(--bg-surface)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {(item.specifications || []).map((spec, sIdx) => (
                          <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '130px 1fr auto', gap: '0.4rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleUpdateSpecRow(idx, sIdx, 'name', e.target.value)}
                              placeholder="Spec Name (e.g. Battery)"
                              style={{ padding: '0.3rem 0.45rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleUpdateSpecRow(idx, sIdx, 'value', e.target.value)}
                              placeholder="Spec Value (e.g. 30 Hours)"
                              style={{ padding: '0.3rem 0.45rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteSpecRow(idx, sIdx)}
                              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                              title="Delete spec row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Short Description & Full Review */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Short Summary / Takeaway
                        </label>
                        <textarea
                          rows={3}
                          value={item.short_description || ''}
                          onChange={(e) => handleUpdateItem(idx, 'short_description', e.target.value)}
                          placeholder="Brief 2-3 sentence overview..."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', lineHeight: 1.4, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Full In-Depth Product Review Content
                        </label>
                        <textarea
                          rows={3}
                          value={item.full_description || ''}
                          onChange={(e) => handleUpdateItem(idx, 'full_description', e.target.value)}
                          placeholder="Comprehensive review paragraphs..."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', lineHeight: 1.4, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                        />
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--green-deep)' }}>
                          Pros (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={(item.pros || []).join('\n')}
                          onChange={(e) => handleUpdateItem(idx, 'pros', e.target.value.split('\n').filter(Boolean))}
                          placeholder="Class-leading noise cancellation\nLong battery life"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)', background: 'var(--green-light)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--danger)' }}>
                          Cons (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={(item.cons || []).join('\n')}
                          onChange={(e) => handleUpdateItem(idx, 'cons', e.target.value.split('\n').filter(Boolean))}
                          placeholder="Premium price point\nCase is slightly bulky"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid #FECACA', background: '#FEF2F2' }}
                        />
                      </div>
                    </div>

                    {/* Best For vs Who Should Avoid It */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--green-deep)' }}>
                          🎯 Who It Is Best For
                        </label>
                        <input
                          type="text"
                          value={item.best_for || ''}
                          onChange={(e) => handleUpdateItem(idx, 'best_for', e.target.value)}
                          placeholder="e.g. Commuters, flyers, and remote workers..."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#B45309' }}>
                          ⚠️ Who Should Avoid It
                        </label>
                        <input
                          type="text"
                          value={item.avoid_if || ''}
                          onChange={(e) => handleUpdateItem(idx, 'avoid_if', e.target.value)}
                          placeholder="e.g. Budget buyers on a sub-$100 limit..."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                        />
                      </div>
                    </div>

                    {/* Video Embed */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Video Embed URL (YouTube/Vimeo)
                        </label>
                        <input
                          type="url"
                          value={item.video_url || ''}
                          onChange={(e) => handleUpdateItem(idx, 'video_url', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Video Title / Caption
                        </label>
                        <input
                          type="text"
                          value={item.video_title || ''}
                          onChange={(e) => handleUpdateItem(idx, 'video_title', e.target.value)}
                          placeholder="e.g. Lab Acoustic Test & Teardown"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
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

      {/* ========================================================= */}
      {/* MODAL 1: SEARCH PRODUCT CATALOG MODAL                     */}
      {/* ========================================================= */}
      {isCatalogModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsCatalogModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%',
              maxWidth: '840px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} color="var(--green-accent)" />
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Search Central Product Catalog
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Select any product to import a full standalone copy into this buying guide.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search Bar & Filters */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  autoFocus
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search by product name, brand, manufacturer, or ASIN..."
                  style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', fontSize: '0.875rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: 'var(--bg-surface)' }}
                />
              </div>

              {/* Category Pills */}
              {catalogCategories.length > 0 && (
                <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('all')}
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-xs)',
                      border: selectedCategoryFilter === 'all' ? '1px solid var(--green-accent)' : '1px solid var(--border)',
                      background: selectedCategoryFilter === 'all' ? 'var(--green-light)' : 'var(--bg-surface)',
                      color: selectedCategoryFilter === 'all' ? 'var(--green-deep)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    All ({catalogProducts.length})
                  </button>
                  {catalogCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-xs)',
                        border: selectedCategoryFilter === cat ? '1px solid var(--green-accent)' : '1px solid var(--border)',
                        background: selectedCategoryFilter === cat ? 'var(--green-light)' : 'var(--bg-surface)',
                        color: selectedCategoryFilter === cat ? 'var(--green-deep)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Products Search Results Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loadingCatalog ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>Loading catalog products...</div>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No products matched your search. Try a different keyword or create a custom pick.
                </div>
              ) : (
                filteredCatalog.map((prod) => {
                  const isAlreadyAdded = products.some((p) => p.product_id === prod.id || p.asin === prod.asin);

                  return (
                    <div
                      key={prod.id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: isAlreadyAdded ? '1px solid var(--green-accent)' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.875rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                            background: '#FFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {prod.thumbnail_url ? (
                            <img src={prod.thumbnail_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : (
                            <ShoppingBag size={18} color="var(--text-muted)" />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                            {prod.brand?.name && (
                              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {prod.brand.name}
                              </span>
                            )}
                            {prod.badge_text && (
                              <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '0 0.35rem', borderRadius: '2px' }}>
                                {prod.badge_text}
                              </span>
                            )}
                          </div>

                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.title}
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--green-accent)', fontWeight: 800 }}>
                              <PriceDisplay amount={prod.price} />
                            </span>
                            {prod.editorial_score && (
                              <span style={{ color: 'var(--green-deep)', fontWeight: 700 }}>
                                ★ Score: {prod.editorial_score}/10
                              </span>
                            )}
                            {prod.asin && (
                              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                ASIN: {prod.asin}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Import Action */}
                      <button
                        type="button"
                        onClick={() => handleImportFromCatalog(prod)}
                        className={isAlreadyAdded ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <CheckCircle2 size={13} color="var(--green-accent)" />
                            <span>Import Again</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>Import to Blog</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: IMPORT JSON PRODUCT TEMPLATE MODAL               */}
      {/* ========================================================= */}
      {isJsonModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsJsonModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-2xl)',
              width: '100%',
              maxWidth: '760px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCode size={18} color="var(--green-accent)" />
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Import Product from JSON File / Template
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Upload a `.json` backup file or paste structured product JSON below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* File Upload Dropzone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Upload .JSON File
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-xs)', background: 'var(--bg-subtle)' }}
                />
              </div>

              {/* Or Paste JSON */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Or Paste Product JSON Data
                </label>
                <textarea
                  rows={6}
                  value={jsonInputText}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  placeholder={`{\n  "title": "Sony WH-1000XM5",\n  "price": 398.00,\n  "badge": "Best Overall",\n  "specifications": [\n    { "name": "Battery", "value": "30 Hours" }\n  ]\n}`}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              {/* Error Message */}
              {jsonParseError && (
                <div style={{ padding: '0.75rem 1rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-xs)', color: '#991B1B', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} />
                  <span>{jsonParseError}</span>
                </div>
              )}

              {/* Parsed Preview */}
              {jsonParsedPreview.length > 0 && (
                <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-deep)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    ✓ Ready to Import {jsonParsedPreview.length} Product(s):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {jsonParsedPreview.map((p, idx) => (
                      <div key={idx} style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700 }}>• {p.title}</span>
                        <span style={{ color: 'var(--green-accent)', fontWeight: 800 }}>${Number(p.price || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmJsonImport}
                disabled={jsonParsedPreview.length === 0}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Check size={14} />
                <span>Import {jsonParsedPreview.length} Product(s) into Blog</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
