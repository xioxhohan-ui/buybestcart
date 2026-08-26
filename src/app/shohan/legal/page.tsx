'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { FileText, Save, CheckCircle2, ShieldCheck, Scale, Award, HelpCircle } from 'lucide-react';

interface LegalPolicies {
  affiliate_disclosure: string;
  privacy_policy: string;
  cookie_policy: string;
  terms_of_use: string;
  disclaimer: string;
  editorial_policy: string;
  how_we_rank: string;
  contact_info: string;
}

const DEFAULT_POLICIES: LegalPolicies = {
  affiliate_disclosure:
    'Buy Best Cart is an independent product review and shopping comparison publication. We participate in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for websites to earn advertising fees by linking to Amazon.com and affiliated international marketplaces. When you click through to Amazon and make a purchase, we may earn an affiliate commission at no additional cost to you.',
  privacy_policy:
    'At Buy Best Cart, we respect your privacy. We do not store personal credit card information or sell your personal data. We utilize analytics cookies and affiliate tracking IDs solely to measure aggregated outbound traffic and improve product testing recommendations.',
  cookie_policy:
    'Buy Best Cart uses essential cookies to remember your preferred Amazon marketplace region and anonymous analytics cookies to track referral traffic. You can adjust your browser cookie settings at any time.',
  terms_of_use:
    'By accessing Buy Best Cart, you agree that product pricing, specifications, and availability are subject to change without notice on official merchant websites. Buy Best Cart does not sell products directly and is not responsible for order fulfillment on external merchant sites.',
  disclaimer:
    'Prices, promotions, and availability on Amazon are subject to change without notice. While we strive to maintain accurate live price tracking, please confirm the final price on the merchant storefront prior to completing purchase.',
  editorial_policy:
    'Our editorial independence is sacred. We do not accept paid product placements, sponsored favorable reviews, or affiliate kickbacks that influence test scores. Every recommendation is backed by real-world testing.',
  how_we_rank:
    'Rankings (#1 Top Pick, #2 Runner-Up, Best Budget) are determined through an objective weighted matrix combining laboratory test benchmarks, verified customer review sentiment, and long-term durability assessments.',
  contact_info:
    'For editorial inquiries, testing corrections, or partner relationships, contact our staff at editorial@buybestcart.shop or by mail at Buy Best Cart Media Inc.',
};

export default function AdminLegalPagesCMS() {
  const [policies, setPolicies] = useState<LegalPolicies>(DEFAULT_POLICIES);
  const [activeTab, setActiveTab] = useState<keyof LegalPolicies>('affiliate_disclosure');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'legal_policies')
      .maybeSingle();

    if (data && data.value) {
      setPolicies({ ...DEFAULT_POLICIES, ...data.value });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const { error } = await supabase.from('settings').upsert({
      key: 'legal_policies',
      category: 'legal',
      value: policies,
      description: 'Legal policies, disclosures, and editorial ranking methodology copy',
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      setSaved(true);
      triggerRevalidation();
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(`Error saving legal policies: ${error.message}`);
    }
    setSaving(false);
  };

  const tabs: Array<{ key: keyof LegalPolicies; label: string }> = [
    { key: 'affiliate_disclosure', label: 'Amazon Affiliate Disclosure' },
    { key: 'privacy_policy', label: 'Privacy Policy' },
    { key: 'cookie_policy', label: 'Cookie Policy' },
    { key: 'terms_of_use', label: 'Terms of Use' },
    { key: 'disclaimer', label: 'General Disclaimer' },
    { key: 'editorial_policy', label: 'Editorial Policy' },
    { key: 'how_we_rank', label: 'How We Rank Methodology' },
    { key: 'contact_info', label: 'Contact Info' },
  ];

  return (
    <div style={{ maxWidth: '920px' }}>
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
            <FileText size={22} color="var(--green-accent)" />
            <span>Legal Documents & Policy CMS (8 Documents)</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage Amazon affiliate disclosures, FTC statements, privacy policies, terms, and testing methodology copy.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Save size={13} />
          <span>{saving ? 'Saving...' : 'Save All Legal Policies'}</span>
        </button>
      </div>

      {saved && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>Legal policies and FTC statements updated successfully in Supabase database.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8125rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              borderRadius: 'var(--radius-xs)',
              border: activeTab === tab.key ? '1px solid var(--green-border)' : '1px solid transparent',
              background: activeTab === tab.key ? 'var(--green-light)' : 'transparent',
              color: activeTab === tab.key ? 'var(--green-accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor Body */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
          {tabs.find((t) => t.key === activeTab)?.label}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          This copy renders dynamically on public legal routes and FTC product card callouts without code modifications.
        </p>

        <textarea
          rows={12}
          value={policies[activeTab] || ''}
          onChange={(e) => setPolicies({ ...policies, [activeTab]: e.target.value })}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-strong)',
            fontSize: '0.875rem',
            lineHeight: 1.65,
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : `Save ${tabs.find((t) => t.key === activeTab)?.label}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
