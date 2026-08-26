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

const DEFAULT_TEAM: AdminUser[] = [];

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
        .maybeSingle();

      if (data && Array.isArray(data.value)) {
        setTeam(data.value);
      } else {
        setTeam([]);
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

  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const localToken = typeof window !== 'undefined' ? localStorage.getItem('bbc_admin_auth') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (localToken) {
        headers['Authorization'] = `Bearer ${localToken}`;
      }

      const res = await fetch('/api/admin/auth', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordMsg({ type: 'success', text: 'Master Administrator password updated successfully!' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating password';
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setUpdatingPassword(false);
    }
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
            Manage editorial staff, affiliate managers, and administrator credentials for the platform.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={fetchTeam}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={14} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Master Admin Password Update Section */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Shield size={18} color="var(--green-accent)" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Master Admin Password Management</h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          You can change the admin login password anytime right here or by setting <code style={{ background: 'var(--bg-subtle)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>ADMIN_PASSWORD</code> in your <code style={{ background: 'var(--bg-subtle)', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>.env.local</code> file.
        </p>

        {passwordMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: passwordMsg.type === 'success' ? 'var(--green-light)' : 'rgba(239, 68, 68, 0.1)',
              color: passwordMsg.type === 'success' ? 'var(--green-accent)' : '#EF4444',
              border: `1px solid ${passwordMsg.type === 'success' ? 'var(--green-border)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              New Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                fontSize: '0.875rem',
                background: 'var(--bg-main)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                fontSize: '0.875rem',
                background: 'var(--bg-main)',
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.875rem' }}
            >
              {updatingPassword ? 'Updating...' : 'Update Password →'}
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="admin-table-wrapper">
        <table className="editorial-table" style={{ minWidth: '640px' }}>
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
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>Loading team members...</td></tr>
            ) : team.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>No team members assigned yet. Click &quot;Add Team Member&quot; above.</td></tr>
            ) : (
              team.map((u) => (
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
            )))}
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
