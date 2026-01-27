/**
 * PHASE S5.2 - PDF Template Builder
 * Universal template builder for all tipizate documents
 * Uses individual templates for each document type
 */

const PDFDocument = require('pdfkit');
const {
  formatDate,
  formatCurrency,
  formatNumber,
  getWatermarkText,
  getDocumentTitle,
  buildFiscalHeader,
  calculatePageBreak,
} = require('./pdf-helpers');

// Import individual templates
const {
  renderNirTemplate,
  renderBonConsumTemplate,
  renderTransferTemplate,
  renderInventarTemplate,
  renderFacturaTemplate,
  renderChitantaTemplate,
  renderRegistruCasaTemplate,
  renderRaportGestiuneTemplate,
  renderRaportXTemplate,
  renderRaportZTemplate,
  renderRaportLunarTemplate,
  renderAvizTemplate,
  renderProcesVerbalTemplate,
  renderReturTemplate,
} = require('./templates');

class PdfTemplateBuilder {
  constructor(options = {}) {
    this.options = {
      format: options.format || 'A4',
      margin: options.margin || { top: 50, right: 50, bottom: 50, left: 50 },
      watermark: options.watermark,
      printerFriendly: options.printerFriendly || false,
      monochrome: options.monochrome || false,
    };

    // PDFKit page dimensions (in points, 1 point = 1/72 inch)
    const dimensions = {
      A4: { width: 595.28, height: 841.89 },
      A5: { width: 419.53, height: 595.28 },
    };

    const dim = dimensions[this.options.format!];
    this.pageWidth = dim.width;
    this.pageHeight = dim.height;
    this.margin = this.options.margin!;

    this.doc = new PDFDocument({
      size: this.options.format,
      margin: this.margin,
      info: {
        Title: 'Tipizat Document',
        Author: 'Restaurant App V3',
        Subject: 'Document Tipizat',
        Creator: 'Restaurant App V3 - Enterprise Tipizate Module',
      },
    });

    this.currentY = this.margin.top;
  }

  getDocument() {
    return this.doc;
  }

  addHeader(data) {
    const { document, fiscalHeader } = data;

    // Fiscal Header
    if (fiscalHeader) {
      this.doc.fontSize(10).text(buildFiscalHeader(fiscalHeader), {
        align: 'left',
        width: this.pageWidth - this.margin.left - this.margin.right,
      });
      this.currentY += 60;
    }

    // Document Title
    this.doc.fontSize(16).font('Helvetica-Bold').text(getDocumentTitle(document.type), {
      align: 'center',
    });
    this.currentY += 30;

    // Document Info
    this.doc.fontSize(10).font('Helvetica');
    this.doc.text(`Serie: ${document.series}`, this.margin.left, this.currentY);
    this.doc.text(`Număr: ${document.number}`, this.margin.left + 150, this.currentY);
    this.doc.text(`Data: ${formatDate(document.date)}`, this.margin.left + 300, this.currentY);
    this.currentY += 20;

    if (document.locationName) {
      this.doc.text(`Locație: ${document.locationName}`, this.margin.left, this.currentY);
      this.currentY += 15;
    }

    if (document.warehouseId) {
      this.doc.text(`Gestiune: ${document.warehouseId}`, this.margin.left, this.currentY);
      this.currentY += 15;
    }

    this.currentY += 10;
  }

  addLinesTable(lines) {
    if (!lines || lines.length === 0) return;

    const tableTop = this.currentY;
    const lineHeight = 20;
    const colWidths = {
      nr: 30,
      product: 200,
      unit: 50,
      quantity: 70,
      price: 80,
      vat: 50,
      total: 80,
    };

    // Table Header
    this.doc.fontSize(9).font('Helvetica-Bold');
    let x = this.margin.left;
    this.doc.text('Nr', x, this.currentY);
    x += colWidths.nr;
    this.doc.text('Produs', x, this.currentY);
    x += colWidths.product;
    this.doc.text('UM', x, this.currentY);
    x += colWidths.unit;
    this.doc.text('Cant.', x, this.currentY);
    x += colWidths.quantity;
    this.doc.text('Preț', x, this.currentY);
    x += colWidths.price;
    this.doc.text('TVA%', x, this.currentY);
    x += colWidths.vat;
    this.doc.text('Total', x, this.currentY);

    this.currentY += lineHeight + 5;

    // Table Rows
    this.doc.fontSize(8).font('Helvetica');
    lines.forEach((line, index) => {
      // Check page break
      if (calculatePageBreak(this.currentY, this.pageHeight, this.margin.bottom)) {
        this.doc.addPage();
        this.currentY = this.margin.top;
      }

      x = this.margin.left;
      this.doc.text(String(index + 1), x, this.currentY);
      x += colWidths.nr;
      this.doc.text(line.productName || '', x, this.currentY, { width: colWidths.product });
      x += colWidths.product;
      this.doc.text(line.unit || '', x, this.currentY);
      x += colWidths.unit;
      this.doc.text(formatNumber(line.quantity, 2), x, this.currentY);
      x += colWidths.quantity;
      this.doc.text(formatCurrency(line.unitPrice), x, this.currentY);
      x += colWidths.price;
      this.doc.text(`${line.vatRate}%`, x, this.currentY);
      x += colWidths.vat;
      this.doc.text(formatCurrency(line.totalWithVat), x, this.currentY);

      this.currentY += lineHeight;
    });

    this.currentY += 10;
  }

  addTotals(totals) {
    if (!totals) return;

    const totalsStartY = this.currentY;
    const lineHeight = 15;
    const rightAlign = this.pageWidth - this.margin.right - 150;

    this.doc.fontSize(10);

    // Subtotal
    this.doc.text('Subtotal:', this.margin.left, this.currentY);
    this.doc.text(formatCurrency(totals.subtotal), rightAlign, this.currentY, { align: 'right' });
    this.currentY += lineHeight;

    // VAT Breakdown
    if (totals.vatBreakdown && totals.vatBreakdown.length > 0) {
      totals.vatBreakdown.forEach((vat) => {
        this.doc.text(`TVA ${vat.vatRate}%:`, this.margin.left, this.currentY);
        this.doc.text(formatCurrency(vat.vatAmount), rightAlign, this.currentY, { align: 'right' });
        this.currentY += lineHeight;
      });
    }

    // Total VAT
    this.doc.text('Total TVA:', this.margin.left, this.currentY);
    this.doc.text(formatCurrency(totals.vatAmount), rightAlign, this.currentY, { align: 'right' });
    this.currentY += lineHeight;

    // Grand Total
    this.doc.fontSize(12).font('Helvetica-Bold');
    this.doc.text('TOTAL:', this.margin.left, this.currentY);
    this.doc.text(formatCurrency(totals.total), rightAlign, this.currentY, { align: 'right' });
    this.currentY += lineHeight + 10;
  }

  addFooter(data) {
    const { document } = data;

    // Move to bottom
    this.currentY = this.pageHeight - this.margin.bottom - 60;

    // Signatures section
    this.doc.fontSize(9).font('Helvetica');
    this.doc.text('Semnături:', this.margin.left, this.currentY);
    this.currentY += 20;

    if (document.signedByName) {
      this.doc.text(`Semnat de: ${document.signedByName}`, this.margin.left, this.currentY);
      if (document.signedAt) {
        this.doc.text(`Data: ${formatDate(document.signedAt)}`, this.margin.left + 200, this.currentY);
      }
      this.currentY += 15;
    }

    if (document.lockedByName) {
      this.doc.text(`Blocat de: ${document.lockedByName}`, this.margin.left, this.currentY);
      if (document.lockedAt) {
        this.doc.text(`Data: ${formatDate(document.lockedAt)}`, this.margin.left + 200, this.currentY);
      }
      this.currentY += 15;
    }

    // Legal footer
    this.currentY += 10;
    this.doc.fontSize(7).text(
      'Document generat electronic. Valabil fără semnătură și ștampilă conform Legii 227/2015.',
      this.margin.left,
      this.currentY,
      {
        width: this.pageWidth - this.margin.left - this.margin.right,
        align: 'center',
      }
    );
  }

  addWatermark(status) {
    // PHASE S5.6 - Skip watermark in printer-friendly mode
    if (this.options.printerFriendly) {
      return;
    }

    const watermarkText = getWatermarkText(status);
    if (!watermarkText) return;

    // Add watermark on every page
    const pages = this.doc.bufferedPageRange();
    for (let i = pages.start; i <= pages.count; i++) {
      this.doc.switchToPage(i);
      this.doc
        .fontSize(72)
        .font('Helvetica-Bold')
        .fillColor('lightgray')
        .opacity(0.2)
        .text(watermarkText, this.pageWidth / 2, this.pageHeight / 2, {
          align: 'center',
          rotate: 45,
        })
        .fillColor('black')
        .opacity(1);
    }
  }

  /**
   * Get template renderer for document type
   */
  getTemplateRenderer(docType) {
    const templateMap = {
      NIR: renderNirTemplate,
      BON_CONSUM: renderBonConsumTemplate,
      TRANSFER: renderTransferTemplate,
      INVENTAR: renderInventarTemplate,
      FACTURA: renderFacturaTemplate,
      CHITANTA: renderChitantaTemplate,
      REGISTRU_CASA: renderRegistruCasaTemplate,
      RAPORT_GESTIUNE: renderRaportGestiuneTemplate,
      RAPORT_X: renderRaportXTemplate,
      RAPORT_Z: renderRaportZTemplate,
      RAPORT_LUNAR: renderRaportLunarTemplate,
      AVIZ: renderAvizTemplate,
      PROCES_VERBAL: renderProcesVerbalTemplate,
      RETUR: renderReturTemplate,
    };

    return templateMap[docType] || null;
  }

  build(data) {
    const { document } = data;
    const templateRenderer = this.getTemplateRenderer(document.type);

    if (templateRenderer) {
      // Use individual template
      templateRenderer(this.doc, data);
    } else {
      // Fallback to generic template
      this.addHeader(data);
      this.addLinesTable(data.lines);
      this.addTotals(data.totals);
      this.addFooter(data);
    }

    // Add watermark (applies to all templates)
    this.addWatermark(data.document.status);

    return this.doc;
  }
}

module.exports = { PdfTemplateBuilder };

