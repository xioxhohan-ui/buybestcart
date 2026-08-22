'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Sparkles, Award } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import { getAnimationProfile } from '@/lib/animation';
import { Product } from '@/types';
import { formatPrice } from '@/lib/region';

interface AnimatedHeroProps {
  heading?: string;
  subheading?: string;
  description?: string;
  eyebrow?: string;
  featuredProduct?: Product | null;
}

export default function AnimatedHero({
  heading = 'The Independent Guide to Better Buying.',
  subheading = 'Curated, Tested & Verified.',
  description = 'We independently test consumer technology, audio gear, and everyday lifestyle tools. Our reviews cut through marketing noise to present verified specifications, lab scores, and authentic pricing.',
  eyebrow = 'THE 2026 SHOPPING & PRODUCT REVIEW EDIT',
  featuredProduct,
}: AnimatedHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const headingLine1Ref = useRef<HTMLHeadingElement | null>(null);
  const headingLine2Ref = useRef<HTMLSpanElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const profile = getAnimationProfile();

    // If reduced motion is requested, do not run GSAP animations — elements stay 100% visible by default
    if (profile.isReduced) return;

    const ctx = gsap.context(() => {
      const elementsToAnimate = [
        eyebrowRef.current,
        headingLine1Ref.current,
        headingLine2Ref.current,
        descRef.current,
        searchRef.current,
        ctaRef.current,
        showcaseRef.current,
      ].filter(Boolean);

      gsap.fromTo(
        elementsToAnimate,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const showcaseItem = featuredProduct || {
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    slug: 'sony-wh-1000xm5-wireless-headphones',
    price: 348.0,
    list_price: 399.99,
    editorial_score: 9.6,
    short_description:
      'Unrivaled acoustic precision with dual processors for eight microphones, Auto NC Optimizer, and 30-hour battery life.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    category: { name: 'Audio & Acoustics' },
  };

  return (
    <section
      ref={containerRef}
      className="hero-section"
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, #FAF9F5 0%, #F5F3EC 100%)',
        padding: '4.5rem 0 4rem 0',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container">
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            className="editorial-eyebrow"
            style={{
              justifyContent: 'center',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={12} color="var(--green-accent)" />
            <span>{eyebrow}</span>
          </div>

          {/* Editorial Serif Headline */}
          <h1 style={{ marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            <span
              ref={headingLine1Ref}
              style={{ display: 'block', marginBottom: '0.25rem' }}
            >
              {heading}
            </span>
            <span
              ref={headingLine2Ref}
              style={{
                fontStyle: 'italic',
                fontWeight: 600,
                color: 'var(--green-accent)',
                display: 'block',
              }}
            >
              {subheading}
            </span>
          </h1>

          <p
            ref={descRef}
            style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              lineHeight: 1.65,
              maxWidth: '680px',
              margin: '0 auto 2rem auto',
            }}
          >
            {description}
          </p>

          {/* Prominent Homepage Search Bar — Always Visible & Accessible on Mobile */}
          <div
            ref={searchRef}
            className="hero-search-wrapper"
            style={{
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              width: '100%',
              position: 'relative',
              zIndex: 40,
            }}
          >
            <SearchBar placeholder="Search 2026 gear, laptops, headphones, deals..." />
          </div>

          {/* Action CTAs */}
          <div
            ref={ctaRef}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem',
            }}
          >
            <a href="#featured-picks" className="btn btn-primary btn-lg">
              Explore Editors&apos; Picks →
            </a>
            <Link href="/guides" className="btn btn-secondary btn-lg">
              Read Buying Guides
            </Link>
          </div>
        </div>

        {/* Featured Editorial Magazine Spread (Luxury Showcase) */}
        <div
          ref={showcaseRef}
          className="hero-showcase"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            maxWidth: '1020px',
            margin: '0 auto',
            boxShadow: 'var(--shadow)',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div
            className="hero-showcase-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            {/* Image Preview */}
            <div
              style={{
                background: '#FAF9F6',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <img
                src={
                  showcaseItem.thumbnail_url ||
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80'
                }
                alt={showcaseItem.title}
                style={{ maxHeight: '240px', margin: '0 auto', objectFit: 'contain' }}
              />
            </div>

            {/* Editorial Feature Content */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <span
                  className="editorial-tag"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Award size={12} color="#FFFFFF" />
                  <span>EDITOR&apos;S #1 CHOICE OF 2026</span>
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {showcaseItem.category?.name?.toUpperCase() || 'FLAGSHIP AUDIO'}
                </span>
              </div>

              <h2
                style={{
                  fontSize: '1.5rem',
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)',
                }}
              >
                {showcaseItem.title}
              </h2>

              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                {showcaseItem.short_description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    Verified Price
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {formatPrice(showcaseItem.price, 'USD')}
                  </div>
                </div>

                <div
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <Link
                    href={`/products/${showcaseItem.slug}`}
                    className="btn btn-secondary btn-sm"
                  >
                    In-Depth Review
                  </Link>
                  <Link
                    href={`/products/${showcaseItem.slug}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Product Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
