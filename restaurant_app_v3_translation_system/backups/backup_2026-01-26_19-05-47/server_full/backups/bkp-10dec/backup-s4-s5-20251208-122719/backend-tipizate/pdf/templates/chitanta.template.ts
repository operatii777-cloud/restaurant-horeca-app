/**
 * PHASE S5.2 - Chitanță Template
 * Individual template for Chitanță (Receipt) documents
 */

import PDFDocument from 'pdfkit';
import { TipizatBase, TipizatLine, TipizatTotals, FiscalHeader } from '../../models/tipizate.types';

export interface ChitantaTemplateData {
  document: TipizatBase;
  fiscalHeader: FiscalHeader;
  lines: TipizatLine[];
  totals: TipizatTotals;
}

/**
 * Render Chitanță document template
 */
export function renderChitantaTemplate(doc: PDFDocument, data: ChitantaTemplateData): void {
  const { document, fiscalHeader, lines, totals } = data;

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text('CHITANȚĂ', { align: 'center' });
  doc.moveDown(0.5);

  // Informații document
  doc.fontSize(10).font('Helvetica');
  doc.text(`Serie: ${document.series}`, { continued: true, align: 'left' });
  doc.text(`Număr: ${document.number}`, { align: 'right' });
  doc.text(`Data: ${new Date(document.date).toLocaleDateString('ro-RO')}`);
  doc.moveDown();

  // Header fiscal
  if (fiscalHeader && fiscalHeader.companyName) {
    doc.fontSize(11).font('Helvetica-Bold').text('Date Fiscale:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Companie: ${fiscalHeader.companyName}`);
    if (fiscalHeader.companyCUI) doc.text(`CUI: ${fiscalHeader.companyCUI}`);
    doc.moveDown();
  }

  // Client
  const documentData = typeof document.documentData === 'string' 
    ? JSON.parse(document.documentData) 
    : document.documentData || {};
  
  if (documentData.clientName) {
    doc.fontSize(11).font('Helvetica-Bold').text('PRIMIT DE:', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nume: ${documentData.clientName}`);
    if (documentData.clientCUI) doc.text(`CUI: ${documentData.clientCUI}`);
    doc.moveDown();
  }

  // Suma primită
  doc.moveDown();
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text(`Suma primită: ${totals.total?.toFixed(2) || '0.00'} RON`, { align: 'center' });
  doc.moveDown();

  // Scris cu litere (dacă există helper)
  if (documentData.amountInWords) {
    doc.fontSize(10).font('Helvetica');
    doc.text(`Scris cu litere: ${documentData.amountInWords}`, { align: 'center' });
    doc.moveDown();
  }

  // Semnături
  doc.moveDown(3);
  doc.fontSize(9).font('Helvetica');
  doc.text('Primit de:', 50, doc.y);
  doc.text('___________________', 50, doc.y + 20);
  doc.text('Emis de:', 350, doc.y - 20);
  doc.text('___________________', 350, doc.y);
}

