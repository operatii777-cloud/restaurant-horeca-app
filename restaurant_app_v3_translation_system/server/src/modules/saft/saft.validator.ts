/**
 * PHASE S8.5 - SAF-T Validator
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Validates fiscal documents against SAF-T (Standard Audit File for Tax) requirements
 */

interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * PHASE S8.5 - Validate fiscal receipt against SAF-T requirements
 */
export function validateFiscalReceipt(receiptData: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!receiptData.fiscalNumber) {
    errors.push({
      field: 'fiscalNumber',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Fiscal number is required',
      severity: 'error'
    });
  }

  if (!receiptData.issueDate) {
    errors.push({
      field: 'issueDate',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Issue date is required',
      severity: 'error'
    });
  }

  if (!receiptData.totalAmount || receiptData.totalAmount <= 0) {
    errors.push({
      field: 'totalAmount',
      code: 'SAFT_INVALID_AMOUNT',
      message: 'Total amount must be greater than 0',
      severity: 'error'
    });
  }

  // Validate items
  if (!receiptData.items || !Array.isArray(receiptData.items) || receiptData.items.length === 0) {
    errors.push({
      field: 'items',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'At least one item is required',
      severity: 'error'
    });
  } else {
    receiptData.items.forEach((item: any, index: number) => {
      if (!item.productName) {
        errors.push({
          field: `items[${index}].productName`,
          code: 'SAFT_REQUIRED_FIELD',
          message: 'Product name is required',
          severity: 'error'
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({
          field: `items[${index}].quantity`,
          code: 'SAFT_INVALID_QUANTITY',
          message: 'Quantity must be greater than 0',
          severity: 'error'
        });
      }
      if (item.vatRate === undefined || item.vatRate < 0 || item.vatRate > 100) {
        errors.push({
          field: `items[${index}].vatRate`,
          code: 'SAFT_INVALID_VAT_RATE',
          message: 'VAT rate must be between 0 and 100',
          severity: 'error'
        });
      }
    });
  }

  // Validate totals match
  const calculatedTotal = receiptData.items?.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity * (1 + (item.vatRate || 0) / 100));
  }, 0) || 0;

  if (Math.abs(calculatedTotal - (receiptData.totalAmount || 0)) > 0.01) {
    warnings.push({
      field: 'totalAmount',
      code: 'SAFT_TOTAL_MISMATCH',
      message: `Total amount mismatch: calculated ${calculatedTotal.toFixed(2)}, provided ${receiptData.totalAmount}`,
      severity: 'warning'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * PHASE S8.5 - Validate UBL XML against SAF-T requirements
 */
export function validateUBL(documentType: string, xml: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Basic XML structure validation
  if (!xml || typeof xml !== 'string') {
    errors.push({
      field: 'xml',
      code: 'SAFT_INVALID_XML',
      message: 'XML content is required',
      severity: 'error'
    });
    return { valid: false, errors, warnings };
  }

  // Check for required UBL elements
  if (!xml.includes('<Invoice') && !xml.includes('<ApplicationResponse')) {
    errors.push({
      field: 'xml',
      code: 'SAFT_INVALID_UBL_ROOT',
      message: 'UBL XML must contain Invoice or ApplicationResponse root element',
      severity: 'error'
    });
  }

  // Check for required namespaces
  if (!xml.includes('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2') &&
      !xml.includes('urn:oasis:names:specification:ubl:schema:xsd:ApplicationResponse-2')) {
    warnings.push({
      field: 'xml',
      code: 'SAFT_MISSING_NAMESPACE',
      message: 'UBL namespace may be missing',
      severity: 'warning'
    });
  }

  // Check for CIUS-RO customization
  if (!xml.includes('CIUS-RO')) {
    warnings.push({
      field: 'xml',
      code: 'SAFT_MISSING_CIUS_RO',
      message: 'CIUS-RO customization ID not found',
      severity: 'warning'
    });
  }

  // Document type specific validations
  if (documentType === 'NIR' || documentType === 'FACTURA') {
    if (!xml.includes('<cbc:ID>')) {
      errors.push({
        field: 'xml',
        code: 'SAFT_MISSING_DOCUMENT_ID',
        message: 'Document ID (cbc:ID) is required',
        severity: 'error'
      });
    }
    if (!xml.includes('<cac:InvoiceLine>')) {
      errors.push({
        field: 'xml',
        code: 'SAFT_MISSING_INVOICE_LINES',
        message: 'At least one invoice line is required',
        severity: 'error'
      });
    }
    
    // PHASE S8.6 - Require NCM code for UBL invoices
    if (!xml.includes('<cbc:CommodityCode>')) {
      warnings.push({
        field: 'xml',
        code: 'SAFT_MISSING_NCM_CODE',
        message: 'NCM/CN code (cbc:CommodityCode) is recommended for all invoice lines',
        severity: 'warning'
      });
    }
  }
  
  // PHASE S8.6 - Require NCM for NIR
  if (documentType === 'NIR') {
    if (!xml.includes('<cbc:CommodityCode>')) {
      warnings.push({
        field: 'xml',
        code: 'SAFT_MISSING_NCM_CODE',
        message: 'NCM code (cbc:CommodityCode) is recommended for NIR lines',
        severity: 'warning'
      });
    }
  }
  
  // PHASE S8.6 - Require CN for Proces Verbal
  if (documentType === 'PROCES_VERBAL') {
    if (!xml.includes('<cbc:CommodityCode>')) {
      warnings.push({
        field: 'xml',
        code: 'SAFT_MISSING_CN_CODE',
        message: 'CN code (cbc:CommodityCode) is recommended for Proces Verbal',
        severity: 'warning'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * PHASE S8.5 - Validate tipizate document against SAF-T requirements
 */
export function validateTipizat(docType: string, document: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required fields
  if (!document.series || !document.number) {
    errors.push({
      field: 'series/number',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Document series and number are required',
      severity: 'error'
    });
  }

  if (!document.date) {
    errors.push({
      field: 'date',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Document date is required',
      severity: 'error'
    });
  }

  // Validate lines
  const lines = document.lines || [];
  if (lines.length === 0) {
    errors.push({
      field: 'lines',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'At least one line is required',
      severity: 'error'
    });
  } else {
    lines.forEach((line: any, index: number) => {
      if (!line.productName) {
        errors.push({
          field: `lines[${index}].productName`,
          code: 'SAFT_REQUIRED_FIELD',
          message: 'Product name is required',
          severity: 'error'
        });
      }
      if (!line.quantity || line.quantity <= 0) {
        errors.push({
          field: `lines[${index}].quantity`,
          code: 'SAFT_INVALID_QUANTITY',
          message: 'Quantity must be greater than 0',
          severity: 'error'
        });
      }
    });
  }

  // Validate totals
  if (!document.totals) {
    warnings.push({
      field: 'totals',
      code: 'SAFT_MISSING_TOTALS',
      message: 'Document totals are recommended',
      severity: 'warning'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * PHASE S8.5 - Validate stock transaction against SAF-T requirements
 */
export function validateStockTransaction(stockMove: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!stockMove.ingredient_id) {
    errors.push({
      field: 'ingredient_id',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Ingredient ID is required',
      severity: 'error'
    });
  }

  if (stockMove.quantity_out === undefined && stockMove.quantity_in === undefined) {
    errors.push({
      field: 'quantity',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Either quantity_in or quantity_out is required',
      severity: 'error'
    });
  }

  if (!stockMove.type) {
    errors.push({
      field: 'type',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Stock move type is required',
      severity: 'error'
    });
  }

  if (!stockMove.date) {
    errors.push({
      field: 'date',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Transaction date is required',
      severity: 'error'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * PHASE S8.5 - Validate payment against SAF-T requirements
 */
export function validatePayment(payment: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!payment.amount || payment.amount <= 0) {
    errors.push({
      field: 'amount',
      code: 'SAFT_INVALID_AMOUNT',
      message: 'Payment amount must be greater than 0',
      severity: 'error'
    });
  }

  if (!payment.paymentMethod) {
    errors.push({
      field: 'paymentMethod',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Payment method is required',
      severity: 'error'
    });
  }

  if (!payment.date) {
    errors.push({
      field: 'date',
      code: 'SAFT_REQUIRED_FIELD',
      message: 'Payment date is required',
      severity: 'error'
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

module.exports = {
  validateFiscalReceipt,
  validateUBL,
  validateTipizat,
  validateStockTransaction,
  validatePayment
};

