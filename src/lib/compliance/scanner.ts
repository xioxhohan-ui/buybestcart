import {
  ComplianceViolation,
  ComplianceScanResult,
  ComplianceConfig,
  ComplianceSeverity,
} from './types';
import { AMAZON_COMPLIANCE_RULES, DEFAULT_COMPLIANCE_CONFIG } from './rules';
import { Product, Article } from '@/types';

/**
 * Validates any outbound URL against Amazon link compliance rules (Rules #2, #7, #10)
 */
export function scanUrl(
  url: string,
  context?: { field?: string; countryCode?: string; config?: ComplianceConfig }
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  if (!url || typeof url !== 'string' || !url.trim()) return violations;

  const config = context?.config || DEFAULT_COMPLIANCE_CONFIG;
  const fieldName = context?.field || 'affiliate_url';
  const cleanUrl = url.trim().toLowerCase();

  // Rule #7: Check for prohibited shortener domains (bit.ly, tinyurl, etc.)
  for (const shortener of config.disallowed_url_domains) {
    if (cleanUrl.includes(shortener)) {
      violations.push({
        id: `viol-url-shortener-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: 'AMZ-RULE-07',
        ruleNumber: 7,
        title: 'Prohibited Link Shortener Detected',
        category: 'url_cloaking',
        severity: 'critical',
        field: fieldName,
        message: `URL contains blacklisted shortener domain "${shortener}". Amazon strictly prohibits cloaking or disguising affiliate links.`,
        remediation:
          'Replace with direct Amazon product URL (https://www.amazon.com/dp/ASIN?tag=...) or internal transparent redirect (/go/[slug]).',
        offendingValue: url,
        suggestedValue: 'https://www.amazon.com/dp/B0XXXXXXXX?tag=bestbuycart-20',
        amazonPolicyRef: 'Associates Program Policies § 3 (Link Formatting)',
        blocking: true,
      });
      break;
    }
  }

  // Rule #10: Check if Amazon URL has a tag parameter
  if (cleanUrl.includes('amazon.') || cleanUrl.includes('amzn.to')) {
    if (!cleanUrl.includes('tag=') && !cleanUrl.includes('amzn.to')) {
      violations.push({
        id: `viol-url-tag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: 'AMZ-RULE-10',
        ruleNumber: 10,
        title: 'Missing Amazon Associate Partner Tag',
        category: 'marketplace_tags',
        severity: 'high',
        field: fieldName,
        message: 'Amazon URL is missing the required "?tag=..." tracking parameter.',
        remediation: 'Append your valid regional Amazon Associates tracking ID (e.g. ?tag=bestbuycart-20).',
        offendingValue: url,
        amazonPolicyRef: 'Associates Program Operating Agreement § 1',
        blocking: true,
      });
    }

    // Check regional tag mismatch if countryCode provided
    if (context?.countryCode && context.countryCode.toUpperCase() === 'GB' && cleanUrl.includes('bestbuycart-20')) {
      violations.push({
        id: `viol-tag-mismatch-${Date.now()}`,
        ruleId: 'AMZ-RULE-10',
        ruleNumber: 10,
        title: 'Regional Tag Mismatch (US Tag on UK Store)',
        category: 'marketplace_tags',
        severity: 'high',
        field: fieldName,
        message: 'US associate tag (bestbuycart-20) used on UK Amazon storefront. UK requires bestbuycartuk-21.',
        remediation: 'Update tag parameter to your registered UK associate ID: bestbuycartuk-21.',
        offendingValue: url,
        amazonPolicyRef: 'Associates Program Operating Agreement § 1',
        blocking: false,
      });
    }
  }

  return violations;
}

/**
 * Validates text content (title, excerpt, description, body) for forbidden trademark claims (Rules #8, #9)
 */
export function scanContent(
  text: string,
  context?: { field?: string; title?: string; config?: ComplianceConfig }
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  if (!text || typeof text !== 'string' || !text.trim()) return violations;

  const config = context?.config || DEFAULT_COMPLIANCE_CONFIG;
  const fieldName = context?.field || 'content';
  const lowerText = text.toLowerCase();

  // Rule #9: Check for forbidden endorsement / certified claims
  for (const forbiddenPhrase of config.forbidden_trademark_phrases) {
    if (lowerText.includes(forbiddenPhrase)) {
      violations.push({
        id: `viol-trademark-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: 'AMZ-RULE-09',
        ruleNumber: 9,
        title: 'Prohibited Endorsement or Certification Claim',
        category: 'endorsement_claims',
        severity: 'critical',
        field: fieldName,
        message: `Content contains forbidden phrase "${forbiddenPhrase}". Associates may not claim official endorsement, certification, or partnership with Amazon.`,
        remediation: `Remove "${forbiddenPhrase}". Clarify that Buy Best Cart is an independent review publication.`,
        offendingValue: forbiddenPhrase,
        amazonPolicyRef: 'Associates Program Operating Agreement § 4 (Relationship of Parties)',
        blocking: true,
      });
    }
  }

  // Rule #8: Check for deceptive button / CTA action wording
  const deceptiveCtaPhrases = [
    'amazon official store',
    'buy direct from amazon warehouse official',
    'amazon certified warranty',
    'amazon guaranteed authentic by us',
  ];

  for (const deceptive of deceptiveCtaPhrases) {
    if (lowerText.includes(deceptive)) {
      violations.push({
        id: `viol-cta-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: 'AMZ-RULE-08',
        ruleNumber: 8,
        title: 'Deceptive Action Button or Wording',
        category: 'trademark_logo',
        severity: 'high',
        field: fieldName,
        message: `Action text contains deceptive phrasing "${deceptive}".`,
        remediation: 'Use approved CTA wording like "View on Amazon" or "Buy on Amazon".',
        offendingValue: deceptive,
        amazonPolicyRef: 'Associates Program Trademark Guidelines § 1',
        blocking: true,
      });
    }
  }

  // Rule #8: Check for embedded Amazon logo graphics/SVGs/filenames in content or CTAs
  const prohibitedLogoReferences = [
    'amazon-logo',
    'amazon_logo',
    'amazon.svg',
    'amazon_smile',
    'amazon-smile',
    'amazon-icon',
    'amazon_icon',
    'logo-amazon',
  ];
  for (const logoRef of prohibitedLogoReferences) {
    if (lowerText.includes(logoRef)) {
      violations.push({
        id: `viol-logo-ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ruleId: 'AMZ-RULE-08',
        ruleNumber: 8,
        title: 'Prohibited Amazon Logo Graphic Detected',
        category: 'trademark_logo',
        severity: 'high',
        field: fieldName,
        message: `Content or CTA contains prohibited Amazon logo reference "${logoRef}". Buy Best Cart mandates clean text-only CTAs without Amazon logos.`,
        remediation: 'Remove the Amazon logo graphic and use clean text-only CTA (e.g. "Buy on Amazon ↗").',
        offendingValue: logoRef,
        amazonPolicyRef: 'Associates Program Trademark Guidelines § 1',
        blocking: true,
      });
      break;
    }
  }

  return violations;
}

/**
 * Validates product image URL (Rule #3 & Rule #8)
 */
export function scanImage(
  imageUrl: string,
  context?: { field?: string; config?: ComplianceConfig }
): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) return violations;

  const config = context?.config || DEFAULT_COMPLIANCE_CONFIG;
  const fieldName = context?.field || 'thumbnail_url';
  const cleanUrl = imageUrl.trim().toLowerCase();

  // Rule #8: Ensure image is not an Amazon logo asset
  const logoKeywords = ['amazon-logo', 'amazon_logo', 'amazon_smile', 'amazon.svg', 'amazon-icon', 'amazon_icon'];
  if (logoKeywords.some((k) => cleanUrl.includes(k))) {
    violations.push({
      id: `viol-img-logo-${Date.now()}`,
      ruleId: 'AMZ-RULE-08',
      ruleNumber: 8,
      title: 'Prohibited Amazon Logo Image Asset',
      category: 'trademark_logo',
      severity: 'high',
      field: fieldName,
      message: 'Product image or thumbnail appears to be an Amazon logo graphic rather than an authentic product photo.',
      remediation: 'Replace with authentic product photo or high-res catalog hardware rendering.',
      offendingValue: imageUrl,
      amazonPolicyRef: 'Associates Program Trademark Guidelines § 1',
      blocking: true,
    });
  }

  // If the image starts with http, check the host
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    try {
      const parsed = new URL(imageUrl);
      const host = parsed.hostname.toLowerCase();

      const isApprovedHost = config.approved_image_hosts.some((approved) =>
        host === approved || host.endsWith(`.${approved}`)
      );

      if (!isApprovedHost && (cleanUrl.includes('amazon') || cleanUrl.includes('ssl-images'))) {
        violations.push({
          id: `viol-img-host-${Date.now()}`,
          ruleId: 'AMZ-RULE-03',
          ruleNumber: 3,
          title: 'Unverified Amazon Image Hosting Domain',
          category: 'image_usage',
          severity: 'high',
          field: fieldName,
          message: `Image host "${host}" is not on the verified Amazon CDN whitelist.`,
          remediation: 'Use official Amazon PA-API CDN (m.media-amazon.com) or approved editorial CDN.',
          offendingValue: imageUrl,
          amazonPolicyRef: 'Associates Program Policies § 4 (Product Advertising API)',
          blocking: false,
        });
      }
    } catch {
      // Invalid URL
    }
  }

  return violations;
}

export type ScannableProduct = {
  id?: string;
  title?: string;
  asin?: string;
  price?: number | string | null;
  list_price?: number | string | null;
  short_description?: string | null;
  description?: string | null;
  editor_verdict?: string | null;
  thumbnail_url?: string | null;
  amazon_url?: string | null;
  affiliate_url?: string | null;
  buy_url?: string | null;
  badge_text?: string | null;
  [key: string]: any;
} | any;

export type ScannableArticle = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  introduction?: string | null;
  disclosure_included?: boolean;
  top_products?: any[];
  [key: string]: any;
} | any;

/**
 * Comprehensive Product Scanner (Validates Rules #1, #2, #3, #4, #7, #8, #9, #10)
 */
export function scanProduct(
  product: ScannableProduct,
  config: ComplianceConfig = DEFAULT_COMPLIANCE_CONFIG
): ComplianceScanResult {
  const violations: ComplianceViolation[] = [];
  let totalChecks = 0;

  // 1. Scan Affiliate URL & Amazon URL
  totalChecks += 2;
  const urlToCheck = product.affiliate_url || product.amazon_url || product.buy_url || '';
  if (urlToCheck) {
    violations.push(...scanUrl(urlToCheck, { field: 'amazon_url', config }));
  } else {
    violations.push({
      id: `viol-prod-missing-url-${Date.now()}`,
      ruleId: 'AMZ-RULE-02',
      ruleNumber: 2,
      title: 'Missing Merchant Destination Link',
      category: 'pre_cta_value',
      severity: 'warning',
      field: 'amazon_url',
      message: 'Product has no Amazon URL or affiliate destination link configured.',
      remediation: 'Provide a valid Amazon product URL with ASIN.',
      blocking: false,
    });
  }

  // 2. Scan Title for Forbidden Claims (Rule #9)
  totalChecks += 1;
  if (product.title) {
    violations.push(...scanContent(product.title, { field: 'title', config }));
  }

  // 3. Scan Descriptions & Verdicts (Rule #9)
  totalChecks += 3;
  if (product.short_description) {
    violations.push(...scanContent(product.short_description, { field: 'short_description', config }));
  }
  if (product.description) {
    violations.push(...scanContent(product.description, { field: 'description', config }));
  }
  if (product.editor_verdict) {
    violations.push(...scanContent(product.editor_verdict, { field: 'editor_verdict', config }));
  }

  // 4. Scan Images (Rule #3)
  totalChecks += 1;
  if (product.thumbnail_url) {
    violations.push(...scanImage(product.thumbnail_url, { field: 'thumbnail_url', config }));
  }

  // 5. Scan Pricing Disclaimer (Rule #4)
  totalChecks += 1;
  if (product.price !== undefined && product.price !== null) {
    if (product.price > 0 && !product.short_description && !product.description) {
      violations.push({
        id: `viol-prod-price-context-${Date.now()}`,
        ruleId: 'AMZ-RULE-02',
        ruleNumber: 2,
        title: 'Price Displayed Without Editorial Context',
        category: 'pre_cta_value',
        severity: 'medium',
        field: 'price',
        message: 'Product price is listed without substantive editorial review or description.',
        remediation: 'Add testing notes, pros/cons, or editorial summary.',
        blocking: false,
      });
    }
  }

  // 6. Scan CTA Button Label (Rule #8)
  totalChecks += 1;
  if (product.badge_text) {
    violations.push(...scanContent(product.badge_text, { field: 'badge_text', config }));
  }

  // 7. Rule #1 Self-Purchase Permanent Advisory
  totalChecks += 1;
  violations.push({
    id: `advisory-self-purchase-${Date.now()}`,
    ruleId: 'AMZ-RULE-01',
    ruleNumber: 1,
    title: 'Self-Purchase Policy Compliance Advisory',
    category: 'self_purchase',
    severity: 'info',
    field: 'self_purchase_guard',
    message: 'Remember: Never purchase items through your own affiliate tracking links.',
    remediation: 'Staff and admins must use clean non-affiliate sessions for personal purchases.',
    amazonPolicyRef: 'Associates Program Policies § 3',
    blocking: false,
  });

  return buildScanResult('product', violations, totalChecks, config, product.id, product.title);
}

/**
 * Comprehensive Article / Guide Scanner (Validates Rules #1, #2, #6, #7, #8, #9, #10)
 */
export function scanArticle(
  article: ScannableArticle,
  config: ComplianceConfig = DEFAULT_COMPLIANCE_CONFIG
): ComplianceScanResult {
  const violations: ComplianceViolation[] = [];
  let totalChecks = 0;

  // 1. Scan Title, Excerpt, Content (Rule #9)
  totalChecks += 3;
  if (article.title) violations.push(...scanContent(article.title, { field: 'title', config }));
  if (article.excerpt) violations.push(...scanContent(article.excerpt, { field: 'excerpt', config }));
  if (article.content) violations.push(...scanContent(article.content, { field: 'content', config }));

  // 2. Scan Mandatory Program Disclosure (Rule #6)
  totalChecks += 1;
  const fullText = `${article.content || ''} ${article.introduction || ''} ${article.excerpt || ''}`.toLowerCase();
  const hasAssociatesDisclosure =
    fullText.includes('amazon associate') ||
    fullText.includes('qualifying purchases') ||
    fullText.includes('affiliate commission') ||
    fullText.includes('independent testing') ||
    article.disclosure_included === true;

  if (!hasAssociatesDisclosure && config.require_article_disclosure) {
    violations.push({
      id: `viol-article-disclosure-${Date.now()}`,
      ruleId: 'AMZ-RULE-06',
      ruleNumber: 6,
      title: 'Missing Amazon Associates Program Disclosure',
      category: 'disclosure',
      severity: 'critical',
      field: 'content',
      message: 'Guide does not contain the mandatory affiliate disclosure statement.',
      remediation:
        'Add the statement: "Buy Best Cart is supported by readers. When you buy through links on our site, we may earn an affiliate commission as an Amazon Associate."',
      amazonPolicyRef: 'Associates Program Operating Agreement § 5',
      blocking: true,
    });
  }

  // 3. Scan Embedded Top Products (Rules #3, #7, #8)
  if (article.top_products && Array.isArray(article.top_products)) {
    article.top_products.forEach((p: any, idx: number) => {
      totalChecks += 2;
      const buyUrl = p.affiliate_url || p.buy_url || '';
      if (buyUrl) {
        violations.push(
          ...scanUrl(buyUrl, { field: `top_products[${idx}].affiliate_url`, config })
        );
      }
      if (p.title) {
        violations.push(
          ...scanContent(p.title, { field: `top_products[${idx}].title`, config })
        );
      }
      if (p.thumbnail_url) {
        violations.push(
          ...scanImage(p.thumbnail_url, { field: `top_products[${idx}].thumbnail_url`, config })
        );
      }
    });
  }

  return buildScanResult('article', violations, totalChecks, config, article.id, article.title);
}

/**
 * Calculates overall compliance score and compiles scan metrics
 */
function buildScanResult(
  targetType: ComplianceScanResult['targetType'],
  violations: ComplianceViolation[],
  totalChecks: number,
  config: ComplianceConfig,
  targetId?: string,
  targetTitle?: string
): ComplianceScanResult {
  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const highCount = violations.filter((v) => v.severity === 'high').length;
  const mediumCount = violations.filter((v) => v.severity === 'medium').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;

  const hasBlockingViolations =
    (config.block_on_critical && criticalCount > 0) ||
    (config.block_on_high && highCount > 0);

  // Score calculation: Base 100 minus weighted penalties
  let score = 100;
  score -= criticalCount * 30;
  score -= highCount * 15;
  score -= mediumCount * 5;
  score -= warningCount * 2;
  score = Math.max(0, Math.min(100, score));

  const passed = criticalCount === 0 && highCount === 0;

  return {
    passed,
    score,
    totalChecks: Math.max(totalChecks, violations.length),
    violations,
    hasBlockingViolations,
    criticalCount,
    highCount,
    mediumCount,
    warningCount,
    scannedAt: new Date().toISOString(),
    targetType,
    targetId,
    targetTitle,
  };
}
