/**
 * PHASE S4.2 - NIR Validators
 */

import { NirDocument } from '../models/nir.types';
import { validateHeader, validateLines, validateFiscalHeader, calculateTotals } from './tipizate.validators';

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

  // Validate lines
  if (!doc.lines || doc.lines.length === 0) {
    throw new Error('NIR-ul trebuie să aibă cel puțin o linie');
  }
  
  // PHASE S5.5 - Validare NIR fără linii valide
  doc.lines.forEach((line, index) => {
    if (line.quantity <= 0) {
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

  // Return validated document
  return {
    ...doc as NirDocument,
    type: 'NIR',
    status: doc.status || 'DRAFT',
    totals,
    version: doc.version || 1,
  };
}

