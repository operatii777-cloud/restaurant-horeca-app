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
    if (!line.productName) {
      throw new Error(`Linia ${index + 1}: Numele produsului este obligatoriu`);
    }
    if (line.quantity <= 0) {
      throw new Error(`Linia ${index + 1}: Cantitatea trebuie să fie > 0`);
    }
    if (line.unitPrice < 0) {
      throw new Error(`Linia ${index + 1}: Prețul unitar nu poate fi negativ`);
    }
    if (line.vatRate < 0 || line.vatRate > 100) {
      throw new Error(`Linia ${index + 1}: Cota TVA trebuie să fie între 0 și 100`);
    }
  });
}

export function validateFiscalHeader(fiscalHeader: Partial<FiscalHeader>): void {
  if (!fiscalHeader.companyName) {
    throw new Error('Numele companiei este obligatoriu');
  }
  if (!fiscalHeader.companyCUI) {
    throw new Error('CUI-ul companiei este obligatoriu');
  }
  if (!fiscalHeader.companyAddress) {
    throw new Error('Adresa companiei este obligatorie');
  }
  if (!fiscalHeader.fiscalCode) {
    throw new Error('Codul fiscal este obligatoriu');
  }
}

export function calculateTotals(lines: TipizatLine[]) {
  const vatMap = new Map<number, { base: number; vat: number }>();
  let subtotal = 0;

  lines.forEach((line) => {
    const lineTotalWithoutVat = line.quantity * line.unitPrice;
    const lineVat = (lineTotalWithoutVat * line.vatRate) / 100;
    const lineTotalWithVat = lineTotalWithoutVat + lineVat;

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

