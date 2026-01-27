/**
 * PHASE S6.1 - CUI Validator
 * Validates Romanian CUI (Cod Unic de Înregistrare) format
 * 
 * Format: RO + 2-10 digits (e.g., RO12345678)
 * For individuals: CIF format (9 digits, no RO prefix)
 */

/**
 * Validate CUI format
 * @param cui - CUI to validate (can be with or without RO prefix)
 * @returns true if valid format
 */
export function validateCUI(cui: string | null | undefined): boolean {
  if (!cui) return false;
  
  const cuiStr = String(cui).trim().toUpperCase();
  
  // Remove spaces
  const cleanCUI = cuiStr.replace(/\s/g, '');
  
  // Format 1: RO + 2-10 digits (standard format)
  const roCUIRegex = /^RO\d{2,10}$/;
  if (roCUIRegex.test(cleanCUI)) {
    return true;
  }
  
  // Format 2: 2-10 digits only (without RO prefix, also valid)
  const digitsOnlyRegex = /^\d{2,10}$/;
  if (digitsOnlyRegex.test(cleanCUI)) {
    return true;
  }
  
  return false;
}

/**
 * Normalize CUI (add RO prefix if missing)
 * @param cui - CUI to normalize
 * @returns Normalized CUI with RO prefix
 */
export function normalizeCUI(cui: string | null | undefined): string | null {
  if (!cui) return null;
  
  const cuiStr = String(cui).trim().toUpperCase().replace(/\s/g, '');
  
  // Already has RO prefix
  if (cuiStr.startsWith('RO')) {
    return cuiStr;
  }
  
  // Add RO prefix
  if (/^\d{2,10}$/.test(cuiStr)) {
    return `RO${cuiStr}`;
  }
  
  return null;
}

/**
 * Validate CUI and throw error if invalid
 * @param cui - CUI to validate
 * @param fieldName - Field name for error message
 * @throws Error if invalid
 */
export function validateCUIOrThrow(cui: string | null | undefined, fieldName: string = 'CUI'): void {
  if (!validateCUI(cui)) {
    throw new Error(`${fieldName} invalid. Format așteptat: RO + 2-10 cifre (ex: RO12345678)`);
  }
}

