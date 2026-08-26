import React from 'react';
import Link from 'next/link';
import RegionSelector from './RegionSelector';
import { getSiteConfiguration } from '@/lib/settings';
import BrandLogo from '@/components/common/BrandLogo';
import { Category } from '@/types';
import { createServerClient } from '@/lib/supabase/server';

interface FooterProps {
  categories?: Category[];
}

export default async function Footer({ categories }: FooterProps) {
  const config = await getSiteConfiguration();
  const currentYear = new Date().getFullYear();

  let activeCategories = categories;
  if (!activeCategories) {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, is_active, display_order, parent_id')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(6);
    activeCategories = (data as unknown as Category[]) || [];
  }

  const topCategories = activeCategories.filter((c) => !c.parent_id);
  const social = config.social_links || {};

  return (
    <footer className="footer-wrap">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Editorial Colophon */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <Link href="/" style={{ textDecoration: 'none' }} title="Buy Best Cart">
                <BrandLogo size="lg" theme="dark" showTagline />
              </Link>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#A8A29E', lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: '340px' }}>
              {config.brand_description || 'An independent shopping magazine and technical review publication. We test, benchmark, and curate the finest products across 11 official Amazon marketplaces.'}
            </p>

            {/* Social Links (Only Active Render) */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {social.twitter_x && (
                <a href={social.twitter_x} target="_blank" rel="noopener noreferrer" style={{ color: '#D6D3D1', fontSize: '0.8125rem', fontWeight: 600 }}>
                  X / Twitter
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#D6D3D1', fontSize: '0.8125rem', fontWeight: 600 }}>
                  YouTube
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#D6D3D1', fontSize: '0.8125rem', fontWeight: 600 }}>
                  Instagram
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#D6D3D1', fontSize: '0.8125rem', fontWeight: 600 }}>
                  Facebook
                </a>
              )}
              {social.reddit && (
                <a href={social.reddit} target="_blank" rel="noopener noreferrer" style={{ color: '#D6D3D1', fontSize: '0.8125rem', fontWeight: 600 }}>
                  Reddit
                </a>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#78716C', fontWeight: 600 }}>MARKETPLACE:</span>
              <RegionSelector />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-col-title">CATEGORIES</h4>
            <ul className="footer-links">
              {topCategories.slice(0, 5).map((cat) => (
                <li key={cat.id || cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="footer-link">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li><Link href="/category" className="footer-link" style={{ color: 'var(--green-gold)', fontWeight: 600 }}>All Departments →</Link></li>
            </ul>
          </div>

          {/* Research & Editorial */}
          <div>
            <h4 className="footer-col-title">EDITORIAL</h4>
            <ul className="footer-links">
              <li><Link href="/products" className="footer-link">All Tested Products</Link></li>
              <li><Link href="/deals" className="footer-link">Curated Deals</Link></li>
              <li><Link href="/guides" className="footer-link">Buying Guides</Link></li>
              <li><Link href="/compare" className="footer-link">Product Comparisons</Link></li>
              <li><Link href="/how-we-rank" className="footer-link">Our Testing Standards</Link></li>
              <li><Link href="/about" className="footer-link">About the Publication</Link></li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div>
            <h4 className="footer-col-title">STANDARDS</h4>
            <ul className="footer-links">
              <li><Link href="/affiliate-disclosure" className="footer-link" style={{ color: 'var(--green-gold)', fontWeight: 600 }}>Amazon Affiliate Disclosure</Link></li>
              <li><Link href="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="/terms" className="footer-link">Terms of Use</Link></li>
              <li><Link href="/contact" className="footer-link">Contact Editorial Staff</Link></li>
            </ul>
          </div>
        </div>

        {/* Amazon Associates Mandatory Compliance Statement */}
        <div style={{ borderTop: '1px solid #292524', paddingTop: '1.5rem', marginTop: '2.25rem', color: '#D6D3D1', fontSize: '0.8125rem', lineHeight: 1.65 }}>
          <div style={{ fontWeight: 700, color: '#FAF9F5', fontSize: '0.875rem', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
            &ldquo;{config.amazon_associate_statement || 'As an Amazon Associate I earn from qualifying purchases.'}&rdquo;
          </div>
          <p style={{ margin: '0 0 0.5rem 0', color: '#A8A29E', fontSize: '0.75rem', maxWidth: '900px' }}>
            {config.disclosure_text || 'Buy Best Cart is an independent, reader-supported publication. When you buy through links on our site, we may earn an affiliate commission from Amazon and other verified retail partners at no extra cost to you. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.'}{' '}
            <Link href="/affiliate-disclosure" style={{ color: '#FAF9F5', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 600 }}>
              Amazon Affiliate Disclosure →
            </Link>
          </p>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span>© {currentYear} {config.company_name || config.site_name.toUpperCase()}. INDEPENDENT EDITORIAL PUBLICATION. NOT AFFILIATED WITH BEST BUY CO., INC.</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/privacy-policy" className="footer-link">Privacy</Link>
              <Link href="/terms" className="footer-link">Terms</Link>
              <Link href="/sitemap.xml" className="footer-link">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
