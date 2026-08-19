import React from 'react';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const supabase = createServerClient();

  const [clicksRes, searchRes] = await Promise.all([
    supabase.from('affiliate_clicks').select('*').order('created_at', { ascending: false }).limit(30),
    supabase.from('search_logs').select('*').order('created_at', { ascending: false }).limit(30),
  ]);

  const clicks = clicksRes.data || [];
  const searchLogs = searchRes.data || [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>System & Audit Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Real-time system events, search requests, and outbound affiliate routing transactions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Outbound Transaction Log */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Amazon Redirect Transactions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {clicks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No redirect events recorded yet.</div>
            ) : (
              clicks.map((c: { id: string; asin?: string; country?: string; cta_type?: string; created_at: string }) => (
                <div key={c.id} style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>[302 REDIRECT]</span> {c.country} • ASIN: {c.asin || 'NONE'} • CTA: {c.cta_type}
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(c.created_at).toISOString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Search Query Log */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Real-Time Search Inquiries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {searchLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No search queries logged yet.</div>
            ) : (
              searchLogs.map((s: { id: string; query: string; results_count: number; created_at: string }) => (
                <div key={s.id} style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>[SEARCH]</span> &ldquo;{s.query}&rdquo; → {s.results_count} results
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(s.created_at).toISOString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
