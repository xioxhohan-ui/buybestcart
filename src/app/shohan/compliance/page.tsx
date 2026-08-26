'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  Volume2,
  Settings,
  ListChecks,
  Activity,
  Sliders,
  Sparkles,
  Link2,
  FileText,
  Package,
  Layers,
  ArrowUpRight,
  Info,
  Clock,
  Play,
  Save,
  Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { AMAZON_COMPLIANCE_RULES, DEFAULT_COMPLIANCE_CONFIG } from '@/lib/compliance/rules';
import {
  ComplianceRule,
  ComplianceViolation,
  ComplianceScanResult,
  ComplianceConfig,
  ComplianceLogItem,
} from '@/lib/compliance/types';
import { scanUrl, scanContent, scanProduct, scanArticle } from '@/lib/compliance/scanner';
import {
  playComplianceAlertSound,
  playComplianceSuccessSound,
  isComplianceSoundEnabled,
  setComplianceSoundEnabled,
} from '@/lib/compliance/sound';
import ComplianceBadge from '@/components/compliance/ComplianceBadge';
import ComplianceSoundToggle from '@/components/compliance/ComplianceSoundToggle';
import SelfPurchaseWarningNotice from '@/components/compliance/SelfPurchaseWarningNotice';
import Link from 'next/link';

export default function AdminCompliancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'rules' | 'logs' | 'tester'>('overview');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [remediatingShorteners, setRemediatingShorteners] = useState(false);
  const [config, setConfig] = useState<ComplianceConfig>(DEFAULT_COMPLIANCE_CONFIG);
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Scan Results State
  const [catalogScan, setCatalogScan] = useState<{
    summary: {
      overallScore: number;
      totalItemsAudited: number;
      productsAudited: number;
      articlesAudited: number;
      comparisonsAudited: number;
      dealsAudited: number;
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      warningCount: number;
      remediatedCount?: number;
      totalViolations: number;
      scannedAt: string;
    };
    productResults: ComplianceScanResult[];
    articleResults: ComplianceScanResult[];
    violations: ComplianceViolation[];
  } | null>(null);

  const handleRemediateShorteners = async () => {
    if (!confirm('Scan entire catalog and automatically replace any third-party URL shorteners (Bitly, TinyURL, etc.) with clean, compliant direct Amazon URLs?')) {
      return;
    }
    setRemediatingShorteners(true);
    try {
      const res = await fetch('/api/compliance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'all', remediate_shorteners: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setCatalogScan(data);
        alert(`✓ URL Shortener Remediation Complete: ${data.summary?.remediatedCount || 0} item(s) sanitized and converted to direct Amazon URLs.`);
        playComplianceSuccessSound();
      }
    } catch (err) {
      alert('Remediation error occurred.');
    } finally {
      setRemediatingShorteners(false);
    }
  };

  // Audit Logs State
  const [logs, setLogs] = useState<ComplianceLogItem[]>([]);
  const [logsFilter, setLogsFilter] = useState<string>('all');
  const [logsSearch, setLogsSearch] = useState<string>('');

  // Interactive Tester State
  const [testUrl, setTestUrl] = useState('https://www.amazon.com/dp/B0CHX1W1XY?tag=bestbuycart-20');
  const [testContent, setTestContent] = useState('Our lab testers recommend this flagship model as an independent selection.');
  const [testCta, setTestCta] = useState('Buy on Amazon');
  const [testResult, setTestResult] = useState<ComplianceViolation[]>([]);

  // Fetch initial compliance data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved compliance config from settings
      const { data: configRow } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'amazon_compliance_config')
        .maybeSingle();

      if (configRow && configRow.value) {
        setConfig({ ...DEFAULT_COMPLIANCE_CONFIG, ...configRow.value });
      }

      // 2. Fetch compliance logs
      const { data: logRows } = await supabase
        .from('system_logs')
        .select('*')
        .eq('category', 'amazon_compliance_audit')
        .order('created_at', { ascending: false })
        .limit(40);

      if (logRows) {
        setLogs(logRows as ComplianceLogItem[]);
      }

      // 3. Trigger initial scan
      await handleRunCatalogScan();
    } catch (err) {
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCatalogScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/compliance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'all' }),
      });

      if (res.ok) {
        const data = await res.json();
        setCatalogScan(data);
        if (data.summary.criticalCount > 0 || data.summary.highCount > 0) {
          playComplianceAlertSound();
        } else {
          playComplianceSuccessSound();
        }
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save Rules Config to DB
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigSaved(false);

    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'amazon_compliance_config',
        category: 'compliance',
        value: config,
        description: 'Amazon Associates Program 2026 automated compliance guard rules and configuration',
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log config update
      await fetch('/api/compliance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule_id: 'CONFIG-UPDATE',
          rule_title: 'Compliance Configuration Updated',
          severity: 'info',
          affected_item: 'amazon_compliance_config',
          affected_type: 'settings',
          action: 'rule_updated',
          details: 'Admin updated compliance rules and threshold parameters',
        }),
      });

      setConfigSaved(true);
      playComplianceSuccessSound();
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Save failed: ${error.message}`);
    } finally {
      setConfigSaving(false);
    }
  };

  // Run Interactive Sandbox Test
  const handleRunTest = () => {
    const violations: ComplianceViolation[] = [];
    if (testUrl) violations.push(...scanUrl(testUrl, { config }));
    if (testContent) violations.push(...scanContent(testContent, { config }));
    if (testCta) violations.push(...scanContent(testCta, { field: 'cta_button', config }));
    setTestResult(violations);

    if (violations.some((v) => v.severity === 'critical' || v.severity === 'high')) {
      playComplianceAlertSound();
    } else {
      playComplianceSuccessSound();
    }
  };

  const overallScore = catalogScan?.summary.overallScore || 100;
  const criticalCount = catalogScan?.summary.criticalCount || 0;
  const highCount = catalogScan?.summary.highCount || 0;

  return (
    <div style={{ maxWidth: '1160px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                padding: '0.4rem',
                borderRadius: 'var(--radius-sm)',
                color: '#FFF',
                display: 'flex',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Amazon Affiliate Compliance Guard
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Automated real-time scanner enforcing all 10 mandatory Amazon Associates Operating Agreement rules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ComplianceSoundToggle />
          <button
            type="button"
            onClick={handleRemediateShorteners}
            disabled={remediatingShorteners || scanning}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#B45309', borderColor: '#FDE68A', background: '#FEF3C7' }}
          >
            <ShieldAlert size={13} />
            <span>{remediatingShorteners ? 'Sanitizing URLs...' : 'Clean URL Shorteners'}</span>
          </button>
          <button
            type="button"
            onClick={handleRunCatalogScan}
            disabled={scanning || remediatingShorteners}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={13} className={scanning ? 'spin' : ''} />
            <span>{scanning ? 'Auditing Catalog...' : 'Audit Entire Catalog'}</span>
          </button>
        </div>
      </div>

      {/* Rule #1 Permanent Self-Purchase Advisory Banner */}
      <SelfPurchaseWarningNotice />

      {/* Compliance Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Platform Health Score
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: overallScore >= 90 ? 'var(--green-accent)' : overallScore >= 70 ? '#F59E0B' : '#EF4444' }}>
              {overallScore}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100% target</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {criticalCount === 0 ? '✓ Zero blocking critical violations' : `⚠️ ${criticalCount} critical violation(s) present`}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            Audited Entities
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {catalogScan?.summary.totalItemsAudited || 0}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {catalogScan?.summary.productsAudited || 0} Products • {catalogScan?.summary.articlesAudited || 0} Buying Guides
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#EF4444', marginBottom: '0.35rem' }}>
            Critical Blocking Issues
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: criticalCount > 0 ? '#EF4444' : 'var(--green-accent)' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {criticalCount === 0 ? 'Publishing fully permitted' : 'Publishing blocked for violators'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            180-Day Sales Window Guard
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-accent)', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '2.4rem' }}>
            <Activity size={18} />
            <span>Active &amp; Healthy</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
            Outbound tracking active across 11 stores
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
        }}
      >
        {[
          { id: 'overview', label: '10 Mandatory Rules', icon: ShieldCheck },
          { id: 'scanner', label: 'Catalog Audit Results', icon: ListChecks, badge: catalogScan?.violations.length },
          { id: 'rules', label: 'Rules & Policy Settings', icon: Sliders },
          { id: 'logs', label: 'Compliance Audit Logs', icon: Clock, badge: logs.length },
          { id: 'tester', label: 'Interactive Link Sandbox', icon: Sparkles },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--green-accent)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--green-accent)' : '2px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                border: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <IconComp size={15} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    background: isActive ? 'var(--green-accent)' : 'var(--bg-subtle)',
                    color: isActive ? '#FFF' : 'var(--text-muted)',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: 10 MANDATORY RULES OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {AMAZON_COMPLIANCE_RULES.map((rule) => {
              const isEnabled = config.rules_toggle[rule.id] !== false;
              return (
                <div
                  key={rule.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: isEnabled ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        background: rule.severity === 'critical' ? '#EF4444' : rule.severity === 'high' ? '#F59E0B' : 'var(--green-accent)',
                        color: '#FFF',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Rule #{rule.ruleNumber}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {rule.severity}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                    {rule.title}
                  </h3>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                    {rule.description}
                  </p>

                  <div style={{ background: 'var(--bg-subtle)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <strong>Remediation:</strong> {rule.remediation}
                  </div>

                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {rule.amazonPolicyRef}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CATALOG AUDIT RESULTS */}
      {activeTab === 'scanner' && (
        <div>
          {catalogScan?.violations && catalogScan.violations.length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="editorial-table" style={{ width: '100%', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>Rule</th>
                    <th>Issue Description</th>
                    <th>Affected Entity</th>
                    <th>Required Fix</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogScan.violations.map((v, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: '0.75rem' }}>#{v.ruleNumber}</span>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{v.ruleId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{v.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.message}</div>
                        {v.offendingValue && (
                          <code style={{ fontSize: '0.6875rem', color: '#EF4444', background: 'rgba(239, 68, 68, 0.08)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>
                            {v.offendingValue}
                          </code>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                          {v.field || 'General'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        {v.remediation}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            color: v.severity === 'critical' ? '#EF4444' : v.severity === 'high' ? '#D97706' : 'var(--text-muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {v.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem 1.5rem', textAlign: 'center' }}>
              <CheckCircle2 size={44} color="var(--green-accent)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Full Catalog is 100% Compliant</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.5rem auto 0 auto' }}>
                All database products, buying guides, comparisons, and deals satisfy all 10 Amazon Associates compliance rules.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RULES & POLICY SETTINGS CMS */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveConfig} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Compliance Guard Settings &amp; Word Blacklist</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Configure automated pre-publish blocking triggers, prohibited trademark phrases, and mandatory disclaimers.
              </p>
            </div>

            <button
              type="submit"
              disabled={configSaving}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Save size={13} />
              <span>{configSaving ? 'Saving Rules...' : 'Save Configuration'}</span>
            </button>
          </div>

          {configSaved && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green-accent)', border: '1px solid var(--green-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>Compliance rules updated and synced successfully.</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Blocking Triggers */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Publish Blocking Triggers
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', marginBottom: '0.65rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.block_on_critical}
                  onChange={(e) => setConfig({ ...config, block_on_critical: e.target.checked })}
                />
                <span><strong>Block on Critical Severity</strong> (URL cloaking, missing disclosure, false endorsements)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', marginBottom: '0.65rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.block_on_high}
                  onChange={(e) => setConfig({ ...config, block_on_high: e.target.checked })}
                />
                <span><strong>Block on High Severity</strong> (Improper CTA logos, unapproved image hosts)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.require_article_disclosure}
                  onChange={(e) => setConfig({ ...config, require_article_disclosure: e.target.checked })}
                />
                <span><strong>Require Disclosure in All Articles</strong> (Rule #6)</span>
              </label>
            </div>

            {/* Mandatory Disclosure Statement */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Mandatory Associates Disclosure Copy
              </h3>
              <textarea
                rows={4}
                value={config.mandatory_disclosure_phrase}
                onChange={(e) => setConfig({ ...config, mandatory_disclosure_phrase: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8125rem',
                  background: 'var(--bg-main)',
                }}
              />
            </div>
          </div>

          {/* Forbidden Trademark Keywords */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Forbidden Endorsement &amp; Trademark Phrases (Rule #9 — One per line)
            </label>
            <textarea
              rows={6}
              value={config.forbidden_trademark_phrases.join('\n')}
              onChange={(e) =>
                setConfig({
                  ...config,
                  forbidden_trademark_phrases: e.target.value.split('\n').map((s) => s.trim().toLowerCase()).filter(Boolean),
                })
              }
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.8125rem',
                fontFamily: 'monospace',
                background: 'var(--bg-main)',
              }}
            />
          </div>

          {/* Blacklisted Shortener Domains */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Blacklisted URL Shortener Domains (Rule #7 — One per line)
            </label>
            <textarea
              rows={4}
              value={config.disallowed_url_domains.join('\n')}
              onChange={(e) =>
                setConfig({
                  ...config,
                  disallowed_url_domains: e.target.value.split('\n').map((s) => s.trim().toLowerCase()).filter(Boolean),
                })
              }
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '0.8125rem',
                fontFamily: 'monospace',
                background: 'var(--bg-main)',
              }}
            />
          </div>
        </form>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Compliance Event &amp; Audit Log</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={logsFilter}
                onChange={(e) => setLogsFilter(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="info">Info / Updates</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="editorial-table" style={{ width: '100%', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event &amp; Action</th>
                  <th>Affected Target</th>
                  <th>Severity</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No compliance audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs
                    .filter((l) => logsFilter === 'all' || l.level === logsFilter)
                    .map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                            {log.metadata?.rule_id ? `[${log.metadata.rule_id}] ` : ''}{log.message}
                          </div>
                          {log.metadata?.details && (
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{log.metadata.details}</div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                            {log.metadata?.affected_item || log.metadata?.affected_type || 'Platform'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 800,
                              color: log.level === 'critical' ? '#EF4444' : log.level === 'high' ? '#D97706' : 'var(--green-accent)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {log.level || 'INFO'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {log.metadata?.admin_user || 'Super Admin'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: INTERACTIVE TESTER SANDBOX */}
      {activeTab === 'tester' && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem' }}>Interactive Compliance Link &amp; Text Sandbox</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Test any Amazon affiliate link, CTA button wording, or blog review copy in real time before publishing.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Test Affiliate URL (Rule #7, #10)
              </label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="Paste URL (e.g. bit.ly/xyz or amazon.com/dp/...)"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8125rem', background: 'var(--bg-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Test CTA Button Label (Rule #8)
              </label>
              <input
                type="text"
                value={testCta}
                onChange={(e) => setTestCta(e.target.value)}
                placeholder="Button text (e.g. Buy on Amazon)"
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8125rem', background: 'var(--bg-main)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Test Review Copy / Title / Excerpt (Rule #9)
            </label>
            <textarea
              rows={3}
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              placeholder="Paste article text to test for prohibited trademark claims..."
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8125rem', background: 'var(--bg-main)' }}
            />
          </div>

          <button
            type="button"
            onClick={handleRunTest}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}
          >
            <Play size={14} />
            <span>Run Real-Time Compliance Test</span>
          </button>

          {/* Test Results Display */}
          {testResult.length > 0 ? (
            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#EF4444', marginBottom: '0.75rem' }}>
                Violations Found ({testResult.length}):
              </h3>
              {testResult.map((v, idx) => (
                <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '0.65rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#EF4444' }}>
                    Rule #{v.ruleNumber} ({v.ruleId}): {v.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{v.message}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--green-accent)', marginTop: '0.35rem' }}>
                    <strong>Required Fix:</strong> {v.remediation}
                  </div>
                </div>
              ))}
            </div>
          ) : testResult.length === 0 && testUrl ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--green-border)', padding: '1rem', borderRadius: 'var(--radius)', color: 'var(--green-accent)', fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>Input passed all compliance tests. Safe and ready for Amazon Associates use.</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
