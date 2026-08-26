import { DEFAULT_COMPLIANCE_CONFIG } from './compliance/rules';
import { isUrlShortener, extractAsinFromUrl } from './affiliate';

export interface ParsedImageEmbed {
  imageUrl: string;
  altText?: string;
  affiliateUrl?: string;
  asin?: string;
  width?: number;
  height?: number;
  isAmazonCdn: boolean;
  isValid: boolean;
  complianceWarning?: string;
}

export interface EmbedParseResult {
  images: ParsedImageEmbed[];
  primaryImage?: ParsedImageEmbed;
  affiliateUrl?: string;
  asin?: string;
  rawInput: string;
  isValid: boolean;
  complianceWarnings: string[];
  error?: string;
}

/**
 * Checks if a host is an approved Amazon media CDN host
 */
export function isApprovedAmazonImageHost(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return DEFAULT_COMPLIANCE_CONFIG.approved_image_hosts.some(
      (approved) => host === approved || host.endsWith(`.${approved}`)
    );
  } catch {
    return false;
  }
}

/**
 * Cleans extracted image URLs (removes HTML entities, leading/trailing quotes, protocol relative fixes)
 */
function sanitizeImageUrl(url: string): string {
  let clean = url.trim().replace(/^['"]|['"]$/g, '').replace(/&amp;/g, '&');
  if (clean.startsWith('//')) {
    clean = `https:${clean}`;
  }
  return clean;
}

/**
 * Determines if an image URL is a tracking pixel (e.g. Amazon adsystem 1x1 pixel)
 */
function isTrackingPixel(url: string, width?: number, height?: number): boolean {
  if (width === 1 && height === 1) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('amazon-adsystem.com/e/ir') ||
    lower.includes('/e/ir?') ||
    lower.includes('1x1') ||
    lower.includes('tracking') ||
    lower.includes('pixel')
  );
}

/**
 * Universal Parser for Amazon SiteStripe embed HTML, <a><img></a> tags, <iframe>, markdown, and direct URLs
 */
export function parseImageEmbed(input: string, defaultAltText?: string): EmbedParseResult {
  const result: EmbedParseResult = {
    images: [],
    rawInput: input || '',
    isValid: false,
    complianceWarnings: [],
  };

  if (!input || typeof input !== 'string' || !input.trim()) {
    result.error = 'Please enter HTML embed code or an image URL.';
    return result;
  }

  const text = input.trim();
  const foundImages: ParsedImageEmbed[] = [];
  let foundAffiliateUrl: string | undefined = undefined;
  let foundAsin: string | undefined = undefined;

  // 1. Extract Affiliate link & ASIN from <a> href or <iframe> src
  const hrefMatch = text.match(/href=["']([^"']+)["']/i) || text.match(/href=([^ >]+)/i);
  if (hrefMatch && hrefMatch[1]) {
    const rawHref = hrefMatch[1].trim().replace(/&amp;/g, '&');
    if (!isUrlShortener(rawHref) && (rawHref.startsWith('http://') || rawHref.startsWith('https://') || rawHref.startsWith('//'))) {
      foundAffiliateUrl = rawHref.startsWith('//') ? `https:${rawHref}` : rawHref;
      const asin = extractAsinFromUrl(foundAffiliateUrl);
      if (asin) foundAsin = asin;
    }
  }

  // Check for iframe src if href was not found
  if (!foundAffiliateUrl) {
    const iframeSrcMatch = text.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      const srcUrl = iframeSrcMatch[1].trim().replace(/&amp;/g, '&');
      const asinMatch = srcUrl.match(/[?&](?:asins|placement|a)=([A-Z0-9]{10})/i);
      if (asinMatch && asinMatch[1]) {
        foundAsin = asinMatch[1].toUpperCase();
        foundAffiliateUrl = `https://www.amazon.com/dp/${foundAsin}?tag=bestbuycart-20`;
      }
    }
  }

  // 2. Extract <img> tags with regex
  const imgRegex = /<img\b([^>]*)>/gi;
  let imgMatch: RegExpExecArray | null;

  while ((imgMatch = imgRegex.exec(text)) !== null) {
    const imgAttrs = imgMatch[1];

    // Extract src
    const srcMatch = imgAttrs.match(/src=["']([^"']+)["']/i) || imgAttrs.match(/src=([^ >]+)/i);
    if (!srcMatch || !srcMatch[1]) continue;

    const rawSrc = sanitizeImageUrl(srcMatch[1]);
    if (!rawSrc.startsWith('http://') && !rawSrc.startsWith('https://')) continue;

    // Extract width / height if available
    const widthMatch = imgAttrs.match(/width=["']?(\d+)["']?/i);
    const heightMatch = imgAttrs.match(/height=["']?(\d+)["']?/i);
    const width = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : undefined;

    // Skip tracking pixels
    if (isTrackingPixel(rawSrc, width, height)) {
      continue;
    }

    // Extract alt
    const altMatch = imgAttrs.match(/alt=["']([^"']*)["']/i);
    const altText = (altMatch && altMatch[1]?.trim()) ? altMatch[1].trim() : defaultAltText;

    const isAmazonCdn = isApprovedAmazonImageHost(rawSrc);
    let complianceWarning: string | undefined = undefined;

    if (isUrlShortener(rawSrc)) {
      complianceWarning = 'URL shorteners are strictly prohibited for images.';
    } else if (rawSrc.includes('amazon-logo') || rawSrc.includes('amazon_logo') || rawSrc.includes('amazon_smile')) {
      complianceWarning = 'Amazon logo graphics are prohibited in product images.';
    }

    foundImages.push({
      imageUrl: rawSrc,
      altText,
      affiliateUrl: foundAffiliateUrl,
      asin: foundAsin,
      width,
      height,
      isAmazonCdn,
      isValid: !complianceWarning,
      complianceWarning,
    });
  }

  // 3. If no <img> tags found, check for Markdown images ![alt](url)
  if (foundImages.length === 0) {
    const markdownRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi;
    let mdMatch: RegExpExecArray | null;

    while ((mdMatch = markdownRegex.exec(text)) !== null) {
      const altText = mdMatch[1] || defaultAltText;
      const rawSrc = sanitizeImageUrl(mdMatch[2]);

      if (!isTrackingPixel(rawSrc)) {
        foundImages.push({
          imageUrl: rawSrc,
          altText,
          affiliateUrl: foundAffiliateUrl,
          asin: foundAsin,
          isAmazonCdn: isApprovedAmazonImageHost(rawSrc),
          isValid: true,
        });
      }
    }
  }

  // 4. If still no image found, check for raw URLs (single or multi-line)
  if (foundImages.length === 0) {
    const urlMatches = text.match(/https?:\/\/[^\s"'<>\n,]+/gi) || [];
    for (const rawUrl of urlMatches) {
      const cleanUrl = sanitizeImageUrl(rawUrl);

      // Check if it's an image file or Amazon image CDN endpoint
      const isImgExtension = /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(cleanUrl);
      const isAmazonMediaUrl = isApprovedAmazonImageHost(cleanUrl);

      if (isImgExtension || isAmazonMediaUrl) {
        if (!isTrackingPixel(cleanUrl)) {
          const isAmazonCdn = isApprovedAmazonImageHost(cleanUrl);
          let complianceWarning: string | undefined = undefined;

          if (isUrlShortener(cleanUrl)) {
            complianceWarning = 'URL shorteners are strictly prohibited.';
          } else if (cleanUrl.includes('amazon-logo') || cleanUrl.includes('amazon_logo')) {
            complianceWarning = 'Amazon logo graphics are prohibited.';
          }

          foundImages.push({
            imageUrl: cleanUrl,
            altText: defaultAltText,
            affiliateUrl: foundAffiliateUrl,
            asin: foundAsin,
            isAmazonCdn,
            isValid: !complianceWarning,
            complianceWarning,
          });
        }
      } else if (!foundAffiliateUrl && cleanUrl.includes('amazon.')) {
        // It's an Amazon product link
        foundAffiliateUrl = cleanUrl;
        const asin = extractAsinFromUrl(cleanUrl);
        if (asin) foundAsin = asin;
      }
    }
  }

  // 5. Finalize Results
  if (foundImages.length === 0) {
    result.error = 'No valid image source detected in the pasted HTML or URL. Please verify your snippet contains a valid image.';
    result.isValid = false;
  } else {
    result.images = foundImages;
    result.primaryImage = foundImages[0];
    result.affiliateUrl = foundAffiliateUrl;
    result.asin = foundAsin;
    result.isValid = true;

    // Collect all warnings
    const warnings = new Set<string>();
    foundImages.forEach((img) => {
      if (img.complianceWarning) warnings.add(img.complianceWarning);
      if (!img.isAmazonCdn) {
        warnings.add('Non-Amazon host: Ensure you have usage rights for external images.');
      }
    });
    result.complianceWarnings = Array.from(warnings);
  }

  return result;
}
