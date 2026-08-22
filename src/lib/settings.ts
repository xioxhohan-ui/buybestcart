import { createServerClient } from '@/lib/supabase/server';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter_x?: string;
  reddit?: string;
  pinterest?: string;
  linkedin?: string;
}

export interface ThemeTokens {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  muted_text_color: string;
  border_color: string;
  button_radius: string;
  card_radius: string;
  shadow_intensity: 'subtle' | 'medium' | 'elevated';
  font_family: string;
  heading_weight: string;
  body_weight: string;
  layout_density: 'comfortable' | 'compact';
}

export interface BrandSettings {
  site_name: string;
  tagline: string;
  company_name: string;
  brand_description: string;
  logo_url: string;
  logo_dark_url: string;
  logo_mobile_url: string;
  favicon_url: string;
  footer_logo_url: string;
  browser_theme_color: string;
  og_default_image: string;
  default_social_image: string;
  contact_email: string;
  support_email: string;
  social_links: SocialLinks;
}

export interface SiteConfiguration extends BrandSettings, ThemeTokens {
  hero_heading: string;
  hero_subheading: string;
  hero_description: string;
  marquee_text: string;
  announcement_enabled: boolean;
  announcement_text: string;
  announcement_link_text: string;
  announcement_link_url: string;
  disclosure_text: string;
  feature_flags: {
    dark_mode: boolean;
    price_tracking: boolean;
    multi_region: boolean;
    comparisons: boolean;
    newsletter: boolean;
    user_reviews: boolean;
  };
  homepage_sections: Array<{
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    enabled: boolean;
    order: number;
    display_count?: number;
  }>;
}

export const DEFAULT_SITE_CONFIG: SiteConfiguration = {
  // Brand Settings
  site_name: 'Buy Best Cart',
  tagline: 'The Independent Guide to Better Buying.',
  company_name: 'Buy Best Cart Media Inc.',
  brand_description:
    'An independent consumer technology review publication and buying guide platform with laboratory testing and verified Amazon partner integration.',
  logo_url: '',
  logo_dark_url: '',
  logo_mobile_url: '',
  favicon_url: '/favicon.ico',
  footer_logo_url: '',
  browser_theme_color: '#1C1917',
  og_default_image: 'https://buybestcart.shop/og-image.png',
  default_social_image: 'https://buybestcart.shop/og-image.png',
  contact_email: 'contact@buybestcart.shop',
  support_email: 'editorial@buybestcart.shop',
  social_links: {
    facebook: 'https://facebook.com/buybestcart',
    instagram: 'https://instagram.com/buybestcart',
    youtube: 'https://youtube.com/@buybestcart',
    twitter_x: 'https://x.com/buybestcart',
    reddit: 'https://reddit.com/r/buybestcart',
  },

  // Theme Design System Tokens
  primary_color: '#1C1917',
  secondary_color: '#57534E',
  accent_color: '#1B4332',
  background_color: '#FAF9F5',
  surface_color: '#FFFFFF',
  text_color: '#1C1917',
  muted_text_color: '#8C857B',
  border_color: '#E7E5E4',
  button_radius: '6px',
  card_radius: '8px',
  shadow_intensity: 'subtle',
  font_family: 'Playfair Display, Newsreader, Georgia, serif',
  heading_weight: '700',
  body_weight: '400',
  layout_density: 'comfortable',

  // Hero & Content
  hero_heading: 'The Independent Guide to Better Buying.',
  hero_subheading: 'Curated, Tested & Verified.',
  hero_description:
    'We independently test consumer technology, audio gear, and everyday lifestyle tools. Our reviews cut through marketing noise to present verified specifications and authentic Amazon pricing.',
  marquee_text:
    'INDEPENDENT PRODUCT TESTING • 11 REGIONAL AMAZON STOREFRONTS • ZERO SPONSORED PLACEMENTS • VERIFIED ACOUSTIC & BATTERY BENCHMARKS',
  announcement_enabled: true,
  announcement_text: 'Discover better products, smarter comparisons & the latest verified Amazon deals.',
  announcement_link_text: 'Browse 2026 Picks →',
  announcement_link_url: '/#featured-picks',
  disclosure_text:
    'Buy Best Cart is an independent editorial review publication. When you purchase through links on our site, we may earn an affiliate commission from Amazon at no extra cost to you.',
  feature_flags: {
    dark_mode: false,
    price_tracking: true,
    multi_region: true,
    comparisons: true,
    newsletter: true,
    user_reviews: false,
  },
  homepage_sections: [
    { id: 'sec-hero', type: 'hero', title: 'Hero Showcase', enabled: true, order: 1 },
    { id: 'sec-marquee', type: 'marquee', title: 'Running Ticker', enabled: true, order: 2 },
    { id: 'sec-stats', type: 'stats', title: 'Editorial Trust Stats', enabled: true, order: 3 },
    { id: 'sec-picks', type: 'picks', title: 'Editors Top Selections', subtitle: 'The 2026 Edit', enabled: true, order: 4, display_count: 8 },
    { id: 'sec-trending', type: 'trending', title: 'Trending on Amazon Right Now', subtitle: 'High Velocity Picks', enabled: true, order: 5, display_count: 4 },
    { id: 'sec-comparison', type: 'comparison', title: 'Flagship Product Showdown', subtitle: 'Head-to-Head Comparison', enabled: true, order: 6 },
    { id: 'sec-deals', type: 'deals', title: 'Today Highlighted Deals', subtitle: 'Time-Sensitive Value', enabled: true, order: 7, display_count: 4 },
    { id: 'sec-categories', type: 'categories', title: 'Explore 9 Departments', enabled: true, order: 8 },
    { id: 'sec-guides', type: 'guides', title: '2026 In-Depth Buying Guides', subtitle: 'Editorial Archive', enabled: true, order: 9, display_count: 3 },
    { id: 'sec-standards', type: 'standards', title: 'Why Millions Trust Our Recommendations', subtitle: 'Our Editorial Standard', enabled: true, order: 10 },
    { id: 'sec-newsletter', type: 'newsletter', title: 'The Weekly Shopping Edit', enabled: true, order: 11 },
    { id: 'sec-faq', type: 'faq', title: 'Frequently Asked Questions', subtitle: 'Common Questions', enabled: true, order: 12 },
    { id: 'sec-cta', type: 'cta', title: 'Find the Perfect Product for Your Lifestyle', enabled: true, order: 13 },
  ],
};

let cachedConfig: { data: SiteConfiguration; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function clearSiteConfigCache() {
  cachedConfig = null;
}

export async function getSiteConfiguration(): Promise<SiteConfiguration> {
  const now = Date.now();
  if (cachedConfig && now - cachedConfig.timestamp < CACHE_TTL_MS) {
    return cachedConfig.data;
  }

  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('settings').select('*');

    if (!data || data.length === 0) {
      cachedConfig = { data: DEFAULT_SITE_CONFIG, timestamp: now };
      return DEFAULT_SITE_CONFIG;
    }

    const config = { ...DEFAULT_SITE_CONFIG };

    data.forEach((row) => {
      if (row.key === 'general' && row.value) {
        Object.assign(config, row.value);
      }
      if (row.key === 'branding' && row.value) {
        Object.assign(config, row.value);
      }
      if (row.key === 'theme' && row.value) {
        Object.assign(config, row.value);
      }
      if (row.key === 'affiliate' && row.value?.disclosure_text) {
        config.disclosure_text = row.value.disclosure_text;
      }
      if (row.key === 'announcement' && row.value) {
        if (typeof row.value.enabled === 'boolean') config.announcement_enabled = row.value.enabled;
        if (row.value.text) config.announcement_text = row.value.text;
        if (row.value.link_text) config.announcement_link_text = row.value.link_text;
        if (row.value.link_url) config.announcement_link_url = row.value.link_url;
      }
      if (row.key === 'homepage_layout' && Array.isArray(row.value)) {
        config.homepage_sections = row.value;
      }
      if (row.key === 'feature_flags' && row.value) {
        config.feature_flags = { ...config.feature_flags, ...row.value };
      }
    });

    cachedConfig = { data: config, timestamp: now };
    return config;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}
