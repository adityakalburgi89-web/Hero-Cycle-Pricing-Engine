export type RuleType = 'DISCOUNT' | 'MARKUP' | 'TAX' | 'SURCHARGE';
export type ValueType = 'PERCENTAGE' | 'FIXED';

export interface PricingRule {
  id: string;
  name: string;
  description?: string;
  ruleType: RuleType;
  valueType: ValueType;
  value: number;
  conditions: Record<string, any>;
  priority: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRuleInput {
  name: string;
  description?: string;
  ruleType: RuleType;
  valueType: ValueType;
  value: number;
  conditions?: Record<string, any>;
  priority?: number;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}
