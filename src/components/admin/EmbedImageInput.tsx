'use client';

import React, { useState, useEffect, useId } from 'react';
import {
  Code,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Layers,
} from 'lucide-react';
import { parseImageEmbed, EmbedParseResult, ParsedImageEmbed } from '@/lib/imageEmbed';

export interface EmbedImageInputProps {
  label?: string;
  placeholder?: string;
  defaultAltText?: string;
  currentImageUrl?: string;
  onSelectPrimaryImage: (url: string, altText?: string, affiliateUrl?: string, asin?: string) => void;
  onAddToGallery?: (items: { url: string; alt_text?: string }[]) => void;
  onInsertMarkdown?: (markdownSnippet: string) => void;
  showGalleryButton?: boolean;
  showMarkdownButton?: boolean;
  helperText?: string;
  compact?: boolean;
}

export default function EmbedImageInput({
  label = 'Embed Image HTML / Image Link',
  placeholder = 'Paste Amazon affiliate embed HTML (e.g. <a href="..."><img src="..."></a>) or direct image URL...',
  defaultAltText = '',
  currentImageUrl = '',
  onSelectPrimaryImage,
  onAddToGallery,
  onInsertMarkdown,
  showGalleryButton = true,
  showMarkdownButton = false,
  helperText = 'Automatically detects image sources, affiliate links, and ASINs from Amazon SiteStripe embed HTML or direct URLs.',
  compact = false,
}: EmbedImageInputProps) {
  const [inputText, setInputText] = useState('');
  const [parseResult, setParseResult] = useState<EmbedParseResult | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const inputId = useId();

  // Parse input whenever it changes
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setParseResult(null);
      return;
    }

    const result = parseImageEmbed(text, defaultAltText);
    setParseResult(result);
    setSelectedImageIndex(0);
  };

  const activeImage: ParsedImageEmbed | undefined =
    parseResult?.images && parseResult.images.length > 0
      ? parseResult.images[selectedImageIndex] || parseResult.primaryImage
      : undefined;

  const handleApplyPrimary = () => {
    if (!activeImage) return;
    onSelectPrimaryImage(
      activeImage.imageUrl,
      activeImage.altText || defaultAltText,
      parseResult?.affiliateUrl,
      parseResult?.asin
    );
    setInputText('');
    setParseResult(null);
  };

  const handleAddAllToGallery = () => {
    if (!parseResult?.images || parseResult.images.length === 0 || !onAddToGallery) return;
    const items = parseResult.images.map((img) => ({
      url: img.imageUrl,
      alt_text: img.altText || defaultAltText,
    }));
    onAddToGallery(items);
    setInputText('');
    setParseResult(null);
  };

  const handleInsertMarkdown = () => {
    if (!activeImage || !onInsertMarkdown) return;
    const alt = activeImage.altText || defaultAltText || 'Product image';
    const md = `![${alt}](${activeImage.imageUrl})`;
    onInsertMarkdown(md);
    setInputText('');
    setParseResult(null);
  };

  const handleCopyAffiliateLink = () => {
    if (parseResult?.affiliateUrl) {
      navigator.clipboard.writeText(parseResult.affiliateUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: compact ? '0.75rem' : '1.15rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1rem',
      }}
    >
      {/* Label & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Code size={15} color="var(--green-accent)" />
          <span>{label}</span>
        </label>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Amazon SiteStripe HTML • Direct Image URLs • Markdown
        </span>
      </div>

      {helperText && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
          {helperText}
        </p>
      )}

      {/* Input Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          id={inputId}
          rows={compact ? 2 : 3}
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-mono)',
            borderRadius: 'var(--radius-xs)',
            border: parseResult?.error
              ? '1px solid #EF4444'
              : parseResult?.images && parseResult.images.length > 0
              ? '1px solid var(--green-accent)'
              : '1px solid var(--border-strong)',
            background: 'var(--bg-subtle)',
            color: 'var(--text-primary)',
            resize: 'vertical',
          }}
        />

        {inputText && (
          <button
            type="button"
            onClick={() => {
              setInputText('');
              setParseResult(null);
            }}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
            title="Clear"
          >
            ×
          </button>
        )}
      </div>

      {/* Parsing Error State */}
      {parseResult?.error && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-xs)',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>{parseResult.error}</span>
        </div>
      )}

      {/* Live Detected Preview Card */}
      {activeImage && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: '#FAF9F6',
            border: '1px solid var(--green-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Image Preview with Aspect Ratio Containment */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: 'var(--radius-xs)',
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <img
                src={activeImage.imageUrl}
                alt={activeImage.altText || 'Detected preview'}
                loading="lazy"
                decoding="async"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#FFF',
                  fontSize: '0.5625rem',
                  padding: '1px 3px',
                  borderRadius: '2px',
                  fontWeight: 700,
                }}
              >
                LIVE
              </span>
            </div>

            {/* Metadata & Detected Attributes */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    background: activeImage.isAmazonCdn ? 'var(--green-light)' : 'var(--bg-subtle)',
                    color: activeImage.isAmazonCdn ? 'var(--green-accent)' : 'var(--text-secondary)',
                    border: activeImage.isAmazonCdn ? '1px solid var(--green-border)' : '1px solid var(--border)',
                  }}
                >
                  <CheckCircle2 size={11} />
                  <span>{activeImage.isAmazonCdn ? 'Amazon Media CDN Verified ✓' : 'External Image Source'}</span>
                </span>

                {parseResult?.asin && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    ASIN: {parseResult.asin}
                  </span>
                )}

                {parseResult?.images && parseResult.images.length > 1 && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FDE68A',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                    }}
                  >
                    {parseResult.images.length} images detected
                  </span>
                )}
              </div>

              {/* Detected URL string */}
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  wordBreak: 'break-all',
                  marginBottom: '0.4rem',
                  maxHeight: '36px',
                  overflow: 'hidden',
                  lineHeight: 1.35,
                }}
              >
                {activeImage.imageUrl}
              </div>

              {/* Detected Affiliate URL Notice */}
              {parseResult?.affiliateUrl && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.6875rem',
                    color: 'var(--green-deep)',
                    marginBottom: '0.5rem',
                    background: 'var(--green-light)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  <LinkIcon size={11} />
                  <span style={{ fontWeight: 600 }}>Detected Affiliate Destination Link</span>
                  <button
                    type="button"
                    onClick={handleCopyAffiliateLink}
                    style={{
                      marginLeft: 'auto',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color: 'var(--green-accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <Copy size={10} />
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              )}

              {/* Compliance Warning if non-compliant */}
              {activeImage.complianceWarning && (
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: '#B45309',
                    background: '#FEF3C7',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <AlertTriangle size={12} />
                  <span>{activeImage.complianceWarning}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleApplyPrimary}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.75rem',
                  }}
                >
                  <Sparkles size={12} />
                  <span>Set as Primary Photo</span>
                </button>

                {showGalleryButton && onAddToGallery && (
                  <button
                    type="button"
                    onClick={handleAddAllToGallery}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.75rem',
                    }}
                  >
                    <Plus size={12} />
                    <span>
                      {parseResult?.images && parseResult.images.length > 1
                        ? `Add All (${parseResult.images.length}) to Gallery`
                        : 'Add to Gallery'}
                    </span>
                  </button>
                )}

                {showMarkdownButton && onInsertMarkdown && (
                  <button
                    type="button"
                    onClick={handleInsertMarkdown}
                    className="btn btn-secondary btn-sm"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.75rem',
                    }}
                  >
                    <Code size={12} />
                    <span>Insert into Guide Body</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Multiple Image Selector Tray if > 1 image detected */}
          {parseResult?.images && parseResult.images.length > 1 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.65rem', marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Select detected photo ({parseResult.images.length} available):
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {parseResult.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '4px',
                      border: selectedImageIndex === idx ? '2px solid var(--green-accent)' : '1px solid var(--border)',
                      background: '#FFF',
                      padding: '2px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Detected ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
