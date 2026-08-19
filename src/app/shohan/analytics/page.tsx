import React from 'react';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const supabase = createServerClient();

  const [clicksRes, searchLogsRes, productsRes] = await Promise.all([
    supabase.from('affiliate_clicks').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('search_logs').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('products').select('id, title, asin, views_count, clicks_count').order('clicks_count', { ascending: false }),
  ]);

  const clicks = clicksRes.data || [];
  const searchLogs = searchLogsRes.data || [];
  const products = productsRes.data || [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Affiliate Click Analytics & Demand Tracking</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          First-party outbound Amazon referral click tracking, conversion signals, and search demand.
        </p>
      </div>

      {/* Grid: Outbound Clicks vs Search Queries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.4fr) minmax(300px, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Outbound Clicks Feed */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Latest Outbound Amazon Clicks</h2>
          <table className="editorial-table">
            <thead>
              <tr>
                <th>ASIN / Item</th>
                <th>Region</th>
                <th>CTA Type</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {clicks.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No clicks recorded yet.</td></tr>
              ) : (
                clicks.map((c: { id: string; asin?: string; country?: string; cta_type?: string; created_at: string }) => (
                  <tr key={c.id}>
                    <td><code>{c.asin || 'Direct Link'}</code></td>
                    <td><strong>{c.country || 'US'}</strong></td>
                    <td><span style={{ fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>{c.cta_type || 'view_price'}</span></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Search Demand Logs */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>User Search Demand Log</h2>
          <table className="editorial-table">
            <thead>
              <tr>
                <th>Search Query</th>
                <th>Results Found</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {searchLogs.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No search logs yet.</td></tr>
              ) : (
                searchLogs.map((s: { id: string; query: string; results_count: number; created_at: string }) => (
                  <tr key={s.id}>
                    <td><strong>&ldquo;{s.query}&rdquo;</strong></td>
                    <td>{s.results_count} products</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
