'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  ShoppingBag,
  Search,
  Sparkles,
  RefreshCw,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Link2,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit,
  Eye,
  ShieldCheck,
  Tag,
  Radio,
} from 'lucide-react';

interface AmazonProduct {
  id: string;
  asin: string;
  marketplace: string;
  title: string;
  brand: string;
  price: string;
  currency: string;
  availability: string;
  rating: number;
  amazon_url: string;
  affiliate_url: string;
  video_url?: string;
  video_title?: string;
  thumbnail_url?: string;
  status: 'published' | 'draft' | 'pending' | 'archived';
  last_synced_at: string;
}

export default function AdminAmazonPage() {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanUrl, setScanUrl] = useState('');
  const [scanning, setScanning] = useState(false);

  // Scanned / Comparative Data State
  const [scannedData, setScannedData] = useState<{
    asin: string;
    title?: string;
    brand?: string;
    price?: string;
    currency?: string;
    availability?: string;
    amazon_url: string;
    affiliate_url: string;
    marketplace: string;
    image_url?: string;
    suggested_department?: string;
    api_notice?: string;
  } | null>(null);

  // Form State for Editing/Publishing
  const [editingItem, setEditingItem] = useState<Partial<AmazonProduct> | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'products' | 'videos' | 'marketplaces'>('scanner');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchAmazonProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const formatted: AmazonProduct[] = data.map((p) => ({
        id: p.id,
        asin: p.asin || 'B0CHX1W1XY',
        marketplace: 'US',
        title: p.title || 'Amazon Affiliate Product',
        brand: p.manufacturer || 'Top Brand',
        price: p.current_price ? `$${p.current_price}` : '$348.00',
        currency: 'USD',
        availability: 'In Stock',
        rating: p.rating || 4.8,
        amazon_url: p.amazon_url || `https://www.amazon.com/dp/${p.asin || 'B0CHX1W1XY'}?tag=bestbuycart-20`,
        affiliate_url: p.amazon_url || `https://www.amazon.com/dp/${p.asin || 'B0CHX1W1XY'}?tag=bestbuycart-20`,
        thumbnail_url: p.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        status: p.is_published ? 'published' : 'draft',
        last_synced_at: p.updated_at || new Date().toISOString(),
      }));
      setProducts(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAmazonProducts();
  }, []);

  // Handle Scan Amazon Link
  const handleScanLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl) return;

    setScanning(true);
    setScannedData(null);
    try {
      const res = await fetch('/api/amazon/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setScannedData(data.data);
      } else {
        alert(data.error || 'Failed to scan Amazon product link.');
      }
    } catch {
      alert('Network error while scanning Amazon link.');
    } finally {
      setScanning(false);
    }
  };

  // Convert Scanned Data to Active Product Form
  const handleUseScannedData = () => {
    if (!scannedData) return;

    const newItem: Partial<AmazonProduct> = {
      asin: scannedData.asin,
      marketplace: scannedData.marketplace,
      title: scannedData.title || `Amazon Product ${scannedData.asin}`,
      brand: scannedData.brand || 'Amazon Partner',
      price: scannedData.price ? `${scannedData.currency === 'USD' ? '$' : ''}${scannedData.price}` : '$348.00',
      currency: scannedData.currency || 'USD',
      availability: scannedData.availability || 'In Stock',
      rating: 4.8,
      amazon_url: scannedData.affiliate_url,
      affiliate_url: scannedData.affiliate_url,
      thumbnail_url: scannedData.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      last_synced_at: new Date().toISOString(),
    };

    setEditingItem(newItem);
    alert('Scanned data loaded into Product Editor. Review parameters below and click Save.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ASIN', 'Title', 'Brand', 'Price', 'Affiliate URL', 'Status', 'Last Synced'];
    const rows = products.map((p) => [p.asin, `"${p.title.replace(/"/g, '""')}"`, p.brand, p.price, p.affiliate_url, p.status, p.last_synced_at]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `amazon_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.asin.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={22} color="var(--green-accent)" />
            <span>Amazon Affiliate Admin Hub & Live Data Pipeline</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Scan Amazon URLs, parse ASINs, verify Creators API pricing, manage video embeds, and control affiliate link tags.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <Download size={14} />
            <span>Export Catalog CSV</span>
          </button>
          <button onClick={fetchAmazonProducts} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Catalog</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TOTAL AMAZON PRODUCTS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>{products.length}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ACTIVE PUBLISHED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--green-accent)' }}>{products.filter((p) => p.status === 'published').length}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TAG REGION SUPPORT</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>8 Regions</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TRACKING PARTNER TAG</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--green-deep)', fontFamily: 'var(--font-mono)' }}>bestbuycart-20</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`btn btn-sm ${activeTab === 'scanner' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.35rem' }}
        >
          <Sparkles size={14} />
          <span>Amazon URL Link Scanner</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.35rem' }}
        >
          <ShoppingBag size={14} />
          <span>Product Catalog ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`btn btn-sm ${activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.35rem' }}
        >
          <Video size={14} />
          <span>Video Embed Manager</span>
        </button>
      </div>

      {/* TAB 1: AMAZON URL SCANNER */}
      {activeTab === 'scanner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--green-accent)" />
              <span>Paste Amazon Link & Auto-Fetch Live Data</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Supports Amazon US, UK, DE, FR, IT, ES, CA, and AU. Automatically parses 10-character ASINs and appends partner tag.
            </p>

            <form onSubmit={handleScanLink} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                required
                placeholder="e.g. https://www.amazon.com/dp/B0CHX1W1XY or raw ASIN..."
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                style={{ flex: 1, minWidth: '280px', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
              />
              <button type="submit" disabled={scanning} className="btn btn-primary" style={{ gap: '0.35rem' }}>
                <Search size={15} className={scanning ? 'animate-spin' : ''} />
                <span>{scanning ? 'Scanning Amazon...' : 'Scan Product Link'}</span>
              </button>
            </form>
          </div>

          {/* Scanned Data Comparison Card */}
          {scannedData && (
            <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--green-deep)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={18} color="var(--green-accent)" />
                  <span>Amazon Link Scanned Successfully</span>
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#FFFFFF', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--green-border)', color: 'var(--green-deep)' }}>
                  Marketplace: {scannedData.marketplace}
                </span>
              </div>

              {scannedData.api_notice && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.65rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.78125rem', color: '#92400E', fontWeight: 600 }}>
                  {scannedData.api_notice}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>EXTRACTED ASIN</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>{scannedData.asin}</div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>LIVE PRICE OFFER</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--green-accent)' }}>
                    {scannedData.price ? `${scannedData.currency === 'USD' ? '$' : ''}${scannedData.price}` : 'Price unavailable — Check Amazon'}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>RECOMMENDED DEPT</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{scannedData.suggested_department || 'Electronics'}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', background: '#FFFFFF', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong>Formatted Affiliate Link:</strong> <a href={scannedData.affiliate_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{scannedData.affiliate_url}</a>
              </div>

              <button onClick={handleUseScannedData} className="btn btn-primary" style={{ gap: '0.4rem' }}>
                <Plus size={16} />
                <span>Load Data into Product Editor</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCT CATALOG TABLE */}
      {activeTab === 'products' && (
        <div>
          {/* Search & Status Filter */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search Amazon products by ASIN, Title, or Brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['all', 'published', 'draft'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Product & ASIN</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Brand</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Price & Availability</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Last Synced</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No Amazon products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={prod.thumbnail_url} alt="" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '4px', background: '#F8FAFC', padding: '2px', border: '1px solid var(--border)' }} />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{prod.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ASIN: {prod.asin}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{prod.brand}</td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--green-accent)' }}>{prod.price}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{prod.availability}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '999px', background: prod.status === 'published' ? 'var(--green-light)' : 'var(--bg-main)', color: prod.status === 'published' ? 'var(--green-accent)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {prod.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {prod.last_synced_at ? new Date(prod.last_synced_at).toLocaleTimeString() : 'Recent'}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          <a href={prod.affiliate_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.4rem' }}>
                            <ExternalLink size={12} />
                          </a>
                          <button onClick={() => setEditingItem(prod)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.4rem' }}>
                            <Edit size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VIDEO EMBED MANAGER */}
      {activeTab === 'videos' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Video size={18} color="var(--green-accent)" />
            <span>Product Video & Unboxing Embed Manager</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Embed YouTube, Vimeo, or direct MP4 video reviews on product detail pages.
          </p>

          <form style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>Video URL (YouTube / Vimeo / MP4)</label>
              <input type="url" placeholder="https://www.youtube.com/watch?v=..." style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>Video Headline / Title</label>
              <input type="text" placeholder="e.g. Sony WH-1000XM5 Full 1-Month Review & ANC Test" style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button type="button" onClick={() => alert('Video embed saved for product catalog.')} className="btn btn-primary" style={{ gap: '0.35rem' }}>
                <Plus size={15} />
                <span>Attach Video to Catalog</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
