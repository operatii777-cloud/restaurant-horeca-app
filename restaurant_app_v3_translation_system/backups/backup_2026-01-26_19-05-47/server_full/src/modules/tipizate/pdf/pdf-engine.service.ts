/**
 * PHASE S5.2 - PDF Engine Service
 * Unified PDF generation service for all tipizate documents
 */

const PDFDocument = require('pdfkit');
const { PdfTemplateBuilder } = require('./pdf-template-builder');
const { tipizateRepository } = require('../repositories/tipizate.repository');
const crypto = require('crypto');

class PdfEngineService {
  /**
   * Generate PDF for a tipizate document
   * @param {string} docType - Document type
   * @param {number} docId - Document ID
   * @param {object} options - PDF generation options
   * @param {string} options.format - Page format: 'A4' or 'A5' (default: auto-detect)
   * @param {boolean} options.printerFriendly - Printer-friendly mode (white background, no watermarks)
   * @param {boolean} options.monochrome - Monochrome mode (grayscale)
   */
  async generatePdf(docType, docId, options = {}) {
    // PHASE S5.7 - Disable PDF generation in test environment
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_PDF === '1') {
      return Buffer.from('PDF-DISABLED-IN-TESTS');
    }

    // Get document from repository
    const document = await tipizateRepository.getById(docId);

    if (!document) {
      throw new Error(`Document ${docType} #${docId} not found`);
    }

    if (document.type !== docType) {
      throw new Error(`Document type mismatch: expected ${docType}, got ${document.type}`);
    }

    // Parse JSON fields
    const fiscalHeader = typeof document.fiscalHeader === 'string' 
      ? JSON.parse(document.fiscalHeader) 
      : document.fiscalHeader || {};

    const lines = typeof document.lines === 'string'
      ? JSON.parse(document.lines)
      : document.lines || [];

    const totals = typeof document.totals === 'string'
      ? JSON.parse(document.totals)
      : document.totals || {};

    const documentData = typeof document.documentData === 'string'
      ? JSON.parse(document.documentData)
      : document.documentData || {};

    // Build template data
    const templateData = {
      document,
      fiscalHeader,
      lines,
      totals,
      documentData,
    };

    // Determine format (A4 default, A5 for receipts, or from options)
    const format = options.format || (['CHITANTA', 'REGISTRU_CASA', 'RAPORT_X', 'RAPORT_Z'].includes(document.type)
      ? 'A5'
      : 'A4');

    // Printer-friendly mode: larger margins, no watermarks
    const printerFriendly = options.printerFriendly || false;
    const monochrome = options.monochrome || false;

    // Create PDF builder
    const builder = new PdfTemplateBuilder({
      format,
      margin: printerFriendly
        ? (format === 'A5' 
          ? { top: 60, right: 60, bottom: 60, left: 60 }
          : { top: 70, right: 70, bottom: 70, left: 70 })
        : (format === 'A5' 
          ? { top: 40, right: 40, bottom: 40, left: 40 }
          : { top: 50, right: 50, bottom: 50, left: 50 }),
      printerFriendly,
      monochrome,
    });

    // Build PDF (async for QR generation)
    const pdfDoc = await builder.build(templateData);

    // Add metadata
    const crypto = require('crypto');
    const documentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ id: document.id, type: document.type, version: document.version }))
      .digest('hex');

    pdfDoc.info = {
      Title: `${document.type} ${document.series}-${document.number}`,
      Author: fiscalHeader?.companyName || 'Restaurant App V3',
      Subject: `Document ${document.type}`,
      Creator: 'Restaurant App V3 - Enterprise Tipizate Module',
      Producer: 'PDFKit',
      CreationDate: new Date(),
      ModDate: new Date(),
      Keywords: `${document.type}, ${document.series}, ${document.number}`,
    };

    // Add custom metadata (for audit) - with null safety
    pdfDoc.info.Custom = {
      DocumentId: (document.id || 0).toString(),
      DocumentType: document.type || 'UNKNOWN',
      DocumentVersion: (document.version || 1).toString(),
      DocumentHash: documentHash,
      Status: document.status || 'DRAFT',
      LocationId: (document.locationId || document.location_id || 0).toString(),
    };

    // Convert to buffer
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  /**
   * Generate PDF and return as stream (for Express response)
   */
  async generatePdfStream(docType, docId) {
    const buffer = await this.generatePdf(docType, docId);
    const { Readable } = require('stream');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}

const pdfEngineService = new PdfEngineService();

module.exports = { pdfEngineService };

