'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Users, Plus, Shield, CheckCircle2, UserCheck, Trash2, X, RefreshCw } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const DEFAULT_TEAM: AdminUser[] = [
  {
    id: 'u-1',
    email: 'shohan@buybestcart.shop',
    full_name: 'Shohan (Master Admin)',
    role: 'Super Administrator',
    is_active: true,
    created_at: '2026-08-01',
  },
  {
    id: 'u-2',
    email: 'editorial@buybestcart.shop',
    full_name: 'Lead Audio & Tech Editor',
    role: 'Senior Reviewer',
    is_active: true,
    created_at: '2026-08-10',
  },
  {
    id: 'u-3',
    email: 'deals@buybestcart.shop',
    full_name: 'Deals & Affiliate Manager',
    role: 'Affiliate Specialist',
    is_active: true,
    created_at: '2026-08-15',
  },
];

export default function AdminUsersPage() {
  const [team, setTeam] = useState<AdminUser[]>(DEFAULT_TEAM);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'Editor',
  });

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_team')
        .single();

      if (data && Array.isArray(data.value) && data.value.length > 0) {
        setTeam(data.value);
      } else {
        setTeam(DEFAULT_TEAM);
      }
    } catch (err) {
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const saveTeamToDb = async (updatedTeam: AdminUser[]) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'admin_team',
        category: 'security',
        value: updatedTeam,
        description: 'Admin team members and role authorization list',
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setTeam(updatedTeam);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating team';
      alert(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    const newUser: AdminUser = {
      id: `u-${Date.now()}`,
      email: formData.email.trim().toLowerCase(),
      full_name: formData.full_name.trim() || 'Staff Editor',
      role: formData.role,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
    };

    const updated = [...team, newUser];
    await saveTeamToDb(updated);
    setShowModal(false);
    setFormData({ email: '', full_name: '', role: 'Editor' });
  };

  const handleToggleStatus = async (id: string) => {
    const updated = team.map((u) => (u.id === id ? { ...u, is_active: !u.is_active } : u));
    await saveTeamToDb(updated);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from authorized team members?`)) return;
    const updated = team.filter((u) => u.id !== id);
    await saveTeamToDb(updated);
  };

  return (
    <div>
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
            <Users size={22} color="var(--green-accent)" />
            <span>Admin Users & Access Control</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage editorial staff, affiliate managers, and master admin privileges for <code>/shohan</code>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchTeam} className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
            <Plus size={14} />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table className="editorial-table">
          <thead>
            <tr>
              <th>Member Name & Email</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {u.full_name || 'Admin User'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {u.email}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.55rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: u.is_active ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>{u.is_active ? 'Active' : 'Disabled'}</span>
                  </button>
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {u.created_at}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {u.id !== 'u-1' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.4rem', color: 'var(--error)' }}
                      title="Remove Member"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Invite New Team Member</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@buybestcart.shop"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Role & Permissions
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.875rem', background: 'var(--bg-main)' }}
                >
                  <option value="Super Administrator">Super Administrator (Full Access)</option>
                  <option value="Senior Reviewer">Senior Reviewer (Editorial & Reviews)</option>
                  <option value="Affiliate Specialist">Affiliate Specialist (Deals & Links)</option>
                  <option value="Editor">Staff Editor (Articles & Guides)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Adding...' : 'Save & Authorize Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
