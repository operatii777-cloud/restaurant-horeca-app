/**
 * PHASE S5.7 - Test Helpers
 * Helper functions for tipizate tests
 */

import { TipizatType, TipizatStatus } from '../../../src/modules/tipizate/models/tipizate.types';

/**
 * Build valid NIR payload
 */
export function buildValidNirPayload() {
  return {
    series: 'NIR',
    number: '001',
    date: new Date().toISOString().split('T')[0],
    locationId: 1,
    locationName: 'Test Location',
    supplierId: 1,
    supplierName: 'Test Supplier SRL',
    invoiceNumber: 'INV-1234',
    invoiceDate: new Date().toISOString().split('T')[0],
    fiscalHeader: {
      companyName: 'Test Company SRL',
      companyCUI: 'RO12345678',
      companyAddress: 'Strada Test 1, București',
      fiscalCode: 'TEST123',
    },
    lines: [
      {
        lineNumber: 1,
        productId: 1,
        ingredientId: 1,
        productName: 'Cartofi',
        unit: 'kg',
        quantity: 10,
        unitPrice: 5.5,
        purchasePrice: 5.5,
        vatRate: 9,
        totalWithoutVat: 55,
        totalVat: 4.95,
        totalWithVat: 59.95,
      },
      {
        lineNumber: 2,
        productId: 2,
        ingredientId: 2,
        productName: 'Ceapă',
        unit: 'kg',
        quantity: 5,
        unitPrice: 3.2,
        purchasePrice: 3.2,
        vatRate: 9,
        totalWithoutVat: 16,
        totalVat: 1.44,
        totalWithVat: 17.44,
      },
    ],
    status: 'DRAFT' as TipizatStatus,
  };
}

/**
 * Build valid Bon Consum payload
 */
export function buildValidBonConsumPayload() {
  return {
    series: 'BC',
    number: '001',
    date: new Date().toISOString().split('T')[0],
    locationId: 1,
    locationName: 'Test Location',
    fiscalHeader: {
      companyName: 'Test Company SRL',
      companyCUI: 'RO12345678',
      companyAddress: 'Strada Test 1, București',
      fiscalCode: 'TEST123',
    },
    lines: [
      {
        lineNumber: 1,
        productId: 1,
        productName: 'Cartofi',
        unit: 'kg',
        quantity: 2,
        unitPrice: 5.5,
        vatRate: 9,
        totalWithoutVat: 11,
        totalVat: 0.99,
        totalWithVat: 11.99,
      },
    ],
    status: 'DRAFT' as TipizatStatus,
  };
}

/**
 * Build valid Transfer payload
 */
export function buildValidTransferPayload() {
  return {
    series: 'TR',
    number: '001',
    date: new Date().toISOString().split('T')[0],
    locationId: 1,
    locationName: 'Test Location',
    fromLocationId: 1,
    fromLocationName: 'Depozit 1',
    toLocationId: 2,
    toLocationName: 'Depozit 2',
    fiscalHeader: {
      companyName: 'Test Company SRL',
      companyCUI: 'RO12345678',
      companyAddress: 'Strada Test 1, București',
      fiscalCode: 'TEST123',
    },
    lines: [
      {
        lineNumber: 1,
        productId: 1,
        productName: 'Cartofi',
        unit: 'kg',
        quantity: 5,
        unitPrice: 5.5,
        vatRate: 9,
        totalWithoutVat: 27.5,
        totalVat: 2.48,
        totalWithVat: 29.98,
      },
    ],
    status: 'DRAFT' as TipizatStatus,
  };
}

/**
 * Build valid Inventar payload
 */
export function buildValidInventarPayload() {
  return {
    series: 'INV',
    number: '001',
    date: new Date().toISOString().split('T')[0],
    locationId: 1,
    locationName: 'Test Location',
    inventoryType: 'FULL',
    startDate: new Date().toISOString().split('T')[0],
    fiscalHeader: {
      companyName: 'Test Company SRL',
      companyCUI: 'RO12345678',
      companyAddress: 'Strada Test 1, București',
      fiscalCode: 'TEST123',
    },
    lines: [
      {
        lineNumber: 1,
        productId: 1,
        productName: 'Cartofi',
        unit: 'kg',
        bookQuantity: 10,
        physicalQuantity: 9.5,
        difference: -0.5,
        unitPrice: 5.5,
        vatRate: 9,
        totalWithoutVat: 52.25,
        totalVat: 4.70,
        totalWithVat: 56.95,
      },
    ],
    status: 'DRAFT' as TipizatStatus,
  };
}

/**
 * Build invalid payload (missing required field)
 */
export function buildInvalidPayload(type: TipizatType, missingField: string) {
  const validPayloads: Record<string, any> = {
    NIR: buildValidNirPayload(),
    BON_CONSUM: buildValidBonConsumPayload(),
    TRANSFER: buildValidTransferPayload(),
    INVENTAR: buildValidInventarPayload(),
  };

  const payload = { ...validPayloads[type] };
  
  // Remove the missing field
  if (missingField.includes('.')) {
    const [parent, child] = missingField.split('.');
    if (payload[parent]) {
      delete payload[parent][child];
    }
  } else {
    delete payload[missingField];
  }

  return payload;
}

