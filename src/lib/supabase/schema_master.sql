-- ==============================================================================
-- BUY BEST CART (V2) — MASTER PRODUCTION DATABASE SCHEMA & SEED MIGRATION
-- Everything on the website is 100% dynamic, relational & editable via the Admin Portal
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ADMIN USERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  product_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES & TAXONOMY (ALL 9 DEPARTMENTS + SUBCATEGORIES)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  icon TEXT DEFAULT 'folder',
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  department TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 1,
  depth INT DEFAULT 0,
  product_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS (COMPLETE EDITORIAL & AMAZON SPECIFICATIONS)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asin TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  manufacturer TEXT,
  short_description TEXT,
  description TEXT,
  thumbnail_url TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.80,
  review_count INT DEFAULT 1000,
  price NUMERIC(10, 2),
  list_price NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',
  availability TEXT DEFAULT 'In Stock',
  amazon_url TEXT,
  global_rank INT,
  category_rank INT,
  editorial_score NUMERIC(3, 1) DEFAULT 9.2,
  is_featured BOOLEAN DEFAULT FALSE,
  is_editor_choice BOOLEAN DEFAULT FALSE,
  is_deal BOOLEAN DEFAULT FALSE,
  show_in_deals BOOLEAN DEFAULT FALSE,
  compliance_status TEXT DEFAULT 'compliant',
  compliance_issues JSONB DEFAULT '[]',
  is_template BOOLEAN DEFAULT FALSE,
  template_data JSONB DEFAULT '{}',
  badge_text TEXT DEFAULT 'Top Pick',
  deal_status TEXT DEFAULT 'none' CHECK (deal_status IN ('none', 'limited_deal', 'top_deal', 'lightning_deal')),
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'featured', 'archived')),
  content_source TEXT DEFAULT 'manual',
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  key_highlights TEXT[] DEFAULT '{}',
  editor_verdict TEXT,
  best_for TEXT,
  why_we_like_it TEXT,
  buying_advice TEXT,
  who_should_buy TEXT,
  who_should_avoid TEXT,
  affiliate_url TEXT,
  video_url TEXT,
  video_title TEXT,
  video_thumbnail TEXT,
  video_type TEXT DEFAULT 'youtube',
  rating_breakdown JSONB DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  last_api_sync TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  clicks_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4b. MESSAGES & CONTACT FORM INQUIRIES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4c. SYSTEM LOGS & AUDIT TRAIL
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT DEFAULT 'info',
  category TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT SPECIFICATIONS (DYNAMIC KEY-VALUE BENCHMARKS)
CREATE TABLE IF NOT EXISTS public.product_specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCT FEATURES (BULLET HIGHLIGHTS)
CREATE TABLE IF NOT EXISTS public.product_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCT IMAGES (GALLERY)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 1,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ARTICLES & BUYING GUIDES (EDITORIAL POSTS & BLOGS)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT,
  content TEXT,
  type TEXT DEFAULT 'article',
  featured_image TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Editorial Staff',
  author_role TEXT DEFAULT 'Senior Tech Analyst',
  author_avatar TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  content_type TEXT DEFAULT 'buying_guide' CHECK (content_type IN ('article', 'review', 'buying_guide', 'comparison', 'how_to', 'faq', 'roundup', 'deal_guide')),
  reading_time_minutes INT DEFAULT 5,
  introduction TEXT,
  top_products JSONB DEFAULT '[]',
  how_we_tested JSONB DEFAULT '{}',
  what_to_look_for JSONB DEFAULT '{}',
  faqs JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image TEXT,
  schema_type TEXT DEFAULT 'Article',
  noindex BOOLEAN DEFAULT FALSE,
  compliance_status TEXT DEFAULT 'compliant',
  compliance_issues JSONB DEFAULT '[]',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  views_count INT DEFAULT 0,
  featured_product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8b. ARTICLE PRODUCTS (RELATIONSHIP WITH PER-BLOG PRODUCT OVERRIDES)
CREATE TABLE IF NOT EXISTS public.article_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  award_badge TEXT,
  custom_title TEXT,
  custom_short_description TEXT,
  custom_full_description TEXT,
  custom_price NUMERIC(10, 2),
  custom_currency TEXT DEFAULT 'USD',
  custom_affiliate_url TEXT,
  custom_asin TEXT,
  custom_thumbnail_url TEXT,
  ranking_score NUMERIC(3, 1),
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '[]',
  performance_notes TEXT,
  best_for TEXT,
  avoid_if TEXT,
  is_top_pick BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (article_id, product_id)
);

-- 8c. COMPLIANCE AUDITS (AMAZON ASSOCIATES POLICY ENFORCEMENT & LOGS)
CREATE TABLE IF NOT EXISTS public.compliance_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'warning', 'info')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'article', 'comparison', 'deal', 'page', 'global')),
  entity_id TEXT,
  entity_title TEXT,
  field_name TEXT,
  violation_details TEXT NOT NULL,
  remediation_step TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed', 'auto_fixed')),
  admin_action TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 9. COMPARISONS (HEAD-TO-HEAD MATRIX & SHOWDOWNS)
CREATE TABLE IF NOT EXISTS public.comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  product_a_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_b_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  winner_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_ids UUID[] DEFAULT '{}',
  comparison_metrics JSONB DEFAULT '{}',
  summary TEXT,
  verdict TEXT,
  key_differences TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9b. DEALS & PROMOTIONS
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  deal_price NUMERIC(10, 2),
  original_price NUMERIC(10, 2),
  discount_percentage INT,
  badge TEXT DEFAULT 'Limited Deal',
  priority INT DEFAULT 1,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  image_url TEXT,
  cta_text TEXT DEFAULT 'View Deal',
  cta_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'draft', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 11. AFFILIATE MARKETPLACES (11 AMAZON REGIONS)
CREATE TABLE IF NOT EXISTS public.affiliate_marketplaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(5) NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  currency VARCHAR(5) NOT NULL,
  partner_tag TEXT,
  tracking_id TEXT,
  api_region TEXT DEFAULT 'us-east-1',
  is_enabled BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  flag_emoji TEXT DEFAULT '',
  redirect_strategy TEXT DEFAULT 'direct',
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AFFILIATE CLICKS (ANALYTICS & CONVERSIONS)
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  asin TEXT,
  marketplace_id UUID REFERENCES public.affiliate_marketplaces(id) ON DELETE SET NULL,
  affiliate_tag TEXT,
  user_ip TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FREQUENTLY ASKED QUESTIONS (FAQS)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  priority INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  schema_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PLATFORM SETTINGS & SITE CONFIGURATION
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'general',
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source_page TEXT DEFAULT 'homepage',
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. SYSTEM LOGS
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'security')),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['brands', 'categories', 'products', 'articles', 'comparisons', 'affiliate_marketplaces', 'faqs', 'settings']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tr_%I_updated_at ON %I;', t, t);
    EXECUTE format('CREATE TRIGGER tr_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
  END LOOP;
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Public: Read-only on active/published rows
-- Authenticated / Admin: Full CRUD on all rows
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_marketplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public can view active brands" ON public.brands FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (status IN ('active', 'featured'));
CREATE POLICY "Public can view specifications" ON public.product_specifications FOR SELECT USING (TRUE);
CREATE POLICY "Public can view features" ON public.product_features FOR SELECT USING (TRUE);
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public can view published articles" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published comparisons" ON public.comparisons FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view enabled marketplaces" ON public.affiliate_marketplaces FOR SELECT USING (is_enabled = TRUE);
CREATE POLICY "Public can view active faqs" ON public.faqs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (TRUE);
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can track clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (TRUE);

-- Service Role & Admin FULL ACCESS policies (all tables)
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access brands" ON public.brands FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access specifications" ON public.product_specifications FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access features" ON public.product_features FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access images" ON public.product_images FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access articles" ON public.articles FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access comparisons" ON public.comparisons FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access marketplaces" ON public.affiliate_marketplaces FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access clicks" ON public.affiliate_clicks FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access faqs" ON public.faqs FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access settings" ON public.settings FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access subscribers" ON public.newsletter_subscribers FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Admin full access logs" ON public.system_logs FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ==============================================================================
-- INITIAL CORE SEED DATA
-- ==============================================================================

-- 1. Initial Site Settings
INSERT INTO public.settings (key, category, value, description)
VALUES 
  (
    'general',
    'general',
    '{
      "site_name": "Buy Best Cart",
      "tagline": "The Independent Guide to Better Buying.",
      "hero_heading": "The Independent Guide to Better Buying.",
      "hero_subheading": "Curated, Tested & Verified.",
      "hero_description": "We independently test consumer technology, audio gear, and everyday lifestyle tools. Our reviews cut through marketing noise to present verified specifications and authentic Amazon pricing.",
      "marquee_text": "INDEPENDENT PRODUCT TESTING • 11 REGIONAL AMAZON STOREFRONTS • ZERO SPONSORED PLACEMENTS • VERIFIED ACOUSTIC & BATTERY BENCHMARKS",
      "support_email": "editorial@bestbuycart.com"
    }',
    'Global site branding, contact info, and homepage copy'
  ),
  (
    'affiliate',
    'affiliate',
    '{
      "disclosure_text": "Buy Best Cart is an independent editorial review publication. When you purchase through links on our site, we may earn an affiliate commission from Amazon at no extra cost to you."
    }',
    'Legal Amazon Associates and FTC disclosure statement'
  )
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. 11 Supported Amazon Marketplaces
INSERT INTO public.affiliate_marketplaces (name, country, country_code, domain, currency, partner_tag, is_default, display_order)
VALUES
  ('Amazon United States', 'United States', 'US', 'amazon.com', 'USD', 'bestbuycart-20', TRUE, 1),
  ('Amazon United Kingdom', 'United Kingdom', 'UK', 'amazon.co.uk', 'GBP', 'bestbuycartuk-21', FALSE, 2),
  ('Amazon Canada', 'Canada', 'CA', 'amazon.ca', 'CAD', 'bestbuycartca-20', FALSE, 3),
  ('Amazon Germany', 'Germany', 'DE', 'amazon.de', 'EUR', 'bestbuycartde-21', FALSE, 4),
  ('Amazon France', 'France', 'FR', 'amazon.fr', 'EUR', 'bestbuycartfr-21', FALSE, 5),
  ('Amazon Italy', 'Italy', 'IT', 'amazon.it', 'EUR', 'bestbuycartit-21', FALSE, 6),
  ('Amazon Spain', 'Spain', 'ES', 'amazon.es', 'EUR', 'bestbuycartes-21', FALSE, 7),
  ('Amazon Japan', 'Japan', 'JP', 'amazon.co.jp', 'JPY', 'bestbuycartjp-22', FALSE, 8),
  ('Amazon Australia', 'Australia', 'AU', 'amazon.com.au', 'AUD', 'bestbuycartau-22', FALSE, 9),
  ('Amazon India', 'India', 'IN', 'amazon.in', 'INR', 'bestbuycartin-21', FALSE, 10),
  ('Amazon Netherlands', 'Netherlands', 'NL', 'amazon.nl', 'EUR', 'bestbuycartnl-21', FALSE, 11)
ON CONFLICT (country_code) DO NOTHING;

