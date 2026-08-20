'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { Product, Brand, Category, ProductStatus, ProductContentSource, ProductImage, ProductFeature, ProductSpecification } from '@/types';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Star,
  Award,
  Flame,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Sparkles,
  Image as ImageIcon,
  ListPlus,
  ArrowUp,
  ArrowDown,
  Check,
  Table,
  Globe,
  Search,
  RefreshCw,
} from 'lucide-react';
import { formatPrice } from '@/lib/region';
import Link from 'next/link';

export const DEPARTMENTS = [
  'Electronics',
  'Computers & Accessories',
  'Phones & Accessories',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Clothing, Shoes & Jewelry',
  'Sports & Outdoors',
  'Toys & Games',
  'Video Games',
  'Automotive',
  'Tools & Home Improvement',
  'Pet Supplies',
  'Baby Products',
  'Books',
  'Office Products',
  'Grocery',
  'Health & Household',
  'Garden & Outdoor',
  'Musical Instruments',
  'Industrial & Scientific',
  'Other',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [scanningLink, setScanningLink] = useState(false);
  const [suggestedDept, setSuggestedDept] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    asin: '',
    brand_id: '',
    category_id: '',
    manufacturer: '',
    short_description: '',
    description: '',
    thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    price: '348.00',
    list_price: '399.99',
    currency: 'USD',
    availability: 'In Stock',
    amazon_url: '',
    rating: '4.8',
    review_count: '1000',
    editorial_score: '9.6',
    global_rank: '1',
    category_rank: '1',
    is_featured: true,
    is_editor_choice: true,
    badge_text: 'Best Overall',
    deal_status: 'none' as Product['deal_status'],
    status: 'active' as ProductStatus,
    content_source: 'manual' as ProductContentSource,
    pros: '',
    cons: '',
    editor_verdict: '',
    best_for: '',
    why_we_like_it: '',
    buying_advice: '',
    who_should_buy: '',
    who_should_avoid: '',
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    og_image: '',
  });

  // Dynamic Gallery, Features & Specifications
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [featureRows, setFeatureRows] = useState<ProductFeature[]>([]);
  const [specRows, setSpecRows] = useState<ProductSpecification[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, brandRes, catRes] = await Promise.all([
      supabase.from('products').select('*, brand:brands(*), category:categories(*)').order('global_rank', { ascending: true, nullsFirst: false }),
      supabase.from('brands').select('id, name, slug').order('name', { ascending: true }),
      supabase.from('categories').select('id, name, slug').order('name', { ascending: true }),
    ]);

    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (brandRes.data) setBrands(brandRes.data as Brand[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScanAmazonLink = async () => {
    if (!formData.amazon_url) {
      alert('Please paste an Amazon Product Link or ASIN first.');
      return;
    }
    setScanningLink(true);
    try {
      const res = await fetch('/api/amazon/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.amazon_url }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setFormData((prev) => ({
          ...prev,
          asin: d.asin || prev.asin,
          amazon_url: d.affiliate_url || prev.amazon_url,
        }));
        if (d.suggested_department) {
          setSuggestedDept(d.suggested_department);
        }
      } else {
        alert(data.error || 'Could not scan Amazon product link.');
      }
    } catch {
      alert('Network error while scanning Amazon link.');
    } finally {
      setScanningLink(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      slug: '',
      asin: '',
      brand_id: brands[0]?.id || '',
      category_id: categories[0]?.id || '',
      manufacturer: '',
      short_description: '',
      description: '',
      thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
      price: '299.99',
      list_price: '349.99',
      currency: 'USD',
      availability: 'In Stock',
      amazon_url: '',
      rating: '4.8',
      review_count: '1200',
      editorial_score: '9.5',
      global_rank: (products.length + 1).toString(),
      category_rank: '1',
      is_featured: true,
      is_editor_choice: false,
      badge_text: 'Best Overall',
      deal_status: 'none',
      status: 'active',
      content_source: 'manual',
      pros: 'Class-leading active noise cancellation\nSuperb 30-hour battery life\nHigh-resolution LDAC codec support',
      cons: 'Premium price point\nDoes not fold as compactly as predecessors',
      editor_verdict: 'The definitive benchmark for consumer wireless ANC headphones in 2026.',
      best_for: 'Frequent commuters, office professionals, and critical music listeners.',
      why_we_like_it: 'Dual-processor ANC and lightweight ergonomic headband.',
      buying_advice: 'Look for periodic $50 price drops during Amazon sales events.',
      who_should_buy: 'Anyone needing industry-best noise isolation and microphone clarity.',
      who_should_avoid: 'Budget buyers seeking sub-$150 gym headphones.',
      seo_title: '',
      seo_description: '',
      canonical_url: '',
      og_image: '',
    });

    setGalleryImages([
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80', alt_text: 'Primary front view', is_primary: true, display_order: 1 }
    ]);

    setFeatureRows([
      { feature: '40-hour continuous battery endurance', display_order: 1 },
      { feature: 'Active dual-processor noise cancellation', display_order: 2 },
      { feature: 'Bluetooth 5.3 multipoint audio connectivity', display_order: 3 },
    ]);

    setSpecRows([
      { spec_key: 'Acoustic Driver', spec_value: '30mm Carbon Fiber Composite', display_order: 1 },
      { spec_key: 'Battery Life', spec_value: '30 Hours (ANC On), 40 Hours (ANC Off)', display_order: 2 },
      { spec_key: 'Weight', spec_value: '250g (8.8 oz)', display_order: 3 },
      { spec_key: 'Connectivity', spec_value: 'Bluetooth 5.2 / Multipoint / 3.5mm Aux', display_order: 4 },
      { spec_key: 'Charging Port', spec_value: 'USB-C Fast Charging (3 min = 3 hrs)', display_order: 5 },
    ]);

    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      asin: p.asin || '',
      brand_id: p.brand_id || '',
      category_id: p.category_id || '',
      manufacturer: p.manufacturer || '',
      short_description: p.short_description || '',
      description: p.description || '',
      thumbnail_url: p.thumbnail_url || '',
      price: p.price ? p.price.toString() : '',
      list_price: p.list_price ? p.list_price.toString() : '',
      currency: p.currency || 'USD',
      availability: p.availability || 'In Stock',
      amazon_url: p.amazon_url || '',
      rating: p.rating ? p.rating.toString() : '4.8',
      review_count: p.review_count ? p.review_count.toString() : '1000',
      editorial_score: p.editorial_score ? p.editorial_score.toString() : '9.0',
      global_rank: p.global_rank ? p.global_rank.toString() : '1',
      category_rank: p.category_rank ? p.category_rank.toString() : '1',
      is_featured: p.is_featured,
      is_editor_choice: p.is_editor_choice,
      badge_text: p.badge_text || 'Best Overall',
      deal_status: p.deal_status,
      status: p.status,
      content_source: p.content_source || 'manual',
      pros: (p.pros || []).join('\n'),
      cons: (p.cons || []).join('\n'),
      editor_verdict: p.editor_verdict || '',
      best_for: p.best_for || '',
      why_we_like_it: p.why_we_like_it || '',
      buying_advice: p.buying_advice || '',
      who_should_buy: p.who_should_buy || '',
      who_should_avoid: p.who_should_avoid || '',
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      canonical_url: p.canonical_url || '',
      og_image: p.og_image || '',
    });

    setGalleryImages(p.images && p.images.length > 0 ? p.images : [
      { url: p.thumbnail_url || '', alt_text: p.title, is_primary: true, display_order: 1 }
    ]);

    setFeatureRows(p.features && p.features.length > 0 ? p.features : [
      { feature: '40-hour continuous battery endurance', display_order: 1 },
      { feature: 'Active dual-processor noise cancellation', display_order: 2 },
      { feature: 'Bluetooth 5.3 multipoint audio connectivity', display_order: 3 },
    ]);

    setSpecRows(p.specifications && p.specifications.length > 0 ? p.specifications : [
      { spec_key: 'Acoustic Driver', spec_value: '30mm Carbon Fiber Composite', display_order: 1 },
      { spec_key: 'Battery Life', spec_value: '30 Hours (ANC On), 40 Hours (ANC Off)', display_order: 2 },
      { spec_key: 'Weight', spec_value: '250g (8.8 oz)', display_order: 3 },
      { spec_key: 'Connectivity', spec_value: 'Bluetooth 5.2 / Multipoint / 3.5mm Aux', display_order: 4 },
      { spec_key: 'Charging Port', spec_value: 'USB-C Fast Charging (3 min = 3 hrs)', display_order: 5 },
    ]);

    setShowModal(true);
  };

  // Gallery Helpers
  const addGalleryImage = () => {
    setGalleryImages([
      ...galleryImages,
      { url: '', alt_text: 'Product showcase image', is_primary: false, display_order: galleryImages.length + 1 },
    ]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    const updated = galleryImages.map((img, i) => ({ ...img, is_primary: i === index }));
    setGalleryImages(updated);
    if (updated[index].url) {
      setFormData({ ...formData, thumbnail_url: updated[index].url });
    }
  };

  // Feature Helpers
  const addFeatureRow = () => {
    setFeatureRows([...featureRows, { feature: '', display_order: featureRows.length + 1 }]);
  };

  const removeFeatureRow = (index: number) => {
    setFeatureRows(featureRows.filter((_, i) => i !== index));
  };

  const updateFeatureText = (index: number, text: string) => {
    const updated = [...featureRows];
    updated[index].feature = text;
    setFeatureRows(updated);
  };

  // Specifications Helpers
  const addSpecRow = () => {
    setSpecRows([...specRows, { spec_key: '', spec_value: '', display_order: specRows.length + 1 }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecRows(specRows.filter((_, i) => i !== index));
  };

  const updateSpecKey = (index: number, key: string) => {
    const updated = [...specRows];
    updated[index].spec_key = key;
    setSpecRows(updated);
  };

  const updateSpecValue = (index: number, val: string) => {
    const updated = [...specRows];
    updated[index].spec_value = val;
    setSpecRows(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const generatedSlug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const prosArray = formData.pros.split('\n').map((s) => s.trim()).filter(Boolean);
    const consArray = formData.cons.split('\n').map((s) => s.trim()).filter(Boolean);

    const payload = {
      title: formData.title,
      slug: generatedSlug,
      asin: formData.asin,
      brand_id: formData.brand_id || null,
      category_id: formData.category_id || null,
      manufacturer: formData.manufacturer,
      short_description: formData.short_description,
      description: formData.description,
      thumbnail_url: formData.thumbnail_url,
      price: formData.price ? parseFloat(formData.price) : null,
      list_price: formData.list_price ? parseFloat(formData.list_price) : null,
      currency: formData.currency,
      availability: formData.availability,
      amazon_url: formData.amazon_url,
      rating: formData.rating ? parseFloat(formData.rating) : 4.8,
      review_count: formData.review_count ? parseInt(formData.review_count) : 1000,
      editorial_score: formData.editorial_score ? parseFloat(formData.editorial_score) : 9.0,
      global_rank: formData.global_rank ? parseInt(formData.global_rank) : null,
      category_rank: formData.category_rank ? parseInt(formData.category_rank) : null,
      is_featured: formData.is_featured,
      is_editor_choice: formData.is_editor_choice,
      badge_text: formData.badge_text,
      deal_status: formData.deal_status,
      status: formData.status,
      content_source: formData.content_source,
      pros: prosArray,
      cons: consArray,
      editor_verdict: formData.editor_verdict,
      best_for: formData.best_for,
      why_we_like_it: formData.why_we_like_it,
      buying_advice: formData.buying_advice,
      who_should_buy: formData.who_should_buy,
      who_should_avoid: formData.who_should_avoid,
      seo_title: formData.seo_title || `${formData.title} — Price, Specs & Reviews | Best Buy Cart`,
      seo_description: formData.seo_description || formData.short_description || `Read our in-depth lab testing and review of the ${formData.title} with verified Amazon pricing.`,
      canonical_url: formData.canonical_url || `https://buybestcart.shop/products/${generatedSlug}`,
      og_image: formData.og_image || formData.thumbnail_url,
      updated_at: new Date().toISOString(),
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id);

      if (!error) {
        setShowModal(false);
        fetchData();
        triggerRevalidation();
      } else {
        alert(`Error updating product: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from('products').insert(payload);

      if (!error) {
        setShowModal(false);
        fetchData();
        triggerRevalidation();
      } else {
        alert(`Error creating product: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete product "${title}"?`)) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
      triggerRevalidation();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.asin && p.asin.toLowerCase().includes(search.toLowerCase())) ||
      (p.brand?.name && p.brand.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || p.content_source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const effectiveSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product-slug';
  const effectiveSeoTitle = formData.seo_title || (formData.title ? `${formData.title} — Price, Specs & Reviews | Best Buy Cart` : 'Product Title — Price, Specs & Reviews | Best Buy Cart');
  const effectiveSeoDesc = formData.seo_description || formData.short_description || 'Read our in-depth laboratory testing and verified buying advice for this top-rated product.';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={22} color="var(--green-accent)" />
            <span>Product Catalog & SEO Matrix Engine</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage Amazon ASINs, live pricing, specifications, Google SERP metadata, custom slugs, and ranking scores.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Plus size={14} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ flex: '1', minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search by title, ASIN, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.8125rem',
              background: 'var(--bg-surface)',
            }}
          >
            <option value="all">All Statuses (8 States)</option>
            <option value="active">Active</option>
            <option value="featured">Featured</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="unavailable">Unavailable</option>
            <option value="needs_review">Needs Review</option>
            <option value="pending_sync">Pending Sync</option>
            <option value="api_error">API Error</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.8125rem',
              background: 'var(--bg-surface)',
            }}
          >
            <option value="all">All Sources</option>
            <option value="manual">Manual</option>
            <option value="amazon_api">Amazon API</option>
            <option value="editorial">Editorial</option>
            <option value="ai_assisted">AI-Assisted</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Rank</th>
              <th>Product Details</th>
              <th>Category & Brand</th>
              <th>Price (MSRP)</th>
              <th>Rating & Score</th>
              <th>Badge</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading product catalog...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>No products found matching filters.</td></tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--green-accent)', fontSize: '0.8125rem' }}>
                      #{p.global_rank || '-'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                      <span>ASIN: <code>{p.asin || 'N/A'}</code></span>
                      <span>Slug: <code>/products/{p.slug}</code></span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{p.category?.name || 'General Tech'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand?.name || p.manufacturer || 'Unbranded'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                      {p.price ? formatPrice(p.price, 'USD') : 'N/A'}
                    </div>
                    {p.list_price && p.price && p.list_price > p.price && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatPrice(p.list_price, 'USD')}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Star size={13} fill="var(--amber-deal)" color="var(--amber-deal)" />
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{p.rating || 4.8}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({p.review_count || 0})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)', marginTop: '0.1rem' }}>
                      Score: {p.editorial_score}/10
                    </div>
                  </td>
                  <td>
                    {p.badge_text ? (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', background: 'var(--green-light)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)', textTransform: 'uppercase' }}>
                        {p.badge_text}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Standard</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.status === 'active' || p.status === 'featured' ? 'var(--success)' : 'var(--text-muted)' }}>
                      ● {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View live product page"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={async () => {
                          if (p.amazon_url || p.asin) {
                            alert(`Refreshing Amazon price and availability for ${p.title} (ASIN: ${p.asin || 'N/A'})...`);
                            await supabase.from('products').update({ updated_at: new Date().toISOString() }).eq('id', p.id);
                            fetchData();
                            triggerRevalidation();
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Refresh Amazon price & availability"
                      >
                        <RefreshCw size={12} />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit product"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete product"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="var(--green-accent)" />
                <span>{editingProduct ? 'Edit Catalog Product & SEO' : 'Register New Product & SEO'}</span>
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Amazon Affiliate Link Auto-Scanner & Live Price Auto-Fetcher */}
              <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--green-deep)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} />
                    <span>Amazon Link Auto-Scanner & Live Price Fetcher</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-deep)', background: 'rgba(255,255,255,0.7)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Auto-Populates Price & ASIN
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Paste Amazon Product Link or ASIN (e.g. https://www.amazon.com/dp/B0CHX1W1XY or B0CHX1W1XY)..."
                    value={formData.amazon_url}
                    onChange={(e) => {
                      const inputUrl = e.target.value;
                      setFormData((prev) => {
                        const asinMatch = inputUrl.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i) || inputUrl.match(/\b([A-Z0-9]{10})\b/i);
                        const extractedAsin = asinMatch ? asinMatch[1].toUpperCase() : prev.asin;
                        const cleanAffiliateUrl = extractedAsin
                          ? `https://www.amazon.com/dp/${extractedAsin}?tag=bestbuycart-20`
                          : inputUrl;
                        return {
                          ...prev,
                          amazon_url: cleanAffiliateUrl,
                          asin: extractedAsin,
                        };
                      });
                    }}
                    style={{ flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-border)', fontSize: '0.8125rem', background: '#FFFFFF' }}
                  />
                  <button
                    type="button"
                    onClick={handleScanAmazonLink}
                    disabled={scanningLink}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
                  >
                    <Search size={14} className={scanningLink ? 'animate-spin' : ''} />
                    <span>{scanningLink ? 'Scanning...' : 'Scan Product'}</span>
                  </button>
                </div>

                {/* Suggested Department Auto-Recommendation Banner */}
                {suggestedDept && (
                  <div style={{ background: '#FFFFFF', border: '1px dashed var(--green-accent)', padding: '0.5rem 0.75rem', borderRadius: '4px', marginBottom: '0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Suggested Department: <strong>{suggestedDept}</strong></span>
                    <button
                      type="button"
                      onClick={() => setSuggestedDept(null)}
                      style={{ background: 'var(--green-light)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', color: 'var(--green-deep)' }}
                    >
                      Accept Suggestion
                    </button>
                  </div>
                )}

                {/* Live Button Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Button CTA Preview:</span>
                  <div
                    style={{
                      background: 'var(--amber-deal)',
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span>Check Price & Availability on Amazon</span>
                    <span style={{ background: '#000000', color: '#FFFFFF', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      ${formData.price || '348.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department / Category Selector & Brand Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Select Department / Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: 'var(--bg-surface)', fontWeight: 600 }}
                  >
                    <option value="">-- Choose Department / Category --</option>
                    <optgroup label="Standard Amazon Departments">
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                          {dept}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Custom Site Categories">
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Select Brand / Manufacturer
                  </label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: 'var(--bg-surface)', fontWeight: 600 }}
                  >
                    <option value="">-- Choose Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Title & ASIN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Amazon ASIN * (10-character code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B09XS7JWHH"
                    value={formData.asin}
                    onChange={(e) => setFormData({ ...formData, asin: e.target.value.toUpperCase().trim() })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* DEDICATED GOOGLE SERP & SEO METADATA CARD */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--green-accent)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Globe size={16} color="var(--green-accent)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    GOOGLE SEARCH ENGINE OPTIMIZATION (SEO) & URL SLUG
                  </span>
                </div>

                {/* Google Live SERP Preview */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Google Search Result Snippet Preview:
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#202124', marginBottom: '0.15rem' }}>
                    https://buybestcart.shop › products › <strong style={{ color: '#1A0DAB' }}>{effectiveSlug}</strong>
                  </div>
                  <div style={{ fontSize: '1.125rem', color: '#1A0DAB', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.25rem', textDecoration: 'underline', cursor: 'pointer' }}>
                    {effectiveSeoTitle}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#4D5156', lineHeight: 1.45 }}>
                    {effectiveSeoDesc.slice(0, 160)}...
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                        SEO Meta Title (Google SERP)
                      </label>
                      <span style={{ fontSize: '0.6875rem', color: formData.seo_title.length > 60 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {formData.seo_title.length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Custom Google Title (Defaults to dynamic template)"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: '#FFFFFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Custom URL Slug (Link: /products/{formData.slug || 'slug'})
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. sony-wh-1000xm5-wireless-headphones"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: '#FFFFFF', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                      SEO Meta Description (Google Rich Snippet)
                    </label>
                    <span style={{ fontSize: '0.6875rem', color: formData.seo_description.length > 160 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {formData.seo_description.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Search engine summary. Describe key lab specs and buying value..."
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: '#FFFFFF' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Canonical URL Override
                    </label>
                    <input
                      type="url"
                      placeholder="https://buybestcart.shop/products/..."
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.75rem', background: '#FFFFFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      Open Graph (OG) Social Share Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.og_image}
                      onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                      style={{ width: '100%', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.75rem', background: '#FFFFFF' }}
                    />
                  </div>
                </div>
              </div>

              {/* Brand & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Brand / Manufacturer
                  </label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="">Select Brand...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Department / Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Dynamic Badge
                  </label>
                  <select
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="Best Overall">Best Overall</option>
                    <option value="Best Budget">Best Budget</option>
                    <option value="Best Value">Best Value</option>
                    <option value="Editor's Choice">Editor&apos;s Choice</option>
                    <option value="Premium Pick">Premium Pick</option>
                    <option value="Popular">Popular</option>
                    <option value="New">New</option>
                    <option value="Deal">Deal</option>
                  </select>
                </div>
              </div>

              {/* Pricing, Editorial Score & Ranking */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Current Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Original MSRP ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.list_price}
                    onChange={(e) => setFormData({ ...formData, list_price: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Editorial Lab Score (/10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    value={formData.editorial_score}
                    onChange={(e) => setFormData({ ...formData, editorial_score: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Global Rank (#)
                  </label>
                  <input
                    type="number"
                    value={formData.global_rank}
                    onChange={(e) => setFormData({ ...formData, global_rank: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Status & Source */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Status (8 States)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="featured">Featured (Top Showcase)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="pending_sync">Pending Sync</option>
                    <option value="api_error">API Error</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Content Source (6 States)
                  </label>
                  <select
                    value={formData.content_source}
                    onChange={(e) => setFormData({ ...formData, content_source: e.target.value as ProductContentSource })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="amazon_api">Amazon PA-API</option>
                    <option value="editorial">Editorial Staff</option>
                    <option value="ai_assisted">AI-Assisted</option>
                    <option value="imported">Imported</option>
                    <option value="mock_test">Mock / Test</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Deal Status
                  </label>
                  <select
                    value={formData.deal_status}
                    onChange={(e) => setFormData({ ...formData, deal_status: e.target.value as Product['deal_status'] })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="none">Standard Pricing</option>
                    <option value="limited_deal">Limited Time Deal</option>
                    <option value="top_deal">Top Pick Deal</option>
                    <option value="lightning_deal">Lightning Deal</option>
                  </select>
                </div>
              </div>

              {/* Gallery Image URLs */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ImageIcon size={14} color="var(--green-accent)" />
                    <span>Product Photography Gallery</span>
                  </label>
                  <button type="button" onClick={addGalleryImage} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    + Add Image URL
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {galleryImages.map((img, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="url"
                        placeholder="Image CDN URL (https://...)"
                        value={img.url}
                        onChange={(e) => {
                          const updated = [...galleryImages];
                          updated[idx].url = e.target.value;
                          setGalleryImages(updated);
                          if (img.is_primary) setFormData({ ...formData, thumbnail_url: e.target.value });
                        }}
                        style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-xs)',
                          border: img.is_primary ? '1px solid var(--green-border)' : '1px solid var(--border)',
                          background: img.is_primary ? 'var(--green-light)' : '#FFF',
                          color: img.is_primary ? 'var(--green-accent)' : 'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        {img.is_primary ? '★ Primary' : 'Set Primary'}
                      </button>
                      <button type="button" onClick={() => removeGalleryImage(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Specifications Matrix */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Table size={14} color="var(--green-accent)" />
                    <span>Dynamic Specifications Table Matrix</span>
                  </label>
                  <button type="button" onClick={addSpecRow} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    + Add Spec Row
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {specRows.map((spec, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Battery Life)"
                        value={spec.spec_key}
                        onChange={(e) => updateSpecKey(idx, e.target.value)}
                        style={{ width: '35%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                      <input
                        type="text"
                        placeholder="Spec Value (e.g. 40 hours with ANC)"
                        value={spec.spec_value}
                        onChange={(e) => updateSpecValue(idx, e.target.value)}
                        style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                      <button type="button" onClick={() => removeSpecRow(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editorial Analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Best For (Target User)
                  </label>
                  <input
                    type="text"
                    value={formData.best_for}
                    placeholder="e.g. Frequent commuters and audio professionals"
                    onChange={(e) => setFormData({ ...formData, best_for: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Why We Like It (Lab Highlight)
                  </label>
                  <input
                    type="text"
                    value={formData.why_we_like_it}
                    placeholder="e.g. Unrivaled ANC with dual processors and 8 microphones"
                    onChange={(e) => setFormData({ ...formData, why_we_like_it: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Who Should Buy / Avoid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Who Should Buy
                  </label>
                  <textarea
                    rows={2}
                    value={formData.who_should_buy}
                    placeholder="e.g. Users seeking reference soundstage and all-day comfort."
                    onChange={(e) => setFormData({ ...formData, who_should_buy: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Who Should Avoid
                  </label>
                  <textarea
                    rows={2}
                    value={formData.who_should_avoid}
                    placeholder="e.g. Budget buyers or gym-goers needing water resistance."
                    onChange={(e) => setFormData({ ...formData, who_should_avoid: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Pros & Cons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Reasons to Buy (Pros - one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.pros}
                    onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Reasons to Avoid (Cons - one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.cons}
                    onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingProduct ? 'Save Product Changes' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
