# Best Buy Cart (v2) — Amazon Affiliate Product Discovery Platform

Best Buy Cart is an enterprise-grade, high-performance Amazon Affiliate Product Discovery, Comparison, Review, Ranking, and Deals platform built with **Next.js 14/15, TypeScript, Supabase (PostgreSQL), and Editorial CSS**.

---

## ⚡ Key Architecture & Features

1. **Pure Discovery & Affiliate Architecture (No Internal Commerce)**:
   - Does **not** process direct payments or hold inventory.
   - Centralized Amazon affiliate link routing engine (`/go/[slug]`) targeting official regional Amazon stores.
   - Fallback protection ensures visitors always reach Amazon even if analytics services fail.

2. **11 Supported Amazon Regional Marketplaces**:
   - 🇺🇸 United States (`amazon.com`)
   - 🇬🇧 United Kingdom (`amazon.co.uk`)
   - 🇨🇦 Canada (`amazon.ca`)
   - 🇩🇪 Germany (`amazon.de`)
   - 🇫🇷 France (`amazon.fr`)
   - 🇮🇹 Italy (`amazon.it`)
   - 🇪🇸 Spain (`amazon.es`)
   - 🇳🇱 Netherlands (`amazon.nl`)
   - 🇸🇪 Sweden (`amazon.se`)
   - 🇵🇱 Poland (`amazon.pl`)
   - 🇦🇺 Australia (`amazon.com.au`)

3. **Master Administration Gateway (`/shohan`)**:
   - Master path: `http://localhost:3000/shohan`
   - Real-time catalog management with ASIN overrides and rank positioning.
   - Marketplace partner tag manager and PA-API connection tester.
   - Outbound click tracker, CTR metrics, and user search demand logs.
   - Fully editable site name, taglines, and legal affiliate disclosures.

4. **SEO & Structured Data Engine**:
   - Automated Schema.org JSON-LD generation (`Product`, `BreadcrumbList`, `Article`, `FAQPage`, `WebSite`, `SearchAction`).
   - Dynamic XML sitemaps (`/sitemap.xml`) splitting products, categories, and buying guides.
   - Strict `robots.txt` configuration safeguarding administrative endpoints.

5. **Classic & Editorial Design**:
   - Custom vanilla CSS design system adhering to strict typography and readability standards.
   - Zero Tailwind or bloated frameworks.
   - Fully responsive across 320px mobile to 4K displays.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or 20+
- Active Supabase project (Pre-configured)

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure your Supabase project URL and Anon keys are defined:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lqydjbdzwmttbnubgtbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_AMAZON_TAG_US=bestbuycart-20
```

### 3. Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Admin Access
Visit [http://localhost:3000/shohan](http://localhost:3000/shohan) to access the management panel.

---

## 🛡️ Amazon Associates Compliance Notice
Best Buy Cart is a participant in the Amazon Services LLC Associates Program. Every primary Call-To-Action (CTA) clearly identifies the destination as Amazon and includes appropriate `rel="nofollow sponsored noopener"` attributes.
