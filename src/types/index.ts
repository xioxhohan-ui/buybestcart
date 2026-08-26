export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role_id?: string;
  is_active: boolean;
  last_login?: string;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  website?: string;
  seo_title?: string;
  seo_description?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  parent_id?: string | null;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  og_image?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  depth: number;
  product_count: number;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seo_title?: string;
  seo_description?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSpecification {
  id?: string;
  product_id?: string;
  spec_key: string;
  spec_value: string;
  display_order?: number;
}

export interface ProductFeature {
  id?: string;
  product_id?: string;
  feature: string;
  display_order?: number;
}

export interface ProductImage {
  id?: string;
  product_id?: string;
  url: string;
  alt_text?: string;
  title?: string;
  caption?: string;
  display_order?: number;
  is_primary?: boolean;
}

export interface ProductMarketplace {
  id: string;
  product_id: string;
  marketplace_id: string;
  asin: string;
  price?: number;
  currency?: string;
  url?: string;
  availability?: string;
  rating?: number;
  review_count?: number;
  last_synced?: string;
  api_source?: string;
}

export type ProductStatus =
  | 'draft'
  | 'active'
  | 'featured'
  | 'archived'
  | 'unavailable'
  | 'needs_review'
  | 'pending_sync'
  | 'api_error';

export type ProductContentSource =
  | 'amazon_api'
  | 'manual'
  | 'editorial'
  | 'imported'
  | 'mock_test'
  | 'ai_assisted';

export type ProductBadge =
  | 'Best Overall'
  | 'Best Budget'
  | 'Best Value'
  | 'Editor\'s Choice'
  | 'Premium Pick'
  | 'Popular'
  | 'New'
  | 'Deal'
  | string;

export interface Product {
  id: string;
  asin?: string;
  title: string;
  slug: string;
  brand_id?: string | null;
  category_id?: string | null;
  manufacturer?: string;
  short_description?: string;
  description?: string;
  thumbnail_url?: string;
  rating?: number;
  review_count?: number;
  price?: number;
  currency?: string;
  list_price?: number;
  availability?: string;
  amazon_url?: string;
  affiliate_url?: string;
  global_rank?: number;
  category_rank?: number;
  editorial_score?: number;
  is_featured: boolean;
  is_editor_choice: boolean;
  is_deal?: boolean;
  show_in_deals?: boolean;
  compliance_status?: 'compliant' | 'warning' | 'violation' | 'blocked';
  compliance_issues?: any[];
  is_template?: boolean;
  template_data?: Record<string, any>;
  badge_text?: ProductBadge;
  deal_status: 'none' | 'limited_deal' | 'top_deal' | 'lightning_deal';
  status: ProductStatus;
  content_source: ProductContentSource;
  pros?: string[];
  cons?: string[];
  editor_verdict?: string;
  best_for?: string;
  buying_advice?: string;
  why_we_like_it?: string;
  who_should_buy?: string;
  who_should_avoid?: string;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  og_image?: string;
  last_api_sync?: string;
  views_count: number;
  clicks_count: number;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: Category;
  specifications?: ProductSpecification[];
  features?: ProductFeature[];
  key_highlights?: string[];
  images?: ProductImage[];
  marketplaces?: ProductMarketplace[];
}

export interface AffiliateMarketplace {
  id: string;
  name: string;
  country: string;
  country_code: string;
  domain: string;
  currency: string;
  locale?: string;
  language: string;
  partner_tag?: string;
  tracking_id?: string;
  api_region?: string;
  flag_emoji?: string;
  is_active: boolean;
  is_enabled?: boolean;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export type ArticleType =
  | 'article'
  | 'review'
  | 'guide'
  | 'comparison'
  | 'how_to'
  | 'faq'
  | 'roundup'
  | 'deal_guide';

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface ProductSpecItem {
  name: string;
  value: string;
}

export interface TopProductItem {
  id?: string;
  product_id?: string;
  position: number;
  rank?: number;
  title: string;
  thumbnail_url?: string;
  gallery_images?: string[];
  price?: number;
  list_price?: number;
  currency?: string;
  availability?: string;
  badge?: string;
  award_label?: string;
  custom_award_label?: string;
  short_description?: string;
  full_description?: string;
  highlights?: string[];
  specifications?: ProductSpecItem[];
  important_features?: string[];
  pros?: string[];
  cons?: string[];
  best_for?: string;
  avoid_if?: string;
  performance_notes?: string;
  custom_notes?: string;
  video_url?: string;
  video_title?: string;
  affiliate_url?: string;
  buy_url?: string;
  cta_text?: string;
  asin?: string;
  product_slug?: string;
  rating?: number;
  score?: number;
  ranking_reason?: string;
  review_count?: number;
}

export interface ArticleVideo {
  id: string;
  title?: string;
  url: string;
  caption?: string;
  display_order?: number;
}

export interface EvaluationCriterion {
  name: string;
  weight?: string;
  description?: string;
}

export interface HowWeTestedData {
  enabled?: boolean;
  title?: string;
  summary?: string;
  testing_process?: string;
  testing_environment?: string;
  what_was_tested?: string[];
  performance_observations?: string;
  comparison_method?: string;
  real_world_usage?: string;
  evaluation_criteria?: EvaluationCriterion[];
}

export interface BuyingFactor {
  title: string;
  description: string;
  importance?: 'critical' | 'important' | 'nice_to_have';
}

export interface WhatToLookForData {
  enabled?: boolean;
  title?: string;
  summary?: string;
  factors?: BuyingFactor[];
  additional_advice?: string;
}

export interface ArticleFaqItem {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  introduction?: string;
  how_we_tested?: HowWeTestedData;
  what_to_look_for?: WhatToLookForData;
  faqs?: ArticleFaqItem[];
  content: string;
  body?: string;
  featured_image?: string;
  type: ArticleType;
  content_type?: string;
  status: ArticleStatus;
  category_id?: string;
  author_id?: string;
  author_name?: string;
  author_role?: string;
  author_avatar?: string;
  reading_time_minutes?: number;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  og_image?: string;
  schema_type?: string;
  noindex?: boolean;
  compliance_status?: 'compliant' | 'warning' | 'violation' | 'blocked';
  compliance_issues?: any[];
  published_at?: string;
  publish_date?: string;
  modified_date?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: Profile;
  product_ids?: string[];
  top_products?: TopProductItem[];
  top_picks_summary?: any[];
  tags?: string[];
  videos?: ArticleVideo[];
}

export interface ArticleProduct {
  id: string;
  article_id: string;
  product_id: string;
  display_order: number;
  award_badge?: string;
  custom_title?: string;
  custom_short_description?: string;
  custom_full_description?: string;
  custom_price?: number;
  custom_currency?: string;
  custom_affiliate_url?: string;
  custom_asin?: string;
  custom_thumbnail_url?: string;
  ranking_score?: number;
  pros?: string[];
  cons?: string[];
  highlights?: string[];
  specifications?: ProductSpecItem[];
  performance_notes?: string;
  best_for?: string;
  avoid_if?: string;
  is_top_pick?: boolean;
  created_at?: string;
  updated_at?: string;
  product?: Product;
  article?: Article;
}

export type ComplianceSeverity = 'critical' | 'high' | 'warning' | 'info';
export type ComplianceStatus = 'open' | 'resolved' | 'dismissed' | 'auto_fixed';
export type ComplianceEntityType = 'product' | 'article' | 'comparison' | 'deal' | 'page' | 'global';

export interface ComplianceAudit {
  id: string;
  rule_id: string;
  rule_name: string;
  severity: ComplianceSeverity;
  entity_type: ComplianceEntityType;
  entity_id?: string | null;
  entity_title?: string | null;
  field_name?: string | null;
  violation_details: string;
  remediation_step?: string | null;
  status: ComplianceStatus;
  admin_action?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export type DealStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';

export interface Deal {
  id: string;
  title: string;
  slug: string;
  product_id?: string;
  marketplace_id?: string;
  deal_label: string;
  current_price: number;
  previous_price?: number;
  savings_percentage?: number;
  description?: string;
  badge?: string;
  start_date?: string;
  end_date?: string;
  priority: number;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  status: DealStatus;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Comparison {
  id: string;
  title: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  og_image?: string;
  product_a_id: string;
  product_b_id: string;
  winner_product_id?: string;
  verdict?: string;
  summary?: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  product_a?: Product;
  product_b?: Product;
  winner?: Product;
}


export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  badge?: string;
  seo_title?: string;
  seo_description?: string;
  cta_text?: string;
  cta_url?: string;
  product_ids?: string[];
  created_at: string;
  updated_at: string;
}
