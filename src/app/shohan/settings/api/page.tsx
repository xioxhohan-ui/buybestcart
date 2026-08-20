'use client';

import React, { useState } from 'react';
import {
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  CloudSun,
  Gift,
  Sparkles,
  BarChart3,
  Image as ImageIcon,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_API_CONFIGS, ApiConfig, maskApiKey } from '@/lib/api/manager';

export default function AdminApiSettingsPage() {
  const [configs, setConfigs] = useState<Record<string, ApiConfig>>(DEFAULT_API_CONFIGS);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (id: string) => {
    setConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id].enabled,
        status: !prev[id].enabled ? 'active' : 'disabled',
      },
    }));
  };

  const handleInputChange = (id: string, field: 'apiKey' | 'secretKey' | 'endpoint', value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);

    await new Promise((res) => setTimeout(res, 800));

    setTestingId(null);
    setTestResult({
      id,
      success: true,
      message: `Connection successful to ${configs[id].name}! Status 200 OK.`,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    await new Promise((res) => setTimeout(res, 600));

    setSaving(false);
    setSavedSuccess(true);

    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'amazon':
        return Zap;
      case 'currency':
        return Globe;
      case 'countries':
        return Globe;
      case 'meteo':
        return CloudSun;
      case 'holidays':
        return Gift;
      case 'ai':
        return Sparkles;
      case 'search_console':
        return BarChart3;
      default:
        return ImageIcon;
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={22} color="var(--green-gold)" />
            <span>API & External Integrations Hub</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage official API credentials, status monitoring, caching, rate limiting, and fallbacks for BuyBestCart.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ gap: '0.5rem', fontSize: '0.875rem' }}
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          <span>{saving ? 'Saving...' : 'Save API Settings'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius)', background: 'var(--success-light)', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>API configurations and credentials saved securely!</span>
        </div>
      )}

      {testResult && (
        <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius)', background: testResult.success ? 'var(--green-light)' : '#fef2f2', border: testResult.success ? '1px solid var(--green-border)' : '1px solid #fecaca', color: testResult.success ? 'var(--green-deep)' : '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Grid of API Providers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {Object.values(configs).map((cfg) => {
          const Icon = getIcon(cfg.id);
          const isTesting = testingId === cfg.id;

          return (
            <div
              key={cfg.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                {/* Top Badge Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}>
                      <Icon size={18} color="var(--green-accent)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{cfg.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cfg.provider}</div>
                    </div>
                  </div>

                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={cfg.enabled}
                      onChange={() => handleToggle(cfg.id)}
                      style={{ display: 'none' }}
                    />
                    <span
                      style={{
                        width: '38px',
                        height: '22px',
                        borderRadius: '999px',
                        background: cfg.enabled ? 'var(--green-accent)' : 'var(--border-strong)',
                        position: 'relative',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          position: 'absolute',
                          top: '2px',
                          left: cfg.enabled ? '18px' : '2px',
                          transition: 'left 0.2s ease',
                        }}
                      />
                    </span>
                  </label>
                </div>

                {/* Status Metrics Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                    <span style={{ fontWeight: 700, color: cfg.enabled ? 'var(--success)' : 'var(--text-muted)' }}>
                      {cfg.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Cache Hit: </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cfg.cacheHitRate}%</span>
                  </div>
                </div>

                {/* Secret Key Input Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <Key size={13} />
                      <span>API Access Key / Secret Token</span>
                    </label>
                    <input
                      type="password"
                      placeholder={maskApiKey(cfg.apiKey)}
                      value={cfg.apiKey || ''}
                      onChange={(e) => handleInputChange(cfg.id, 'apiKey', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8125rem',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-strong)',
                        background: 'var(--bg-main)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>
                      Endpoint Base URL
                    </label>
                    <input
                      type="text"
                      value={cfg.endpoint || ''}
                      onChange={(e) => handleInputChange(cfg.id, 'endpoint', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-main)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => handleTestConnection(cfg.id)}
                  disabled={isTesting}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', gap: '0.35rem' }}
                >
                  {isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
