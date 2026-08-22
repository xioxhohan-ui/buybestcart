'use client';

import React from 'react';
import { WhatToLookForData, BuyingFactor } from '@/types';
import { Compass, Plus, Trash2, Sparkles, Lightbulb } from 'lucide-react';

interface WhatToLookForManagerProps {
  data?: WhatToLookForData;
  onChange: (updated: WhatToLookForData) => void;
}

const DEFAULT_AUDIO_FACTORS: WhatToLookForData = {
  enabled: true,
  title: "5. What to Look For: Buyer's Guide & Key Factors",
  summary: 'Before choosing a pair of active noise-canceling headphones, evaluate these critical performance parameters to match your listening habits.',
  factors: [
    {
      title: 'Active Noise Cancellation vs. Passive Seal',
      importance: 'critical',
      description: 'Look for dual-processor hybrid ANC with feedforward and feedback microphones. A high-density memory foam ear cup seal is equally vital for suppressing sudden high-pitched noises.',
    },
    {
      title: 'Real-World Battery Life & Emergency Quick Charge',
      importance: 'critical',
      description: 'Ensure a minimum of 24 hours playback with ANC engaged. Look for fast charging that provides at least 3-4 hours of playback from a quick 5-minute USB-C charge.',
    },
    {
      title: 'High-Res Bluetooth Codecs (LDAC, aptX Adaptive)',
      importance: 'important',
      description: 'If you stream lossless audio via Apple Music or Tidal, check for LDAC or aptX Adaptive support to prevent sound degradation over standard SBC codecs.',
    },
    {
      title: 'Long-Duration Ergonomics & Clamping Force',
      importance: 'important',
      description: 'Headphones over 280g can cause top-of-skull fatigue during flights. Look for soft protein leather headbands with even weight distribution.',
    },
    {
      title: 'Multipoint Bluetooth Device Pairing',
      importance: 'nice_to_have',
      description: 'Allows seamless automatic audio switching between your laptop and smartphone without disconnecting.',
    },
  ],
  additional_advice: 'If you wear prescription glasses, look for models with deep, compliant ear cushions (like Bose QuietComfort Ultra or Sony XM5) that do not break the acoustic seal when resting over eyeglass frames.',
};

const DEFAULT_LAPTOP_FACTORS: WhatToLookForData = {
  enabled: true,
  title: "5. What to Look For: Remote Work Laptop Buying Guide",
  summary: 'Evaluate these key hardware specifications to ensure seamless multitasking and all-day battery reliability.',
  factors: [
    {
      title: 'Unified RAM Capacity (16GB Minimum)',
      importance: 'critical',
      description: 'Modern web browsers, Slack, Zoom, and background multitasking require at least 16GB of RAM to prevent page reloads and slowdowns.',
    },
    {
      title: 'Battery Efficiency & Thermal Throttling',
      importance: 'critical',
      description: 'Choose modern silicon (Apple M-Series, Intel Core Ultra, AMD Ryzen AI) that achieves 14+ hours of real-world productivity without aggressive fan noise.',
    },
    {
      title: 'Display Resolution & Brightness (300+ Nits)',
      importance: 'important',
      description: 'Opt for 16:10 aspect ratio screens with minimum 300-400 nits brightness for comfortable document reading near sunny windows.',
    },
    {
      title: 'Webcam & Microphone Quality',
      importance: 'important',
      description: 'Ensure a 1080p FHD webcam with hardware noise-canceling dual microphones for professional video conferencing.',
    },
  ],
  additional_advice: 'Prioritize laptops with USB-C / Thunderbolt Power Delivery charging so you can power your entire workstation and display setup using a single lightweight travel adapter.',
};

export default function WhatToLookForManager({ data = { enabled: true }, onChange }: WhatToLookForManagerProps) {
  const isEnabled = data.enabled !== false;

  const handleUpdate = (field: keyof WhatToLookForData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleAddFactor = () => {
    const current = data.factors || [];
    handleUpdate('factors', [
      ...current,
      {
        title: 'New Buying Factor',
        importance: 'important',
        description: 'Explain why this factor is important for buyers to consider...',
      },
    ]);
  };

  const handleUpdateFactor = (index: number, field: keyof BuyingFactor, val: any) => {
    const current = [...(data.factors || [])];
    current[index] = { ...current[index], [field]: val };
    handleUpdate('factors', current);
  };

  const handleDeleteFactor = (index: number) => {
    const current = (data.factors || []).filter((_, idx) => idx !== index);
    handleUpdate('factors', current);
  };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Preset Loaders */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <Compass size={16} color="var(--green-accent)" />
            <span>5. What to Look For &amp; Buyer Checklist Builder</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Explain the essential technical, ergonomic, and practical factors buyers should consider before purchasing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_AUDIO_FACTORS)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Sparkles size={11} />
            <span>Load Audio Preset</span>
          </button>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_LAPTOP_FACTORS)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Sparkles size={11} />
            <span>Load Laptop Preset</span>
          </button>
        </div>
      </div>

      {/* Enable / Disable Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1rem', background: isEnabled ? 'var(--green-light)' : 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <input
          type="checkbox"
          id="enable_what_to_look_for"
          checked={isEnabled}
          onChange={(e) => handleUpdate('enabled', e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--green-accent)' }}
        />
        <label htmlFor="enable_what_to_look_for" style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer' }}>
          Display &quot;What to Look For&quot; Buyer&apos;s Guide Section
        </label>
      </div>

      {isEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section Title & Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Section Heading
              </label>
              <input
                type="text"
                value={data.title || "5. What to Look For: Buyer's Guide"}
                onChange={(e) => handleUpdate('title', e.target.value)}
                placeholder="5. What to Look For: Buyer's Guide"
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Category Overview Lead
              </label>
              <input
                type="text"
                value={data.summary || ''}
                onChange={(e) => handleUpdate('summary', e.target.value)}
                placeholder="Brief advice intro explaining what matters most..."
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>

          {/* Factors Builder */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  Buying Checklist &amp; Factors ({(data.factors || []).length} Factors)
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Add key technical, battery, build, and warranty factors to evaluate.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddFactor}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={11} />
                <span>Add Factor</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(data.factors || []).map((factor, fIdx) => (
                <div
                  key={fIdx}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={factor.title}
                      onChange={(e) => handleUpdateFactor(fIdx, 'title', e.target.value)}
                      placeholder="Factor Title (e.g. Battery Life vs Weight)"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                    />
                    <select
                      value={factor.importance || 'important'}
                      onChange={(e) => handleUpdateFactor(fIdx, 'importance', e.target.value as any)}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                    >
                      <option value="critical">Critical Factor</option>
                      <option value="important">Important</option>
                      <option value="nice_to_have">Nice to Have</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteFactor(fIdx)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                      title="Delete factor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={factor.description}
                    onChange={(e) => handleUpdateFactor(fIdx, 'description', e.target.value)}
                    placeholder="Describe what buyers should check for and why it matters..."
                    style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.75rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Expert Advice */}
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--green-deep)' }}>
              Lab Expert Advice &amp; Purchasing Strategy Callout
            </label>
            <textarea
              rows={3}
              value={data.additional_advice || ''}
              onChange={(e) => handleUpdate('additional_advice', e.target.value)}
              placeholder="e.g. If you wear glasses, look for models with deep, compliant ear cushions that preserve the acoustic seal..."
              style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
