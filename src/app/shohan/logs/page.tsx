import React from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { Mail, ArrowUpRight, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  const supabase = createServerClient();

  const [contactRes, clicksRes, searchRes] = await Promise.all([
    supabase
      .from('system_logs')
      .select('*')
      .eq('category', 'contact_message')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase.from('affiliate_clicks').select('*').order('created_at', { ascending: false }).limit(30),
    supabase.from('search_logs').select('*').order('created_at', { ascending: false }).limit(30),
  ]);

  const contactLogs = contactRes.data || [];
  const clicks = clicksRes.data || [];
  const searchLogs = searchRes.data || [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>System & Audit Logs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Real-time editorial contact messages, search queries, and outbound affiliate routing transactions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Real-Time Contact Messages */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Mail size={18} color="var(--green-accent)" />
            <h2 style={{ fontSize: '1.125rem' }}>Editorial Contact Messages</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '500px', overflowY: 'auto', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem' }}>
            {contactLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                No contact messages received yet.
              </div>
            ) : (
              contactLogs.map((item: { id: string; message: string; metadata?: { name?: string; email?: string; subject?: string; message?: string }; created_at: string }) => {
                const meta = item.metadata || {};
                return (
                  <div key={item.id} style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{meta.name || 'Anonymous'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{meta.email}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green-accent)', marginBottom: '0.25rem' }}>
                      Subject: {meta.subject || 'General'}
                    </div>
                    <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0.25rem 0' }}>
                      &ldquo;{meta.message || item.message}&rdquo;
                    </p>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Outbound Transaction Log */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowUpRight size={18} color="var(--amber-deal)" />
            <h2 style={{ fontSize: '1.125rem' }}>Amazon Redirect Transactions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {clicks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                No redirect events recorded yet.
              </div>
            ) : (
              clicks.map((c: { id: string; asin?: string; country?: string; cta_type?: string; created_at: string }) => (
                <div key={c.id} style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>[302 REDIRECT]</span> {c.country} • ASIN: {c.asin || 'NONE'} • CTA: {c.cta_type}
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Search Query Log */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Search size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.125rem' }}>Real-Time Search Inquiries</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {searchLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                No search queries logged yet.
              </div>
            ) : (
              searchLogs.map((s: { id: string; query: string; results_count: number; created_at: string }) => (
                <div key={s.id} style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>[SEARCH]</span> &ldquo;{s.query}&rdquo; → {s.results_count} results
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(s.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
