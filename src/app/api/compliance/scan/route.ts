import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { scanProduct, scanArticle, scanUrl, scanContent } from '@/lib/compliance/scanner';
import { ComplianceScanResult, ComplianceViolation } from '@/lib/compliance/types';
import { isUrlShortener, buildAmazonAffiliateUrl } from '@/lib/affiliate';

export const dynamic = 'force-dynamic';

/**
 * POST /api/compliance/scan
 * Bulk audits the entire catalog or a specific item for Amazon compliance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { target = 'all', productId, articleId, remediate_shorteners = false } = body;

    const supabase = createServerClient();

    // 1. Single Product Scan
    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('*, brand:brands(*), category:categories(*)')
        .eq('id', productId)
        .maybeSingle();

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }

      const scanResult = scanProduct(product);
      return NextResponse.json({ success: true, result: scanResult });
    }

    // 2. Single Article Scan
    if (articleId) {
      const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .maybeSingle();

      if (!article) {
        return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
      }

      const scanResult = scanArticle(article);
      return NextResponse.json({ success: true, result: scanResult });
    }

    // 3. Full Catalog Scan & Optional Shortener Auto-Remediation
    const [prodRes, artRes, compRes, dealRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('articles').select('*'),
      supabase.from('comparisons').select('*'),
      supabase.from('deals').select('*'),
    ]);

    const products = prodRes.data || [];
    const articles = artRes.data || [];
    const comparisons = compRes.data || [];
    const deals = dealRes.data || [];

    let remediatedCount = 0;

    if (remediate_shorteners) {
      // 1. Remediate products
      for (const p of products) {
        let needsUpdate = false;
        let newAffiliate = p.affiliate_url;
        let newAmazon = p.amazon_url;

        if (p.affiliate_url && isUrlShortener(p.affiliate_url)) {
          newAffiliate = p.asin ? buildAmazonAffiliateUrl({ asin: p.asin }) : null;
          needsUpdate = true;
        }
        if (p.amazon_url && isUrlShortener(p.amazon_url)) {
          newAmazon = p.asin ? buildAmazonAffiliateUrl({ asin: p.asin }) : null;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await supabase
            .from('products')
            .update({ affiliate_url: newAffiliate, amazon_url: newAmazon, updated_at: new Date().toISOString() })
            .eq('id', p.id);
          remediatedCount++;
        }
      }

      // 2. Remediate articles with embedded top products
      for (const a of articles) {
        if (a.top_products && Array.isArray(a.top_products)) {
          let articleUpdated = false;
          const cleanedProducts = a.top_products.map((tp: any) => {
            let tpUpdated = false;
            let tpAffiliate = tp.affiliate_url;
            let tpBuy = tp.buy_url;

            if (tp.affiliate_url && isUrlShortener(tp.affiliate_url)) {
              tpAffiliate = tp.asin ? buildAmazonAffiliateUrl({ asin: tp.asin }) : `https://www.amazon.com?tag=bestbuycart-20`;
              tpUpdated = true;
            }
            if (tp.buy_url && isUrlShortener(tp.buy_url)) {
              tpBuy = tp.asin ? buildAmazonAffiliateUrl({ asin: tp.asin }) : `https://www.amazon.com?tag=bestbuycart-20`;
              tpUpdated = true;
            }

            if (tpUpdated) {
              articleUpdated = true;
              return { ...tp, affiliate_url: tpAffiliate, buy_url: tpBuy };
            }
            return tp;
          });

          if (articleUpdated) {
            await supabase
              .from('articles')
              .update({ top_products: cleanedProducts, updated_at: new Date().toISOString() })
              .eq('id', a.id);
            remediatedCount++;
          }
        }
      }

      // 3. Remediate deals
      for (const d of deals) {
        if (d.cta_url && isUrlShortener(d.cta_url)) {
          await supabase
            .from('deals')
            .update({ cta_url: '/deals', updated_at: new Date().toISOString() })
            .eq('id', d.id);
          remediatedCount++;
        }
      }
    }

    const productResults: ComplianceScanResult[] = products.map((p) => scanProduct(p));
    const articleResults: ComplianceScanResult[] = articles.map((a) => scanArticle(a));

    const allViolations: ComplianceViolation[] = [];
    productResults.forEach((r) => allViolations.push(...r.violations));
    articleResults.forEach((r) => allViolations.push(...r.violations));

    // Also scan comparisons and deals
    comparisons.forEach((c) => {
      if (c.title) allViolations.push(...scanContent(c.title, { field: `comparison[${c.id}].title` }));
      if (c.verdict) allViolations.push(...scanContent(c.verdict, { field: `comparison[${c.id}].verdict` }));
    });

    deals.forEach((d) => {
      if (d.title) allViolations.push(...scanContent(d.title, { field: `deal[${d.id}].title` }));
      if (d.cta_url) allViolations.push(...scanUrl(d.cta_url, { field: `deal[${d.id}].cta_url` }));
    });

    const criticalCount = allViolations.filter((v) => v.severity === 'critical').length;
    const highCount = allViolations.filter((v) => v.severity === 'high').length;
    const mediumCount = allViolations.filter((v) => v.severity === 'medium').length;
    const warningCount = allViolations.filter((v) => v.severity === 'warning').length;

    let overallScore = 100;
    overallScore -= criticalCount * 25;
    overallScore -= highCount * 10;
    overallScore -= mediumCount * 3;
    overallScore -= warningCount * 1;
    overallScore = Math.max(0, Math.min(100, overallScore));

    return NextResponse.json({
      success: true,
      summary: {
        overallScore,
        totalItemsAudited: products.length + articles.length + comparisons.length + deals.length,
        productsAudited: products.length,
        articlesAudited: articles.length,
        comparisonsAudited: comparisons.length,
        dealsAudited: deals.length,
        criticalCount,
        highCount,
        mediumCount,
        warningCount,
        remediatedCount,
        totalViolations: allViolations.length,
        scannedAt: new Date().toISOString(),
      },
      productResults,
      articleResults,
      violations: allViolations,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
