'use client';

import React from 'react';
import { HowWeTestedData, EvaluationCriterion } from '@/types';
import {
  FlaskConical,
  Plus,
  Trash2,
  Sparkles,
  Activity,
  Building,
  CheckCircle2,
  BarChart3,
  GitCompare,
  Compass,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface HowWeTestedManagerProps {
  data?: HowWeTestedData;
  onChange: (updated: HowWeTestedData) => void;
}

const DEFAULT_AUDIO_TEMPLATE: HowWeTestedData = {
  enabled: true,
  title: '4. How We Tested & Editorial Methodology',
  summary: 'Our engineering lab conducted over 40 hours of calibrated acoustic measurements, battery run-down loops, and real-world subway commutes to evaluate active noise cancellation.',
  testing_process: 'Each headphone underwent a 5-stage testing protocol: 1) Anechoic chamber acoustic frequency sweep from 20Hz to 20kHz; 2) Calibrated pink/white noise decibel suppression testing; 3) Standardized 65dB battery loop test; 4) AI microphone speech-to-noise ratio benchmarking; 5) 10-day daily commute wear trial.',
  testing_environment: 'Acoustic testing was conducted inside our calibrated isolation booth using an artificial head binaural microphone rig. Environmental noise simulations were performed with calibrated 85dB airplane cabin rumblings and 75dB commuter subway recordings.',
  what_was_tested: [
    'Active Noise Cancellation (Low, Mid, and High Frequency Attenuation)',
    'Continuous Battery Longevity at 65% Volume with ANC Enabled',
    'Microphone Beamforming Clarity in 70dB Ambient Wind / Traffic',
    'Long-Duration Ergonomic Clamp Force & Headband Pressure',
    'Bluetooth 5.3 Multipoint Stability & Codec Latency (LDAC / AAC)',
  ],
  performance_observations: 'Top-ranking models maintained exceptional acoustic clarity and frequency attenuation, while ergonomic picks excelled in long-duration comfort with minimal headband pressure.',
  comparison_method: 'We performed direct blind A/B listening tests against industry benchmark standards and previous generation models to measure generational soundstage and active isolation improvements.',
  real_world_usage: 'We wore each model across transatlantic flights, daily morning subway commutes, and noisy open-plan office spaces to verify comfort, ambient transparency modes, and quick-attention conversation gestures.',
  evaluation_criteria: [
    { name: 'Acoustic Fidelity & Soundstage', weight: '30%', description: 'Clarity, bass punch, treble resolution, and distortion across volume levels.' },
    { name: 'Active Noise Cancellation (ANC)', weight: '30%', description: 'Suppression of transit engines, chatter, and office air conditioners.' },
    { name: 'Ergonomic Comfort & Build', weight: '20%', description: 'Clamp pressure, memory foam plushness, and multi-hour fatigue.' },
    { name: 'Battery Longevity & Fast Charge', weight: '10%', description: 'Measured runtime and emergency 3-minute top-up efficiency.' },
    { name: 'Microphone & Connectivity', weight: '10%', description: 'Call clarity in windy environments and seamless multipoint switching.' },
  ],
};

const DEFAULT_LAPTOP_TEMPLATE: HowWeTestedData = {
  enabled: true,
  title: '4. How We Tested & Editorial Methodology',
  summary: 'Our hardware team subjected every laptop to rigorous Geekbench, Cinebench thermal loops, 150-nit web browsing battery tests, and daily multi-tasking productivity workloads.',
  testing_process: 'Each laptop ran through standardized benchmark loops: 1) Cinebench R24 multi-core thermal stress; 2) PugetBench for Premiere Pro & Photoshop; 3) Continuous 150-nit Wi-Fi web browsing battery drain test; 4) Keyboard actuation travel and trackpad gesture accuracy tests.',
  testing_environment: 'Tests were conducted in a 21°C temperature-controlled hardware lab using calibrated light meters for 150-nit display calibration and infrared thermal cameras for surface heat mapping.',
  what_was_tested: [
    'Single-Core and Multi-Core CPU Performance under Sustained Load',
    'Continuous Web Browsing & Video Playback Battery Endurance',
    'Thermal Throttling, Fan Noise Decibels, and Chassis Hotspots',
    'Keyboard Travel, Tactile Bump, and Precision Glass Trackpad Response',
    '1080p Webcam Clarity, Microphones, and Speaker Sound Quality',
  ],
  performance_observations: 'ARM-based architectures exhibited virtually zero thermal throttling with all-day 18+ hour battery endurance, while high-performance x86 chips delivered superior multi-threaded render speeds at the expense of fan noise under heavy exports.',
  comparison_method: 'All laptops were benchmarked at identical 150-nit screen brightness with background indexing disabled to ensure 100% fair battery and performance comparisons.',
  real_world_usage: 'Each laptop was used as a primary remote work driver for a full week, conducting Zoom meetings, heavy Slack messaging, 40+ browser tab multitasking, and photo editing.',
  evaluation_criteria: [
    { name: 'Real-World Battery Endurance', weight: '30%', description: 'All-day unplugged productivity without battery anxiety.' },
    { name: 'Performance & Thermal Stability', weight: '25%', description: 'Sustained compute speed without loud fan noise or throttling.' },
    { name: 'Display & Visual Quality', weight: '20%', description: 'Color gamut coverage (sRGB/DCI-P3), brightness, and resolution.' },
    { name: 'Keyboard, Trackpad & Ergonomics', weight: '15%', description: 'Typing comfort and palm rejection accuracy.' },
    { name: 'Port Selection & Build Quality', weight: '10%', description: 'Chassis rigidity, Thunderbolt ports, and durability.' },
  ],
};

export default function HowWeTestedManager({ data = { enabled: true }, onChange }: HowWeTestedManagerProps) {
  const isEnabled = data.enabled !== false;

  const handleUpdate = (field: keyof HowWeTestedData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleAddCriterion = () => {
    const current = data.evaluation_criteria || [];
    handleUpdate('evaluation_criteria', [
      ...current,
      { name: 'New Criterion', weight: '20%', description: 'Description of evaluation standard...' },
    ]);
  };

  const handleUpdateCriterion = (index: number, field: keyof EvaluationCriterion, val: string) => {
    const current = [...(data.evaluation_criteria || [])];
    current[index] = { ...current[index], [field]: val };
    handleUpdate('evaluation_criteria', current);
  };

  const handleDeleteCriterion = (index: number) => {
    const current = (data.evaluation_criteria || []).filter((_, idx) => idx !== index);
    handleUpdate('evaluation_criteria', current);
  };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Quick Templates */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <FlaskConical size={16} color="var(--green-accent)" />
            <span>4. How We Tested &amp; Lab Methodology Builder</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Document your testing process, environment, variables, performance findings, comparison methods, and weighted scoring criteria.
          </p>
        </div>

        {/* Template Loaders */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_AUDIO_TEMPLATE)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Sparkles size={11} />
            <span>Load Audio/ANC Preset</span>
          </button>

          <button
            type="button"
            onClick={() => onChange(DEFAULT_LAPTOP_TEMPLATE)}
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
          id="enable_how_we_tested"
          checked={isEnabled}
          onChange={(e) => handleUpdate('enabled', e.target.checked)}
          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--green-accent)' }}
        />
        <label htmlFor="enable_how_we_tested" style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer' }}>
          Display &quot;How We Tested&quot; Methodology Section in Buying Guide
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
                value={data.title || '4. How We Tested & Editorial Methodology'}
                onChange={(e) => handleUpdate('title', e.target.value)}
                placeholder="4. How We Tested & Editorial Methodology"
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Methodology Overview Summary
              </label>
              <input
                type="text"
                value={data.summary || ''}
                onChange={(e) => handleUpdate('summary', e.target.value)}
                placeholder="Brief summary of total lab hours and testing scope..."
                style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>

          {/* 1. Testing Process & 2. Testing Environment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--green-deep)' }}>
                1. Testing Process (Step-by-step test protocol)
              </label>
              <textarea
                rows={4}
                value={data.testing_process || ''}
                onChange={(e) => handleUpdate('testing_process', e.target.value)}
                placeholder="Detail the step-by-step benchmark and testing phases..."
                style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#1D4ED8' }}>
                2. Testing Environment (Chamber, noise simulators, temp)
              </label>
              <textarea
                rows={4}
                value={data.testing_environment || ''}
                onChange={(e) => handleUpdate('testing_environment', e.target.value)}
                placeholder="Describe isolation booths, calibrated microphones, noise decibel simulators..."
                style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>

          {/* 3. What Was Tested */}
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#7E22CE' }}>
              3. What Was Tested (Key parameters, comma separated)
            </label>
            <input
              type="text"
              value={(data.what_was_tested || []).join(', ')}
              onChange={(e) => handleUpdate('what_was_tested', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              placeholder="Active Noise Cancellation, Continuous Battery Longevity, Microphone Voice Clarity, Drop Resistance"
              style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
            />
          </div>

          {/* 4. Performance Observations & 5. Comparison Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#B45309' }}>
                4. Performance Observations (Data metrics &amp; lab results)
              </label>
              <textarea
                rows={3}
                value={data.performance_observations || ''}
                onChange={(e) => handleUpdate('performance_observations', e.target.value)}
                placeholder="Key quantitative benchmark findings and measurable differences..."
                style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#BE185D' }}>
                5. Comparison Method (A/B testing against baselines)
              </label>
              <textarea
                rows={3}
                value={data.comparison_method || ''}
                onChange={(e) => handleUpdate('comparison_method', e.target.value)}
                placeholder="How products were compared side-by-side against market baselines..."
                style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
              />
            </div>
          </div>

          {/* 6. Real-World Usage */}
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem', color: '#0369A1' }}>
              6. Real-World Usage (Commutes, flights, home office, ergonomics)
            </label>
            <textarea
              rows={2}
              value={data.real_world_usage || ''}
              onChange={(e) => handleUpdate('real_world_usage', e.target.value)}
              placeholder="Real-world scenarios, transit trials, daily wear trials, and practical impressions..."
              style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.8125rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
            />
          </div>

          {/* 7. Evaluation Criteria Builder */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
                  <Sliders size={13} color="var(--green-accent)" />
                  <span>7. Evaluation Criteria &amp; Scoring Weighting ({(data.evaluation_criteria || []).length} Criteria)</span>
                </div>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Define score weights and criteria breakdown (e.g. Sound Quality: 30%, ANC: 30%, Comfort: 20%).
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCriterion}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={11} />
                <span>Add Criterion</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(data.evaluation_criteria || []).map((crit, cIdx) => (
                <div key={cIdx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 80px 2fr auto', gap: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={crit.name}
                    onChange={(e) => handleUpdateCriterion(cIdx, 'name', e.target.value)}
                    placeholder="Criterion Name (e.g. Acoustic Fidelity)"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                  />
                  <input
                    type="text"
                    value={crit.weight || ''}
                    onChange={(e) => handleUpdateCriterion(cIdx, 'weight', e.target.value)}
                    placeholder="e.g. 30%"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', fontWeight: 800, textAlign: 'center', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                  />
                  <input
                    type="text"
                    value={crit.description || ''}
                    onChange={(e) => handleUpdateCriterion(cIdx, 'description', e.target.value)}
                    placeholder="Evaluation details..."
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(cIdx)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                    title="Delete criterion"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
