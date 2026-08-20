'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Mail, ArrowUpRight, Search, RefreshCw, Reply, CheckCircle2, Clock } from 'lucide-react';

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  created_at: string;
}

interface ClickLogItem {
  id: string;
  asin?: string;
  country?: string;
  cta_type?: string;
  created_at: string;
}

interface SearchLogItem {
  id: string;
  query: string;
  results_count: number;
  created_at: string;
}

export default function AdminLogsPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [clicks, setClicks] = useState<ClickLogItem[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchRealtimeLogs = async () => {
    try {
      const fetchSafe = async (queryPromise: PromiseLike<{ data: unknown }>) => {
        try {
          return await queryPromise;
        } catch {
          return { data: null };
        }
      };

      const [messagesRes, systemLogsRes, clicksRes, searchRes] = await Promise.all([
        fetchSafe(supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(30)),
        fetchSafe(supabase.from('system_logs').select('*').eq('category', 'contact_message').order('created_at', { ascending: false }).limit(30)),
        fetchSafe(supabase.from('affiliate_clicks').select('*').order('created_at', { ascending: false }).limit(30)),
        fetchSafe(supabase.from('search_logs').select('*').order('created_at', { ascending: false }).limit(30)),
      ]);

      const formattedMessages: ContactMessageItem[] = [];

      // 1. Process messages table rows
      if (messagesRes.data && Array.isArray(messagesRes.data)) {
        messagesRes.data.forEach((m) => {
          formattedMessages.push({
            id: m.id,
            name: m.name || 'Anonymous',
            email: m.email || 'No email provided',
            subject: m.subject || 'General Inquiry',
            message: m.message || '',
            status: m.status || 'unread',
            created_at: m.created_at,
          });
        });
      }

      // 2. Fallback to system_logs if messages table is empty
      if (formattedMessages.length === 0 && systemLogsRes.data && Array.isArray(systemLogsRes.data)) {
        systemLogsRes.data.forEach((log) => {
          const meta = log.metadata || {};
          formattedMessages.push({
            id: log.id,
            name: meta.name || 'Anonymous User',
            email: meta.email || 'editorial@buybestcart.shop',
            subject: meta.subject || 'Editorial Correction',
            message: meta.message || log.message || '',
            status: 'new',
            created_at: log.created_at,
          });
        });
      }

      setMessages(formattedMessages);
      setClicks(clicksRes.data || []);
      setSearchLogs(searchRes.data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching real-time logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeLogs();

    // Auto Refresh every 5 seconds for Real-Time Live Feed
    const interval = setInterval(() => {
      fetchRealtimeLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={22} color="var(--green-accent)" />
            <span>Real-Time Audit & Contact Logs</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Live stream of public editorial contact messages, search queries, and outbound Amazon affiliate transactions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Auto-refreshing (Last: {lastRefreshed.toLocaleTimeString()})
          </span>
          <button
            onClick={fetchRealtimeLogs}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', gap: '0.35rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Grid of 3 Log Feeds */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Real-Time Contact Messages */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} color="var(--green-accent)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Editorial Contact Messages</h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'var(--green-light)', color: 'var(--green-deep)' }}>
              {messages.length} Live
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <Mail size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
                <div>No contact messages received yet.</div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Submit a test form on /contact to see messages appear here live!</div>
              </div>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.875rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-strong)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.name}</span>
                    <a
                      href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject)}`}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--green-accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        textDecoration: 'underline',
                      }}
                    >
                      <Reply size={12} />
                      <span>Reply</span>
                    </a>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Email: {item.email}
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)', background: 'var(--green-light)', padding: '0.25rem 0.5rem', borderRadius: '4px', alignSelf: 'flex-start' }}>
                    Subject: {item.subject}
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45, background: 'var(--bg-surface)', padding: '0.5rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    &ldquo;{item.message}&rdquo;
                  </p>

                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Outbound Transaction Log */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpRight size={18} color="var(--amber-deal)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Amazon Redirect Transactions</h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'var(--amber-light)', color: 'var(--amber-deal)' }}>
              {clicks.length} Clicks
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '520px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {clicks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                No redirect events recorded yet.
              </div>
            ) : (
              clicks.map((c) => (
                <div key={c.id} style={{ padding: '0.625rem', background: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>[302 REDIRECT]</span>
                    <span style={{ fontWeight: 700 }}>{c.country || 'US'}</span>
                  </div>
                  <div>ASIN: {c.asin || 'GENERAL'} • CTA: {c.cta_type || 'Buy on Amazon'}</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.6875rem' }}>{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Search Query Log */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Real-Time Search Inquiries</h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}>
              {searchLogs.length} Queries
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '520px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {searchLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                No search queries logged yet.
              </div>
            ) : (
              searchLogs.map((s) => (
                <div key={s.id} style={{ padding: '0.625rem', background: 'var(--bg-main)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>[SEARCH QUERY]</span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>{s.results_count} results</span>
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>&ldquo;{s.query}&rdquo;</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.6875rem' }}>{new Date(s.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
