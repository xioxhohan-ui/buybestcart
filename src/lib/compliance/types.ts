export type ComplianceSeverity = 'critical' | 'high' | 'medium' | 'warning' | 'info';

export type ComplianceCategory =
  | 'self_purchase'
  | 'pre_cta_value'
  | 'image_usage'
  | 'pricing_disclaimer'
  | 'account_health'
  | 'disclosure'
  | 'url_cloaking'
  | 'trademark_logo'
  | 'endorsement_claims'
  | 'marketplace_tags';

export interface ComplianceRule {
  id: string; // e.g. 'AMZ-RULE-01'
  ruleNumber: number; // 1 to 10
  title: string;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  description: string;
  rationale: string;
  remediation: string;
  amazonPolicyRef: string;
  isConfigurable: boolean;
  enabled: boolean;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  ruleNumber: number;
  title: string;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  field?: string;
  message: string;
  remediation: string;
  offendingValue?: string;
  suggestedValue?: string;
  amazonPolicyRef?: string;
  blocking: boolean; // True if publish should be blocked
}

export interface ComplianceScanResult {
  passed: boolean;
  score: number; // 0 to 100
  totalChecks: number;
  violations: ComplianceViolation[];
  hasBlockingViolations: boolean;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  warningCount: number;
  scannedAt: string;
  targetType: 'product' | 'article' | 'url' | 'redirect' | 'comparison' | 'deal' | 'config' | 'catalog';
  targetId?: string;
  targetTitle?: string;
}

export interface ComplianceLogItem {
  id: string;
  level: string;
  category: 'amazon_compliance_audit';
  message: string;
  metadata: {
    rule_id?: string;
    rule_number?: number;
    rule_title?: string;
    severity?: ComplianceSeverity;
    affected_item?: string;
    affected_type?: string;
    action?: string; // 'publish_blocked', 'scan_warning', 'manual_override', 'draft_saved', 'rule_updated'
    status?: 'open' | 'resolved' | 'dismissed_draft';
    details?: string;
    admin_user?: string;
    offending_value?: string;
  };
  created_at: string;
}

export interface ComplianceConfig {
  enabled: boolean;
  block_on_critical: boolean;
  block_on_high: boolean;
  sound_alert_enabled: boolean;
  require_timestamped_prices: boolean;
  require_footer_disclosure: boolean;
  require_article_disclosure: boolean;
  forbidden_trademark_phrases: string[];
  disallowed_url_domains: string[];
  approved_image_hosts: string[];
  approved_cta_phrases: string[];
  mandatory_disclosure_phrase: string;
  pricing_disclaimer_template: string;
  rules_toggle: Record<string, boolean>;
}
