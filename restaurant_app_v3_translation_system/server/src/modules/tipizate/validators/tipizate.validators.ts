/**
 * PHASE S4.2 - Tipizate Validators
 * Common validation functions for all tipizate documents
 */

import { TipizatBase, TipizatLine, FiscalHeader } from '../models/tipizate.types';

export function validateHeader(header: Partial<TipizatBase>): void {
  if (!header.series || !header.number) {
    throw new Error('Serie și număr document sunt obligatorii');
  }
  if (!header.date) {
    throw new Error('Data document este obligatorie');
  }
  if (!header.locationId) {
    throw new Error('Locația este obligatorie');
  }
}

export function validateLines(lines: TipizatLine[]): void {
  if (!lines || lines.length === 0) {
    throw new Error('Documentul trebuie să aibă cel puțin o linie');
  }
  
  lines.forEach((line, index) => {
    // Acceptă atât productName cât și ingredientName (pentru Waste, Bon Consum, etc.)
    if (!line.productName && !line.ingredientName) {
      throw new Error(`Linia ${index + 1}: Numele produsului/ingredientului este obligatoriu`);
    }
    // Normalizează - copiază ingredientName în productName dacă lipsește
    if (!line.productName && line.ingredientName) {
      line.productName = line.ingredientName;
    }
    
    // PHASE S6.2 - Validate quantity (use quantityReceived if available, otherwise quantity)
    const qty = line.quantityReceived !== null && line.quantityReceived !== undefined 
      ? line.quantityReceived 
      : line.quantity;
    
    if (qty <= 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea trebuie să fie > 0`);
    }
    
    // PHASE S6.2 - Validate quantityReceived vs quantityInvoiced
    if (line.quantityInvoiced !== null && line.quantityInvoiced !== undefined) {
      if (line.quantityInvoiced <= 0) {
        throw new Error(`Linia ${index + 1}: Cantitatea facturată trebuie să fie > 0`);
      }
      
      // Calculate difference
      if (line.quantityReceived !== null && line.quantityReceived !== undefined) {
        line.quantityDifference = line.quantityReceived - line.quantityInvoiced;
        
        // Determine variance type
        const absDiff = Math.abs(line.quantityDifference);
        if (absDiff < 0.01) {
          line.quantityVarianceType = 'normal';
        } else if (line.quantityReceived > line.quantityInvoiced) {
          line.quantityVarianceType = 'excess';
          // Allow 10% excess without error
          const excessPercent = ((line.quantityReceived - line.quantityInvoiced) / line.quantityInvoiced) * 100;
          if (excessPercent > 10) {
            throw new Error(`Linia ${index + 1}: Cantitatea primită depășește cu mai mult de 10% cantitatea facturată (${excessPercent.toFixed(2)}%)`);
          }
        } else {
          line.quantityVarianceType = 'deficit';
        }
      }
    }
    
    if (line.unitPrice < 0) {
      throw new Error(`Linia ${index + 1}: Prețul unitar nu poate fi negativ`);
    }
    
    // PHASE S6.2 - Validate discount
    if (line.discountPercentage !== null && line.discountPercentage !== undefined) {
      if (line.discountPercentage < 0 || line.discountPercentage > 100) {
        throw new Error(`Linia ${index + 1}: Discount-ul trebuie să fie între 0 și 100%`);
      }
    }
    
    if (line.vatRate < 0 || line.vatRate > 100) {
      throw new Error(`Linia ${index + 1}: Cota TVA trebuie să fie între 0 și 100`);
    }
  });
}

export function validateFiscalHeader(fiscalHeader: Partial<FiscalHeader>, options?: { requireAll?: boolean }): void {
  // Pentru documente interne (Bon Consum, Waste, etc.) nu e obligatoriu
  // Pentru documente fiscale externe (Factura, Aviz) e obligatoriu
  if (options?.requireAll !== false) {
    // Validare strictă doar dacă e specificat explicit
    if (!fiscalHeader.companyName) {
      console.warn('⚠️ Validare: companyName lipsește (opțional pentru documente interne)');
    }
    if (!fiscalHeader.companyCUI) {
      console.warn('⚠️ Validare: companyCUI lipsește (opțional pentru documente interne)');
    }
  }
  // Nu aruncăm erori - doar avertismente pentru documente interne
}

export function calculateTotals(lines: TipizatLine[]) {
  const vatMap = new Map<number, { base: number; vat: number }>();
  let subtotal = 0;

  lines.forEach((line) => {
    // PHASE S6.2 - Use quantityReceived if available, otherwise quantity (backward compatibility)
    const qty = line.quantityReceived !== null && line.quantityReceived !== undefined 
      ? line.quantityReceived 
      : line.quantity;
    
    // PHASE S6.2 - Calculate with discount if available
    let lineTotalWithoutVat = qty * line.unitPrice;
    
    if (line.discountPercentage && line.discountPercentage > 0) {
      const discountAmount = (lineTotalWithoutVat * line.discountPercentage) / 100;
      line.discountAmount = discountAmount;
      lineTotalWithoutVat = lineTotalWithoutVat - discountAmount;
      line.totalAmountAfterDiscount = lineTotalWithoutVat;
    } else {
      line.discountAmount = 0;
      line.totalAmountAfterDiscount = lineTotalWithoutVat;
    }
    
    const lineVat = (lineTotalWithoutVat * line.vatRate) / 100;
    const lineTotalWithVat = lineTotalWithoutVat + lineVat;

    // Update line totals
    line.totalWithoutVat = lineTotalWithoutVat;
    line.totalVat = lineVat;
    line.totalWithVat = lineTotalWithVat;

    subtotal += lineTotalWithoutVat;

    const existing = vatMap.get(line.vatRate) || { base: 0, vat: 0 };
    vatMap.set(line.vatRate, {
      base: existing.base + lineTotalWithoutVat,
      vat: existing.vat + lineVat,
    });
  });

  const totalVat = Array.from(vatMap.values()).reduce((sum, v) => sum + v.vat, 0);
  const total = subtotal + totalVat;

  const vatBreakdown = Array.from(vatMap.entries()).map(([vatRate, amounts]) => ({
    vatRate,
    baseAmount: amounts.base,
    vatAmount: amounts.vat,
  }));

  return {
    subtotal,
    vatAmount: totalVat,
    total,
    vatBreakdown,
  };
}

