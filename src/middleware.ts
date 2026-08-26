import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Technical SEO Crawl Protection: Exclude Private / Affiliate / API / Search Routes
  if (
    pathname.startsWith('/shohan') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/go') ||
    pathname.startsWith('/search')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  }

  // 2. Direct Canonical URL Normalization: Lowercase, trailing-slash, multi-slash in 1 single 301 hop
  if (!pathname.startsWith('/shohan') && !pathname.startsWith('/api') && !pathname.startsWith('/go')) {
    let normalized = pathname.toLowerCase().replace(/\/+/g, '/');
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    if (normalized !== pathname) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.pathname = normalized;
      return NextResponse.redirect(cleanUrl, 301);
    }
  }

  // 4. Security & Canonical Crawling Directives
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/media assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)',
  ],
};
