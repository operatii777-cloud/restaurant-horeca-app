/**
 * PHASE S4.2 - NIR Validators
 * PHASE S6.1 - Added CUI validation for supplier
 */

import { NirDocument } from '../models/nir.types';
import { validateHeader, validateLines, validateFiscalHeader, calculateTotals } from './tipizate.validators';
import { validateCUIOrThrow } from '../utils/cuiValidator';

export function validateNir(doc: Partial<NirDocument>): NirDocument {
  // Validate base header
  validateHeader(doc);
  validateFiscalHeader(doc.fiscalHeader || {});

  // Validate NIR-specific fields
  if (!doc.supplierId) {
    throw new Error('Furnizorul este obligatoriu pentru NIR');
  }
  if (!doc.supplierName) {
    throw new Error('Numele furnizorului este obligatoriu');
  }
  if (!doc.invoiceNumber) {
    throw new Error('Numărul facturii furnizorului este obligatoriu');
  }

  // PHASE S6.1 - Validate supplier CUI (obligatory for NIR)
  const supplierCUI = doc.supplierCUI || (doc.fiscalHeader as any)?.supplierCUI;
  if (!supplierCUI) {
    throw new Error('CUI-ul furnizorului este obligatoriu pentru NIR');
  }
  validateCUIOrThrow(supplierCUI, 'CUI furnizor');

  // PHASE S6.2 - Validate invoice totals if provided
  if (doc.invoiceTotalAmount !== null && doc.invoiceTotalAmount !== undefined) {
    if (doc.invoiceTotalAmount < 0) {
      throw new Error('Valoarea totală a facturii nu poate fi negativă');
    }
  }

  // Validate lines
  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('NIR-ul trebuie să aibă cel puțin o linie');
  }
  
  // PHASE S5.5 - Validare NIR fără linii valide
  // PHASE S6.2 - Enhanced validation with quantity tracking
  doc.lines.forEach((line, index) => {
    // Use quantityReceived if available, otherwise quantity (backward compatibility)
    const qty = line.quantityReceived !== null && line.quantityReceived !== undefined 
      ? line.quantityReceived 
      : line.quantity;
    
    if (qty <= 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea trebuie să fie pozitivă`);
    }
    
    if (!line.productId && !line.productName) {
      throw new Error(`Linia ${index + 1}: Produsul este obligatoriu`);
    }
    
    if (line.unitPrice < 0) {
      throw new Error(`Linia ${index + 1}: Prețul unitar nu poate fi negativ`);
    }
  });
  
  validateLines(doc.lines);

  // Calculate totals
  const totals = calculateTotals(doc.lines);
  
  // PHASE S6.2 - Validate totals match invoice if provided
  if (doc.invoiceTotalAmount !== null && doc.invoiceTotalAmount !== undefined) {
    const difference = Math.abs(doc.invoiceTotalAmount - totals.total);
    if (difference > 0.01) {
      throw new Error(`Totalul NIR (${totals.total.toFixed(2)}) nu corespunde cu totalul facturii (${doc.invoiceTotalAmount.toFixed(2)}) - diferență: ${difference.toFixed(2)}`);
    }
  }
  
  // PHASE S6.2 - Validate invoice TVA if provided
  if (doc.invoiceTvaAmount !== null && doc.invoiceTvaAmount !== undefined) {
    const vatDifference = Math.abs(doc.invoiceTvaAmount - totals.vatAmount);
    if (vatDifference > 0.01) {
      throw new Error(`TVA NIR (${totals.vatAmount.toFixed(2)}) nu corespunde cu TVA factură (${doc.invoiceTvaAmount.toFixed(2)}) - diferență: ${vatDifference.toFixed(2)}`);
    }
  }

  // Return validated document
  return {
    ...doc as NirDocument,
    type: 'NIR',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

