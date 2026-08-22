'use client';

import React from 'react';
import { ArticleFaqItem } from '@/types';
import { HelpCircle, Plus, Trash2, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

interface ArticleFaqManagerProps {
  faqs?: ArticleFaqItem[];
  onChange: (updated: ArticleFaqItem[]) => void;
}

const DEFAULT_HEADPHONE_FAQS: ArticleFaqItem[] = [
  {
    question: 'How do active noise-canceling headphones differ from passive noise isolation?',
    answer: 'Passive isolation physically blocks sound waves using memory foam ear cushions and closed-back ear cups. Active noise cancellation (ANC) uses exterior microphones and digital signal processors (DSP) to generate inverted "anti-noise" sound waves that neutralize incoming continuous frequencies like jet engines and train hums.',
  },
  {
    question: 'Does active noise cancellation drain battery faster?',
    answer: 'Yes. Enabling ANC generally reduces overall battery runtime by 20% to 30% because the acoustic microphones and signal processor continuously sample and calculate phase cancellation in real time.',
  },
  {
    question: 'Can I use Bluetooth ANC headphones with an airplane in-flight entertainment system?',
    answer: 'Yes, most premium wireless ANC headphones include a 3.5mm auxiliary audio cable and a dual-prong airplane adapter in the carrying case, allowing direct wired plug-in without Bluetooth.',
  },
  {
    question: 'Are noise-canceling headphones safe for long daily listening sessions?',
    answer: 'Yes. By reducing background ambient rumble, ANC allows you to listen to music and podcasts at significantly lower, safer volume decibel levels, reducing long-term ear fatigue and hearing strain.',
  },
];

const DEFAULT_LAPTOP_FAQS: ArticleFaqItem[] = [
  {
    question: 'How much RAM do I need for remote work and multitasking in 2026?',
    answer: 'We recommend a minimum of 16GB of unified or DDR5 RAM. While 8GB is sufficient for basic single-tab browsing, remote workflows involving Slack, Zoom, 30+ browser tabs, and spreadsheets require 16GB to avoid memory swapping and sluggish performance.',
  },
  {
    question: 'What is the ideal screen brightness for home and coffee shop work?',
    answer: 'Look for displays rated at 400 nits or higher. If you work near bright windows or outdoors, 500 nits ensures comfortable readability without severe eye strain or glare reflections.',
  },
  {
    question: 'Is USB-C Power Delivery charging necessary?',
    answer: 'Highly recommended. USB-C Power Delivery (PD) enables you to use universal GaN travel chargers for your laptop, phone, and tablet with a single lightweight cable, eliminating proprietary heavy power bricks.',
  },
];

export default function ArticleFaqManager({ faqs = [], onChange }: ArticleFaqManagerProps) {
  const handleAddFaq = () => {
    onChange([
      ...faqs,
      {
        question: 'New Question?',
        answer: 'Provide a clear, expert answer here...',
      },
    ]);
  };

  const handleUpdateFaq = (index: number, field: keyof ArticleFaqItem, val: string) => {
    const copy = [...faqs];
    copy[index] = { ...copy[index], [field]: val };
    onChange(copy);
  };

  const handleDeleteFaq = (index: number) => {
    const copy = faqs.filter((_, idx) => idx !== index);
    onChange(copy);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= faqs.length) return;
    const copy = [...faqs];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    onChange(copy);
  };

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Preset Loaders */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <HelpCircle size={16} color="var(--green-accent)" />
            <span>6. FAQ &amp; Structured Schema Builder ({faqs.length} FAQs)</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Add unlimited frequently asked questions. These automatically render as rich interactive accordions and generate Google FAQPage JSON-LD structured data.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_HEADPHONE_FAQS)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Sparkles size={11} />
            <span>Load Audio FAQs</span>
          </button>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_LAPTOP_FAQS)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Sparkles size={11} />
            <span>Load Laptop FAQs</span>
          </button>
          <button
            type="button"
            onClick={handleAddFaq}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Plus size={11} />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* FAQ Items List */}
      {faqs.length === 0 ? (
        <div style={{ background: 'var(--bg-subtle)', border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center' }}>
          <HelpCircle size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No FAQs Added Yet
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Add common buyer questions to boost search engine visibility and address buyer concerns.
          </p>
          <button
            type="button"
            onClick={handleAddFaq}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={13} />
            <span>Add First Question</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--green-accent)',
                      color: '#FFF',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                    placeholder="Enter question (e.g. How does ANC work?)"
                    style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', fontWeight: 700, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '0.2rem', color: idx === 0 ? '#CBD5E1' : 'var(--text-secondary)' }}
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === faqs.length - 1}
                    style={{ background: 'none', border: 'none', cursor: idx === faqs.length - 1 ? 'not-allowed' : 'pointer', padding: '0.2rem', color: idx === faqs.length - 1 ? '#CBD5E1' : 'var(--text-secondary)' }}
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--danger)' }}
                    title="Delete question"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={faq.answer}
                onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                placeholder="Enter detailed, helpful answer..."
                style={{ width: '100%', padding: '0.45rem 0.6rem', fontSize: '0.8125rem', lineHeight: 1.5, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
