'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Product } from '@/types';
import { buildAmazonAffiliateUrl, MARKETPLACES } from '@/lib/affiliate';

export default function AdminAffiliateLinksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [customTag, setCustomTag] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('products').select('*').order('title', { ascending: true });
      if (data && data.length > 0) {
        setProducts(data as Product[]);
        setSelectedProduct(data[0].id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return;

    const url = buildAmazonAffiliateUrl({
      asin: prod.asin,
      countryCode: selectedCountry,
      customTag: customTag.trim() || undefined,
    });
    setGeneratedUrl(url);
  }, [selectedProduct, selectedCountry, customTag, products]);

  return (
    <div style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Affiliate Link Generator & Health Validator</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Test and verify Amazon affiliate URLs with live marketplace partner tags and ASIN routing.
        </p>
      </div>

      {/* Generator Tool Box */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Affiliate Link Builder</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Select Product *
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)', background: 'var(--bg-main)' }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (ASIN: {p.asin || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Target Amazon Marketplace *
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)', background: 'var(--bg-main)' }}
              >
                {Object.entries(MARKETPLACES).map(([code, mkt]) => (
                  <option key={code} value={code}>
                    {mkt.flag_emoji} {mkt.country} ({mkt.domain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                Optional Custom Partner Tag Override
              </label>
              <input
                type="text"
                placeholder="Leave blank to use default tag"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>

          {/* Generated Result Output */}
          <div style={{ marginTop: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Generated Amazon Destination URL:
            </div>
            <div style={{ wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>
              {generatedUrl}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                Test Outbound Click ↗
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedUrl);
                  alert('Copied affiliate URL to clipboard!');
                }}
                className="btn btn-secondary btn-sm"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
