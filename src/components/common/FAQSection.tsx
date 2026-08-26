'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FAQ } from '@/types';
import { isReducedMotion } from '@/lib/animation';

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
}

export default function FAQSection({ faqs, title = 'Frequently Asked Questions' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    if (!containerRef.current || isReducedMotion()) return;

    // Single GSAP context for the entire FAQ section with automatic cleanup
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-row',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div ref={containerRef} style={{ margin: '1rem 0' }}>
      {title && <h2 style={{ marginBottom: '1.5rem', fontSize: '1.35rem' }}>{title}</h2>}
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const formattedIndex = String(index + 1).padStart(2, '0');

          return (
            <div
              key={faq.id || index}
              className="faq-row"
              style={{
                borderBottom: '1px solid var(--border)',
                background: isOpen ? 'var(--bg-subtle)' : 'transparent',
                transition: 'background-color 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <button
                onClick={() => toggle(index)}
                style={{
                  width: '100%',
                  padding: '1.25rem 0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                }}
                aria-expanded={isOpen}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--green-dark)', fontWeight: 700 }}>
                    {formattedIndex}
                  </span>
                  <span>{faq.question}</span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    color: 'var(--green-dark)',
                    width: '24px',
                    textAlign: 'center',
                    fontWeight: 700,
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                    display: 'inline-block',
                  }}
                >
                  +
                </span>
              </button>

              {/* Zero-Jank GPU Grid Height Expansion */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      padding: '0 0.5rem 1.25rem 2.75rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      fontSize: '0.875rem',
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(0, -6px, 0)',
                      transition: 'opacity 0.25s ease, transform 0.25s ease',
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
