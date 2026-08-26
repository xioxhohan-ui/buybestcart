'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  X,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching messages:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'unread' | 'read' | 'replied' | 'archived') => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );

      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      setNotification(`Message marked as ${newStatus}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Failed to update message: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;

      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);

      setNotification('Message deleted successfully');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const filtered = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Mail size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Contact Inquiries & Reader Messages</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage editorial inquiries, feedback, and reader messages submitted through the public contact form.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchMessages}
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

      {/* Stat Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Inquiries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{messages.length}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-deal)', textTransform: 'uppercase' }}>Unread / Action Required</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-deal)', marginTop: '0.25rem' }}>{unreadCount}</div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)', textTransform: 'uppercase' }}>Replied & Archived</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-accent)', marginTop: '0.25rem' }}>
            {messages.filter((m) => m.status === 'replied' || m.status === 'archived').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by sender, email, subject or message text..."
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
          <option value="unread">Unread ({unreadCount})</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table Layout */}
      <div className="admin-table-wrapper">
        <table className="editorial-table" style={{ width: '100%', minWidth: '680px' }}>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Status</th>
              <th>Sender</th>
              <th>Subject</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading messages...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  <MessageSquare size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No messages found</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Reader inquiries from /contact will automatically populate here.</div>
                </td>
              </tr>
            ) : (
              filtered.map((msg) => (
                <tr key={msg.id} style={{ background: msg.status === 'unread' ? '#FEFCE8' : undefined }}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background:
                          msg.status === 'unread'
                            ? '#FEF3C7'
                            : msg.status === 'replied'
                            ? '#DCFCE7'
                            : msg.status === 'archived'
                            ? '#F5F5F4'
                            : '#F1F5F9',
                        color:
                          msg.status === 'unread'
                            ? '#B45309'
                            : msg.status === 'replied'
                            ? '#15803D'
                            : msg.status === 'archived'
                            ? '#78716C'
                            : '#475569',
                      }}
                    >
                      {msg.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: msg.status === 'unread' ? 800 : 600, fontSize: '0.875rem' }}>
                      {msg.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {msg.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: msg.status === 'unread' ? 800 : 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                      {msg.subject}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                      {msg.message}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (msg.status === 'unread') handleUpdateStatus(msg.id, 'read');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        title="View Full Message"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Message"
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

      {/* Message Modal Preview */}
      {selectedMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', maxWidth: '640px', width: '100%', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Inquiry Details</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Received on {new Date(selectedMessage.created_at).toLocaleString()}</span>
              </div>
              <button onClick={() => setSelectedMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sender</label>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginTop: '0.15rem' }}>{selectedMessage.name}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
                  <div style={{ fontSize: '0.875rem', marginTop: '0.15rem' }}>
                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`} style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>{selectedMessage.email}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subject</label>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{selectedMessage.subject}</div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Message Body</label>
                <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
                  {selectedMessage.message}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                    className="btn btn-primary btn-sm"
                  >
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                    className="btn btn-secondary btn-sm"
                  >
                    Archive
                  </button>
                </div>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Mail size={13} />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
