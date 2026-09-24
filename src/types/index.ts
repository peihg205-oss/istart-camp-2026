// ==============================================================================
// IStart Camp 2026 Team Scoring System - Core Types
// ==============================================================================

export type Role = 'ADMIN' | 'SCORER';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  code: string;
  name: string;
  motto: string;
  avatar_url?: string;
  color_accent: string;
  is_active: boolean;
  total_score?: number;
  raw_score?: number;
  rank?: number;
  previous_rank?: number;
  movement?: 'UP' | 'DOWN' | 'SAME';
  leader?: string;
  assistant?: string;
  badge_color?: string;
  created_at: string;
}

export type ActivityCategory = 'ACADEMIC' | 'CHALLENGE' | 'DISCIPLINE' | 'SPIRIT' | 'SPECIAL';
export type ScoringRuleType = 'FIXED' | 'RANKING' | 'QUANTITY' | 'FORMULA';

export interface Activity {
  id: string;
  code: string;
  name: string;
  category: ActivityCategory;
  description: string;
  rule_type: ScoringRuleType;
  is_repeatable: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  scoring_rule?: ScoringRule;
}

export interface FixedRuleConfig {
  points: number;
}

export interface RankingRuleConfig {
  ranks: Record<string | number, number>;
}

export interface QuantityRuleItem {
  id: string;
  label: string;
  points: number;
}

export interface QuantityRuleConfig {
  items: QuantityRuleItem[];
}

export interface FormulaField {
  key: string;
  label: string;
  min: number;
  max: number;
  weight: number;
}

export interface FormulaRuleConfig {
  formula_name: string;
  expression: string;
  description: string;
  fields: FormulaField[];
}

export type RuleConfig =
  | FixedRuleConfig
  | RankingRuleConfig
  | QuantityRuleConfig
  | FormulaRuleConfig;

export interface ScoringRule {
  id: string;
  activity_id: string;
  rule_type: ScoringRuleType;
  config: RuleConfig;
  created_at: string;
  updated_at: string;
}

export type TransactionStatus = 'ACTIVE' | 'UNDONE' | 'MODIFIED';

export interface ScoreTransaction {
  id: string;
  team_id: string;
  activity_id: string;
  points_awarded: number;
  metadata: {
    rule_type?: ScoringRuleType;
    rank?: number;
    quantity_item_id?: string;
    quantity_item_label?: string;
    quantity_count?: number;
    formula_values?: Record<string, number>;
    custom_note?: string;
    [key: string]: unknown;
  };
  status: TransactionStatus;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  // Join references
  team?: Team;
  activity?: Activity;
}

export type AuditAction = 'CREATE' | 'EDIT' | 'UNDO';

export interface ScoreAuditLog {
  id: string;
  transaction_id: string;
  action: AuditAction;
  performed_by: string;
  performed_by_name?: string;
  old_value?: Partial<ScoreTransaction>;
  new_value?: Partial<ScoreTransaction>;
  reason?: string;
  created_at: string;
  // Relation
  transaction?: ScoreTransaction;
}

export interface ScoringCalculationInput {
  ruleType: ScoringRuleType;
  config: RuleConfig;
  rank?: number;
  quantityItemId?: string;
  quantityCount?: number;
  formulaValues?: Record<string, number>;
}

export interface ScoringPreviewResult {
  points: number;
  breakdown: string;
  details: Record<string, unknown>;
  isValid: boolean;
  error?: string;
}
