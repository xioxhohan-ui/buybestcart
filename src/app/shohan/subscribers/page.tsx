'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Trash2,
  CheckCircle,
  RefreshCw,
  Download,
  Mail,
  UserCheck,
  UserX,
  Globe,
  Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source?: string;
  region?: string;
  subscribed_at: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching subscribers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;

      setSubscribers((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status: nextStatus as 'active' | 'unsubscribed' } : sub))
      );

      setNotification(`Subscriber status updated to ${nextStatus}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Failed to update subscriber: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
      if (error) throw error;

      setSubscribers((prev) => prev.filter((sub) => sub.id !== id));
      setNotification('Subscriber removed successfully');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Failed to delete subscriber: ${error.message}`);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export');
      return;
    }

    const headers = ['Email', 'Status', 'Region', 'Source', 'Subscribed At'];
    const rows = filtered.map((s) => [
      s.email,
      s.status,
      s.region || 'US',
      s.source || 'default',
      new Date(s.subscribed_at).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `buybestcart-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const regions = Array.from(new Set(subscribers.map((s) => s.region).filter(Boolean)));

  const filtered = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || sub.region === regionFilter;
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const activeCount = subscribers.filter((s) => s.status === 'active').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Users size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Newsletter Audience & Subscribers</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage newsletter subscribers, lead captures, region demographics, and export mailing lists.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Leads</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{subscribers.length}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase' }}>Active Subscribers</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-accent)', marginTop: '0.25rem' }}>{activeCount}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-deal)', textTransform: 'uppercase' }}>Unsubscribed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-deal)', marginTop: '0.25rem' }}>
            {subscribers.filter((s) => s.status === 'unsubscribed').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by subscriber email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active ({activeCount})</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>

        {regions.length > 0 && (
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <option value="all">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table Layout */}
      <div className="admin-table-wrapper">
        <table className="editorial-table" style={{ width: '100%', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Status</th>
              <th>Email Address</th>
              <th>Region</th>
              <th>Acquisition Source</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading subscriber list...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Mail size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No subscribers found</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Newsletter signups from the footer and homepage will automatically appear here.</div>
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: sub.status === 'active' ? '#DCFCE7' : '#F5F5F4',
                        color: sub.status === 'active' ? '#15803D' : '#78716C',
                      }}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {sub.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <Globe size={12} color="var(--text-muted)" />
                      <span>{sub.region || 'US'}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem', background: '#F5F5F4', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                      {sub.source || 'homepage_box'}
                    </code>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(sub.subscribed_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleStatus(sub.id, sub.status)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        title={sub.status === 'active' ? 'Mark as Unsubscribed' : 'Mark as Active'}
                      >
                        {sub.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
                        <span>{sub.status === 'active' ? 'Unsubscribe' : 'Reactivate'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Subscriber"
                      >
                        <Trash2 size={13} />
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
  );
}
