import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/compliance/audit
 * Fetches compliance audit records from compliance_audits table
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const ruleId = searchParams.get('rule_id');
    const entityType = searchParams.get('entity_type');

    const supabase = createServerClient();

    let query = supabase
      .from('compliance_audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (severity) {
      query = query.eq('severity', severity);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (ruleId) {
      query = query.eq('rule_id', ruleId);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback query to system_logs if compliance_audits fails
      const { data: logData } = await supabase
        .from('system_logs')
        .select('*')
        .eq('category', 'amazon_compliance_audit')
        .order('created_at', { ascending: false })
        .limit(limit);

      return NextResponse.json({
        success: true,
        audits: logData || [],
        count: logData?.length || 0,
      });
    }

    return NextResponse.json({
      success: true,
      audits: data || [],
      count: data?.length || 0,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/compliance/audit
 * Records a new compliance audit violation or admin scan result
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rule_id,
      rule_name,
      rule_title,
      severity = 'high',
      entity_type = 'product',
      entity_id,
      entity_title,
      field_name,
      violation_details,
      details,
      remediation_step,
      status = 'open',
      admin_action,
      metadata = {},
    } = body;

    const finalRuleName = rule_name || rule_title || rule_id || 'Compliance Check';
    const finalDetails = violation_details || details || 'Compliance policy trigger';

    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('compliance_audits')
      .insert([
        {
          rule_id: rule_id || 'AMZ-RULE-UNKNOWN',
          rule_name: finalRuleName,
          severity,
          entity_type,
          entity_id: entity_id ? String(entity_id) : null,
          entity_title: entity_title || null,
          field_name: field_name || null,
          violation_details: finalDetails,
          remediation_step: remediation_step || null,
          status,
          admin_action: admin_action || null,
          metadata: metadata || {},
          created_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      audit: data,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/compliance/audit
 * Updates compliance audit status (e.g. resolve, dismiss, add admin note)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_action, remediation_notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Audit record ID is required.' }, { status: 400 });
    }

    const supabase = createServerClient();
    const updatePayload: Record<string, unknown> = {};

    if (status) {
      updatePayload.status = status;
      if (status === 'resolved' || status === 'auto_fixed') {
        updatePayload.resolved_at = new Date().toISOString();
      }
    }
    if (admin_action) {
      updatePayload.admin_action = admin_action;
    }
    if (remediation_notes) {
      updatePayload.remediation_step = remediation_notes;
    }

    const { data, error } = await supabase
      .from('compliance_audits')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      audit: data,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
