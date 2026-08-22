'use client';

import React from 'react';
import { HowWeTestedData } from '@/types';
import {
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Building,
  Activity,
  GitCompare,
  Compass,
  Award,
  Sparkles,
  Layers,
  BarChart3,
  Clock,
  Radio,
} from 'lucide-react';

interface HowWeTestedSectionProps {
  data?: HowWeTestedData;
  title?: string;
  subtitle?: string;
}

export default function HowWeTestedSection({
  data,
  title = '4. How We Tested & Editorial Methodology',
  subtitle = 'Our rigorous laboratory benchmarks, calibrated testing environments, and real-world evaluation criteria.',
}: HowWeTestedSectionProps) {
  if (!data || data.enabled === false) {
    return null;
  }

  // Check if at least some data exists
  const hasContent =
    data.testing_process ||
    data.testing_environment ||
    (data.what_was_tested && data.what_was_tested.length > 0) ||
    data.performance_observations ||
    data.comparison_method ||
    data.real_world_usage ||
    (data.evaluation_criteria && data.evaluation_criteria.length > 0);

  if (!hasContent) {
    return null;
  }

  return (
    <section
      style={{
        margin: '4.5rem 0',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-2xl)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Top Accent Border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--green-accent) 0%, #3B82F6 100%)',
        }}
      />

      {/* Section Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--green-light)', border: '1px solid var(--green-border)', color: 'var(--green-deep)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FlaskConical size={13} />
            <span>Independent Lab Methodology</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)' }}>
            <ShieldCheck size={15} />
            <span>100% Unbiased • Zero Merchant Intervention</span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          {data.title || title}
        </h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, maxWidth: '780px' }}>
          {data.summary || subtitle}
        </p>
      </div>

      {/* Grid of Testing Methodology Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* 1. Testing Process */}
        {data.testing_process && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-xs)', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--green-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={17} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                1. Testing Process
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {data.testing_process}
            </p>
          </div>
        )}

        {/* 2. Testing Environment */}
        {data.testing_environment && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-xs)', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={17} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                2. Testing Environment
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {data.testing_environment}
            </p>
          </div>
        )}

        {/* 3. What Was Tested */}
        {data.what_was_tested && data.what_was_tested.length > 0 && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-xs)', background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={17} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                3. What Was Tested
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {data.what_was_tested.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Performance Observations */}
        {data.performance_observations && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-xs)', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--amber-deal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={17} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                4. Performance Observations
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {data.performance_observations}
            </p>
          </div>
        )}

        {/* 5. Comparison Method */}
        {data.comparison_method && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-xs)', background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitCompare size={17} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                5. Comparison Method
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {data.comparison_method}
            </p>
          </div>
        )}

        {/* 6. Real-World Usage */}
        {data.real_world_usage && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-xs)', background: 'rgba(14, 165, 233, 0.12)', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={17} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                6. Real-World Usage
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {data.real_world_usage}
            </p>
          </div>
        )}
      </div>

      {/* 7. Evaluation Criteria & Scoring Weights (Horizontal Banner) */}
      {data.evaluation_criteria && data.evaluation_criteria.length > 0 && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            <Sliders size={16} color="var(--green-accent)" />
            <span>7. Evaluation Criteria &amp; Scoring Weighting</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {data.evaluation_criteria.map((criterion, cIdx) => (
              <div
                key={cIdx}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {criterion.name}
                  </span>
                  {criterion.weight && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green-deep)', background: 'var(--green-light)', border: '1px solid var(--green-border)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-xs)' }}>
                      {criterion.weight}
                    </span>
                  )}
                </div>
                {criterion.description && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {criterion.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editorial Trust Statement */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <Sparkles size={14} color="var(--green-accent)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Testing Integrity:</strong> Buy Best Cart operates an independent consumer testing lab. We do not accept paid manufacturer placements or sponsored editorial rankings.
        </span>
      </div>
    </section>
  );
}
