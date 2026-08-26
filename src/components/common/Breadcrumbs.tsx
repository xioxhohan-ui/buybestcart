import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ margin: '1rem 0 1.5rem 0' }}>
      <ol
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
          listStyle: 'none',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
        }}
      >
        <li>
          <Link href="/" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.url}>
              <li>/</li>
              <li>
                {isLast ? (
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }} aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.url} style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {item.name}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
