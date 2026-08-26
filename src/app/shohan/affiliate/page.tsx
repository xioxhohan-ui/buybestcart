'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Link2, Save, CheckCircle2, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminAffiliateEnginePage() {
  const [partnerTagUS, setPartnerTagUS] = useState('bestbuycart-20');
  const [partnerTagUK, setPartnerTagUK] = useState('bestbuycartuk-21');
  const [partnerTagCA, setPartnerTagCA] = useState('bestbuycartca-20');
  const [partnerTagDE, setPartnerTagDE] = useState('bestbuycartde-21');
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [disclosurePrefix, setDisclosurePrefix] = useState('Prices & availability live on Amazon as of checking.');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'affiliate_engine')
        .maybeSingle();

      if (data && data.value) {
        if (data.value.partnerTagUS) setPartnerTagUS(data.value.partnerTagUS);
        if (data.value.partnerTagUK) setPartnerTagUK(data.value.partnerTagUK);
        if (data.value.partnerTagCA) setPartnerTagCA(data.value.partnerTagCA);
        if (data.value.partnerTagDE) setPartnerTagDE(data.value.partnerTagDE);
        if (data.value.disclosurePrefix) setDisclosurePrefix(data.value.disclosurePrefix);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.from('settings').upsert({
      key: 'affiliate_engine',
      category: 'affiliate',
      value: {
        partnerTagUS,
        partnerTagUK,
        partnerTagCA,
        partnerTagDE,
        autoRedirect,
        disclosurePrefix,
      },
      description: 'Affiliate Engine Partner Tags & Geo-Targeting Rules',
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      await fetch('/api/revalidate', { method: 'POST' }).catch(() => {});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(`Error saving affiliate settings: ${error.message}`);
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: '840px' }}>
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
            <Link2 size={22} color="var(--green-accent)" />
            <span>Amazon Affiliate Engine & Partner Configuration</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Configure default Amazon Associates tags, tracking IDs, and geo-targeted redirect rules.
          </p>
        </div>

        <Link href="/shohan/amazon" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Globe size={13} />
          <span>All 11 Marketplaces Panel →</span>
        </Link>
      </div>

      {saved && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>Affiliate engine settings saved successfully to Supabase database.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Core Partner Tags */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Primary Amazon Associates Partner Tags</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                United States Partner Tag (amazon.com)
              </label>
              <input
                type="text"
                required
                value={partnerTagUS}
                onChange={(e) => setPartnerTagUS(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                United Kingdom Partner Tag (amazon.co.uk)
              </label>
              <input
                type="text"
                required
                value={partnerTagUK}
                onChange={(e) => setPartnerTagUK(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Canada Partner Tag (amazon.ca)
              </label>
              <input
                type="text"
                required
                value={partnerTagCA}
                onChange={(e) => setPartnerTagCA(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Germany & EU Partner Tag (amazon.de)
              </label>
              <input
                type="text"
                required
                value={partnerTagDE}
                onChange={(e) => setPartnerTagDE(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>
        </div>

        {/* Global Behavior */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Affiliate Link Behavior & CTA Rules</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Button Pricing Tooltip Prefix
              </label>
              <input
                type="text"
                value={disclosurePrefix}
                onChange={(e) => setDisclosurePrefix(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="auto_redirect"
                checked={autoRedirect}
                onChange={(e) => setAutoRedirect(e.target.checked)}
              />
              <label htmlFor="auto_redirect" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                Enable automatic geo-targeted regional redirect (/api/affiliate-redirect?asin=...)
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
          style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Save size={14} />
          <span>{saving ? 'Saving...' : 'Save Affiliate Engine Configuration'}</span>
        </button>
      </form>
    </div>
  );
}
