/**
 * PHASE S8.4 - TVA Rules (Date-Based)
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Legislative VAT rules with date-based validity
 */

export interface TVARule {
  vatCategory: string;      // 'food', 'standard', 'reduced', 'zero'
  rate: number;              // VAT rate (9, 11, 19, 21, 0)
  validFrom: string | null;  // ISO date string (null = from beginning)
  validTo: string | null;    // ISO date string (null = no expiry)
  description?: string;
}

/**
 * PHASE S8.4 - Default VAT rules (Romania legislative)
 * 
 * Rules are applied in order - first matching rule wins
 */
export const DEFAULT_VAT_RULES: TVARule[] = [
  // Food VAT - 9% until 2025-07-31, then 11%
  {
    vatCategory: 'food',
    rate: 9,
    validFrom: null,
    validTo: '2025-07-31',
    description: 'TVA alimente 9% (până la 31.07.2025)'
  },
  {
    vatCategory: 'food',
    rate: 11,
    validFrom: '2025-08-01',
    validTo: null,
    description: 'TVA alimente 11% (de la 01.08.2025)'
  },
  
  // Standard VAT - 19% until 2025-07-31, then 21%
  {
    vatCategory: 'standard',
    rate: 19,
    validFrom: null,
    validTo: '2025-07-31',
    description: 'TVA standard 19% (până la 31.07.2025)'
  },
  {
    vatCategory: 'standard',
    rate: 21,
    validFrom: '2025-08-01',
    validTo: null,
    description: 'TVA standard 21% (de la 01.08.2025)'
  },
  
  // Reduced VAT - 5% (unchanged)
  {
    vatCategory: 'reduced',
    rate: 5,
    validFrom: null,
    validTo: null,
    description: 'TVA redusă 5%'
  },
  
  // Zero VAT
  {
    vatCategory: 'zero',
    rate: 0,
    validFrom: null,
    validTo: null,
    description: 'TVA 0%'
  }
];

/**
 * Get applicable VAT rule for a category and date
 */
export function getVatRuleForCategory(category: string, date: Date = new Date()): TVARule | null {
  const dateStr = date.toISOString().split('T')[0];
  
  // Find first matching rule
  for (const rule of DEFAULT_VAT_RULES) {
    if (rule.vatCategory !== category) continue;
    
    // Check date validity
    if (rule.validFrom && dateStr < rule.validFrom) continue;
    if (rule.validTo && dateStr > rule.validTo) continue;
    
    return rule;
  }
  
  return null;
}

/**
 * Get VAT rate for a category and date
 */
export function getVatRateForCategory(category: string, date: Date = new Date()): number {
  const rule = getVatRuleForCategory(category, date);
  return rule ? rule.rate : 19; // Default to 19% if no rule found
}


