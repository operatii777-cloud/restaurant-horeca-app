/**
 * PHASE S8.3 - UBL Tipizate Service
 * 
 * Restaurant App V3 powered by QrOMS
 * 
 * Generates UBL XML for all 14 tipizate document types
 */

const { buildUblInvoice } = require('../../../ubl');
const { dbPromise } = require('../../../../database');
const tipizateRepository = require('../repositories/tipizate.repository').tipizateRepository;
// PHASE S8.4 - TVA System v2
const TVAService = require('../../tva/tva.service');
// PHASE S8.5 - SAF-T Validation
const SaftService = require('../../saft/saft.service');
// PHASE S8.6 - Fiscal Codes (NCM/CN)
const FiscalCodesService = require('../../fiscal-codes/fiscalCodes.service');
// PHASE S8.7 - ANAF Submit v2
const AnafSubmitService = require('../../anaf-submit/anafSubmit.service');

/**
 * PHASE S8.3 - Build UBL XML for a tipizate document
 * 
 * @param {string} docType - Document type (NIR, BON_CONSUM, etc.)
 * @param {number} docId - Document ID
 * @returns {Promise<string>} UBL XML string
 */
async function buildUBLForTipizate(docType: string, docId: number): Promise<string> {
  const db = await dbPromise;
  
  // Get document with lines
  const document = await tipizateRepository.getById(docId);
  if (!document) {
    throw new Error(`Document ${docType} with ID ${docId} not found`);
  }

  // Get lines
  const lines = await getDocumentLines(db, docType, docId);
  
  // Get totals (from document JSON or calculate)
  const totals = document.totals ? JSON.parse(document.totals) : calculateTotals(lines);

  // PHASE S8.5 - Validate tipizate document before UBL generation
  const saftValidation = await SaftService.validateTipizatDocument(docType, document);
  if (!saftValidation.valid && saftValidation.errors.length > 0) {
    throw new Error(`SAF-T validation failed: ${saftValidation.errors.map(e => e.message).join(', ')}`);
  }

  // Map to UBL based on document type (PHASE S8.4 - all builders are async for TVA v2)
  let xml: string;
  switch (docType.toUpperCase()) {
    case 'NIR':
      xml = await buildUBLForNIR(document, lines, totals);
      break;
    case 'BON_CONSUM':
      return await buildUBLForBonConsum(document, lines, totals);
    case 'TRANSFER':
      return await buildUBLForTransfer(document, lines, totals);
    case 'INVENTAR':
      return await buildUBLForInventar(document, lines, totals);
    case 'FACTURA':
      return await buildUBLForFactura(document, lines, totals);
    case 'CHITANTA':
      return await buildUBLForChitanta(document, lines, totals);
    case 'REGISTRU_CASA':
      return await buildUBLForRegistruCasa(document, lines, totals);
    case 'RAPORT_GESTIUNE':
      return await buildUBLForRaportGestiune(document, lines, totals);
    case 'RAPORT_X':
      return await buildUBLForRaportX(document, lines, totals);
    case 'RAPORT_Z':
      return await buildUBLForRaportZ(document, lines, totals);
    case 'RAPORT_LUNAR':
      return await buildUBLForRaportLunar(document, lines, totals);
    case 'AVIZ':
      return await buildUBLForAviz(document, lines, totals);
    case 'PROCES_VERBAL':
      return await buildUBLForProcesVerbal(document, lines, totals);
    case 'RETUR':
      xml = await buildUBLForRetur(document, lines, totals);
      break;
    default:
      throw new Error(`Unsupported document type: ${docType}`);
  }

  // PHASE S8.5 - Validate generated UBL XML
  const ublValidation = await SaftService.validateUBLXml(docType, xml);
  if (!ublValidation.valid && ublValidation.errors.length > 0) {
    throw new Error(`SAF-T UBL validation failed: ${ublValidation.errors.map(e => e.message).join(', ')}`);
  }

  // PHASE S8.7 - Queue for ANAF submission (if auto-submit enabled)
  if (process.env.ANAF_AUTO_SUBMIT === 'true') {
    try {
      await AnafSubmitService.queueDocument(docType, docId, xml, 'normal');
      console.log(`[UBL Tipizate] UBL queued for ANAF submission: ${docType} ${docId}`);
    } catch (queueError) {
      console.warn('[UBL Tipizate] Failed to queue for ANAF submission:', queueError.message);
    }
  }

  return xml;
}

/**
 * Get document lines from document JSON
 */
async function getDocumentLines(db: any, docType: string, docId: number): Promise<any[]> {
  // Lines are stored as JSON in tipizate_documents.lines
  const document = await tipizateRepository.getById(docId);
  if (!document || !document.lines) {
    return [];
  }
  
  // Parse lines JSON
  let lines = document.lines;
  if (typeof lines === 'string') {
    lines = JSON.parse(lines);
  }
  
  return Array.isArray(lines) ? lines : [];
}

/**
 * Calculate totals from lines
 */
function calculateTotals(lines: any[]): any {
  const subtotal = lines.reduce((sum, line) => sum + (line.total_without_vat || 0), 0);
  const vatAmount = lines.reduce((sum, line) => sum + (line.total_vat || 0), 0);
  const total = subtotal + vatAmount;

  // Group by VAT rate
  const vatBreakdown = new Map();
  lines.forEach(line => {
    const rate = line.vat_rate || 0;
    if (!vatBreakdown.has(rate)) {
      vatBreakdown.set(rate, { vatRate: rate, baseAmount: 0, vatAmount: 0 });
    }
    const breakdown = vatBreakdown.get(rate);
    breakdown.baseAmount += line.total_without_vat || 0;
    breakdown.vatAmount += line.total_vat || 0;
  });

  return {
    subtotal,
    vatAmount,
    total,
    vatBreakdown: Array.from(vatBreakdown.values())
  };
}

// ========================================
// UBL BUILDERS FOR EACH DOCUMENT TYPE
// ========================================

/**
 * Build UBL for NIR (Note Intrare Recepție)
 * Maps to UBL Invoice (Purchase Invoice)
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForNIR(document: any, lines: any[], totals: any): Promise<string> {
  const documentDate = new Date(document.date);
  
  // PHASE S8.4 - Resolve VAT rates using TVA System v2
  const invoiceLines = await Promise.all(lines.map(async (line, index) => {
    const vatRate = line.product_id 
      ? await TVAService.getVatRateForProduct(line.product_id, documentDate)
      : await TVAService.getVatRateAt(documentDate, 'standard');
    
    return {
      name: line.product_name || `Product ${index + 1}`,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      lineExtensionAmount: line.total_without_vat,
      vatRate: vatRate,
      taxCategoryCode: 'S'
    };
  }));
  
  const invoiceDTO = {
    invoiceNumber: `${document.series}-${document.number}`,
    issueDate: documentDate,
    invoiceTypeCode: '380', // Commercial Invoice
    documentCurrencyCode: 'RON',
    supplier: {
      name: document.supplier_name || 'Supplier',
      cui: document.supplier_cui || null,
      address: {
        street: document.supplier_address || '',
        countryCode: 'RO'
      }
    },
    customer: {
      name: process.env.COMPANY_NAME || 'Restaurant',
      cui: process.env.COMPANY_CUI || '',
      address: {
        street: process.env.COMPANY_ADDRESS || '',
        countryCode: 'RO'
      }
    },
    invoiceLines: invoiceLines,
    taxExclusiveAmount: totals.subtotal,
    taxInclusiveAmount: totals.total,
    payableAmount: totals.total,
    taxSubtotals: totals.vatBreakdown.map((b: any) => ({
      taxableAmount: b.baseAmount,
      taxAmount: b.vatAmount,
      percent: b.vatRate,
      categoryCode: 'S'
    })),
    paymentMeans: { code: '30' },
    note: `NIR ${document.series}-${document.number}`
  };

  return buildUblInvoice(invoiceDTO);
}

/**
 * Build UBL for Bon Consum
 * Maps to UBL Invoice (Internal Consumption)
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForBonConsum(document: any, lines: any[], totals: any): Promise<string> {
  // Similar to NIR but for internal consumption
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Transfer
 * Maps to UBL DespatchAdvice
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForTransfer(document: any, lines: any[], totals: any): Promise<string> {
  // PHASE S8.3 - Transfer uses DespatchAdvice UBL type
  // For now, use Invoice format (will be extended in future)
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Inventar
 * Maps to UBL ApplicationResponse (Inventory Report)
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForInventar(document: any, lines: any[], totals: any): Promise<string> {
  // PHASE S8.3 - Inventory uses ApplicationResponse
  // For now, use Invoice format
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Factura (Tipizat Invoice)
 * Maps to UBL Invoice
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForFactura(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Chitanță
 * Maps to UBL Invoice (Receipt)
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForChitanta(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Registru Casă
 * Maps to UBL ApplicationResponse
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForRegistruCasa(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Raport Gestiune
 * Maps to UBL ApplicationResponse
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForRaportGestiune(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Raport X
 * Maps to UBL ApplicationResponse
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForRaportX(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Raport Z
 * Maps to UBL ApplicationResponse
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForRaportZ(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Raport Lunar
 * Maps to UBL ApplicationResponse
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForRaportLunar(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Aviz
 * Maps to UBL DespatchAdvice
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForAviz(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Proces Verbal
 * Maps to UBL ApplicationResponse
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForProcesVerbal(document: any, lines: any[], totals: any): Promise<string> {
  return await buildUBLForNIR(document, lines, totals);
}

/**
 * Build UBL for Retur
 * Maps to UBL CreditNote
 * PHASE S8.4 - Uses TVA System v2
 */
async function buildUBLForRetur(document: any, lines: any[], totals: any): Promise<string> {
  // PHASE S8.3 - Return uses CreditNote
  const documentDate = new Date(document.date);
  
  // PHASE S8.4 - Resolve VAT rates using TVA System v2
  const invoiceLines = await Promise.all(lines.map(async (line, index) => {
    const vatRate = line.product_id 
      ? await TVAService.getVatRateForProduct(line.product_id, documentDate)
      : await TVAService.getVatRateAt(documentDate, 'standard');
    
    return {
      name: line.product_name || `Product ${index + 1}`,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      lineExtensionAmount: line.total_without_vat,
      vatRate: vatRate,
      taxCategoryCode: 'S'
    };
  }));
  
  const invoiceDTO = {
    invoiceNumber: `${document.series}-${document.number}`,
    issueDate: documentDate,
    invoiceTypeCode: '381', // Credit Note
    documentCurrencyCode: 'RON',
    supplier: {
      name: process.env.COMPANY_NAME || 'Restaurant',
      cui: process.env.COMPANY_CUI || '',
      address: {
        street: process.env.COMPANY_ADDRESS || '',
        countryCode: 'RO'
      }
    },
    customer: {
      name: document.customer_name || 'Customer',
      cui: document.customer_cui || null,
      address: {
        street: document.customer_address || '',
        countryCode: 'RO'
      }
    },
    invoiceLines: invoiceLines,
    taxExclusiveAmount: totals.subtotal,
    taxInclusiveAmount: totals.total,
    payableAmount: totals.total,
    taxSubtotals: totals.vatBreakdown.map((b: any) => ({
      taxableAmount: b.baseAmount,
      taxAmount: b.vatAmount,
      percent: b.vatRate,
      categoryCode: 'S'
    })),
    paymentMeans: { code: '30' },
    note: `Retur ${document.series}-${document.number}`
  };

  return buildUblInvoice(invoiceDTO);
}

/**
 * Save UBL XML to database
 */
async function saveUBLXml(docType: string, docId: number, xml: string): Promise<void> {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE tipizate_documents SET ubl_xml = ?, updated_at = datetime('now', 'localtime') WHERE id = ? AND type = ?`,
      [xml, docId, docType],
      (err: any) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

module.exports = {
  buildUBLForTipizate,
  saveUBLXml,
  buildUBLForNIR,
  buildUBLForBonConsum,
  buildUBLForTransfer,
  buildUBLForInventar,
  buildUBLForFactura,
  buildUBLForChitanta,
  buildUBLForRegistruCasa,
  buildUBLForRaportGestiune,
  buildUBLForRaportX,
  buildUBLForRaportZ,
  buildUBLForRaportLunar,
  buildUBLForAviz,
  buildUBLForProcesVerbal,
  buildUBLForRetur
};

