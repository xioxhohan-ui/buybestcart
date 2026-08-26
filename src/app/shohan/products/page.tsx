'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { triggerRevalidation } from '@/lib/revalidate';
import { recordSlugChangeRedirect } from '@/lib/redirects';
import { Product, Brand, Category, ProductStatus, ProductContentSource, ProductImage, ProductFeature, ProductSpecification } from '@/types';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Star,
  Award,
  Flame,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Sparkles,
  Image as ImageIcon,
  ListPlus,
  ArrowUp,
  ArrowDown,
  Check,
  Table,
  Globe,
  Search,
  RefreshCw,
  Link2,
  Download,
  FileCode,
  Upload,
} from 'lucide-react';
import { formatPrice } from '@/lib/region';
import Link from 'next/link';
import SeoMetadataEditor from '@/components/admin/SeoMetadataEditor';
import SlugUrlAdvisor from '@/components/admin/SlugUrlAdvisor';
import { generateCleanSlug } from '@/lib/urls';
import { generateProductMetadata } from '@/lib/metadata';
import { optimizeSeoTitle } from '@/lib/seo';
import { isUrlShortener } from '@/lib/affiliate';
import { downloadProductJson, parseProductJsonToTopProducts } from '@/lib/productTemplate';
import { scanProduct } from '@/lib/compliance/scanner';
import { playComplianceAlertSound, playComplianceSuccessSound } from '@/lib/compliance/sound';
import ComplianceBadge from '@/components/compliance/ComplianceBadge';
import ComplianceAlertBanner from '@/components/compliance/ComplianceAlertBanner';
import ComplianceScanModal from '@/components/compliance/ComplianceScanModal';
import SelfPurchaseWarningNotice from '@/components/compliance/SelfPurchaseWarningNotice';
import EmbedImageInput from '@/components/admin/EmbedImageInput';

const DEPARTMENTS = [
  'Electronics',
  'Computers & Accessories',
  'Phones & Accessories',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Clothing, Shoes & Jewelry',
  'Sports & Outdoors',
  'Toys & Games',
  'Video Games',
  'Automotive',
  'Tools & Home Improvement',
  'Pet Supplies',
  'Baby Products',
  'Books',
  'Office Products',
  'Grocery',
  'Health & Household',
  'Garden & Outdoor',
  'Musical Instruments',
  'Industrial & Scientific',
  'Other',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [scanningLink, setScanningLink] = useState(false);
  const [suggestedDept, setSuggestedDept] = useState<string | null>(null);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [savingAsDraft, setSavingAsDraft] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    asin: '',
    brand_id: '',
    category_id: '',
    manufacturer: '',
    short_description: '',
    description: '',
    thumbnail_url: '',
    price: '',
    list_price: '',
    currency: 'USD',
    availability: 'In Stock',
    amazon_url: '',
    affiliate_url: '',
    rating: '',
    review_count: '',
    editorial_score: '',
    global_rank: '1',
    category_rank: '1',
    is_featured: false,
    is_editor_choice: false,
    is_deal: false,
    badge_text: '',
    deal_status: 'none' as Product['deal_status'],
    status: 'active' as ProductStatus,
    content_source: 'manual' as ProductContentSource,
    pros: '',
    cons: '',
    editor_verdict: '',
    best_for: '',
    why_we_like_it: '',
    buying_advice: '',
    who_should_buy: '',
    who_should_avoid: '',
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    og_image: '',
  });

  // Dynamic Gallery, Features & Specifications
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [batchImageUrls, setBatchImageUrls] = useState('');
  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [previewHovered, setPreviewHovered] = useState(false);
  const [featureRows, setFeatureRows] = useState<ProductFeature[]>([]);
  const [batchHighlightsText, setBatchHighlightsText] = useState('');
  const [showBatchHighlights, setShowBatchHighlights] = useState(false);
  const [specRows, setSpecRows] = useState<ProductSpecification[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, brandRes, catRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, brand:brands(*), category:categories(*), specifications:product_specifications(*), features:product_features(*), images:product_images(*)')
        .order('created_at', { ascending: false }),
      supabase.from('brands').select('id, name, slug').order('name', { ascending: true }),
      supabase.from('categories').select('id, name, slug').order('name', { ascending: true }),
    ]);

    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (brandRes.data) setBrands(brandRes.data as Brand[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [apiNotice, setApiNotice] = useState<string | null>(null);

  const handleScanAmazonLink = async () => {
    if (!formData.amazon_url) {
      alert('Please paste an Amazon Product Link or ASIN first.');
      return;
    }
    setScanningLink(true);
    setApiNotice(null);
    try {
      const res = await fetch('/api/amazon/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.amazon_url }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setFormData((prev) => ({
          ...prev,
          asin: d.asin || prev.asin,
          amazon_url: d.affiliate_url || prev.amazon_url,
          title: d.title || prev.title,
          manufacturer: d.brand || prev.manufacturer,
          price: d.price || prev.price,
          currency: d.currency || prev.currency,
          availability: d.availability || prev.availability,
          thumbnail_url: d.image_url || prev.thumbnail_url,
        }));
        if (d.suggested_department) {
          setSuggestedDept(d.suggested_department);
        }
        if (d.api_notice) {
          setApiNotice(d.api_notice);
        }
      } else {
        alert(data.error || 'Could not scan Amazon product link.');
      }
    } catch {
      alert('Network error while scanning Amazon link.');
    } finally {
      setScanningLink(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      slug: '',
      asin: '',
      brand_id: brands[0]?.id || '',
      category_id: categories[0]?.id || '',
      manufacturer: '',
      short_description: '',
      description: '',
      thumbnail_url: '',
      price: '',
      list_price: '',
      currency: 'USD',
      availability: 'In Stock',
      amazon_url: '',
      affiliate_url: '',
      rating: '',
      review_count: '',
      editorial_score: '',
      global_rank: (products.length + 1).toString(),
      category_rank: '1',
      is_featured: false,
      is_editor_choice: false,
      is_deal: false,
      badge_text: '',
      deal_status: 'none',
      status: 'active',
      content_source: 'manual',
      pros: '',
      cons: '',
      editor_verdict: '',
      best_for: '',
      why_we_like_it: '',
      buying_advice: '',
      who_should_buy: '',
      who_should_avoid: '',
      seo_title: '',
      seo_description: '',
      canonical_url: '',
      og_image: '',
    });

    setGalleryImages([]);
    setFeatureRows([]);
    setSpecRows([]);

    setShowModal(true);
  };

  const handleImportProductJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = event.target?.result as string;
        const parsedList = parseProductJsonToTopProducts(rawJson);
        if (parsedList.length > 0) {
          const item = parsedList[0];
          setEditingProduct(null);

          let importedAffiliateUrl = item.affiliate_url || item.buy_url || '';
          let importedAmazonUrl = item.buy_url || item.affiliate_url || '';

          if (isUrlShortener(importedAffiliateUrl) || isUrlShortener(importedAmazonUrl)) {
            alert('⚠️ Amazon Compliance Warning: A prohibited third-party URL shortener (e.g. Bitly/TinyURL) was detected in the imported JSON. Per Amazon Associates policy, it has been automatically converted to a compliant direct Amazon link.');
            importedAffiliateUrl = item.asin ? `https://www.amazon.com/dp/${item.asin}?tag=bestbuycart-20` : '';
            importedAmazonUrl = item.asin ? `https://www.amazon.com/dp/${item.asin}?tag=bestbuycart-20` : '';
          }

          setFormData({
            title: item.title || '',
            slug: item.product_slug || '',
            asin: item.asin || '',
            brand_id: brands[0]?.id || '',
            category_id: categories[0]?.id || '',
            manufacturer: (item as any).brand || '',
            short_description: item.short_description || '',
            description: item.full_description || '',
            thumbnail_url: item.thumbnail_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
            price: item.price ? item.price.toString() : '',
            list_price: item.list_price ? item.list_price.toString() : '',
            currency: item.currency || 'USD',
            availability: item.availability || 'In Stock',
            amazon_url: importedAmazonUrl,
            affiliate_url: importedAffiliateUrl,
            rating: (item.rating || 4.8).toString(),
            review_count: (item.review_count || 500).toString(),
            editorial_score: (item.score || 9.5).toString(),
            global_rank: (products.length + 1).toString(),
            category_rank: '1',
            is_featured: true,
            is_editor_choice: true,
            is_deal: false,
            badge_text: item.badge || 'Best Overall',
            deal_status: 'none',
            status: 'active',
            content_source: 'manual',
            pros: Array.isArray(item.pros) ? item.pros.join('\n') : '',
            cons: Array.isArray(item.cons) ? item.cons.join('\n') : '',
            editor_verdict: item.performance_notes || item.full_description || '',
            best_for: item.best_for || '',
            why_we_like_it: item.ranking_reason || '',
            buying_advice: '',
            who_should_buy: item.best_for || '',
            who_should_avoid: item.avoid_if || '',
            seo_title: '',
            seo_description: '',
            canonical_url: '',
            og_image: item.thumbnail_url || '',
          });

          // Populate gallery images
          if (item.gallery_images && item.gallery_images.length > 0) {
            setGalleryImages(
              item.gallery_images.map((url, idx) => ({
                url,
                alt_text: item.title,
                is_primary: idx === 0,
                display_order: idx + 1,
              }))
            );
          }

          // Populate specs
          if (item.specifications && item.specifications.length > 0) {
            setSpecRows(
              item.specifications.map((s, idx) => ({
                spec_key: s.name,
                spec_value: s.value,
                display_order: idx + 1,
              }))
            );
          }

          // Populate features
          if (item.highlights && item.highlights.length > 0) {
            setFeatureRows(
              item.highlights.map((h, idx) => ({
                feature: h,
                display_order: idx + 1,
              }))
            );
          }

          setShowModal(true);
        } else {
          alert('Could not detect product attributes in the uploaded JSON file.');
        }
      } catch (err: any) {
        alert(`Error reading JSON file: ${err?.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      asin: p.asin || '',
      brand_id: p.brand_id || '',
      category_id: p.category_id || '',
      manufacturer: p.manufacturer || '',
      short_description: p.short_description || '',
      description: p.description || '',
      thumbnail_url: p.thumbnail_url || '',
      price: p.price ? p.price.toString() : '',
      list_price: p.list_price ? p.list_price.toString() : '',
      currency: p.currency || 'USD',
      availability: p.availability || 'In Stock',
      amazon_url: p.amazon_url || '',
      affiliate_url: p.affiliate_url || '',
      rating: p.rating ? p.rating.toString() : '4.8',
      review_count: p.review_count ? p.review_count.toString() : '1000',
      editorial_score: p.editorial_score ? p.editorial_score.toString() : '9.0',
      global_rank: p.global_rank ? p.global_rank.toString() : '1',
      category_rank: p.category_rank ? p.category_rank.toString() : '1',
      is_featured: p.is_featured,
      is_editor_choice: p.is_editor_choice,
      is_deal: !!p.is_deal,
      badge_text: p.badge_text || 'Best Overall',
      deal_status: p.deal_status,
      status: p.status,
      content_source: p.content_source || 'manual',
      pros: (p.pros || []).join('\n'),
      cons: (p.cons || []).join('\n'),
      editor_verdict: p.editor_verdict || '',
      best_for: p.best_for || '',
      why_we_like_it: p.why_we_like_it || '',
      buying_advice: p.buying_advice || '',
      who_should_buy: p.who_should_buy || '',
      who_should_avoid: p.who_should_avoid || '',
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      canonical_url: p.canonical_url || '',
      og_image: p.og_image || '',
    });

    setGalleryImages(p.images && p.images.length > 0 ? p.images : [
      { url: p.thumbnail_url || '', alt_text: p.title, is_primary: true, display_order: 1 }
    ]);

    const loadedFeatures = (p.features && p.features.length > 0)
      ? p.features
      : (p.key_highlights && p.key_highlights.length > 0)
      ? p.key_highlights.map((text, i) => ({ feature: text, display_order: i + 1 }))
      : [
          { feature: '40-hour continuous battery endurance', display_order: 1 },
          { feature: 'Active dual-processor noise cancellation', display_order: 2 },
          { feature: 'Bluetooth 5.3 multipoint audio connectivity', display_order: 3 },
        ];

    setFeatureRows(loadedFeatures);

    setSpecRows(p.specifications && p.specifications.length > 0 ? p.specifications : [
      { spec_key: 'Acoustic Driver', spec_value: '30mm Carbon Fiber Composite', display_order: 1 },
      { spec_key: 'Battery Life', spec_value: '30 Hours (ANC On), 40 Hours (ANC Off)', display_order: 2 },
      { spec_key: 'Weight', spec_value: '250g (8.8 oz)', display_order: 3 },
      { spec_key: 'Connectivity', spec_value: 'Bluetooth 5.2 / Multipoint / 3.5mm Aux', display_order: 4 },
      { spec_key: 'Charging Port', spec_value: 'USB-C Fast Charging (3 min = 3 hrs)', display_order: 5 },
    ]);

    setShowModal(true);
  };

  // Gallery Helpers
  const addGalleryImage = () => {
    setGalleryImages([
      ...galleryImages,
      { url: '', alt_text: 'Product showcase image', is_primary: false, display_order: galleryImages.length + 1 },
    ]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    const updated = galleryImages.map((img, i) => ({ ...img, is_primary: i === index }));
    setGalleryImages(updated);
    if (updated[index].url) {
      setFormData({ ...formData, thumbnail_url: updated[index].url });
    }
  };

  const handleBatchAddImages = () => {
    if (!batchImageUrls.trim()) return;
    const urls = batchImageUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));

    if (urls.length === 0) {
      alert('Please enter valid image URLs starting with http:// or https://');
      return;
    }

    const existingUrls = galleryImages.map((g) => g.url.trim());
    const newItems: ProductImage[] = [];
    urls.forEach((url) => {
      if (!existingUrls.includes(url)) {
        newItems.push({
          url,
          alt_text: formData.title || 'Product photo',
          is_primary: galleryImages.length === 0 && newItems.length === 0,
          display_order: galleryImages.length + newItems.length + 1,
        });
      }
    });

    if (newItems.length > 0) {
      setGalleryImages([...galleryImages, ...newItems]);
      if (!formData.thumbnail_url && newItems[0]) {
        setFormData({ ...formData, thumbnail_url: newItems[0].url });
      }
    }
    setBatchImageUrls('');
    setShowBatchAdd(false);
  };

  // Compile active multi-images for the live admin preview
  const previewImagesList = useMemo(() => {
    const list: string[] = [];
    if (formData.thumbnail_url && formData.thumbnail_url.trim()) {
      list.push(formData.thumbnail_url.trim());
    }
    galleryImages.forEach((img) => {
      if (img && img.url && img.url.trim() && !list.includes(img.url.trim())) {
        list.push(img.url.trim());
      }
    });
    return list;
  }, [formData.thumbnail_url, galleryImages]);

  // Admin live multi-image preview auto-cycle: 2s default, 1s hover speedup
  useEffect(() => {
    if (previewImagesList.length <= 1) return;
    const interval = previewHovered ? 1000 : 2000;
    const timer = setInterval(() => {
      setPreviewImageIndex((prev) => (prev + 1) % previewImagesList.length);
    }, interval);
    return () => clearInterval(timer);
  }, [previewImagesList.length, previewHovered]);

  // Feature Helpers
  const addFeatureRow = () => {
    setFeatureRows([...featureRows, { feature: '', display_order: featureRows.length + 1 }]);
  };

  const removeFeatureRow = (index: number) => {
    setFeatureRows(featureRows.filter((_, i) => i !== index));
  };

  const updateFeatureText = (index: number, text: string) => {
    const updated = [...featureRows];
    updated[index].feature = text;
    setFeatureRows(updated);
  };

  const handleBatchAddHighlights = () => {
    if (!batchHighlightsText.trim()) return;
    const lines = batchHighlightsText
      .split('\n')
      .map((l) => l.replace(/^[\s*•\-–—\d.)]+/, '').trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      alert('Please enter at least one highlight line.');
      return;
    }

    const newRows = lines.map((line, idx) => ({
      feature: line,
      display_order: featureRows.length + idx + 1,
    }));

    setFeatureRows([...featureRows, ...newRows]);
    setBatchHighlightsText('');
    setShowBatchHighlights(false);
  };

  // Specifications Helpers
  const addSpecRow = () => {
    setSpecRows([...specRows, { spec_key: '', spec_value: '', display_order: specRows.length + 1 }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecRows(specRows.filter((_, i) => i !== index));
  };

  const updateSpecKey = (index: number, key: string) => {
    const updated = [...specRows];
    updated[index].spec_key = key;
    setSpecRows(updated);
  };

  const updateSpecValue = (index: number, val: string) => {
    const updated = [...specRows];
    updated[index].spec_value = val;
    setSpecRows(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = generateCleanSlug(formData.slug || formData.title);

    const prosArray = formData.pros.split('\n').map((s) => s.trim()).filter(Boolean);
    const consArray = formData.cons.split('\n').map((s) => s.trim()).filter(Boolean);

    const trimmedAffiliateUrl = formData.affiliate_url?.trim() || '';
    if (trimmedAffiliateUrl) {
      if (!/^https?:\/\/.+/i.test(trimmedAffiliateUrl)) {
        alert('Please enter a valid HTTP or HTTPS Affiliate Buy URL (e.g. https://www.amazon.com/dp/...) or leave it blank.');
        return;
      }
    }

    // Real-Time Amazon Compliance Guard Pre-Publish Scan
    const scanRes = scanProduct({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : undefined,
      list_price: formData.list_price ? parseFloat(formData.list_price) : undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      editorial_score: formData.editorial_score ? parseFloat(formData.editorial_score) : undefined,
      affiliate_url: trimmedAffiliateUrl || undefined,
      amazon_url: formData.amazon_url || undefined,
    });

    if ((formData.status === 'active' || formData.status === 'featured') && scanRes.hasBlockingViolations) {
      playComplianceAlertSound();
      setShowComplianceModal(true);
      try {
        fetch('/api/compliance/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rule_id: scanRes.violations[0]?.ruleId || 'AMZ-RULE-07',
            rule_number: scanRes.violations[0]?.ruleNumber || 7,
            rule_title: scanRes.violations[0]?.title || 'Compliance Violation',
            severity: scanRes.violations[0]?.severity || 'critical',
            affected_item: formData.title,
            affected_type: 'product',
            action: 'publish_blocked',
            status: 'open',
            details: `Publishing blocked due to ${scanRes.criticalCount} critical and ${scanRes.highCount} high violations`,
            offending_value: scanRes.violations[0]?.offendingValue,
          }),
        });
      } catch {}
      return;
    }

    const payload = {
      title: formData.title,
      slug: generatedSlug,
      asin: formData.asin,
      brand_id: formData.brand_id || null,
      category_id: formData.category_id || null,
      manufacturer: formData.manufacturer,
      short_description: formData.short_description,
      description: formData.description,
      thumbnail_url: formData.thumbnail_url,
      price: formData.price ? parseFloat(formData.price) : null,
      list_price: formData.list_price ? parseFloat(formData.list_price) : null,
      currency: formData.currency,
      availability: formData.availability,
      amazon_url: formData.amazon_url,
      affiliate_url: trimmedAffiliateUrl || null,
      rating: formData.rating ? parseFloat(formData.rating) : 4.8,
      review_count: formData.review_count ? parseInt(formData.review_count) : 1000,
      editorial_score: formData.editorial_score ? parseFloat(formData.editorial_score) : 9.0,
      global_rank: formData.global_rank ? parseInt(formData.global_rank) : null,
      category_rank: formData.category_rank ? parseInt(formData.category_rank) : null,
      is_featured: formData.is_featured,
      is_editor_choice: formData.is_editor_choice,
      is_deal: formData.is_deal,
      badge_text: formData.badge_text,
      deal_status: formData.deal_status,
      status: formData.status,
      content_source: formData.content_source,
      pros: prosArray,
      cons: consArray,
      editor_verdict: formData.editor_verdict,
      best_for: formData.best_for,
      why_we_like_it: formData.why_we_like_it,
      buying_advice: formData.buying_advice,
      who_should_buy: formData.who_should_buy,
      who_should_avoid: formData.who_should_avoid,
      key_highlights: featureRows.filter((f) => f.feature && f.feature.trim()).map((f) => f.feature.trim()),
      seo_title: formData.seo_title || optimizeSeoTitle(formData.title),
      seo_description: formData.seo_description || formData.short_description || `Read our in-depth lab testing and review of the ${formData.title} with verified Amazon pricing.`,
      canonical_url: formData.canonical_url || `https://buybestcart.shop/products/${generatedSlug}`,
      og_image: formData.og_image || formData.thumbnail_url,
      updated_at: new Date().toISOString(),
    };

    let savedProductId: string | null = null;

    if (editingProduct) {
      if (editingProduct.slug && editingProduct.slug !== generatedSlug) {
        await recordSlugChangeRedirect(`/products/${editingProduct.slug}`, `/products/${generatedSlug}`);
      }

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id);

      if (error) {
        alert(`Error updating product: ${error.message}`);
        return;
      }
      savedProductId = editingProduct.id;
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        alert(`Error creating product: ${error.message}`);
        return;
      }
      savedProductId = data?.id || null;
    }

    if (savedProductId) {
      try {
        // Sync gallery images
        await supabase.from('product_images').delete().eq('product_id', savedProductId);
        const validImages = galleryImages
          .filter((img) => img.url && img.url.trim())
          .map((img, idx) => ({
            product_id: savedProductId,
            url: img.url.trim(),
            alt_text: img.alt_text || formData.title,
            is_primary: !!img.is_primary,
            display_order: idx + 1,
          }));
        if (validImages.length > 0) {
          await supabase.from('product_images').insert(validImages);
        }

        // Sync features
        await supabase.from('product_features').delete().eq('product_id', savedProductId);
        const validFeatures = featureRows
          .filter((f) => f.feature && f.feature.trim())
          .map((f, idx) => ({
            product_id: savedProductId,
            feature: f.feature.trim(),
            display_order: idx + 1,
          }));
        if (validFeatures.length > 0) {
          await supabase.from('product_features').insert(validFeatures);
        }

        // Sync specifications
        await supabase.from('product_specifications').delete().eq('product_id', savedProductId);
        const validSpecs = specRows
          .filter((s) => s.spec_key && s.spec_key.trim())
          .map((s, idx) => ({
            product_id: savedProductId,
            spec_key: s.spec_key.trim(),
            spec_value: s.spec_value ? s.spec_value.trim() : '',
            display_order: idx + 1,
          }));
        if (validSpecs.length > 0) {
          await supabase.from('product_specifications').insert(validSpecs);
        }
      } catch (childErr) {
        console.warn('Notice syncing product specifications or features:', childErr);
      }

      setShowModal(false);
      await fetchData();
      triggerRevalidation();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete product "${title}"?`)) {
      await Promise.all([
        supabase.from('product_images').delete().eq('product_id', id),
        supabase.from('product_features').delete().eq('product_id', id),
        supabase.from('product_specifications').delete().eq('product_id', id),
      ]);
      await supabase.from('products').delete().eq('id', id);
      await fetchData();
      triggerRevalidation();
    }
  };

  const complianceResult = useMemo(() => {
    return scanProduct({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : undefined,
      list_price: formData.list_price ? parseFloat(formData.list_price) : undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      editorial_score: formData.editorial_score ? parseFloat(formData.editorial_score) : undefined,
      affiliate_url: formData.affiliate_url || undefined,
      amazon_url: formData.amazon_url || undefined,
    });
  }, [formData]);

  const handleSaveAsDraft = async () => {
    setSavingAsDraft(true);
    setFormData((prev) => ({ ...prev, status: 'draft' }));
    setShowComplianceModal(false);

    try {
      const generatedSlug =
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const payload = {
        title: formData.title,
        slug: generatedSlug,
        asin: formData.asin,
        brand_id: formData.brand_id || null,
        category_id: formData.category_id || null,
        manufacturer: formData.manufacturer,
        short_description: formData.short_description,
        description: formData.description,
        thumbnail_url: formData.thumbnail_url,
        price: formData.price ? parseFloat(formData.price) : null,
        list_price: formData.list_price ? parseFloat(formData.list_price) : null,
        currency: formData.currency,
        availability: formData.availability,
        amazon_url: formData.amazon_url,
        affiliate_url: formData.affiliate_url?.trim() || null,
        rating: formData.rating ? parseFloat(formData.rating) : 4.8,
        review_count: formData.review_count ? parseInt(formData.review_count) : 1000,
        editorial_score: formData.editorial_score ? parseFloat(formData.editorial_score) : 9.0,
        global_rank: formData.global_rank ? parseInt(formData.global_rank) : null,
        category_rank: formData.category_rank ? parseInt(formData.category_rank) : null,
        is_featured: false,
        is_editor_choice: false,
        is_deal: formData.is_deal,
        badge_text: formData.badge_text,
        deal_status: formData.deal_status,
        status: 'draft',
        content_source: formData.content_source,
        pros: formData.pros.split('\n').map((s) => s.trim()).filter(Boolean),
        cons: formData.cons.split('\n').map((s) => s.trim()).filter(Boolean),
        editor_verdict: formData.editor_verdict,
        best_for: formData.best_for,
        why_we_like_it: formData.why_we_like_it,
        buying_advice: formData.buying_advice,
        who_should_buy: formData.who_should_buy,
        who_should_avoid: formData.who_should_avoid,
        key_highlights: featureRows.filter((f) => f.feature && f.feature.trim()).map((f) => f.feature.trim()),
        seo_title: formData.seo_title || optimizeSeoTitle(formData.title),
        seo_description: formData.seo_description || formData.short_description,
        canonical_url: formData.canonical_url || `https://buybestcart.shop/products/${generatedSlug}`,
        og_image: formData.og_image || formData.thumbnail_url,
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        await supabase.from('products').update(payload).eq('id', editingProduct.id);
      } else {
        await supabase.from('products').insert(payload);
      }

      await fetch('/api/compliance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule_id: 'DRAFT-SAVE',
          rule_title: 'Saved as Draft under Compliance Guard',
          severity: 'warning',
          affected_item: formData.title,
          affected_type: 'product',
          action: 'draft_saved',
          status: 'resolved',
          details: 'User saved non-compliant product as draft to resolve issues later',
        }),
      });

      setShowModal(false);
      await fetchData();
      triggerRevalidation();
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Error saving draft: ${error.message}`);
    } finally {
      setSavingAsDraft(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const titleStr = p.title || '';
    const asinStr = p.asin || '';
    const brandStr = p.brand?.name || p.manufacturer || '';
    const searchLower = search.toLowerCase();

    const matchesSearch =
      titleStr.toLowerCase().includes(searchLower) ||
      asinStr.toLowerCase().includes(searchLower) ||
      brandStr.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || p.content_source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const effectiveSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product-slug';
  const effectiveSeoTitle = formData.seo_title || (formData.title ? `${formData.title} — Price, Specs & Reviews | Buy Best Cart` : 'Product Title — Price, Specs & Reviews | Buy Best Cart');
  const effectiveSeoDesc = formData.seo_description || formData.short_description || 'Read our in-depth laboratory testing and verified buying advice for this top-rated product.';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={22} color="var(--green-accent)" />
            <span>Product Catalog & SEO Matrix Engine</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage Amazon ASINs, live pricing, specifications, Google SERP metadata, custom slugs, and ranking scores.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
            title="Upload and import product from a JSON template file"
          >
            <Upload size={14} />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImportProductJsonFile}
            />
          </label>

          <button onClick={openAddModal} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Plus size={14} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ flex: '1', minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search by title, ASIN, or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.8125rem',
              background: 'var(--bg-surface)',
            }}
          >
            <option value="all">All Statuses (8 States)</option>
            <option value="active">Active</option>
            <option value="featured">Featured</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="unavailable">Unavailable</option>
            <option value="needs_review">Needs Review</option>
            <option value="pending_sync">Pending Sync</option>
            <option value="api_error">API Error</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              fontSize: '0.8125rem',
              background: 'var(--bg-surface)',
            }}
          >
            <option value="all">All Sources</option>
            <option value="manual">Manual</option>
            <option value="amazon_api">Amazon API</option>
            <option value="editorial">Editorial</option>
            <option value="ai_assisted">AI-Assisted</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-table-wrapper">
        <table className="editorial-table" style={{ minWidth: '840px' }}>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>Rank</th>
              <th>Product Details</th>
              <th>Category & Brand</th>
              <th>Price (MSRP)</th>
              <th>Rating & Score</th>
              <th>Badge</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>Loading product catalog...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>No products found matching filters.</td></tr>
            ) : (
              paginatedProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--green-accent)', fontSize: '0.8125rem' }}>
                      #{p.global_rank || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="product-table-title" style={{ fontSize: '0.9375rem', fontWeight: 650 }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      <span>ASIN: <code>{p.asin || 'N/A'}</code></span>
                      <span>Slug: <code>/products/{p.slug}</code></span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#F5F5F4', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <ImageIcon size={11} color="var(--green-accent)" />
                        <span>{(p.images && p.images.length > 0) ? p.images.length : (p.thumbnail_url ? 1 : 0)} photos</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{p.category?.name || 'General Tech'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand?.name || p.manufacturer || 'Unbranded'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                      {p.price ? formatPrice(p.price, 'USD') : 'N/A'}
                    </div>
                    {p.list_price && p.price && p.list_price > p.price && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatPrice(p.list_price, 'USD')}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Star size={13} fill="var(--amber-deal)" color="var(--amber-deal)" />
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{p.rating || 4.8}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({p.review_count || 0})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-accent)', marginTop: '0.1rem' }}>
                      Score: {p.editorial_score}/10
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                      {p.badge_text ? (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--green-accent)', background: 'var(--green-light)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--green-border)', textTransform: 'uppercase' }}>
                          {p.badge_text}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Standard</span>
                      )}

                      {/* Quick 1-Click Toggle for Show in Deals */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextState = !p.is_deal;
                          await supabase.from('products').update({ is_deal: nextState, updated_at: new Date().toISOString() }).eq('id', p.id);
                          await fetchData();
                          triggerRevalidation();
                        }}
                        style={{
                          background: p.is_deal ? '#FFF7ED' : 'transparent',
                          border: p.is_deal ? '1px solid #FDBA74' : '1px solid var(--border)',
                          color: p.is_deal ? 'var(--amber-deal)' : 'var(--text-muted)',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.35rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          transition: 'all 0.15s ease',
                        }}
                        title={p.is_deal ? 'Click to remove from public /deals' : 'Click to feature on public /deals'}
                      >
                        <Flame size={10} />
                        <span>{p.is_deal ? '🔥 Deals (ON)' : '+ Deals'}</span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.status === 'active' || p.status === 'featured' ? 'var(--success)' : 'var(--text-muted)' }}>
                        ● {p.status.toUpperCase()}
                      </span>
                      <ComplianceBadge scanResult={scanProduct(p)} size="sm" />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="View live product page"
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={async () => {
                          if (p.amazon_url || p.asin) {
                            alert(`Refreshing Amazon price and availability for ${p.title} (ASIN: ${p.asin || 'N/A'})...`);
                            await supabase.from('products').update({ updated_at: new Date().toISOString() }).eq('id', p.id);
                            fetchData();
                            triggerRevalidation();
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Refresh Amazon price & availability"
                      >
                        <RefreshCw size={12} />
                      </button>
                      <button
                        onClick={() => downloadProductJson(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Export product data to JSON backup"
                      >
                        <Download size={12} />
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit product"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                        title="Delete product"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0 0.5rem' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={18} color="var(--green-accent)" />
                  <span>{editingProduct ? 'Edit Catalog Product & SEO' : 'Register New Product & SEO'}</span>
                </h2>
                <ComplianceBadge scanResult={complianceResult} onClick={() => setShowComplianceModal(true)} />
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ✕
              </button>
            </div>

            {/* Real-Time Compliance Alert Banner */}
            <ComplianceAlertBanner
              scanResult={complianceResult}
              onOpenDetails={() => setShowComplianceModal(true)}
            />

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Amazon Affiliate Link Auto-Scanner & Live Price Auto-Fetcher */}
              <div style={{ background: 'var(--green-light)', border: '1px solid var(--green-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--green-deep)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} />
                    <span>Amazon Link Auto-Scanner & Live Price Fetcher</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-deep)', background: 'rgba(255,255,255,0.7)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Auto-Populates Price & ASIN
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Paste Amazon Product Link or ASIN (e.g. https://www.amazon.com/dp/B0CHX1W1XY or B0CHX1W1XY)..."
                    value={formData.amazon_url}
                    onChange={(e) => {
                      const inputUrl = e.target.value;
                      setFormData((prev) => {
                        const asinMatch = inputUrl.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i) || inputUrl.match(/\b([A-Z0-9]{10})\b/i);
                        const extractedAsin = asinMatch ? asinMatch[1].toUpperCase() : prev.asin;
                        const cleanAffiliateUrl = extractedAsin
                          ? `https://www.amazon.com/dp/${extractedAsin}?tag=bestbuycart-20`
                          : inputUrl;
                        return {
                          ...prev,
                          amazon_url: cleanAffiliateUrl,
                          asin: extractedAsin,
                        };
                      });
                    }}
                    style={{ flex: 1, padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--green-border)', fontSize: '0.8125rem', background: '#FFFFFF' }}
                  />
                  <button
                    type="button"
                    onClick={handleScanAmazonLink}
                    disabled={scanningLink}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
                  >
                    <Search size={14} className={scanningLink ? 'animate-spin' : ''} />
                    <span>{scanningLink ? 'Scanning...' : 'Scan Product'}</span>
                  </button>
                </div>

                {/* API Status Notice Banner */}
                {apiNotice && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.625rem', borderRadius: '4px', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#92400E', fontWeight: 600 }}>
                    {apiNotice}
                  </div>
                )}

                {/* Suggested Department Auto-Recommendation Banner */}
                {suggestedDept && (
                  <div style={{ background: '#FFFFFF', border: '1px dashed var(--green-accent)', padding: '0.5rem 0.75rem', borderRadius: '4px', marginBottom: '0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Suggested Department: <strong>{suggestedDept}</strong></span>
                    <button
                      type="button"
                      onClick={() => setSuggestedDept(null)}
                      style={{ background: 'var(--green-light)', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', color: 'var(--green-deep)' }}
                    >
                      Accept Suggestion
                    </button>
                  </div>
                )}

                {/* Live Button Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Button CTA Preview:</span>
                  <div
                    style={{
                      background: 'var(--amber-deal)',
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <span>Buy on Amazon</span>
                    <span style={{ background: '#000000', color: '#FFFFFF', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      ${formData.price || '348.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DEDICATED AFFILIATE BUY LINK / BUY URL CARD */}
              <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderLeft: '4px solid #3B82F6', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Link2 size={16} color="#2563EB" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                      AFFILIATE BUY LINK / BUY URL
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1D4ED8', background: '#DBEAFE', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Direct Buy CTA Destination
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  Paste your custom affiliate or direct merchant buy URL below. When saved, the public <strong>Buy on Amazon</strong> CTA button will route directly to this link.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <input
                      type="url"
                      placeholder="https://www.amazon.com/dp/B0...?tag=yourtag-20 or custom partner URL..."
                      value={formData.affiliate_url}
                      onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.8125rem',
                        fontFamily: 'monospace',
                        background: '#FFFFFF',
                      }}
                    />
                  </div>

                  {formData.affiliate_url ? (
                    <a
                      href={formData.affiliate_url.startsWith('http') ? formData.affiliate_url : `https://${formData.affiliate_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                    >
                      <ExternalLink size={13} />
                      <span>Preview Buy Button ↗</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      (Using regional Amazon ASIN routing by default)
                    </span>
                  )}
                </div>
              </div>

              {/* Department / Category Selector & Brand Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Select Department / Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: 'var(--bg-surface)', fontWeight: 600 }}
                  >
                    <option value="">-- Choose Department / Category --</option>
                    <optgroup label="Standard Amazon Departments">
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
                          {dept}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Custom Site Categories">
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Select Brand / Manufacturer
                  </label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: 'var(--bg-surface)', fontWeight: 600 }}
                  >
                    <option value="">-- Choose Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Title & ASIN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Canceling Headphones"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Amazon ASIN * (10-character code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B09XS7JWHH"
                    value={formData.asin}
                    onChange={(e) => setFormData({ ...formData, asin: e.target.value.toUpperCase().trim() })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* DEDICATED GOOGLE SERP & SEO METADATA CARD */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border-strong)', borderLeft: '4px solid var(--green-accent)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Globe size={16} color="var(--green-accent)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    GOOGLE SEARCH ENGINE OPTIMIZATION (SEO) &amp; URL SLUG
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Custom URL Slug (Link: /products/{formData.slug || 'slug'})
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. sony-wh-1000xm5-wireless-headphones"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateCleanSlug(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem', background: '#FFFFFF', fontFamily: 'monospace' }}
                  />
                  <SlugUrlAdvisor
                    slug={formData.slug || generateCleanSlug(formData.title)}
                    sourceTitle={formData.title}
                    routePrefix="/products"
                    tableName="products"
                    currentId={editingProduct?.id}
                    onChange={(newSlug) => setFormData({ ...formData, slug: newSlug })}
                  />
                </div>

                <SeoMetadataEditor
                  seoTitle={formData.seo_title}
                  onSeoTitleChange={(val) => setFormData({ ...formData, seo_title: val })}
                  seoDescription={formData.seo_description}
                  onSeoDescriptionChange={(val) => setFormData({ ...formData, seo_description: val })}
                  canonicalUrl={formData.canonical_url}
                  onCanonicalUrlChange={(val) => setFormData({ ...formData, canonical_url: val })}
                  ogImage={formData.og_image}
                  onOgImageChange={(val) => setFormData({ ...formData, og_image: val })}
                  rawEntityTitle={formData.title}
                  slug={formData.slug || generateCleanSlug(formData.title)}
                  pathPrefix="products"
                  tableName="products"
                  currentId={editingProduct?.id}
                  onAutoGenerate={() => {
                    const auto = generateProductMetadata(formData as any);
                    setFormData({
                      ...formData,
                      seo_title: auto.title,
                      seo_description: auto.description,
                      canonical_url: auto.canonicalUrl,
                    });
                  }}
                />
              </div>

              {/* Brand & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Brand / Manufacturer
                  </label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="">Select Brand...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Department / Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Dynamic Badge
                  </label>
                  <select
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="Best Overall">Best Overall</option>
                    <option value="Best Budget">Best Budget</option>
                    <option value="Best Value">Best Value</option>
                    <option value="Editor's Choice">Editor&apos;s Choice</option>
                    <option value="Premium Pick">Premium Pick</option>
                    <option value="Popular">Popular</option>
                    <option value="New">New</option>
                    <option value="Deal">Deal</option>
                  </select>
                </div>
              </div>

              {/* Pricing, Editorial Score & Ranking */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Current Price ($) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave blank for CTA only"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Original MSRP ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.list_price}
                    onChange={(e) => setFormData({ ...formData, list_price: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Editorial Lab Score (/10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    value={formData.editorial_score}
                    onChange={(e) => setFormData({ ...formData, editorial_score: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Global Rank (#)
                  </label>
                  <input
                    type="number"
                    value={formData.global_rank}
                    onChange={(e) => setFormData({ ...formData, global_rank: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Status & Source */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Status (8 States)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="featured">Featured (Top Showcase)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="pending_sync">Pending Sync</option>
                    <option value="api_error">API Error</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Content Source (6 States)
                  </label>
                  <select
                    value={formData.content_source}
                    onChange={(e) => setFormData({ ...formData, content_source: e.target.value as ProductContentSource })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="amazon_api">Amazon PA-API</option>
                    <option value="editorial">Editorial Staff</option>
                    <option value="ai_assisted">AI-Assisted</option>
                    <option value="imported">Imported</option>
                    <option value="mock_test">Mock / Test</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Deal Status
                  </label>
                  <select
                    value={formData.deal_status}
                    onChange={(e) => setFormData({ ...formData, deal_status: e.target.value as Product['deal_status'] })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  >
                    <option value="none">Standard Pricing</option>
                    <option value="limited_deal">Limited Time Deal</option>
                    <option value="top_deal">Top Pick Deal</option>
                    <option value="lightning_deal">Lightning Deal</option>
                  </select>
                </div>
              </div>

              {/* Show in Deals & Editorial Placement Toggles */}
              <div
                style={{
                  background: formData.is_deal ? '#FFF7ED' : '#FAF9F6',
                  border: formData.is_deal ? '1px solid #FED7AA' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: formData.is_deal ? '#FFF' : '#E7E5E4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: formData.is_deal ? 'var(--amber-deal)' : 'var(--text-muted)',
                      border: formData.is_deal ? '1px solid #FDBA74' : '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  >
                    <Flame size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span>Show in Deals (/deals)</span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          background: formData.is_deal ? 'var(--amber-deal)' : '#78716C',
                          color: '#FFFFFF',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {formData.is_deal ? '🔥 ON (Live on /deals)' : 'OFF (Hidden from /deals)'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                      {formData.is_deal
                        ? 'Active: This product is currently displayed on the public /deals page.'
                        : 'Inactive: Product does not appear on /deals. Toggle ON anytime to feature it as a deal.'}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '52px',
                    height: '28px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.is_deal}
                    onChange={(e) => setFormData({ ...formData, is_deal: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: formData.is_deal ? 'var(--amber-deal)' : '#CBD5E1',
                      borderRadius: '34px',
                      transition: '0.25s ease',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: '22px',
                        width: '22px',
                        left: formData.is_deal ? '27px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.25s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Multi-Image Gallery & Live Cycling Preview */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                      <ImageIcon size={16} color="var(--green-accent)" />
                      <span>Product Photography Gallery ({previewImagesList.length} Photos)</span>
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Auto-cycles every 2s on public cards • Speeds up to 1s on hover
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowBatchAdd(!showBatchAdd)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      {showBatchAdd ? '✕ Close Batch Add' : '⚡ Batch Paste URLs'}
                    </button>
                    <button
                      type="button"
                      onClick={addGalleryImage}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      + Add Image Row
                    </button>
                  </div>
                </div>

                {/* Embed Image HTML / Image Link Component */}
                <EmbedImageInput
                  label="Embed Image HTML / Image Link"
                  placeholder="Paste Amazon affiliate embed HTML (e.g. <a href=...><img src=...></a>) or direct image CDN URL..."
                  defaultAltText={formData.title}
                  currentImageUrl={formData.thumbnail_url}
                  onSelectPrimaryImage={(url, alt, affiliateUrl, asin) => {
                    setFormData((prev) => ({
                      ...prev,
                      thumbnail_url: url,
                      affiliate_url: prev.affiliate_url || affiliateUrl || prev.affiliate_url,
                      amazon_url: prev.amazon_url || affiliateUrl || prev.amazon_url,
                      asin: prev.asin || asin || prev.asin,
                    }));
                    // Update or insert primary gallery image
                    if (galleryImages.length === 0) {
                      setGalleryImages([{ url, alt_text: alt || formData.title, is_primary: true, display_order: 1 }]);
                    } else {
                      const updated = galleryImages.map((g, i) =>
                        i === 0 ? { ...g, url, alt_text: alt || formData.title, is_primary: true } : { ...g, is_primary: false }
                      );
                      setGalleryImages(updated);
                    }
                  }}
                  onAddToGallery={(items) => {
                    const existingUrls = galleryImages.map((g) => g.url);
                    const newRows = items
                      .filter((it) => !existingUrls.includes(it.url))
                      .map((it, idx) => ({
                        url: it.url,
                        alt_text: it.alt_text || formData.title,
                        is_primary: galleryImages.length === 0 && idx === 0,
                        display_order: galleryImages.length + idx + 1,
                      }));
                    if (newRows.length > 0) {
                      const merged = [...galleryImages, ...newRows];
                      setGalleryImages(merged);
                      if (!formData.thumbnail_url) {
                        setFormData((prev) => ({ ...prev, thumbnail_url: newRows[0].url }));
                      }
                    }
                  }}
                  showGalleryButton={true}
                  helperText="Paste Amazon SiteStripe <a><img></a> HTML or any image URL. The engine auto-extracts the clean photo, affiliate link, and ASIN without scraping."
                />

                {/* Batch Add Modal / Dropdown */}
                {showBatchAdd && (
                  <div style={{ background: '#FFFFFF', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Paste Multiple Image URLs (one per line or separated by commas):
                    </label>
                    <textarea
                      rows={3}
                      value={batchImageUrls}
                      onChange={(e) => setBatchImageUrls(e.target.value)}
                      placeholder="https://m.media-amazon.com/images/I/71...jpg&#10;https://m.media-amazon.com/images/I/81...jpg"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', fontFamily: 'monospace' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowBatchAdd(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBatchAddImages}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Add to Gallery
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Admin Multi-Image Simulator Card */}
                {previewImagesList.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {/* Simulator Image Box */}
                    <div
                      onMouseEnter={() => setPreviewHovered(true)}
                      onMouseLeave={() => setPreviewHovered(false)}
                      style={{
                        width: '120px',
                        height: '100px',
                        background: '#FAF9F6',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-xs)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      title="Hover to test 1-second cycling speedup!"
                    >
                      {previewImagesList.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt="preview"
                          style={{
                            position: 'absolute',
                            maxHeight: '90%',
                            maxWidth: '90%',
                            objectFit: 'contain',
                            opacity: idx === previewImageIndex ? 1 : 0,
                            transition: 'opacity 0.35s ease-in-out',
                          }}
                        />
                      ))}

                      {previewImagesList.length > 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: previewHovered ? 'var(--green-accent)' : 'rgba(0,0,0,0.6)',
                            color: '#FFF',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '999px',
                          }}
                        >
                          {previewImageIndex + 1}/{previewImagesList.length}
                        </div>
                      )}
                    </div>

                    {/* Simulator Status & Instruction */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          Live Public Storefront Simulator
                        </span>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '999px',
                            background: previewHovered ? 'var(--amber-light)' : 'var(--green-light)',
                            color: previewHovered ? 'var(--amber-deal)' : 'var(--green-accent)',
                            border: previewHovered ? '1px solid var(--amber-border)' : '1px solid var(--green-border)',
                          }}
                        >
                          {previewHovered ? '⚡ Fast Hover Mode: 1.0s / photo' : '⏱ Standard Loop: 2.0s / photo'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {previewImagesList.length > 1
                          ? `Cycling through ${previewImagesList.length} uploaded photos. Move your cursor over the box to experience the 1-second accelerated preview!`
                          : 'Add at least 2 image URLs below to enable smooth automatic photo cycling on public product cards.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Individual Gallery Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {galleryImages.map((img, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {/* Mini Thumbnail */}
                      <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#FFF', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {img.url ? (
                          <img src={img.url} alt={`Thumb ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '0.625rem', color: '#999' }}>#{idx + 1}</span>
                        )}
                      </div>

                      <input
                        type="url"
                        placeholder="Image CDN URL (https://...)"
                        value={img.url}
                        onChange={(e) => {
                          const updated = [...galleryImages];
                          updated[idx].url = e.target.value;
                          setGalleryImages(updated);
                          if (img.is_primary) setFormData({ ...formData, thumbnail_url: e.target.value });
                        }}
                        style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: '#FFFFFF' }}
                      />
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-xs)',
                          border: img.is_primary ? '1px solid var(--green-border)' : '1px solid var(--border)',
                          background: img.is_primary ? 'var(--green-light)' : '#FFF',
                          color: img.is_primary ? 'var(--green-accent)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {img.is_primary ? '★ Primary' : 'Set Primary'}
                      </button>
                      <button type="button" onClick={() => removeGalleryImage(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} title="Delete photo">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Highlights / Bullet Points */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
                      <Sparkles size={16} color="var(--green-accent)" />
                      <span>Key Highlights / Product Bullet Points ({featureRows.filter((f) => f.feature && f.feature.trim()).length} Items)</span>
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Displayed directly on the public product page as primary bullet points
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowBatchHighlights(!showBatchHighlights)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      {showBatchHighlights ? '✕ Close Batch Paste' : '⚡ Batch Paste Highlights'}
                    </button>
                    <button
                      type="button"
                      onClick={addFeatureRow}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      + Add Highlight
                    </button>
                  </div>
                </div>

                {/* Batch Paste Highlights Modal */}
                {showBatchHighlights && (
                  <div style={{ background: '#FFFFFF', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                      Paste Multiple Highlights (one per line, bullets like &quot;*&quot; or &quot;-&quot; are automatically cleaned):
                    </label>
                    <textarea
                      rows={4}
                      value={batchHighlightsText}
                      onChange={(e) => setBatchHighlightsText(e.target.value)}
                      placeholder="* 40-hour continuous battery endurance&#10;* Active dual-processor noise cancellation&#10;* Bluetooth 5.3 multipoint audio connectivity"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setShowBatchHighlights(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBatchAddHighlights}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Add to Highlights
                      </button>
                    </div>
                  </div>
                )}

                {/* Individual Highlight Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {featureRows.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--green-accent)', fontWeight: 800, minWidth: '1.25rem', textAlign: 'center' }}>
                        ●
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 40-hour continuous battery endurance"
                        value={f.feature}
                        onChange={(e) => updateFeatureText(idx, e.target.value)}
                        style={{ flex: 1, padding: '0.45rem 0.65rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)', background: '#FFFFFF' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeatureRow(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.35rem' }}
                        title="Delete highlight"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Live Public Product Card Preview of Highlights */}
                {featureRows.filter((f) => f.feature && f.feature.trim()).length > 0 && (
                  <div style={{ marginTop: '1rem', background: '#FFFFFF', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Public Product Page Preview:</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {featureRows
                        .filter((f) => f.feature && f.feature.trim())
                        .map((f, i) => (
                          <li key={i} style={{ lineHeight: 1.4 }}>{f.feature}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Dynamic Specifications Matrix */}
              <div style={{ background: '#FAF9F6', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Table size={14} color="var(--green-accent)" />
                    <span>Dynamic Specifications Table Matrix</span>
                  </label>
                  <button type="button" onClick={addSpecRow} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    + Add Spec Row
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {specRows.map((spec, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Battery Life)"
                        value={spec.spec_key}
                        onChange={(e) => updateSpecKey(idx, e.target.value)}
                        style={{ width: '35%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                      <input
                        type="text"
                        placeholder="Spec Value (e.g. 40 hours with ANC)"
                        value={spec.spec_value}
                        onChange={(e) => updateSpecValue(idx, e.target.value)}
                        style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-strong)' }}
                      />
                      <button type="button" onClick={() => removeSpecRow(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editorial Analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Best For (Target User)
                  </label>
                  <input
                    type="text"
                    value={formData.best_for}
                    placeholder="e.g. Frequent commuters and audio professionals"
                    onChange={(e) => setFormData({ ...formData, best_for: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Why We Like It (Lab Highlight)
                  </label>
                  <input
                    type="text"
                    value={formData.why_we_like_it}
                    placeholder="e.g. Unrivaled ANC with dual processors and 8 microphones"
                    onChange={(e) => setFormData({ ...formData, why_we_like_it: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Who Should Buy / Avoid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Who Should Buy
                  </label>
                  <textarea
                    rows={2}
                    value={formData.who_should_buy}
                    placeholder="e.g. Users seeking reference soundstage and all-day comfort."
                    onChange={(e) => setFormData({ ...formData, who_should_buy: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Who Should Avoid
                  </label>
                  <textarea
                    rows={2}
                    value={formData.who_should_avoid}
                    placeholder="e.g. Budget buyers or gym-goers needing water resistance."
                    onChange={(e) => setFormData({ ...formData, who_should_avoid: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Pros & Cons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Reasons to Buy (Pros - one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.pros}
                    onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Reasons to Avoid (Cons - one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.cons}
                    onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Reusable Product List Template Option */}
              <div
                style={{
                  background: 'var(--green-light)',
                  border: '1px solid var(--green-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                  <input
                    type="checkbox"
                    id="add_to_product_template"
                    defaultChecked={true}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--green-accent)' }}
                  />
                  <div>
                    <label
                      htmlFor="add_to_product_template"
                      style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--green-deep)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Sparkles size={14} color="var(--green-accent)" />
                      <span>Add to Product List Template (Reusable in Buying Guides &amp; Blogs)</span>
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                      Keeps this product securely registered in the central Product Catalog with instant 1-click import into any buying guide.
                    </p>
                  </div>
                </div>

                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => downloadProductJson(editingProduct)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
                    title="Export complete JSON backup of this product"
                  >
                    <Download size={13} />
                    <span>Export JSON Backup</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingProduct ? 'Save Product Changes' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Amazon Compliance Pre-Publish Blocking Modal */}
      <ComplianceScanModal
        isOpen={showComplianceModal}
        scanResult={complianceResult}
        onClose={() => setShowComplianceModal(false)}
        onSaveAsDraft={handleSaveAsDraft}
        savingAsDraft={savingAsDraft}
      />
    </div>
  );
}
