import React from 'react';
import Link from 'next/link';
import { Search, Compass, ArrowLeft, Home } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '5rem 1.5rem 6rem 1.5rem', maxWidth: '720px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'var(--green-light)', color: 'var(--green-accent)', marginBottom: '1.5rem' }}>
        <Compass size={36} />
      </div>

      <div className="editorial-eyebrow">ERROR 404 • PAGE NOT FOUND</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
        We Couldn&apos;t Locate That Page
      </h1>
      <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
        The product review, category archive, or link you requested may have moved or been updated. Try searching below or explore popular shopping departments.
      </p>

      {/* Embedded Search Bar */}
      <div style={{ maxWidth: '480px', margin: '0 auto 2.5rem auto' }}>
        <SearchBar />
      </div>

      {/* Quick Navigation Links */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <Link href="/" className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Home size={15} />
          <span>Return Home</span>
        </Link>
        <Link href="/category" className="btn btn-secondary">
          All 9 Departments
        </Link>
        <Link href="/deals" className="btn btn-secondary">
          Today&apos;s Deals
        </Link>
        <Link href="/products" className="btn btn-secondary">
          All Products
        </Link>
      </div>
    </div>
  );
}
